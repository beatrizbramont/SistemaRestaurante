def enviar_otp_email(funcionario, codigo):
    """
    Aqui futuramente entra Flask-Mail, SMTP, SendGrid etc.
    """
    print("===================================")
    print("ENVIO DE OTP (SIMULAÇÃO)")
    print(f"Funcionário: {funcionario.nome}")
    print(f"Email: {funcionario.email}")
    print(f"Código OTP: {codigo}")
    print("===================================")