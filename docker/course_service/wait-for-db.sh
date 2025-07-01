#!/bin/sh
set -e

host="$1"
port="$2"
shift 2
cmd="$@"

# Hardcoded credentials
POSTGRES_USER='db_course'
DB_NAME='course_service_db'

until PGPASSWORD='PWD' psql -h "$host" -p "$port" -U "$POSTGRES_USER" -d "$DB_NAME" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd