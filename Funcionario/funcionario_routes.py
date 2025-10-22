from flask import Blueprint, request, jsonify, redirect, url_for, render_template
from .funcionario_service  import cadastrar_funcionario, listar_usuario_email
from .funcionario_model  import Funcionario
from .funcionario_forms  import LoginForm

funcionarios_bp = Blueprint('funcionarios', __name__)   


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
def funcionarios_page():
    funcionarios = Funcionario.query.all()

    return render_template('funcionarios.html', funcionarios=funcionarios)


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

