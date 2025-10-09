from config import app, db
'''Blueprint - rotas'''
from frontendRoutes import frontend_bp
from QtdMesas.quantidadeMesasRoutes import quantidade_bp
from Resultado.esperaRoutes import espera_bp

app.register_blueprint(frontend_bp)
app.register_blueprint(quantidade_bp)
app.register_blueprint(espera_bp)

with app.app_context():
    db.create_all()
    
if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])