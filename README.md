# 10088-store · idea-store · A 股智能决策平台

> 从 pretty-sm 武器库销售页 → **idea-store 机会挖掘** 全自动 A 股决策平台
> 接入 idea-to-trade 方法论 · 5 板块 + 四季地图 · 每日 AI 定时跑

**线上访问**：https://ai10088.com/idea-store/（v0.1 即将上线 · 2026-08-20）

---

## 项目定位

**展示 idea-to-trade 项目能力** · **不再卖 pretty-sm 武器库订阅**

前端是「**商品化展示**」：把 idea-to-trade 的方法论 + Skill 落地成 5 个板块 + 1 个交易地图，每天服务器自动跑 AI 任务 → 输出结构化 JSON → 前端精美展示。

---

## 6 大板块（每日定时 AI 跑）

| # | 板块 | 触发时间 | 数据来源 | 输出格式 |
|---|------|---------|---------|---------|
| 1 | **🎯 低位机会逻辑分析** | 07:30 | methodology/13 左侧挖掘 6 路径 + methodology/15 小市值×SMC | `low-position-opportunities/{date}.json` |
| 2 | **🌙 昨日美股最明星板块对今日大 A** | 07:35 | 美股数据 + 板块映射 | `us-megastar-a-impact/{date}.json` |
| 3 | **📊 大 A 今日复盘** | 15:30 | NeoData 大盘/广度/资金流/涨停梯队 | `a-share-daily-review/{date}.json` |
| 4 | **🌅 大 A 盘前机会** | 07:00 | 美股映射 + 今日要闻 + 竞价观察 | `a-share-premarket/{date}.json` |
| 5 | **🔮 大 A 明日预测** | 15:35 | 当日数据 + 多因子预测 | `a-share-forecast/{date}.json` |
| 6 | **🗺️ 四季交易地图** | 月初 04:00 | 全年 12 月节奏 + 季节判断 | `season-map/{year}.json` |

---

## 项目结构

```
10088-store/                          ← 本仓库（前端 + 脚本）
├── index.html                        # 主页（5 板块 + 四季地图）
├── __auth/
│   └── account.html                   # 保留（旧版订阅页 · 暂不删）
├── assets/
│   ├── shared.css                     # 复用自 aichainmap（MIT）
│   ├── idea-store.css                 # ★ v0.1 idea-store 专属样式
│   ├── idea-store.js                  # ★ v0.1 前端拉 JSON + 渲染
│   ├── main.js                        # 旧版（保留）
│   ├── auth-chrome.js                 # 旧版（保留）
│   ├── logo-ps.svg
│   ├── logo-mark.png
│   └── favicon-*.png
├── data/                              # ★ v0.1 数据 schema 定义
│   └── schemas.py                     # 6 个板块的 JSON 结构定义
├── scripts/                           # ★ v0.1 AI 定时任务
│   ├── idea_daily_cron.py             # 核心脚本（6 个板块）
│   ├── aliyun_setup_cron.sh           # aliyun 部署脚本（含 nginx + crontab）
│   ├── aliyun_paths.sh
│   └── fetch_data_aliyun.py
├── README.md
└license
```

**数据输出目录**（aliyun 服务器）：

```
/root/workbuddy-data/idea-store/
├── low-position-opportunities/{YYYY-MM-DD}.json
├── us-megastar-a-impact/{YYYY-MM-DD}.json
├── a-share-daily-review/{YYYY-MM-DD}.json
├── a-share-premarket/{YYYY-MM-DD}.json
├── a-share-forecast/{YYYY-MM-DD}.json
├── season-map/{YYYY}.json
└── latest.json  (索引文件)
```

---

## 技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| **前端** | 纯静态 HTML + CSS + JS | 无 build · 无依赖 · 任何静态服务器可跑 |
| **样式** | 复用 aichainmap（MIT）+ idea-store 自定义 | 日光模式 + 中国 A 股涨跌色（涨红跌绿）|
| **后端 AI** | idea-trade-qa Skill CLI + aliyun cron | 每日自动跑 6 个板块任务 |
| **数据源** | NeoData · westockdata · akshare · WebSearch | 实时 A 股 + 美股 + 港股 |
| **部署** | nginx + crontab | aliyun 服务器 · https://ai10088.com/idea-store/ |

---

## 本地预览

```bash
cd ~/Desktop/10088-store
python3 -m http.server 8000
# 访问 http://localhost:8000/

# 数据需要从 aliyun 拉取（本地没有 /root/workbuddy-data/）
```

---

## aliyun 部署

```bash
# 一键部署（含 rsync + nginx + crontab）
bash scripts/aliyun_setup_cron.sh

# 手动跑一次（测试）
ssh aliyun "cd /root/idea-to-trade && python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py all"
```

**crontab 自动跑**（每日 5 个时间点 + 月初）：

```
# 07:00  盘前机会
0 7 * * 1-5 python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py premarket

# 07:30  低位机会 + 美股映射
30 7 * * 1-5 python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py low-position
35 7 * * 1-5 python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py us-megastar

# 15:30  今日复盘 + 明日预测
30 15 * * 1-5 python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py daily-review
35 15 * * 1-5 python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py forecast

# 月初 1 号 04:00  四季地图校准
0 4 1 * * python3 /www/wwwroot/10088-store/scripts/idea_daily_cron.py season-map
```

---

## 关联项目

| 项目 | 仓库 | 关系 |
|------|------|------|
| **idea-to-trade** | https://github.com/huangrichao2020/idea-to-trade | 方法论 + Skill 源 |
| **机会挖掘 Skill** | idea-to-trade/skill/idea-trade-qa/ | 9 类场景模板 + CLI |
| **10088-store** | https://github.com/huangrichao2020/10088-store | 本仓库（前端展示）|

---

## 版本

- **v0.1**（2026-08-20）· idea-store 初次集成
  - 5 个新板块 + 四季地图
  - idea-trade-qa CLI → JSON 输出
  - aliyun cron 定时任务
  - 前端拉 JSON 渲染

---

## License

MIT — 与 aichainmap 协议一致

---

## 作者

**小源**（WorkBuddy · MiniMax-M3）· 2026-08-20 v0.1 上线