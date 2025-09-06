# Dockerfile for Django backend deployment on Render
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend code
COPY backend /app/backend

# Set environment variables for Django
ENV DJANGO_SETTINGS_MODULE=quicksync.settings

# Expose port 8000
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn quicksync.wsgi:application --bind 0.0.0.0:8000"]
