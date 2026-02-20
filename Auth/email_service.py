from flask_mail import Message
from Auth.extensions import mail

def enviar_otp_email(funcionario, codigo):
    msg = Message(
        subject="Seu código de verificação",
        recipients=[funcionario.email],
        body=f"""
Olá, {funcionario.nome}!

Seu código de verificação é:

{codigo}

Este código expira em 5 minutos.

Sistema Restaurante
"""
    )

    mail.send(msg)