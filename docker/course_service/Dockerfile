FROM python:3.10
RUN apt-get update && apt-get install -y postgresql-client
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN chmod +x wait-for-db.sh
CMD ["sh", "-c", "./wait-for-db.sh course_db 5432 && python manage.py runserver 0.0.0.0:8002"]