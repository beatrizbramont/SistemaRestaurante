import sys
import os
from flask import Blueprint, request, jsonify, send_from_directory, redirect, url_for
from Funcionario.funcionario_service import cadastrar_funcionario, listar_usuario_email
from Funcionario.funcionario_model import Funcionario
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'frontend')


funcionarios_bp = Blueprint('funcionarios', __name__)
frontend_bp = Blueprint('frontend', __name__)


@funcionarios_bp.route("/painel") 
def painel_page(): 
    return send_from_directory(os.path.join(STATIC_DIR, "html"), "painel.html")

@funcionarios_bp.route("/funcionarios",  methods=['POST'])
def criar_funcionario():
    dados = request.json

    funcionario = Funcionario(
        nome=dados['nome'],
        cargo=dados['cargo'],
        email=dados['email'],
        senha=dados['senha']
    )

    funcionario_criado = cadastrar_funcionario(funcionario)

    return jsonify({
        'id': funcionario_criado.id,
        'nome': funcionario_criado.nome,
        'cargo': funcionario_criado.cargo,
        'email': funcionario_criado.email
    }), 201


@funcionarios_bp.route('/funcionarios', methods=['GET'])
def listar_funcionarios():
    funcionarios = Funcionario.query.all()
    lista = []
    for f in funcionarios:
        lista.append({
            'id': f.id,
            'nome': f.nome,
            'cargo': f.cargo,
            'email': f.email
        })
    return jsonify(lista), 200


@funcionarios_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST':

        email = request.form['email']
        senha = request.form['pwd']

        funcionario_bd = listar_usuario_email(email)

        if funcionario_bd and funcionario_bd.senha == senha:
            return redirect(url_for('funcionarios.painel_page'))

        else:
            return jsonify({"erro": "Email ou senha inválidos"}), 401
        
    return send_from_directory(os.path.join(STATIC_DIR, "html"), "login.html")

