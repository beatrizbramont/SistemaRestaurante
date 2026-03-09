import os
import re
from flask import Blueprint, request, jsonify, redirect, url_for, render_template, current_app, flash, session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from .funcionario_service import (
    cadastrar_funcionario,
    listar_usuario_email,
    verificar_chave,
    listar_funcionario_id,
    deletar_funcionario
)

from .funcionario_model import Funcionario
from .funcionario_forms import CadastroFuncionarioForm, LoginForm, DeleteForm
from config import db

funcionarios_bp = Blueprint('funcionarios', __name__)


@funcionarios_bp.route('/funcionarios', methods=['GET'])
def funcionarios_page():

    if "usuario_id" not in session:
        return redirect(url_for("funcionarios.login"))

    if session.get("usuario_permissao") != "ADMIN":
        flash("Acesso restrito.", "error")
        return redirect(url_for("index.dashboard"))

    form_cadastro = CadastroFuncionarioForm()
    funcionarios = Funcionario.query.all()
    form_deletar = DeleteForm()

    return render_template(
        'funcionarios.html',
        funcionarios=funcionarios,
        form_cadastro=form_cadastro,
        form_deletar=form_deletar
    )


@funcionarios_bp.route('/funcionarios', methods=['POST'])
def criar_funcionario_form():

    if "usuario_id" not in session:
        return redirect(url_for("funcionarios.login"))

    form = CadastroFuncionarioForm()

    if form.validate_on_submit():

        telefone = re.sub(r'\D', '', form.telefone.data or '')

        imagem = form.imagem.data
        nome_arquivo = None

        if imagem:
            nome_arquivo = secure_filename(imagem.filename)
            caminho = os.path.join(current_app.config['UPLOAD_FOLDER'], nome_arquivo)
            imagem.save(caminho)

        funcionario = Funcionario(
            nome=form.nome.data,
            cargo=form.cargo.data,
            email=form.email.data,
            senha=generate_password_hash(form.senha.data),
            telefone=telefone,
            permissao=form.permissao.data,
            imagem=nome_arquivo
        )

        cadastrar_funcionario(funcionario)

        flash(f"Funcionário {form.nome.data} cadastrado com sucesso!", "success")

    return redirect(url_for('funcionarios.funcionarios_page'))


@funcionarios_bp.route("/funcionario/atualizar/<int:id>", methods=["POST"])
def atualizar_funcionario_form(id):

    if "usuario_id" not in session:
        return redirect(url_for("funcionarios.login"))

    funcionario = Funcionario.query.get_or_404(id)

    funcionario.nome = request.form.get("nome")
    funcionario.cargo = request.form.get("cargo")
    funcionario.email = request.form.get("email")
    funcionario.telefone = request.form.get("telefone")
    funcionario.permissao = request.form.get("permissao")

    senha = request.form.get("senha")

    # senha só atualiza se preenchida
    if senha:
        funcionario.senha = generate_password_hash(senha)

    arquivo_imagem = request.files.get("imagem")

    if arquivo_imagem and arquivo_imagem.filename != "":
        nome_arquivo = secure_filename(arquivo_imagem.filename)
        caminho = os.path.join(current_app.config['UPLOAD_FOLDER'], nome_arquivo)
        arquivo_imagem.save(caminho)

        funcionario.imagem = nome_arquivo

    db.session.commit()

    flash(f"Funcionário {funcionario.nome} atualizado com sucesso!", "success")

    return redirect(url_for("funcionarios.funcionarios_page"))


@funcionarios_bp.route('/funcionarios/delete/<int:id>', methods=['POST'])
def deletar_funcionario_route(id):

    if "usuario_id" not in session:
        return redirect(url_for("funcionarios.login"))

    form = DeleteForm()
    funcionario = listar_funcionario_id(id)

    if not funcionario:
        flash("Funcionário não encontrado.", "error")
        return redirect(url_for('funcionarios.funcionarios_page'))

    if form.validate_on_submit():
        chave = form.chave.data

        if verificar_chave(chave):
            deletar_funcionario(funcionario)
            flash(f"Funcionário {funcionario.nome} deletado com sucesso!", "success")
        else:
            flash("Chave incorreta.", "error")

    return redirect(url_for('funcionarios.funcionarios_page'))


@funcionarios_bp.route("/login", methods=["GET", "POST"])
def login():

    if "usuario_id" in session:
        return redirect(url_for("index.dashboard"))

    form = LoginForm()

    if form.validate_on_submit():

        funcionario_bd = listar_usuario_email(form.email.data)

        if funcionario_bd and check_password_hash(funcionario_bd.senha, form.senha.data):

            session["usuario_id"] = funcionario_bd.id
            session["usuario_nome"] = funcionario_bd.nome
            session["usuario_cargo"] = funcionario_bd.cargo
            session["usuario_permissao"] = funcionario_bd.permissao

            flash("Login realizado com sucesso!", "success")

            return redirect(url_for('index.dashboard'))

        else:
            flash("Email ou senha inválidos.", "error")

    return render_template("login.html", form=form)


@funcionarios_bp.route("/logout")
def logout():
    session.clear()
    flash("Logout realizado com sucesso!", "success")
    return redirect(url_for("funcionarios.login"))