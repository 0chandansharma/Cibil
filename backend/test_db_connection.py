# test_db_connection.py
from app.db.session import SessionLocal
from app.db.models import User

db = SessionLocal()
try:
    # Count users
    user_count = db.query(User).count()
    print(f"Total users in database: {user_count}")
    
    # List all users
    users = db.query(User).all()
    for user in users:
        print(f"User: id={user.id}, username={user.username}, email={user.email}, role={user.role}")
finally:
    db.close()