import random
from datetime import datetime, timedelta

def gerar_otp():
    return str(random.randint(100000, 999999))

def tempo_expiracao():
    return datetime.utcnow() + timedelta(minutes=5)