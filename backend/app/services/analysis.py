import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from typing import List, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import calendar

from backend.app.models.energy_data import EnergyData

class EnergyAnalysisService:
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        
    def save_dataset(self, df: pd.DataFrame, user_id: int, db: Session):
        try:
            print(f"开始保存数据集，用户ID: {user_id}")
            print(f"数据集列: {df.columns.tolist()}")
            print(f"数据集前几行: \n{df.head()}")
            
            # 确保日期列是datetime类型
            try:
                df['date'] = pd.to_datetime(df['date'])
                print("日期转换成功")
            except Exception as e:
                print(f"日期转换错误: {str(e)}")
                raise ValueError(f"日期格式无效: {str(e)}")
            
            # 确保consumption列是float类型
            try:
                df['consumption'] = df['consumption'].astype(float)
                print("用电量数据转换成功")
            except Exception as e:
                print(f"用电量数据转换错误: {str(e)}")
                raise ValueError(f"用电量数据格式无效: {str(e)}")
            
            # 删除旧数据
            try:
                db.query(EnergyData).filter(EnergyData.user_id == user_id).delete()
                print("旧数据删除成功")
            except Exception as e:
                print(f"删除旧数据错误: {str(e)}")
                raise
            
            # 插入新数据
            for _, row in df.iterrows():
                try:
                    energy_data = EnergyData(
                        user_id=user_id,
                        date=row['date'].date(),
                        consumption=float(row['consumption'])
                    )
                    db.add(energy_data)
                except Exception as e:
                    print(f"插入数据错误: {str(e)}")
                    db.rollback()
                    raise ValueError(f"数据插入失败: {str(e)}")
            
            db.commit()
            print("数据集保存成功")
            
        except Exception as e:
            print(f"保存数据集时发生错误: {str(e)}")
            db.rollback()
            raise
    
    def get_user_dataset(self, user_id: int, db: Session) -> pd.DataFrame:
        try:
            print(f"Fetching data for user_id: {user_id}")  # 添加调试信息
            data = db.query(EnergyData).filter(
                EnergyData.user_id == user_id
            ).order_by(EnergyData.date).all()
            
            print(f"Found {len(data)} records")  # 添加调试信息
            
            if not data:
                print("No data found for user")  # 添加调试信息
                return pd.DataFrame()
            
            df = pd.DataFrame([
                {'date': record.date, 'consumption': record.consumption}
                for record in data
            ])
            print(f"DataFrame created with shape: {df.shape}")  # 添加调试信息
            return df
        except Exception as e:
            print(f"Error in get_user_dataset: {str(e)}")  # 添加调试信息
            raise
    
    def analyze_trends(self, data: pd.DataFrame) -> Dict:
        data = data.copy()
        data['date'] = pd.to_datetime(data['date'])
        
        # 基本统计
        daily_avg = data['consumption'].mean()
        peak_usage = data['consumption'].max()
        peak_time = data.loc[data['consumption'].idxmax(), 'date']
        
        # 周模式分析
        data['weekday'] = data['date'].dt.dayofweek
        weekly_pattern = data.groupby('weekday')['consumption'].mean()
        
        # 月度趋势
        monthly_trend = data.set_index('date').resample('M')['consumption'].mean()
        
        # 添加更详细的分析
        weekday_avg = data[data['weekday'].isin(range(5))]['consumption'].mean()
        weekend_avg = data[data['weekday'].isin([5,6])]['consumption'].mean()
        
        # 计算趋势
        consumption_trend = np.polyfit(range(len(data)), data['consumption'].values, 1)[0]
        
        return {
            "daily_average": float(daily_avg),
            "peak_usage": float(peak_usage),
            "peak_time": peak_time.strftime("%Y-%m-%d %H:%M"),
            "weekly_pattern": weekly_pattern.to_dict(),
            "monthly_trend": monthly_trend.to_dict(),
            "weekday_average": float(weekday_avg),
            "weekend_average": float(weekend_avg),
            "consumption_trend": float(consumption_trend)
        }
    
    def generate_suggestions(self, trends: Dict) -> List[str]:
        suggestions = []
        
        # 1. Peak usage time analysis
        peak_time = datetime.strptime(trends['peak_time'], "%Y-%m-%d %H:%M")
        peak_hour = peak_time.hour
        
        if 9 <= peak_hour <= 17:
            suggestions.append(f"Your peak electricity usage occurs during work hours ({peak_hour}:00). Recommendations:\n"
                            "- Use timers to run high-power appliances during off-peak hours\n"
                            "- Maximize natural light usage to reduce lighting costs\n"
                            "- Turn off unnecessary electrical equipment during lunch breaks")
        elif 18 <= peak_hour <= 22:
            suggestions.append(f"Your peak electricity usage occurs in the evening ({peak_hour}:00). Recommendations:\n"
                            "- Schedule washing machine and dryer usage during off-peak hours\n"
                            "- Use energy-saving modes on household appliances\n"
                            "- Avoid using multiple high-power appliances simultaneously")
        
        # 2. Weekday vs Weekend analysis
        weekday_avg = trends['weekday_average']
        weekend_avg = trends['weekend_average']
        if weekend_avg > weekday_avg * 1.3:
            suggestions.append(f"Weekend consumption is significantly higher than weekdays (by {((weekend_avg/weekday_avg)-1)*100:.1f}%). Recommendations:\n"
                            "- Avoid using multiple high-power appliances simultaneously on weekends\n"
                            "- Plan household electricity usage to avoid peak hours\n"
                            "- Maximize use of natural light and ventilation")
        
        # 3. Consumption trend analysis
        if trends['consumption_trend'] > 0:
            suggestions.append("Your electricity consumption shows an increasing trend. Recommendations:\n"
                            "- Check for standby power consumption\n"
                            "- Consider upgrading to energy-efficient appliances\n"
                            "- Use smart plugs to monitor electricity usage")
        
        # 4. Consumption level recommendations
        daily_avg = trends['daily_average']
        if daily_avg > 20:
            suggestions.append("Your daily average consumption is high. Consider these energy-saving measures:\n"
                            "- Use inverter air conditioners that adjust based on temperature needs\n"
                            "- Monitor and control standby power with smart plugs\n"
                            "- Consider installing renewable energy systems\n"
                            "- Regular maintenance of electrical appliances")
        elif daily_avg > 10:
            suggestions.append("Your electricity consumption is moderate. Further savings can be achieved through:\n"
                            "- Using LED lighting\n"
                            "- Setting appropriate AC temperature (recommended above 26°C in summer)\n"
                            "- Maximizing natural ventilation\n"
                            "- Developing habits of turning off unused lights")
        
        # 5. Seasonal recommendations
        current_month = datetime.now().month
        if 6 <= current_month <= 8:  # Summer
            suggestions.append("Summer energy-saving tips:\n"
                            "- Use curtains to reduce direct sunlight\n"
                            "- Clean AC filters regularly for better efficiency\n"
                            "- Use AC timer functions to avoid overnight operation\n"
                            "- Set appropriate AC temperature, recommended above 26°C")
        elif 12 <= current_month <= 2:  # Winter
            suggestions.append("Winter energy-saving tips:\n"
                            "- Use heating equipment efficiently\n"
                            "- Check window and door seals to prevent heat loss\n"
                            "- Use smart thermostats for heating management\n"
                            "- Maximize natural sunlight for heating")
        elif 3 <= current_month <= 5:  # Spring
            suggestions.append("Spring energy-saving tips:\n"
                            "- Maximize natural ventilation\n"
                            "- Use dehumidifiers efficiently\n"
                            "- Choose appropriate times for ventilation")
        else:  # Fall
            suggestions.append("Fall energy-saving tips:\n"
                            "- Turn off AC when possible and use natural ventilation\n"
                            "- Adjust appliance usage based on weather conditions\n"
                            "- Prepare for cold weather insulation")
        
        return suggestions
    
    def predict_future_usage(self, data: pd.DataFrame) -> pd.DataFrame:
        # 创建更多的时间特征
        df = data.copy()
        df['date'] = pd.to_datetime(df['date'])
        df['dayofweek'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['week'] = df['date'].dt.isocalendar().week
        
        # 创建滞后特征
        df['consumption_lag1'] = df['consumption'].shift(1)
        df['consumption_lag7'] = df['consumption'].shift(7)
        df['rolling_mean_7'] = df['consumption'].rolling(window=7).mean()
        df['rolling_std_7'] = df['consumption'].rolling(window=7).std()
        
        # 处理缺失值
        df = df.dropna()
        
        # 准备特征
        features = ['dayofweek', 'month', 'day', 'week', 
                   'consumption_lag1', 'consumption_lag7',
                   'rolling_mean_7', 'rolling_std_7']
        
        X = df[features].values
        y = df['consumption'].values
        
        # 标准化特征
        X_scaled = self.scaler.fit_transform(X)
        
        # 训练模型
        self.model.fit(X_scaled, y)
        
        # 生成未来日期
        future_dates = pd.date_range(
            start=data['date'].max() + timedelta(days=1),
            periods=30,
            freq='D'
        )
        
        # 为预测创建特征
        future_df = pd.DataFrame({'date': future_dates})
        future_df['dayofweek'] = future_df['date'].dt.dayofweek
        future_df['month'] = future_df['date'].dt.month
        future_df['day'] = future_df['date'].dt.day
        future_df['week'] = future_df['date'].dt.isocalendar().week
        
        # 使用最后的已知值初始化滞后特征
        last_known = df['consumption'].iloc[-1]
        last_known_7 = df['consumption'].iloc[-7:].mean()
        future_df['consumption_lag1'] = last_known
        future_df['consumption_lag7'] = last_known_7
        future_df['rolling_mean_7'] = df['rolling_mean_7'].iloc[-1]
        future_df['rolling_std_7'] = df['rolling_std_7'].iloc[-1]
        
        # 逐步预测
        predictions = []
        for i in range(len(future_df)):
            # 准备当前预测的特征
            current_features = future_df.iloc[i][features].values.reshape(1, -1)
            current_features_scaled = self.scaler.transform(current_features)
            
            # 预测
            pred = self.model.predict(current_features_scaled)[0]
            predictions.append(pred)
            
            # 更新下一步的滞后特征
            if i < len(future_df) - 1:
                future_df.iloc[i + 1, future_df.columns.get_loc('consumption_lag1')] = pred
                if i >= 6:
                    future_df.iloc[i + 1, future_df.columns.get_loc('consumption_lag7')] = np.mean(predictions[-7:])
                    future_df.iloc[i + 1, future_df.columns.get_loc('rolling_mean_7')] = np.mean(predictions[-7:])
                    future_df.iloc[i + 1, future_df.columns.get_loc('rolling_std_7')] = np.std(predictions[-7:])
        
        return pd.DataFrame({
            'date': future_dates,
            'predicted_consumption': predictions
        })
    
    def predict_savings(self, predictions: pd.DataFrame) -> pd.DataFrame:
        # 基于历史数据和预测趋势计算更合理的节能因子
        base_savings = 0.85  # 基础节能率15%
        trend_factor = 0.02  # 每天额外2%的潜在改进空间
        
        days = np.arange(len(predictions))
        savings_factors = base_savings - (trend_factor * days / len(days))
        # 确保节能因子在合理范围内（最多节能30%）
        savings_factors = np.clip(savings_factors, 0.7, 0.95)
        
        predictions['savings_prediction'] = predictions['predicted_consumption'] * savings_factors
        return predictions 