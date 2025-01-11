import requests
import os

def download_file(url, filename):
    response = requests.get(url)
    if response.status_code == 200:
        with open(os.path.join('backend', 'static', filename), 'wb') as f:
            f.write(response.content)
        print(f"Downloaded {filename}")
    else:
        print(f"Failed to download {filename}")

# 创建 static 目录（如果不存在）
os.makedirs(os.path.join('backend', 'static'), exist_ok=True)

# 下载 Swagger UI 文件
files = {
    'swagger-ui.css': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
    'swagger-ui-bundle.js': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
    'swagger-ui-standalone-preset.js': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js'
}

for filename, url in files.items():
    download_file(url, filename) 