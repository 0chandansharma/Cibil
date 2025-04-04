import os
import uuid
import shutil
from typing import List, Tuple
from fastapi import UploadFile
from app.core.config import settings

def save_upload_file(upload_file: UploadFile, destination_folder: str = None) -> Tuple[str, str]:
    """
    Save an uploaded file to disk
    
    Returns:
        Tuple[str, str]: (file_path, file_extension)
    """
    # Get file extension
    file_extension = os.path.splitext(upload_file.filename)[1].lower()
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Determine destination folder
    if destination_folder is None:
        destination_folder = settings.UPLOAD_DIR
    
    # Ensure destination folder exists
    os.makedirs(destination_folder, exist_ok=True)
    
    # Create full file path
    file_path = os.path.join(destination_folder, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path, file_extension

def is_valid_file_type(filename: str) -> bool:
    """
    Check if file has a valid extension
    """
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    file_extension = os.path.splitext(filename)[1].lower()
    return file_extension in valid_extensions

def get_file_size(file_path: str) -> int:
    """
    Get file size in bytes
    """
    return os.path.getsize(file_path)

def delete_file(file_path: str) -> bool:
    """
    Delete a file
    
    Returns:
        bool: True if file was deleted, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {str(e)}")
        return False