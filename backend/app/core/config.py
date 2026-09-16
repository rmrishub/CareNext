import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareConnect Elder Care Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careconnect-super-secret-jwt-key-chennai-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Adaptive Database URL: SQLite (default dev) or PostgreSQL + PostGIS (prod/staging)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./careconnect.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Chennai core serviceable localities and pincode ranges
    CHENNAI_PINCODES: List[str] = [
        # Central / South Chennai Core Hubs
        "600020",  # Adyar
        "600090",  # Besant Nagar
        "600041",  # Thiruvanmiyur
        "600042",  # Velachery
        "600004",  # Mylapore
        "600017",  # T. Nagar
        "600018",  # Alwarpet
        "600034",  # Nungambakkam
        "600040",  # Anna Nagar
        "600010",  # Kilpauk
        "600014",  # Royapettah
        "600096",  # Perungudi / OMR
        "600119",  # Sholinganallur / OMR
        "600028",  # R.A. Puram
        "600085",  # Kotturpuram
        "600024",  # Kodambakkam
        "600033",  # West Mambalam
        "600083",  # Ashok Nagar
        "600078",  # K.K. Nagar
        "600100",  # Medavakkam
        "600115",  # Ennore (boundary check)
        "600001",  # George Town / North Chennai
        "600002",  # Mount Road
        "600006",  # Thousand Lights
        "600025",  # Guindy
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
