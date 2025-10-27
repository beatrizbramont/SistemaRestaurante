from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, FileField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length
from flask_wtf.file import FileAllowed

class CadastroFuncionarioForm(FlaskForm):
    nome = StringField('Nome', validators=[DataRequired(), Length(min=4, max=120)])
    cargo = SelectField('Cargo', choices=[
    ('Garçom', 'Garçom'),
    ('Balconista', 'Balconista'),
    ('Cozinheiro', 'Cozinheiro'),
    ('Gerente', 'Gerente')], 
    validators=[DataRequired()])
    telefone = StringField('Telefone', validators=[DataRequired()])
    email = StringField(label='Email', validators=[DataRequired(), Email()])
    senha = PasswordField(label='Senha', validators=[DataRequired(), Length(min=4)])
    imagem = FileField('Foto do Funcionário', validators=[
        FileAllowed(['jpg', 'png', 'jpeg'], 'Somente imagens JPG e PNG!')
    ])
    enviar = SubmitField('Cadastrar')


class LoginForm(FlaskForm):
    email = StringField(label='Email', validators=[DataRequired(), Email()])
    senha = PasswordField(label='Senha', validators=[DataRequired(), Length(min=4)])
    submit = SubmitField('Entrar')