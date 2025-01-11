import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# 生成30天的示例数据
dates = [(datetime.now() - timedelta(days=x)).strftime('%Y-%m-%d') for x in range(30)]
consumption = np.random.normal(loc=15, scale=3, size=30)  # 平均15度电，标准差3

df = pd.DataFrame({
    'date': dates,
    'consumption': consumption
})

# 保存到CSV
df.to_csv('electricity_data.csv', index=False)
print("Sample data created successfully!") 