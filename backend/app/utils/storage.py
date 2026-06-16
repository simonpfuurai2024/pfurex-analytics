import os
import shutil
from pathlib import Path
from fastapi import UploadFile

STORAGE_PATH = os.getenv("FILE_STORAGE_PATH", "./uploads")

def save_upload(upload_file: UploadFile, company_id: str, document_id: str) -> str:
    """Saves file to local storage and returns the relative path (from STORAGE_PATH)."""
    dest_dir = Path(STORAGE_PATH) / str(company_id)
    dest_dir.mkdir(parents=True, exist_ok=True)
    file_ext = Path(upload_file.filename).suffix
    file_name = f"{document_id}{file_ext}"
    file_path = dest_dir / file_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    # Return path relative to the backend directory (which is where STORAGE_PATH lives)
    return str(file_path)

def delete_file(file_path: str):
    """Deletes a file from local storage."""
    full_path = Path(file_path)
    if full_path.exists():
        full_path.unlink()
