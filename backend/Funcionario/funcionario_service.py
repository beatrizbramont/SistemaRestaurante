from config import db
from Funcionario.funcionario_model import Funcionario

def cadastrar_funcionario(funcionario):
    funcionario_bd = Funcionario(
        nome=funcionario.nome,
        cargo=funcionario.cargo,
        email=funcionario.email,
        senha=funcionario.senha
    )

    db.session.add(funcionario_bd)
    db.session.commit() 

    return funcionario_bd

