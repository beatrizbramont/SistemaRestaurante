from flask import Blueprint, request, jsonify
from config import db
from Auth.auth_model import Usuario

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/auth')

# Rota de cadastro
@auth_bp.route('/cadastro', methods=['POST'])
def cadastrar_usuario():
    data = request.get_json()

    nome = data.get('nome')
    email = data.get('email')
    senha = data.get('senha')

    if not nome or not email or not senha:
        return jsonify({'erro': 'Todos os campos são obrigatórios!'}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({'erro': 'E-mail já cadastrado!'}), 400

    novo_usuario = Usuario(nome=nome, email=email)
    novo_usuario.set_senha(senha)
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({'mensagem': 'Usuário cadastrado com sucesso!'}), 201


# Rota de login
@auth_bp.route('/login', methods=['POST'])
def login_usuario():
    data = request.get_json()

    email = data.get('email')
    senha = data.get('senha')

    if not email or not senha:
        return jsonify({'erro': 'Preencha todos os campos!'}), 400

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not usuario.verificar_senha(senha):
        return jsonify({'erro': 'E-mail ou senha incorretos!'}), 401

    return jsonify({'mensagem': f'Login realizado com sucesso! Bem-vindo, {usuario.nome}'}), 200
