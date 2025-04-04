# Create a test user script
from app.db.session import SessionLocal
from app.db.models import User, UserRole
from app.core.security import get_password_hash
import datetime

db = SessionLocal()

# Check if test user already exists
test_user = db.query(User).filter(User.username == "test1").first()
if not test_user:
    # Create test user
    test_user = User(
        username="test1",
        email="test1@example.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.CA,
        is_active=True,
        created_at=datetime.datetime.utcnow()
    )
    db.add(test_user)
    db.commit()
    print('Test user created: testuser / password123')
else:
    print('Test user already exists')

db.close()