# TableTrack

TableTrack é um sistema web que permite gerenciar as comandas, mesas e
otimizar o processo de reserva de mesas em restaurantes.

------------------------------------------------------------------------

## 📚 Sumário

1.  [Visão Geral](#visão-geral)\
2.  [Stack Tecnológica](#stack-tecnológica)\
3.  [Estrutura de Pastas](#estrutura-de-pastas)\
4.  [Como Rodar Localmente](#como-rodar-localmente)\
5.  [Autenticação](#autenticação)\
6.  [Banco de Dados](#banco-de-dados)\
7.  [Diagrama de caso de uso ](#diagrama-de-caso-de-uso-uml)\
8.  [Diagrama de classes / UML](#-diagrama-de-classes)
9.  [Fluxo de Uso (User Flow)](#fluxo-de-uso-user-flow)\
10. [Futuras melhorias](#futuras-melhorias)

------------------------------------------------------------------------

## Visão Geral

O **TableTrack** é uma aplicação full-stack para gerenciar operações de
restaurante, incluindo:

-   Cadastro e gerenciamento de mesas;
-   Abertura, fechamento e consulta de comandas;
-   Cadastro de clientes, funcionários e itens do cardápio;
-   Interface para cliente visualizar o cardápio e reservar mesa de
    qualquer lugar.

------------------------------------------------------------------------

## Stack Tecnológica

  Camada           Tecnologias
  ---------------- ------------------------------------------
  Frontend         HTML, JS, CSS (responsivo)
  Backend          Flask, SQLAlchemy, Flask-CORS, Threading
  Banco de Dados   MySQL

------------------------------------------------------------------------

## Estrutura de Pastas

    /
    ├── Cardapio/
    ├── Cliente/
    │   ├── backend/
    │   │   ├── Auth/
    │   │   │   ├── auth_model.py
    │   │   │   ├── auth_routes.py
    │   │   ├── Cardapio/
    │   │   │   ├── cardapio_routes.py
    │   │   ├── QtdMesas/
    │   │   │   ├── quantidadeMesasRoutes.py
    │   │   ├── Reserva/
    │   │   │   ├── reservaModel.py
    │   │   │   ├── reservaRoutes.py
    │   │   ├── venv/
    │   │   ├── .env
    │   │   ├── .gitignore
    │   │   ├── app_cliente.py
    │   │   ├── config.py
    │   │   ├── frontendRoutes.py
    │   │   ├── requirements.txt
    │   ├── frontend/
    │       ├── css/
    │       ├── html/
    │       ├── js/
    ├── Comanda Produto/
    │   ├── __init__.py
    │   ├── cp_models.py
    │   ├── cp_routes.py
    ├── Comandas/
    │   ├── __init__.py
    │   ├── comandas_models.py
    │   ├── comandas_routes.py
    ├── Funcionario/
    │   ├── funcionario_forms.py
    │   ├── funcionario_model.py
    │   ├── funcionario_routes.py
    │   ├── funcionario_service.py
    ├── Mesas/
    │   ├── __init__.py
    │   ├── Comandas/
    │   ├── mesas_cadastradas.py
    │   ├── mesas_model.py
    │   ├── mesas_routes.py
    ├── static/
    │   ├── css/
    │   ├── images/
    │   ├── js/
    │   ├── uploads/
    ├── templates/
    ├── venv/
    ├── .env
    ├── .gitignore
    ├── app.py
    ├── config.py
    ├── docker-compose.yml
    ├── dockerfile
    ├── index_route.py
    ├── requirements.txt

------------------------------------------------------------------------

## Como Rodar Localmente

### 🛠 Pré-requisitos

-   **Python 3.10+**
-   **MySQL instalado**
-   Criar o arquivo .env
-   Criar os bancos necessários para gerar as tabelas
-   Criar e ativar um ambiente virtual (venv)

------------------------------------------------------------------------

### 🖥 Rodar o sistema interno (porta 8001)

1.  Criar e ativar o ambiente virtual:

```{=html}
<!-- -->
```
    python -m venv venv
    venv/Scripts/activate

2.  Instalar dependências:

```{=html}
<!-- -->
```
    pip install -r requirements.txt

3.  Rodar:

```{=html}
<!-- -->
```
    python app.py

------------------------------------------------------------------------

### 🌐 Rodar o sistema externo (Cliente -- porta 8002)

1.  Entrar em:

```{=html}
<!-- -->
```
    Cliente/backend

2.  Ativar o venv:

```{=html}
<!-- -->
```
    venv/Scripts/activate

3.  Rodar:

```{=html}
<!-- -->
```
    python app_cliente.py

------------------------------------------------------------------------

## Autenticação

O sistema utiliza autenticação baseada em sessão + token simples
armazenado no backend cliente.

------------------------------------------------------------------------

## Banco de Dados

-   MySQL
-   Migrations automáticas via SQLAlchemy ao rodar os arquivos
    principais (`app.py`, `app_cliente.py`).

------------------------------------------------------------------------

## 📌 Diagrama de Caso de Uso
![Diagrama de Caso de Uso](static/images/Captura%20de%20tela%202025-11-24%20185317.png)

------------------------------------------------------------------------

## 📌 Diagrama de Classes
![Diagrama de Classes](static/images/Captura%20de%20tela%202025-11-24%20185455.png)

------------------------------------------------------------------------

## Fluxo de Uso (User Flow)

1.  Cliente acessa o site externo\
2.  Realiza Cadastro/Login
3.  Visualiza cardápio\
4.  Realiza reserva com base nas mesas disponíveis do sistema interno\
5.  Visualiza Minhas reservas\
6.  Funcionário no sistema interno gerencia mesas, comandas e
    atualizações presencialmente

------------------------------------------------------------------------

## Futuras melhorias

-   Dockerização;
-   Atualizar lógica da atualização do status das mesas

------------------------------------------------------------------------


