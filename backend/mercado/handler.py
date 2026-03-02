import json
import os
import uuid
from datetime import datetime
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
offers_table = dynamodb.Table(os.environ['OFFERS_TABLE'])
external_rates_table = dynamodb.Table(os.environ['EXTERNAL_RATES_TABLE'])

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

def decimal_to_float(obj):
    """Convierte Decimal a float para JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def get_offers(event, context):
    """
    GET /offers?type=BUY|SELL&currency=USD|PEN&sort=best_rate
    Lista ofertas activas con filtros
    """
    try:
        params = event.get('queryStringParameters') or {}
        offer_type = params.get('type')
        currency = params.get('currency')
        sort_by = params.get('sort', 'created_at')
        
        # Consultar ofertas activas
        query_params = {
            'IndexName': 'StatusIndex',
            'KeyConditionExpression': Key('status').eq('OPEN'),
            'ScanIndexForward': False  # Ordenar descendente
        }
        
        result = offers_table.query(**query_params)
        offers = result['Items']
        
        # Filtrar por tipo si se especifica
        if offer_type:
            offers = [o for o in offers if o.get('type') == offer_type]
        
        # Filtrar por moneda si se especifica
        if currency:
            offers = [o for o in offers if o.get('currency') == currency]
        
        # Ordenar por mejor rate si se solicita
        if sort_by == 'best_rate':
            # Para BUY: menor rate es mejor, para SELL: mayor rate es mejor
            offers.sort(
                key=lambda x: float(x.get('rate', 0)),
                reverse=(offer_type == 'SELL')
            )
        
        # Convertir Decimals a float
        offers_clean = []
        for offer in offers:
            offers_clean.append({
                'id': offer['id'],
                'user_id': offer['user_id'],
                'type': offer['type'],
                'currency': offer['currency'],
                'amount': float(offer['amount']),
                'rate': float(offer['rate']),
                'status': offer['status'],
                'created_at': offer['created_at']
            })
        
        return response(200, {
            'offers': offers_clean,
            'count': len(offers_clean)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def create_offer(event, context):
    """
    POST /offers/create
    Body: {user_id, type: BUY|SELL, currency: USD|PEN, amount, rate}
    """
    try:
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        offer_type = body.get('type')
        currency = body.get('currency')
        amount = body.get('amount')
        rate = body.get('rate')
        
        # Validaciones
        if not all([user_id, offer_type, currency, amount, rate]):
            return response(400, {'error': 'Todos los campos son requeridos'})
        
        if offer_type not in ['BUY', 'SELL']:
            return response(400, {'error': 'type debe ser BUY o SELL'})
        
        if currency not in ['USD', 'PEN']:
            return response(400, {'error': 'currency debe ser USD o PEN'})
        
        if amount <= 0 or rate <= 0:
            return response(400, {'error': 'amount y rate deben ser mayores a 0'})
        
        offer_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Crear oferta
        offers_table.put_item(Item={
            'id': offer_id,
            'user_id': user_id,
            'type': offer_type,
            'currency': currency,
            'amount': Decimal(str(amount)),
            'rate': Decimal(str(rate)),
            'status': 'OPEN',
            'created_at': timestamp
        })
        
        return response(201, {
            'message': 'Oferta creada exitosamente',
            'offer_id': offer_id,
            'type': offer_type,
            'amount': amount,
            'rate': rate,
            'status': 'OPEN'
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def delete_offer(event, context):
    """
    DELETE /offers/{id}
    Elimina o pausa una oferta
    """
    try:
        offer_id = event['pathParameters']['id']
        
        # Verificar que la oferta existe
        offer_response = offers_table.get_item(Key={'id': offer_id})
        
        if 'Item' not in offer_response:
            return response(404, {'error': 'Oferta no encontrada'})
        
        # Actualizar estado a CANCELLED
        offers_table.update_item(
            Key={'id': offer_id},
            UpdateExpression='SET #status = :status, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'CANCELLED',
                ':time': datetime.utcnow().isoformat()
            }
        )
        
        return response(200, {
            'message': 'Oferta cancelada exitosamente',
            'offer_id': offer_id
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def get_market_rates(event, context):
    """
    GET /market/rates
    Consulta tipos de cambio externos (simulado con datos de ejemplo)
    En producción, esto consumiría APIs reales de bancos
    """
    try:
        # Simular tasas bancarias (en producción, consultar APIs reales)
        bank_rates = [
            {
                'bank_name': 'BCP',
                'buy_rate': 3.72,
                'sell_rate': 3.75,
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'bank_name': 'Interbank',
                'buy_rate': 3.71,
                'sell_rate': 3.76,
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'bank_name': 'BBVA',
                'buy_rate': 3.70,
                'sell_rate': 3.77,
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'bank_name': 'Scotiabank',
                'buy_rate': 3.71,
                'sell_rate': 3.75,
                'timestamp': datetime.utcnow().isoformat()
            }
        ]
        
        # Guardar en DynamoDB para histórico
        for rate in bank_rates:
            external_rates_table.put_item(Item={
                'bank_name': rate['bank_name'],
                'buy_rate': Decimal(str(rate['buy_rate'])),
                'sell_rate': Decimal(str(rate['sell_rate'])),
                'timestamp': rate['timestamp']
            })
        
        # Calcular promedio bancario
        avg_buy = sum(r['buy_rate'] for r in bank_rates) / len(bank_rates)
        avg_sell = sum(r['sell_rate'] for r in bank_rates) / len(bank_rates)
        
        return response(200, {
            'banks': bank_rates,
            'average': {
                'buy_rate': round(avg_buy, 2),
                'sell_rate': round(avg_sell, 2)
            },
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})
