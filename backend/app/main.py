import sys
from pathlib import Path

# 将项目根目录添加到Python路径
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import pandas as pd
import io
from datetime import datetime
from sqlalchemy import text
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

from backend.app.database import get_db
from backend.app.services.analysis import EnergyAnalysisService
from backend.app.services.auth import AuthService
from backend.app.schemas.user import UserCreate, User
from backend.app.schemas.analysis import AnalysisResponse

app = FastAPI(
    title="Energy Saving Assistant",
    description="AI-powered electricity consumption analysis and saving suggestions",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

# 添加静态文件服务
app.mount("/static", StaticFiles(directory="static"), name="static")

# 初始化服务
auth_service = AuthService()
analysis_service = EnergyAnalysisService()

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 添加这个配置
app.swagger_ui_init_oauth = {
    "usePkceWithAuthorizationCodeGrant": True,
    "clientId": "swagger-ui",
}

security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "Welcome to Energy Saving Assistant API"}

# 测试数据库连接的端点
@app.get("/test-db")
async def test_db(db: Session = Depends(get_db)):
    try:
        # 使用 text() 包装 SQL 查询
        result = db.execute(text("SELECT 1"))
        return {"message": "Database connection successful!", "result": result.scalar()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# 用户注册
@app.post("/register", response_model=dict)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        return await auth_service.register_user(user, db)
    except Exception as e:
        print(f"Registration error: {str(e)}")  # 打印详细错误信息
        import traceback
        traceback.print_exc()  # 打印完整的错误堆栈
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

# 用户登录
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        result = await auth_service.authenticate_user(form_data.username, form_data.password, db)
        print("Token generated:", result)
        return result
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )

# 上传数据集
@app.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        print(f"Received file: {file.filename}")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="Only CSV files are allowed"
            )
        
        contents = await file.read()
        print("File contents read successfully")
        
        try:
            df = pd.read_csv(io.BytesIO(contents))
            print("CSV parsed successfully")
            print("Columns:", df.columns.tolist())
            
            # 重命名列名以匹配期望的格式
            df = df.rename(columns={
                'Date': 'date',
                'Usage': 'consumption'
            })
            
            print("Columns after renaming:", df.columns.tolist())
            print("First few rows:", df.head())
            
        except Exception as e:
            print(f"Error parsing CSV: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error parsing CSV file: {str(e)}")
        
        # 验证数据集格式
        required_columns = ['date', 'consumption']
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # 验证数据类型
        try:
            df['date'] = pd.to_datetime(df['date'])
            print("Date column converted successfully")
        except Exception as e:
            print(f"Error converting dates: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error in date column: {str(e)}"
            )
            
        try:
            df['consumption'] = pd.to_numeric(df['consumption'], errors='coerce')
            print("Consumption column converted successfully")
        except Exception as e:
            print(f"Error converting consumption values: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error in consumption column: {str(e)}"
            )
        
        if df['consumption'].isna().any():
            raise HTTPException(
                status_code=400,
                detail="Invalid consumption values in dataset"
            )
        
        # 获取用户ID并存储数据
        try:
            # 移除 'bearer ' 前缀（如果存在）
            token = auth.credentials.replace('bearer ', '', 1).replace('Bearer ', '', 1)
            user_id = auth_service.get_user_id_from_token(token)
            print(f"User ID retrieved: {user_id}")
        except Exception as e:
            print(f"Error getting user ID: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail=f"Authentication error: {str(e)}"
            )
        
        try:
            analysis_service.save_dataset(df, user_id, db)
            print("Dataset saved successfully")
        except Exception as e:
            print(f"Error saving dataset: {str(e)}")
            db.rollback()  # 添加这行来回滚事务
            raise HTTPException(
                status_code=500,
                detail=f"Error saving dataset: {str(e)}"
            )
        
        return {"message": "Dataset uploaded successfully"}
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=str(e) if str(e) else "An unexpected error occurred"
        )

# 分析用电数据
@app.post("/analyze-consumption", response_model=AnalysisResponse)
async def analyze_consumption(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        # 移除 'bearer ' 前缀（如果存在）
        token = auth.credentials.replace('bearer ', '', 1).replace('Bearer ', '', 1)
        user_id = auth_service.get_user_id_from_token(token)
        print(f"User ID for analysis: {user_id}")  # 添加调试信息
        
        dataset = analysis_service.get_user_dataset(user_id, db)
        print(f"Dataset retrieved: {len(dataset) if not dataset.empty else 'Empty'} rows")  # 添加调试信息
        
        if dataset.empty:
            raise HTTPException(status_code=404, detail="No dataset found for this user")
        
        try:
            trends = analysis_service.analyze_trends(dataset)
            print("Trends analyzed successfully")  # 添加调试信息
            
            suggestions = analysis_service.generate_suggestions(trends)
            print("Suggestions generated successfully")  # 添加调试信息
            
            predictions = analysis_service.predict_future_usage(dataset)
            print("Future usage predicted successfully")  # 添加调试信息
            
            savings_predictions = analysis_service.predict_savings(predictions)
            print("Savings predictions generated successfully")  # 添加调试信息
            
            return {
                "trends": trends,
                "suggestions": suggestions,
                "predictions": predictions.to_dict(orient='records'),
                "savings_predictions": savings_predictions.to_dict(orient='records')
            }
        except Exception as e:
            print(f"Error in analysis: {str(e)}")  # 添加调试信息
            import traceback
            traceback.print_exc()  # 打印完整的错误堆栈
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing data: {str(e)}"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error in analyze_consumption: {str(e)}")  # 添加调试信息
        import traceback
        traceback.print_exc()  # 打印完整的错误堆栈
        raise HTTPException(
            status_code=500,
            detail=str(e) if str(e) else "An unexpected error occurred during analysis"
        )

# 获取用户历史数据
@app.get("/user-data")
async def get_user_data(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        user_id = auth_service.get_user_id_from_token(auth.credentials)
        dataset = analysis_service.get_user_dataset(user_id, db)
        return dataset.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Energy Saving Assistant API</title>
        <link rel="stylesheet" type="text/css" href="/static/swagger-ui.css">
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="/static/swagger-ui-bundle.js"></script>
        <script src="/static/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: '/openapi.json',
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIBundle.SwaggerUIStandalonePreset
                    ],
                    layout: "BaseLayout",
                    deepLinking: true
                })
            }
        </script>
    </body>
    </html>
    """)

@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_endpoint():
    return get_openapi(
        title="Energy Saving Assistant",
        version="1.0.0",
        description="AI-powered electricity consumption analysis and saving suggestions",
        routes=app.routes,
    ) 

@app.get("/dashboard")
async def get_dashboard(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = auth.credentials.replace('bearer ', '', 1).replace('Bearer ', '', 1)
        user_id = auth_service.get_user_id_from_token(token)
        
        # 获取用户数据
        dataset = analysis_service.get_user_dataset(user_id, db)
        if dataset.empty:
            return {
                "message": "No data available",
                "data": None,
                "analysis": None
            }
            
        # 分析数据
        trends = analysis_service.analyze_trends(dataset)
        suggestions = analysis_service.generate_suggestions(trends)
        predictions = analysis_service.predict_future_usage(dataset)
        savings_predictions = analysis_service.predict_savings(predictions)
        
        return {
            "message": "Dashboard data retrieved successfully",
            "data": dataset.to_dict(orient='records'),
            "analysis": {
                "trends": trends,
                "suggestions": suggestions,
                "predictions": predictions.to_dict(orient='records'),
                "savings_predictions": savings_predictions.to_dict(orient='records')
            }
        }
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# 修改上传数据集的路由路径
@app.post("/dataset/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        print(f"Received file: {file.filename}")
        print(f"Content type: {file.content_type}")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=422,
                detail="Only CSV files are allowed"
            )
        
        contents = await file.read()
        print(f"File content length: {len(contents)}")
        
        try:
            df = pd.read_csv(io.BytesIO(contents))
            print("CSV parsed successfully")
            print("Columns:", df.columns.tolist())
            print("Data types:", df.dtypes.to_dict())
            print("First few rows:", df.head().to_dict())
            
            # Check required columns
            required_columns = {'Date', 'Usage'}
            missing_columns = required_columns - set(df.columns)
            if missing_columns:
                raise HTTPException(
                    status_code=422,
                    detail=f"Missing required columns: {', '.join(missing_columns)}"
                )
            
            # Rename columns to match expected format
            df = df.rename(columns={
                'Date': 'date',
                'Usage': 'consumption'
            })
            
            print("Columns after renaming:", df.columns.tolist())
            
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=422, detail="The file is empty")
        except pd.errors.ParserError as e:
            print(f"Parser error details: {str(e)}")
            raise HTTPException(status_code=422, detail=f"CSV parsing error: {str(e)}")
        except Exception as e:
            print(f"CSV parsing error: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Invalid file format: {str(e)}")
        
        # Get user ID and store data
        try:
            token = auth.credentials.replace('bearer ', '', 1).replace('Bearer ', '', 1)
            user_id = auth_service.get_user_id_from_token(token)
            print(f"User ID retrieved: {user_id}")
        except Exception as e:
            print(f"Error getting user ID: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Authentication failed. Please log in again"
            )
        
        try:
            analysis_service.save_dataset(df, user_id, db)
            print("Dataset saved successfully")
            return {"message": "Dataset uploaded successfully"}
        except ValueError as e:
            print(f"Data validation error: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except Exception as e:
            print(f"Error saving dataset: {str(e)}")
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save dataset: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Internal server error. Please try again later"
        ) 