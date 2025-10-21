from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length

class CadastroFuncionarioForm(FlaskForm):
    ...

class LoginForm(FlaskForm):
    email = StringField(label='Email', validators=[DataRequired(), Email()])
    senha = PasswordField(label='Senha', validators=[DataRequired(), Length(min=4)])
    submit = SubmitField('Entrar')