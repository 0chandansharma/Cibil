# backend/create_admin.py
# Run this script to create an admin user
from app.db.session import SessionLocal
from app.db.models import User, UserRole
from app.core.security import get_password_hash
import datetime

db = SessionLocal()
admin = User(
    username='admin',
    email='admin@deecogs.com',
    password_hash=get_password_hash('admin@123'),
    role=UserRole.ADMIN,
    is_active=True,
    created_at=datetime.datetime.utcnow()
)
db.add(admin)
db.commit()
db.close()
print('Admin user created: admin@deecogs.com / admin@123')