# check_user.py
from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import verify_password

def check_user(username, password):
    db = SessionLocal()
    try:
        # Try to find user by username
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"No user found with username: {username}")
            
            # Try to find user by email
            user = db.query(User).filter(User.email == username).first()
            if not user:
                print(f"No user found with email: {username}")
                return
            else:
                print(f"Found user by email: {user.username}")
        else:
            print(f"Found user by username: {user.username}")
        
        # Check password
        if verify_password(password, user.password_hash):
            print("Password is correct!")
            print(f"User details: id={user.id}, role={user.role}, is_active={user.is_active}")
        else:
            print("Password is incorrect!")
            
    finally:
        db.close()

# Test with your credentials
check_user("test1", "password123")
# Also try with email
check_user("test1@example.com", "password123")