import os
import re
from flask import Blueprint, request, jsonify, redirect, url_for, render_template, current_app, flash
from .funcionario_service  import cadastrar_funcionario, listar_usuario_email
from .funcionario_model  import Funcionario
from .funcionario_forms  import CadastroFuncionarioForm, LoginForm

funcionarios_bp = Blueprint('funcionarios', __name__)   


@funcionarios_bp.route("/funcionarios/json",  methods=['POST'])
def criar_funcionario_json():
    dados = request.json

    funcionario = Funcionario(
        nome=dados['nome'],
        cargo=dados['cargo'],
        telefone=dados['telefone'],
        email=dados['email'],
        senha=dados['senha']
    )

    funcionario_criado = cadastrar_funcionario(funcionario)

    return jsonify({
        'id': funcionario_criado.id,
        'nome': funcionario_criado.nome,
        'cargo': funcionario_criado.cargo,
        'telefone': funcionario_criado.telefone,
        'email': funcionario_criado.email
    }), 201


@funcionarios_bp.route('/funcionarios', methods=['GET'])
def funcionarios_page():
    form_cadastro = CadastroFuncionarioForm()
    funcionarios = Funcionario.query.all()

    return render_template('funcionarios.html', funcionarios=funcionarios, form_cadastro=form_cadastro)

@funcionarios_bp.route('/funcionarios', methods=['POST'])
def criar_funcionario_form():
    form = CadastroFuncionarioForm()
    if form.validate_on_submit():
        nome = form.nome.data
        cargo = form.cargo.data
        email = form.email.data
        senha = form.senha.data
        telefone = re.sub(r'\D', '', form.telefone.data or '')

        imagem = form.imagem.data
        if imagem:
            from werkzeug.utils import secure_filename
            nome_arquivo = secure_filename(imagem.filename)
            caminho = os.path.join(current_app.config['UPLOAD_FOLDER'], nome_arquivo)
            imagem.save(caminho)
        else:
            nome_arquivo = None

        funcionario = Funcionario(
            nome=nome,
            cargo=cargo,
            email=email,
            senha=senha,
            telefone=telefone,
            imagem=nome_arquivo
        )
        cadastrar_funcionario(funcionario)
        flash(f"Funcionário {nome} cadastrado com sucesso!", "success")
    print(form.errors)
    return redirect(url_for('funcionarios.funcionarios_page'))


@funcionarios_bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if request.method == 'POST':

        email = request.form['email']
        senha = request.form['senha']

        funcionario_bd = listar_usuario_email(email)

        if funcionario_bd and funcionario_bd.senha == senha:
            return redirect(url_for('index.index'))

        else:
            return jsonify({"erro": "Email ou senha inválidos"}), 401
        
    return render_template("login.html", form=form)

