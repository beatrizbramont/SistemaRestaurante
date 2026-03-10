import smtplib
from email.mime.text import MIMEText
from flask import current_app


def enviar_otp_email(destinatario, otp):

    assunto = "Seu código de verificação - TableTrack"

    corpo = f"""
Olá!

Seu código de verificação é:

{otp}

Esse código expira em 5 minutos.

Caso não tenha solicitado login, ignore este email.

Equipe TableTrack
"""

    msg = MIMEText(corpo)
    msg["Subject"] = assunto
    msg["From"] = current_app.config["MAIL_USERNAME"]
    msg["To"] = destinatario

    try:
        with smtplib.SMTP(
            current_app.config["MAIL_SERVER"],
            current_app.config["MAIL_PORT"]
        ) as server:

            server.starttls()

            server.login(
                current_app.config["MAIL_USERNAME"],
                current_app.config["MAIL_PASSWORD"]
            )

            server.send_message(msg)

        print("EMAIL OTP ENVIADO")

    except Exception as e:
        print("Erro ao enviar email:", e)