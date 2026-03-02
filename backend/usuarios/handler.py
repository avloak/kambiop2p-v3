import json
import os
import uuid
import hashlib
from datetime import datetime
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])
profiles_table = dynamodb.Table(os.environ['PROFILES_TABLE'])
reputation_table = dynamodb.Table(os.environ['REPUTATION_TABLE'])

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

def hash_password(password):
    """Hash de contraseña simple (en producción usar bcrypt)"""
    return hashlib.sha256(password.encode()).hexdigest()

def register(event, context):
    """
    POST /auth/register
    Body: {email, password, dni, full_name, birth_date}
    """
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        dni = body.get('dni')
        full_name = body.get('full_name')
        birth_date = body.get('birth_date')
        
        if not all([email, password, dni, full_name, birth_date]):
            return response(400, {'error': 'Todos los campos son requeridos'})
        
        # Verificar si email ya existe
        existing = users_table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email)
        )
        
        if existing['Items']:
            return response(400, {'error': 'El email ya está registrado'})
        
        user_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Crear usuario
        users_table.put_item(Item={
            'id': user_id,
            'email': email,
            'password_hash': hash_password(password),
            'status': 'ACTIVE',
            'created_at': timestamp
        })
        
        # Crear perfil
        profiles_table.put_item(Item={
            'user_id': user_id,
            'dni': dni,
            'full_name': full_name,
            'birth_date': birth_date,
            'created_at': timestamp
        })
        
        # Inicializar reputación
        reputation_table.put_item(Item={
            'user_id': user_id,
            'score_avg': Decimal('0'),
            'total_trades': 0,
            'created_at': timestamp
        })
        
        return response(201, {
            'message': 'Usuario registrado exitosamente',
            'user_id': user_id,
            'email': email
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def get_profile(event, context):
    """
    GET /user/profile/{id}
    """
    try:
        user_id = event['pathParameters']['id']
        
        # Obtener usuario
        user_response = users_table.get_item(Key={'id': user_id})
        if 'Item' not in user_response:
            return response(404, {'error': 'Usuario no encontrado'})
        
        user = user_response['Item']
        
        # Obtener perfil
        profile_response = profiles_table.get_item(Key={'user_id': user_id})
        profile = profile_response.get('Item', {})
        
        # Obtener reputación
        reputation_response = reputation_table.get_item(Key={'user_id': user_id})
        reputation = reputation_response.get('Item', {})
        
        return response(200, {
            'id': user['id'],
            'email': user['email'],
            'status': user['status'],
            'profile': {
                'full_name': profile.get('full_name'),
                'dni': profile.get('dni'),
                'birth_date': profile.get('birth_date')
            },
            'reputation': {
                'score_avg': float(reputation.get('score_avg', 0)),
                'total_trades': reputation.get('total_trades', 0)
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})

def update_reputation(event, context):
    """
    PATCH /user/reputation
    Body: {user_id, rating: 1-5}
    """
    try:
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        rating = body.get('rating')
        
        if not user_id or rating is None:
            return response(400, {'error': 'user_id y rating son requeridos'})
        
        if rating < 1 or rating > 5:
            return response(400, {'error': 'rating debe estar entre 1 y 5'})
        
        # Obtener reputación actual
        reputation_response = reputation_table.get_item(Key={'user_id': user_id})
        
        if 'Item' not in reputation_response:
            return response(404, {'error': 'Usuario no encontrado'})
        
        reputation = reputation_response['Item']
        current_avg = float(reputation.get('score_avg', 0))
        total_trades = reputation.get('total_trades', 0)
        
        # Calcular nuevo promedio
        new_total = total_trades + 1
        new_avg = ((current_avg * total_trades) + rating) / new_total
        
        # Actualizar reputación
        reputation_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET score_avg = :avg, total_trades = :total, updated_at = :time',
            ExpressionAttributeValues={
                ':avg': Decimal(str(round(new_avg, 2))),
                ':total': new_total,
                ':time': datetime.utcnow().isoformat()
            }
        )
        
        return response(200, {
            'message': 'Reputación actualizada',
            'user_id': user_id,
            'new_score_avg': round(new_avg, 2),
            'total_trades': new_total
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Error interno del servidor'})
