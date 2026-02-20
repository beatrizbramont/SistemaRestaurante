from datetime import datetime
from config import db

class OTP(db.Model):
    __tablename__ = "otps"

    id = db.Column(db.Integer, primary_key=True)

    funcionario_id = db.Column(
        db.Integer,
        db.ForeignKey("funcionarios.id"),
        nullable=False
    )

    codigo = db.Column(db.String(6), nullable=False)

    criado_em = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    expira_em = db.Column(
        db.DateTime,
        nullable=False
    )