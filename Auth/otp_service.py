import random
from datetime import datetime, timedelta
from .otp_model import OTP
from config import db

def gerar_otp():
    return str(random.randint(100000, 999999))

def salvar_otp(funcionario_id, codigo):
    otp = OTP(
        funcionario_id=funcionario_id,
        codigo=codigo,
        criado_em=datetime.utcnow(),
        expira_em=datetime.utcnow() + timedelta(minutes=5)
    )
    db.session.add(otp)
    db.session.commit()
    return otp

def validar_otp(funcionario_id, codigo):
    otp = OTP.query.filter_by(
        funcionario_id=funcionario_id,
        codigo=codigo
    ).first()

    if not otp:
        return False

    if otp.expira_em < datetime.utcnow():
        return False

    return True

def limpar_otp(funcionario_id):
    OTP.query.filter_by(funcionario_id=funcionario_id).delete()
    db.session.commit()