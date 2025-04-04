# test_password_hash.py
from app.core.security import get_password_hash, verify_password

# Create a password hash
password = "password123"
hashed = get_password_hash(password)
print(f"Password: {password}")
print(f"Hashed: {hashed}")

# Verify the password
is_valid = verify_password(password, hashed)
print(f"Password valid: {is_valid}")

# Try an incorrect password
is_invalid = verify_password("wrongpassword", hashed)
print(f"Wrong password valid: {is_invalid}")