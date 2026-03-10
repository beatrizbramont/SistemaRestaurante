from flask import Blueprint, request, jsonify
from config import db
from utils.email_service import enviar_otp_email
from datetime import datetime, timedelta
from Auth.auth_model import Usuario
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from datetime import timedelta

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/auth')

@auth_bp.route('/status', methods=['GET'])
def status_servidor():
    return jsonify({'status': 'Servidor Flask ativo!'}), 200


# 🧱 CADASTRO
@auth_bp.route('/cadastro', methods=['POST'])
def cadastrar_usuario():
    data = request.get_json()

    if not data:
        return jsonify({'erro': 'JSON inválido'}), 400

    nome = data.get('nome')
    email = data.get('email', '').strip().lower()
    senha = data.get('senha')

    if not nome or not email or not senha:
        return jsonify({'erro': 'Todos os campos são obrigatórios!'}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({'erro': 'E-mail já cadastrado!'}), 400

    try:
        novo_usuario = Usuario(nome=nome, email=email)
        novo_usuario.set_senha(senha)

        db.session.add(novo_usuario)
        db.session.commit()

        return jsonify({'mensagem': 'Usuário cadastrado com sucesso!'}), 201

    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({'erro': str(e)}), 500

from utils.otp_service import gerar_otp, tempo_expiracao

@auth_bp.route('/login', methods=['POST'])
def login_usuario():

    data = request.get_json()

    email = data.get('email', '').strip().lower()
    senha = data.get('senha')

    if not email or not senha:
        return jsonify({'erro': 'Preencha todos os campos!'}), 400

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not usuario.verificar_senha(senha):
        return jsonify({'erro': 'E-mail ou senha incorretos!'}), 401

    otp = gerar_otp()

    usuario.otp_codigo = otp
    usuario.otp_expiracao = tempo_expiracao()

    db.session.commit()

    enviar_otp_email(usuario.email, otp)

    return jsonify({
        "mensagem": "Código OTP enviado para seu email",
        "email": usuario.email
    }), 200

@auth_bp.route('/perfil', methods=['GET'])
@jwt_required()
def perfil_usuario():
    usuario_id = get_jwt_identity()  
    claims = get_jwt()
    return jsonify({
        'mensagem': 'Acesso autorizado',
        'usuario': {
            'id': usuario_id,
            'nome': claims.get('nome'),
            'email': claims.get('email')
        }
    }), 200

@auth_bp.route('/verificar-otp', methods=['POST'])
def verificar_otp():

    data = request.get_json()

    email = data.get('email')
    otp = data.get('otp')

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    if usuario.otp_codigo != otp:
        return jsonify({'erro': 'OTP inválido'}), 401

    if usuario.otp_expiracao < datetime.utcnow():
        return jsonify({'erro': 'OTP expirado'}), 401

    access_token = create_access_token(
        identity=str(usuario.id),
        additional_claims={
            "nome": usuario.nome,
            "email": usuario.email
        },
        expires_delta=timedelta(hours=2)
    )

    usuario.otp_codigo = None
    usuario.otp_expiracao = None

    db.session.commit()

    return jsonify({
        "mensagem": "Login validado",
        "token": access_token
    }), 200

@auth_bp.route('/reenviar-otp', methods=['POST'])
def reenviar_otp():

    data = request.get_json()
    email = data.get('email')

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    otp = gerar_otp()

    usuario.otp_codigo = otp
    usuario.otp_expiracao = tempo_expiracao()

    db.session.commit()

    enviar_otp_email(usuario.email, otp)

    return jsonify({"mensagem": "Novo código enviado"}), 200