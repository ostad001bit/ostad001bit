# ایجاد دایرکتوری برای نودها
New-Item -ItemType Directory -Force -Path .\node1
New-Item -ItemType Directory -Force -Path .\node2
New-Item -ItemType Directory -Force -Path .\node3

# کپی فایل‌ها به هر نود
Copy-Item -Recurse -Force .\shared\* .\node1\
Copy-Item -Recurse -Force .\shared\* .\node2\
Copy-Item -Recurse -Force .\shared\* .\node3\
Copy-Item .\package.json .\node1\
Copy-Item .\package.json .\node2\
Copy-Item .\package.json .\node3\

# اجرای ۳ ترمینال با مقادیر محیطی متفاوت و ذخیره خروجی‌ها در فایل‌های جداگانه
Start-Process powershell -ArgumentList 'cd .\node1; $env:HTTP_PORT=3001; $env:P2P_PORT=6001; node index.js > .\node1\output.log 2>&1'
Start-Process powershell -ArgumentList 'cd .\node2; $env:HTTP_PORT=3002; $env:P2P_PORT=6002; node index.js > .\node2\output.log 2>&1'
Start-Process powershell -ArgumentList 'cd .\node3; $env:HTTP_PORT=3003; $env:P2P_PORT=6003; node index.js > .\node3\output.log 2>&1'

Write-Host "Nodes are running in the background. Logs are saved in node1/output.log, node2/output.log, and node3/output.log"
