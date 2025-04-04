# backend/create_ca_user.py
from app.db.session import SessionLocal
from app.db.models import User, UserRole
from app.core.security import get_password_hash
import datetime

db = SessionLocal()
ca_user = User(
    username='user',
    email='user@deecogs.com',
    password_hash=get_password_hash('user@123'),
    role=UserRole.CA,
    is_active=True,
    created_at=datetime.datetime.utcnow()
)
db.add(ca_user)
db.commit()
db.close()
print('CA user created: user@deecogs.com / user@123')