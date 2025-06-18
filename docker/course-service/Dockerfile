FROM python:3.10

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app
COPY requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY ..
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD["gunicorn","course_project.wsgi:application","--bind","0.0.0.0:8000"]

