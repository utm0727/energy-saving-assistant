from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)
        
    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)
        
    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
    async def register_user(self, user: UserCreate, db: Session):
        try:
            # 检查用户是否已存在
            db_user = db.query(User).filter(User.email == user.email).first()
            if db_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # 创建新用户
            hashed_password = self.get_password_hash(user.password)
            db_user = User(
                email=user.email,
                username=user.username,
                hashed_password=hashed_password,
                created_at=datetime.utcnow()
            )
            
            try:
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
            except Exception as e:
                db.rollback()
                print(f"Database error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {str(e)}"
                )
            
            return {"message": "User created successfully"}
        except Exception as e:
            print(f"Registration service error: {str(e)}")
            raise
        
    async def authenticate_user(self, username: str, password: str, db: Session):
        try:
            # 查找用户
            user = db.query(User).filter(User.username == username).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )

            # 验证密码
            if not self.verify_password(password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect password"
                )
            
            # 创建访问令牌
            try:
                access_token = self.create_access_token(data={"sub": str(user.id)})
                return {"access_token": access_token, "token_type": "bearer"}
            except Exception as e:
                print(f"Token creation error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error creating token: {str(e)}"
                )
            
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            raise
        
    def get_user_id_from_token(self, token: str) -> int:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            return int(user_id)
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token") 