from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from Funcionario.funcionario_service import listar_usuario_email, listar_funcionario_id
from .otp_service import gerar_otp, salvar_otp, validar_otp, limpar_otp
from .email_service import enviar_otp_email
from .auth_forms import LoginForm, OTPForm

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():

    if "usuario_id" in session:
        return redirect(url_for("index.dashboard"))

    form = LoginForm()

    if form.validate_on_submit():
        funcionario = listar_usuario_email(form.email.data)

        if not funcionario:
            flash("E-mail não cadastrado. Por favor, registre-se.", "error")
        elif not check_password_hash(funcionario.senha, form.senha.data):
            flash("Senha incorreta. Tente novamente.", "error")
        else:
            codigo = gerar_otp()
            salvar_otp(funcionario.id, codigo)
            enviar_otp_email(funcionario, codigo)

            session["pre_otp_user"] = funcionario.id

            flash("Código de verificação enviado para seu e-mail.", "info")
            return redirect(url_for("auth.otp"))

    return render_template("login.html", form=form)

@auth_bp.route("/otp", methods=["GET", "POST"])
def otp():

    if "pre_otp_user" not in session:
        return redirect(url_for("auth.login"))

    form = OTPForm()

    if form.validate_on_submit():
        funcionario_id = session["pre_otp_user"]

        if validar_otp(funcionario_id, form.codigo.data):
            print("Código digitado:", form.codigo.data)
            print("ID usuário:", funcionario_id)
            
            funcionario = listar_funcionario_id(funcionario_id)

            session["usuario_id"] = funcionario.id
            session["permissao"] = funcionario.permissao  

            limpar_otp(funcionario_id)
            session.pop("pre_otp_user", None)
        
            flash("Login realizado com sucesso!", "success")
            return redirect(url_for("index.dashboard"))
            
        flash("Código inválido ou expirado.", "error")

    return render_template("otp.html", form=form)

@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("Logout realizado com sucesso!", "success")
    return redirect(url_for("auth.login"))