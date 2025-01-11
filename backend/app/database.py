from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

# 获取当前文件的目录
BASE_DIR = Path(__file__).resolve().parent.parent

# 加载.env文件
load_dotenv(BASE_DIR / '.env')

# 从环境变量获取数据库URL
DATABASE_URL = os.getenv("SUPABASE_DB_URL")

# 在创建engine之前添加调试信息
print("Database URL:", DATABASE_URL)
if not DATABASE_URL:
    print("Warning: DATABASE_URL is not set!")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 