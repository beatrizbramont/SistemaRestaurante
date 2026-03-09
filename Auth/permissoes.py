from functools import wraps
from flask import session, redirect, url_for, flash

def permissao_necessaria(*permissoes):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if "usuario_id" not in session:
                return redirect(url_for("auth.login"))

            if session.get("permissao") not in permissoes:
                flash("Acesso não autorizado.", "error")
                return redirect(url_for("index.dashboard"))

            return f(*args, **kwargs)
        return wrapper
    return decorator