# backend/app/core/celery_app.py
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.document_processing"]
)

celery_app.conf.task_routes = {
    "app.tasks.document_processing.*": {"queue": "document_processing"}
}

celery_app.conf.update(task_track_started=True)