AUTH_USER_MODEL = 'grades.User'  # Use custom user model
REST_FRAMEWORK = {  # Enable JWT token for auth
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}