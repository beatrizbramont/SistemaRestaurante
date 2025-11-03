import os
from flask import current_app
from config import db
from Funcionario.funcionario_model import Funcionario

def cadastrar_funcionario(funcionario):
    funcionario_bd = Funcionario(
        nome=funcionario.nome,
        cargo=funcionario.cargo,
        email=funcionario.email,
        senha=funcionario.senha,
        telefone=getattr(funcionario, 'telefone', '00 00 00000-0000'),
        imagem=getattr(funcionario, 'imagem', None)
    )

    db.session.add(funcionario_bd)
    db.session.commit() 

    return funcionario_bd

def listar_usuario_email(email):
    return Funcionario.query.filter_by(email=email).first()

def listar_funcionario_id(id):
    return Funcionario.query.filter_by(id=id).first()

def verificar_chave(chave):
    if chave == '123456789':
        return True
    
def deletar_funcionario(funcionario):
    if funcionario.imagem: 
        caminho_imagem = os.path.join(current_app.config['UPLOAD_FOLDER'], funcionario.imagem)
        print(f"Tentando deletar imagem: {caminho_imagem}")  

        if os.path.exists(caminho_imagem):
            os.remove(caminho_imagem)
            print("Imagem deletada com sucesso")
        else:
            print(f"Imagem não encontrada em: {caminho_imagem}")

    db.session.delete(funcionario)
    db.session.commit()

