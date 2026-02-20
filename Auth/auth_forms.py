from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length


class LoginForm(FlaskForm):
    email = StringField(
        "Email",
        validators=[DataRequired(), Email()]
    )
    senha = PasswordField(
        "Senha",
        validators=[DataRequired()]
    )
    submit = SubmitField("Entrar")


class OTPForm(FlaskForm):
    codigo = StringField(
        "Código",
        validators=[DataRequired(), Length(min=6, max=6)]
    )
    submit = SubmitField("Validar")