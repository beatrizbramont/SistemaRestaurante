FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y gcc libffi-dev python3-dev cargo && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install cryptography

COPY . .

EXPOSE 8001

CMD ["python", "app.py"]
