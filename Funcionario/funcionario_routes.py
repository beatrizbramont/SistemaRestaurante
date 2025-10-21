import sys
import os
from flask import Blueprint, request, jsonify, redirect, url_for, render_template
from Funcionario.funcionario_service import cadastrar_funcionario, listar_usuario_email
from Funcionario.funcionario_model import Funcionario
from Funcionario.funcionario_forms import LoginForm




funcionarios_bp = Blueprint('funcionarios', __name__,template_folder='../frontend',static_folder='../frontend',  static_url_path='/frontend_static')    


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
    form = LoginForm()
    if request.method == 'POST':

        email = request.form['email']
        senha = request.form['senha']

        funcionario_bd = listar_usuario_email(email)

        if funcionario_bd and funcionario_bd.senha == senha:
            return redirect(url_for('frontend.serve_frontend'))

        else:
            return jsonify({"erro": "Email ou senha inválidos"}), 401
        
    return render_template("html/login.html", form=form)

