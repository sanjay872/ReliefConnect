from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "test")

client: Optional[AsyncIOMotorClient] = None

def get_mongo_client() -> AsyncIOMotorClient:
    """
    Returns a global MongoDB client instance.
    Ensures only ONE client exists (recommended by Motor & FastAPI).
    """
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI, maxPoolSize=20, minPoolSize=5)
    return client

def get_db():
    return get_mongo_client()[DB_NAME]
