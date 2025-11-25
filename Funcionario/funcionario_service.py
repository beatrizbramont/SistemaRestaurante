import os
import re
from flask import current_app
from config import db
from werkzeug.utils import secure_filename
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
    

def atualizar_funcionario(funcionario, dados, arquivo_imagem):

    nome = dados.get("nome")
    cargo = dados.get("cargo")
    email = dados.get("email")
    senha = dados.get("senha")
    telefone = re.sub(r"\D", "", dados.get("telefone", "")) 

    if nome:
        funcionario.nome = nome
    if cargo:
        funcionario.cargo = cargo
    if email:
        funcionario.email = email
    if senha:
        funcionario.senha = senha
    if telefone:
        funcionario.telefone = telefone

    if arquivo_imagem:
        nome_arquivo = secure_filename(arquivo_imagem.filename)
        caminho = os.path.join(current_app.config['UPLOAD_FOLDER'], nome_arquivo)
        arquivo_imagem.save(caminho)

        funcionario.imagem = nome_arquivo  

    db.session.commit()

    return funcionario

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

