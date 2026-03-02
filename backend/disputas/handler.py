import json
import os
import uuid
from datetime import datetime
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
disputes_table = dynamodb.Table(os.environ['DISPUTES_TABLE'])

def cors_headers():
    """Retorna headers CORS necesarios"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': True,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    }

def response(status_code, body):
    """Genera respuesta HTTP con CORS"""
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(body, default=str)
    }

def open_dispute(event, context):
    """
    POST /disputes/open
    Body: {trade_id, reporter_id, reason, evidence_url}
    Abre un ticket vinculado a un trade_id
    """
    try:
        body = json.loads(event['body'])
        trade_id = body.get('trade_id')
        reporter_id = body.get('reporter_id')
        reason = body.get('reason')
        evidence_url = body.get('evidence_url')
        
        if not all([trade_id, reporter_id, reason]):
            return response(400, {'error': 'trade_id, reporter_id y reason son requeridos'})
        
        dispute_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Crear disputa
        disputes_table.put_item(Item={
            'id': dispute_id,
            'trade_id': trade_id,
            'reporter_id': reporter_id,
            'reason': reason,
            'evidence_url': evidence_url or '',
            'status': 'PENDING',
            'created_at': timestamp,
            'updated_at': timestamp
        })
        
        # Notificar a soporte (simulado con log)
        print(f"ALERT: Nueva disputa abierta - ID: {dispute_id}, Trade: {trade_id}")
        print(f"Razón: {reason}")
        
        return response(201, {
            'message': 'Disputa abierta exitosamente. Un agente revisará el caso',
            'dispute_id': dispute_id,
            'trade_id': trade_id,
            'status': 'PENDING',
            'escrow_frozen': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def get_dispute(event, context):
    """
    GET /disputes/{id}
    Seguimiento del estado de la disputa
    """
    try:
        dispute_id = event['pathParameters']['id']
        
        # Obtener disputa
        dispute_response = disputes_table.get_item(Key={'id': dispute_id})
        
        if 'Item' not in dispute_response:
            return response(404, {'error': 'Disputa no encontrada'})
        
        dispute = dispute_response['Item']
        
        return response(200, {
            'id': dispute['id'],
            'trade_id': dispute['trade_id'],
            'reporter_id': dispute['reporter_id'],
            'reason': dispute['reason'],
            'evidence_url': dispute.get('evidence_url', ''),
            'status': dispute['status'],
            'resolution': dispute.get('resolution', ''),
            'resolved_by': dispute.get('resolved_by', ''),
            'created_at': dispute['created_at'],
            'updated_at': dispute['updated_at'],
            'resolved_at': dispute.get('resolved_at', '')
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def resolve_dispute(event, context):
    """
    POST /disputes/{id}/resolve
    Body: {mediator_id, resolution: REFUND|RELEASE, notes}
    El mediador dicta una resolución
    """
    try:
        dispute_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        mediator_id = body.get('mediator_id')
        resolution = body.get('resolution')
        notes = body.get('notes')
        
        if not all([mediator_id, resolution]):
            return response(400, {'error': 'mediator_id y resolution son requeridos'})
        
        if resolution not in ['REFUND', 'RELEASE']:
            return response(400, {'error': 'resolution debe ser REFUND o RELEASE'})
        
        # Obtener disputa
        dispute_response = disputes_table.get_item(Key={'id': dispute_id})
        
        if 'Item' not in dispute_response:
            return response(404, {'error': 'Disputa no encontrada'})
        
        dispute = dispute_response['Item']
        
        if dispute['status'] != 'PENDING':
            return response(400, {'error': 'La disputa ya ha sido resuelta'})
        
        # Actualizar disputa
        disputes_table.update_item(
            Key={'id': dispute_id},
            UpdateExpression='SET #status = :status, resolution = :resolution, resolved_by = :mediator, notes = :notes, resolved_at = :resolved, updated_at = :updated',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'RESOLVED',
                ':resolution': resolution,
                ':mediator': mediator_id,
                ':notes': notes or '',
                ':resolved': datetime.utcnow().isoformat(),
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        action = 'devueltos al comprador' if resolution == 'REFUND' else 'liberados al vendedor'
        
        return response(200, {
            'message': f'Disputa resuelta. Fondos {action}',
            'dispute_id': dispute_id,
            'trade_id': dispute['trade_id'],
            'resolution': resolution,
            'status': 'RESOLVED'
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def list_disputes(event, context):
    """
    GET /disputes?status=PENDING|RESOLVED
    Lista disputas (para uso del panel de soporte)
    """
    try:
        params = event.get('queryStringParameters') or {}
        status = params.get('status')
        
        if status:
            # Filtrar por estado
            result = disputes_table.query(
                IndexName='StatusIndex',
                KeyConditionExpression=Key('status').eq(status)
            )
        else:
            # Listar todas
            result = disputes_table.scan()
        
        disputes = []
        for item in result['Items']:
            disputes.append({
                'id': item['id'],
                'trade_id': item['trade_id'],
                'reporter_id': item['reporter_id'],
                'reason': item['reason'],
                'status': item['status'],
                'created_at': item['created_at'],
                'resolved_at': item.get('resolved_at', '')
            })
        
        return response(200, {
            'disputes': disputes,
            'count': len(disputes)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})
