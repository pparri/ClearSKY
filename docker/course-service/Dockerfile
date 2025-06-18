# Dockerfile

FROM python:3.11-slim

# Crea el directorio de la app
WORKDIR /app

# Copia requirements e instala dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código fuente
COPY . .

# Puerto (ajústalo si no usas uvicorn)
EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

