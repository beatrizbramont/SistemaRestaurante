from flask import Blueprint, request, jsonify
from config import db
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

    except Exception:
        db.session.rollback()
        return jsonify({'erro': 'Erro ao cadastrar usuário.'}), 500


# 🔐 LOGIN
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

    # JWT CORRIGIDO — identity PRECISA SER STRING
    access_token = create_access_token(
        identity=str(usuario.id),  # <--- CORREÇÃO PRINCIPAL
        additional_claims={
            "nome": usuario.nome,
            "email": usuario.email
        },
        expires_delta=timedelta(hours=2)
    )

    return jsonify({
        'mensagem': f'Login realizado com sucesso!',
        'token': access_token,
        'usuario': {
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email
        }
    }), 200


# 🔎 PEGAR PERFIL
@auth_bp.route('/perfil', methods=['GET'])
@jwt_required()
def perfil_usuario():
    usuario_id = get_jwt_identity()  # agora é uma string
    claims = get_jwt()
    return jsonify({
        'mensagem': 'Acesso autorizado',
        'usuario': {
            'id': usuario_id,
            'nome': claims.get('nome'),
            'email': claims.get('email')
        }
    }), 200
