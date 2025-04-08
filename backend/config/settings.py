AUTH_USER_MODEL = 'grades.User'  # Use custom user model
REST_FRAMEWORK = {  # Enable JWT token for auth
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'clearsky',          # Nombre de tu base de datos
        'USER': 'clearsky',          # Usuario de la base de datos
        'PASSWORD': 'clearsky', # Contraseña del usuario
        'HOST': 'localhost',         # Dirección del servidor (o 'postgres' si usas Docker)
        'PORT': '5432',              # Puerto de PostgreSQL (por defecto es 5432)
    }
}