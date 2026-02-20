from config import db
from Funcionario.funcionario_model import Funcionario
from werkzeug.security import generate_password_hash

def seed_scrum():

    email = "scrum@empresa.com"

    existe = Funcionario.query.filter_by(email=email).first()
    if existe:
        print("✔ Usuário Scrum já existe")
        return

    scrum = Funcionario(
        nome="Scrum Master",
        cargo="SCRUM",
        telefone="11999999999",
        email=email,
        senha=generate_password_hash("scrum123"),
        imagem=None
    )

    db.session.add(scrum)
    db.session.commit()

    print("✅ Scrum Master criado com sucesso!")
