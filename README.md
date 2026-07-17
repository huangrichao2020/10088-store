# 10088-store · pretty-skills 武器库销售页

> 一个 AI 技能武器库 —— 16 领域 / 87 case / 4 大场景入口 / VIP 5 档订阅

**做完后你能直接**：

- 📊 看一个完整 AI 技能武器库长什么样（87 case 分布 + 4 大场景）
- 💰 把"订阅式 AI 技能服务"卖出去（VIP 5 档 + 支付宝 A2A 接好即用）
- 🎯 微调所有文案 / 价格 / case 描述（你正在 vscode 里看的就是这个项目）
- 🚀 一行命令部署到 aliyun，访问 `https://ai10088.com/10088-store/`

**线上访问**：[https://ai10088.com/10088-store/](https://ai10088.com/10088-store/)（v0.1 已上线，2026-07-17）

---

## 项目结构

```
10088-store/
├── index.html              # 主页（58KB · 12 section）
├── __auth/
│   └── account.html        # 订阅页（14KB · VIP 5 档 + 3 支付方式占位）
├── assets/
│   ├── shared.css          # 复用自 aichainmap（MIT）
│   ├── main.js             # 复用自 aichainmap
│   ├── logo-ps.svg         # 自制 PS logo（498B）
│   ├── logo-mark.png       # 备用 logo
│   ├── favicon.ico         # 浏览器图标
│   ├── favicon-32.png      # 浏览器图标
│   ├── apple-touch-icon.png
│   └── auth-chrome.js      # 订阅页交互
├── README.md               # 本文件
├── LICENSE                 # MIT
└── .gitignore
```

**总大小**：~100KB（不含 preview 截图）
**技术栈**：纯静态 HTML + CSS + JS · 无 build · 无依赖 · 任何静态服务器可跑

---

## 本地预览

```bash
# 方式 1：直接打开
open index.html  # macOS 自动用默认浏览器打开

# 方式 2：起本地服务（推荐，避免某些浏览器 file:// 限制）
python3 -m http.server 8000
# 访问 http://localhost:8000/

# 方式 3：用 vscode Live Server 插件
# 右键 index.html → "Open with Live Server"
```

**vscode 打开**（你已经装好）：

```bash
code ~/Desktop/10088-store/
```

**推荐 vscode 扩展**：

- `Live Server` — 边改边看效果（自动刷新浏览器）
- `Prettier` — 格式化 HTML/CSS/JS
- `Auto Rename Tag` — 改 HTML 标签自动改闭合
- `HTML CSS Support` — 写 class 时自动补全 shared.css 里的样式

---

## 4 大核心场景（改文案位置）

| 场景 | 改什么 | 在 HTML 哪 |
|---|---|---|
| **做 PPT · 真实 .pptx** | 副标 + case 列表 | `index.html` line ~270（"7 大场景 · 4 大入口"区） |
| **做股票 · 四层融合** | 副标 + 5 维框架 | 同上 |
| **做情感 · 关系教练** | 副标 + 5 维信号 | 同上 |
| **做自媒体 · 9 模板** | 副标 + 平台清单 | 同上 |

---

## 16 领域索引（改 case 数量/描述）

`index.html` line ~400 区域"16 领域索引"，每行 4 字段：

```html
<a class="toc-row" href="...">
    <span class="toc-name">视觉创作</span>
    <span class="toc-count">23</span>
    <span class="toc-tags">AI 生图 / PPT / 配图 / 漫画 / Vlog / 公众号主题库</span>
    <span class="toc-go">浏览</span>
</a>
```

**改哪几个数字会全站联动**：

- `index.html` line ~190（cover 区域右侧"87 case"）
- `index.html` line ~440（VIP 五档首"87 case 全部解锁"）
- `__auth/account.html` line ~140（订阅页"87 case 全部解锁"）

---

## VIP 5 档定价（当前是占位，等商业化定）

| 档位 | 月费 | 年费 | 包含 |
|---|---|---|---|
| 第一档 · 免费试用 | ¥0 | — | 30% case + 社区文档 |
| 第二档 · 个人 VIP | ¥? | ¥? | 87 case 全部解锁 · 月度更新 5+ |
| 第三档 · 团队 VIP | — | ¥? | 5 账号共享 · 团队空间 · 协作笔记 |
| 第四档 · 企业 VIP | — | ¥? | 私有部署 · SLA 99.9% · 数据不出网 |
| 第五档 · 定制咨询 | — | 议价 | 1v1 · 驻场实施 · 行业专项方案 |

**改位置**：`index.html` line ~440（VIP 五档蛋糕）

---

## 商业化模型 · 「skill 触发订阅」

- **4 大付费 hook**：① 立即订阅 VIP ② 立即查看 ③ 立即试用 ④ 立即加入
- **3 支付方式**（占位「开发中」）：支付宝 A2A / 微信支付 / Stripe
- **支付宝 A2A 接入**：[https://a2a.alipay.com/#collection](https://a2a.alipay.com/#collection)（智能体支付协议，2025-2026 推出）
- **不做的红线**：不预收钱 / 不承诺实测 SLA / 不锁单方定价（"价格开发中"显式占位）

**改支付方式**（订阅页）：`__auth/account.html` 底部"订阅方法开发"区（line ~250）

---

## 部署（aliyun nginx）

> 已部署在 `https://ai10088.com/10088-store/`，nginx 配置 + 路径方案 vs 子域名决策见 aliyun-server-ops SOP

**快速部署**（如果你换服务器）：

```bash
# 1. 上传（rsync / scp）
rsync -avz --delete \
  /Users/tingchi/Desktop/10088-store/ \
  aliyun:/www/wwwroot/10088-store/

# 2. nginx 加 location（详见 aliyun-server-ops.md）
# location ^~ /10088-store/ {
#     alias /www/wwwroot/10088-store/;
#     index index.html;
#     try_files $uri $uri/ =404;
#     add_header Cache-Control "no-cache";
# }

# 3. 测 + reload
ssh aliyun "nginx -t && systemctl reload nginx"
```

**注意**：路径是 `/10088-store/`（不是 `/10088-store` 或 `/10088-store/index.html`）—— `^~` + `alias` 模式。

---

## 设计灵感 · 复刻自 aichainmap

**布局复刻自 [AI 产业链地图 · 知识库 (aichainmap)](https://aichainmap.com/)（MIT 协议）**。我们在其布局基础上：

1. 替换所有内容为 pretty-skills 87 case
2. 自制 PS logo（SVG）替换 aichainmap A 字 logo
3. 加 /__auth/account.html 订阅占位
4. footer 加 aichainmap MIT attribution 显式致谢

**为什么复刻 aichainmap 布局**：

- 排版密度高、信息层次清晰（很适合 87 case 武器库这类"大量信息 + 轻交互"场景）
- 侧栏 + 主区 grid（既保留导航又突出核心 case）
- 衬线大字标题 + 数字指标框（量化疗效，符合 pretty-skills 收口硬规则）
- MIT 协议（商业可用 + 显式致谢）

**怎么找到这个布局的**：`/Users/tingchi/.mavis/agents/mavis/memory/ai-website-cloner.md` 记录了 5 阶段克隆 pipeline。

---

## 维护清单

**改文案**（你正在做的事）：直接 vscode 改 `index.html` / `__auth/account.html`，刷新浏览器看效果

**改 case 数量**：改完后**必须同步改**这 3 处：

- `index.html` cover 区域"87 case"数字
- `index.html` VIP 五档"87 case 全部解锁"
- `__auth/account.html` 订阅页"87 case 全部解锁"

**改完 push 到 GitHub**：

```bash
cd ~/Desktop/10088-store
git add .
git commit -m "feat: 改文案 ..."
git push origin main
```

**同步到 aliyun**（改了 HTML 之后）：

```bash
rsync -avz --delete \
  /Users/tingchi/Desktop/10088-store/ \
  aliyun:/www/wwwroot/10088-store/

ssh aliyun "systemctl reload nginx"
```

---

## License

MIT — 与 aichainmap 协议一致

---

## 作者

**Mavis**（MiniMax As a Jarvis）· Mavis · 2026-07-17 v0.1 上线
