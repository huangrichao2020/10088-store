#!/bin/bash
# aliyun_setup_cron.sh — 80088-store idea-store aliyun 部署脚本
# 把每日定时任务装到 aliyun 服务器

set -e

echo "============================================================"
echo "  80088-store idea-store aliyun 部署"
echo "============================================================"

# 1. 安装项目到 aliyun
ALIYUN_TARGET="/www/wwwroot/idea-store"
echo ""
echo "===== 1. rsync 到 aliyun ====="
rsync -avz --delete \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='schemas.py' \
    /Users/tingchi/Desktop/80088-store/ \
    aliyun:/www/wwwroot/idea-store/

# 2. 数据目录初始化
echo ""
echo "===== 2. 数据目录初始化 ====="
ssh aliyun "mkdir -p /root/workbuddy-data/idea-store/{low-position-opportunities,us-megastar-a-impact,a-share-daily-review,a-share-premarket,a-share-forecast,season-map}"

# 3. nginx 配置（前端静态页）
echo ""
echo "===== 3. nginx 配置（前端静态页）====="
ssh aliyun "cat > /etc/nginx/conf.d/idea-store.conf << 'NGINX_EOF'
location ^~ /idea-store/ {
    alias /www/wwwroot/idea-store/;
    index index.html;
    try_files \$uri \$uri/ =404;
    add_header Cache-Control \"no-cache\";
    # 允许跨域读取 JSON
    add_header Access-Control-Allow-Origin *;
}
location ^~ /idea-store/data/ {
    alias /root/workbuddy-data/idea-store/;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control \"no-cache\";
}
NGINX_EOF"

# 4. crontab 设置
echo ""
echo "===== 4. crontab 定时任务 ====="
ssh aliyun "cat > /root/idea_daily_crontab.txt << 'CRON_EOF'
# 80088-store idea-store 每日 AI 任务
# 07:00  盘前机会
0 7 * * 1-5 cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py premarket
# 07:30  低位机会 + 美股映射
30 7 * * 1-5 cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py low-position
35 7 * * 1-5 cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py us-megastar
# 15:30  今日复盘 + 明日预测（盘后）
30 15 * * 1-5 cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py daily-review
35 15 * * 1-5 cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py forecast
# 月初 1 号 04:00 校准四季地图
0 4 1 * * cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py season-map
CRON_EOF
crontab /root/idea_daily_crontab.txt
crontab -l"

# 5. 测试 cron 任务
echo ""
echo "===== 5. 测试 cron 任务（手动跑一次）====="
ssh aliyun "cd /root/idea-to-trade && python3 /www/wwwroot/idea-store/scripts/idea_daily_cron.py all 2>&1 | tail -20"

# 6. nginx reload
echo ""
echo "===== 6. nginx reload ====="
ssh aliyun "nginx -t && systemctl reload nginx"

# 7. 验证访问
echo ""
echo="===== 7. 验证访问 ====="
echo "前端: https://ai80088.com/"
echo "数据: https://ai80088.com/data/latest.json"

echo ""
echo "============================================================"
echo "  ✓ 80088-store idea-store 部署完成"
echo "============================================================"