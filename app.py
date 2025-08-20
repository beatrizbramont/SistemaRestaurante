import os
from config import app, db
# chamar as rotas
from Swagger.swagger_config import configure_swagger

# Registrar os blueprints
app.register_blueprint(cardapio_bp)
app.register_blueprint(professor_bp)
app.register_blueprint(turma_bp)

configure_swagger(app)

with app.app_context():
    db.drop_all()
    db.create_all()
    

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port = app.config['PORT'],debug=app.config['DEBUG'])