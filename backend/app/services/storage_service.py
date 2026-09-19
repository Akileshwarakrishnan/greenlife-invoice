import os
import shutil
from abc import ABC, abstractmethod
from app.core.config import settings

class BaseStorageService(ABC):
    @abstractmethod
    def save_file(self, content: bytes, filename: str, subfolder: str = "invoices") -> str:
        pass

    @abstractmethod
    def get_file_path(self, filename: str, subfolder: str = "invoices") -> str:
        pass

class LocalStorageService(BaseStorageService):
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or settings.STORAGE_LOCAL_PATH
        os.makedirs(self.base_dir, exist_ok=True)
        os.makedirs(os.path.join(self.base_dir, "invoices"), exist_ok=True)
        os.makedirs(os.path.join(self.base_dir, "uploads"), exist_ok=True)

    def save_file(self, content: bytes, filename: str, subfolder: str = "invoices") -> str:
        target_dir = os.path.join(self.base_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        file_path = os.path.join(target_dir, filename)
        with open(file_path, "wb") as f:
            f.write(content)
        return file_path

    def get_file_path(self, filename: str, subfolder: str = "invoices") -> str:
        return os.path.join(self.base_dir, subfolder, filename)

class S3StorageService(BaseStorageService):
    def __init__(self):
        self.bucket = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION

    def save_file(self, content: bytes, filename: str, subfolder: str = "invoices") -> str:
        # If boto3/credentials available, upload to S3, otherwise fallback to local
        try:
            import boto3
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=self.region
            )
            key = f"{subfolder}/{filename}"
            s3_client.put_object(Bucket=self.bucket, Key=key, Body=content)
            return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"
        except Exception:
            local = LocalStorageService()
            return local.save_file(content, filename, subfolder)

    def get_file_path(self, filename: str, subfolder: str = "invoices") -> str:
        key = f"{subfolder}/{filename}"
        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"

def get_storage_service() -> BaseStorageService:
    if settings.STORAGE_TYPE == "s3" and settings.AWS_ACCESS_KEY_ID:
        return S3StorageService()
    return LocalStorageService()

storage_service = get_storage_service()
