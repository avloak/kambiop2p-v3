import json
import os
import uuid
from datetime import datetime
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
trades_table = dynamodb.Table(os.environ['TRADES_TABLE'])
bank_accounts_table = dynamodb.Table(os.environ['BANK_ACCOUNTS_TABLE'])

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

def initiate_trade(event, context):
    """
    POST /trades/initiate
    Body: {offer_id, buyer_id, seller_id, amount_fiat, rate}
    Crea un contrato de intercambio entre dos usuarios
    """
    try:
        body = json.loads(event['body'])
        offer_id = body.get('offer_id')
        buyer_id = body.get('buyer_id')
        seller_id = body.get('seller_id')
        amount_fiat = body.get('amount_fiat')
        rate = body.get('rate')
        
        if not all([offer_id, buyer_id, seller_id, amount_fiat, rate]):
            return response(400, {'error': 'Todos los campos son requeridos'})
        
        if amount_fiat <= 0:
            return response(400, {'error': 'amount_fiat debe ser mayor a 0'})
        
        trade_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Crear trade con fondos en escrow
        trades_table.put_item(Item={
            'id': trade_id,
            'offer_id': offer_id,
            'buyer_id': buyer_id,
            'seller_id': seller_id,
            'amount_fiat': Decimal(str(amount_fiat)),
            'rate': Decimal(str(rate)),
            'escrow_status': 'INITIATED',
            'deposit_confirmed': False,
            'funds_released': False,
            'created_at': timestamp,
            'updated_at': timestamp
        })
        
        return response(201, {
            'message': 'Trade iniciado exitosamente',
            'trade_id': trade_id,
            'escrow_status': 'INITIATED',
            'amount_fiat': amount_fiat,
            'rate': rate
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def confirm_deposit(event, context):
    """
    POST /trades/{id}/confirm-deposit
    Body: {user_id, receipt_url}
    El usuario notifica que envió el dinero
    """
    try:
        trade_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        receipt_url = body.get('receipt_url')
        
        if not user_id:
            return response(400, {'error': 'user_id es requerido'})
        
        # Obtener trade
        trade_response = trades_table.get_item(Key={'id': trade_id})
        
        if 'Item' not in trade_response:
            return response(404, {'error': 'Trade no encontrado'})
        
        trade = trade_response['Item']
        
        # Verificar que el usuario es parte del trade
        if user_id not in [trade['buyer_id'], trade['seller_id']]:
            return response(403, {'error': 'No autorizado'})
        
        # Actualizar estado a "Fondos en Custodia"
        trades_table.update_item(
            Key={'id': trade_id},
            UpdateExpression='SET escrow_status = :status, deposit_confirmed = :confirmed, receipt_url = :receipt, updated_at = :time',
            ExpressionAttributeValues={
                ':status': 'FUNDS_IN_CUSTODY',
                ':confirmed': True,
                ':receipt': receipt_url or '',
                ':time': datetime.utcnow().isoformat()
            }
        )
        
        return response(200, {
            'message': 'Depósito confirmado. Fondos en custodia',
            'trade_id': trade_id,
            'escrow_status': 'FUNDS_IN_CUSTODY',
            'cancellation_blocked': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def release_funds(event, context):
    """
    POST /trades/{id}/release-funds
    Body: {user_id, operation_number}
    Libera los fondos del Escrow tras validación
    """
    try:
        trade_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        operation_number = body.get('operation_number')
        
        if not user_id:
            return response(400, {'error': 'user_id es requerido'})
        
        # Obtener trade
        trade_response = trades_table.get_item(Key={'id': trade_id})
        
        if 'Item' not in trade_response:
            return response(404, {'error': 'Trade no encontrado'})
        
        trade = trade_response['Item']
        
        # Verificar que el depósito está confirmado
        if not trade.get('deposit_confirmed'):
            return response(400, {'error': 'Debe confirmar el depósito primero'})
        
        # Verificar que el usuario es parte del trade
        if user_id not in [trade['buyer_id'], trade['seller_id']]:
            return response(403, {'error': 'No autorizado'})
        
        # Liberar fondos
        trades_table.update_item(
            Key={'id': trade_id},
            UpdateExpression='SET escrow_status = :status, funds_released = :released, operation_number = :op, updated_at = :time, completed_at = :completed',
            ExpressionAttributeValues={
                ':status': 'COMPLETED',
                ':released': True,
                ':op': operation_number or '',
                ':time': datetime.utcnow().isoformat(),
                ':completed': datetime.utcnow().isoformat()
            }
        )
        
        return response(200, {
            'message': 'Fondos liberados exitosamente',
            'trade_id': trade_id,
            'escrow_status': 'COMPLETED',
            'operation_number': operation_number
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def get_bank_accounts(event, context):
    """
    GET /trades/bank-accounts?user_id={id}
    Gestiona las cuentas bancarias vinculadas
    """
    try:
        params = event.get('queryStringParameters') or {}
        user_id = params.get('user_id')
        
        if not user_id:
            return response(400, {'error': 'user_id es requerido'})
        
        # Consultar cuentas del usuario
        result = bank_accounts_table.query(
            IndexName='UserIndex',
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        
        accounts = []
        for item in result['Items']:
            accounts.append({
                'id': item['id'],
                'bank_name': item['bank_name'],
                'account_number': item['account_number'],
                'currency_type': item['currency_type'],
                'created_at': item['created_at']
            })
        
        return response(200, {
            'accounts': accounts,
            'count': len(accounts)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def add_bank_account(event, context):
    """
    POST /trades/bank-accounts
    Body: {user_id, bank_name, account_number, currency_type}
    Agrega una cuenta bancaria
    """
    try:
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        bank_name = body.get('bank_name')
        account_number = body.get('account_number')
        currency_type = body.get('currency_type')
        
        if not all([user_id, bank_name, account_number, currency_type]):
            return response(400, {'error': 'Todos los campos son requeridos'})
        
        # Validar banco
        valid_banks = ['BCP', 'Interbank', 'BBVA', 'Scotiabank']
        if bank_name not in valid_banks:
            return response(400, {'error': f'bank_name debe ser uno de: {", ".join(valid_banks)}'})
        
        # Validar moneda
        if currency_type not in ['USD', 'PEN']:
            return response(400, {'error': 'currency_type debe ser USD o PEN'})
        
        account_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Crear cuenta bancaria
        bank_accounts_table.put_item(Item={
            'id': account_id,
            'user_id': user_id,
            'bank_name': bank_name,
            'account_number': account_number,
            'currency_type': currency_type,
            'created_at': timestamp
        })
        
        return response(201, {
            'message': 'Cuenta bancaria agregada exitosamente',
            'account_id': account_id,
            'bank_name': bank_name,
            'currency_type': currency_type
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})
