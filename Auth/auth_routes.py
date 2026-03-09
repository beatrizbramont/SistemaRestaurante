from flask import Blueprint, render_template, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from Funcionario.funcionario_service import listar_usuario_email
from .auth_forms import LoginForm

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():

    if "usuario_id" in session:
        return redirect(url_for("index.dashboard"))

    form = LoginForm()

    if form.validate_on_submit():

        funcionario = listar_usuario_email(form.email.data)

        if not funcionario:
            flash("E-mail não cadastrado.", "error")

        elif not check_password_hash(funcionario.senha, form.senha.data):
            flash("Senha incorreta.", "error")

        else:
            session["usuario_id"] = funcionario.id
            session["usuario_permissao"] = funcionario.permissao

            flash("Login realizado com sucesso!", "success")

            return redirect(url_for("index.dashboard"))

    return render_template("login.html", form=form)


@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("Logout realizado com sucesso!", "success")
    return redirect(url_for("auth.login"))