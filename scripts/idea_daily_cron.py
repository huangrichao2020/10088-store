#!/usr/bin/env python3
"""
idea_daily_cron.py — idea-trade-qa aliyun 定时任务版

每天 5 个时间点跑：
- 07:00  盘前机会
- 09:35  今日复盘（盘前）
- 11:30  盘中复盘
- 15:30  今日复盘 + 明日预测（盘后）
- 16:30  低位机会 + 美股映射

输出结构化 JSON → /root/workbuddy-data/idea-store/
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# 路径
ALIYUN_DATA_DIR = Path("/root/workbuddy-data/idea-store")
ALIYUN_DATA_DIR.mkdir(parents=True, exist_ok=True)

IDEA_TO_QA = "/root/idea-to-trade/skill/idea-trade-qa/idea_trade_qa.py"


def today_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def write_json(板块: str, data: dict, date: str = None):
    """写入 JSON 文件"""
    date = date or today_str()
    dir_path = ALIYUN_DATA_DIR / 板块
    dir_path.mkdir(parents=True, exist_ok=True)
    file_path = dir_path / f"{date}.json"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    print(f"✓ {file_path}")
    return file_path


def call_idea_trade_qa(query: str, scenario: str = None) -> str:
    """调用 idea-trade-qa CLI"""
    cmd = ["python3", IDEA_TO_QA, "--query", query]
    if scenario:
        cmd.extend(["--scenario", scenario])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return result.stdout
        print(f"  ! idea-trade-qa 失败: {result.stderr[:200]}")
        return ""
    except Exception as e:
        print(f"  ! idea-trade-qa 异常: {e}")
        return ""


# ═══ 5 个板块任务 ═══

def task_low_position_opportunities():
    """板块 1：低位机会逻辑分析（07:30 跑）"""
    print("\n═══ 板块 1：低位机会逻辑分析 ═══")
    raw = call_idea_trade_qa("今天低位机会分析小市值选股", scenario="小市值选股")

    data = {
        "schema_version": "1.0",
        "板块": "低位机会逻辑分析",
        "板块英文": "low-position-opportunities",
        "板块图标": "🎯",
        "更新日期": today_str(),
        "更新时间": datetime.now().strftime("%H:%M"),
        "数据源": ["idea-to-trade methodology/13 左侧挖掘 6 路径", "methodology/15 小市值xSMC", "NeoData 实时数据"],
        "idea_trade_qa_raw": raw,
        # AI 提取结构化字段（前端渲染用）
        "候选": [],
        "策略摘要": {
            "本月主题": "小市值 + SMC 双过滤",
            "月份判断": "夏末（警惕期）",
            "期望年化": "25-50%",
            "核心风险": "单票最大回撤 30%",
        },
        "next_run": "每日 07:30",
    }
    return write_json("low-position-opportunities", data)


def task_us_megastar_a_impact():
    """板块 2：昨日美股明星板块对今日大 A 机会（07:30 跑）"""
    print("\n═══ 板块 2：美股明星板块对 A 机会 ═══")
    raw = call_idea_trade_qa("昨日美股最明星板块对今日大A的机会")

    data = {
        "schema_version": "1.0",
        "板块": "美股明星板块对 A 机会",
        "板块英文": "us-megastar-a-impact",
        "板块图标": "🌙",
        "更新日期": today_str(),
        "更新时间": datetime.now().strftime("%H:%M"),
        "昨日美股": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
        "明星板块": [],
        "重点标的": [],
        "idea_trade_qa_raw": raw,
        "next_run": "每日 07:30",
    }
    return write_json("us-megastar-a-impact", data)


def task_daily_review():
    """板块 3：大 A 今日复盘（15:30 盘后跑）"""
    print("\n═══ 板块 3：大 A 今日复盘 ═══")
    raw = call_idea_trade_qa("大A今日复盘", scenario="次日推演")

    data = {
        "schema_version": "1.0",
        "板块": "大 A 今日复盘",
        "板块英文": "a-share-daily-review",
        "板块图标": "📊",
        "更新日期": today_str(),
        "更新时间": datetime.now().strftime("%H:%M"),
        "大盘指数": [],
        "市场广度": {
            "上涨占比": 0.5, "涨停": 0, "跌停": 0,
            "情绪温度": 50,
            "情绪标签": "中性",
        },
        "资金流": {
            "净流入TOP3": [],
            "净流出TOP3": [],
        },
        "涨停梯队": {
            "首板": 0, "二板": 0, "三板": 0, "四板": 0, "五板+": 0,
            "最高板": "无",
        },
        "情绪周期": "中性",
        "明日盯盘信号": [],
        "idea_trade_qa_raw": raw,
        "next_run": "每日 15:30",
    }
    return write_json("a-share-daily-review", data)


def task_premarket():
    """板块 4：大 A 盘前机会（07:00 跑）"""
    print("\n═══ 板块 4：大 A 盘前机会 ═══")
    raw = call_idea_trade_qa("今天大A盘前机会", scenario="盘中机会")

    data = {
        "schema_version": "1.0",
        "板块": "大 A 盘前机会",
        "板块英文": "a-share-premarket",
        "板块图标": "🌅",
        "更新日期": today_str(),
        "更新时间": "07:00",
        "今日要闻": [],
        "美股映射": [],
        "竞价观察": [],
        "操作建议": {
            "总仓位": "≤ 30%",
            "重点方向": "AI 算力回调低吸",
            "避免方向": "高位放量滞涨股",
        },
        "idea_trade_qa_raw": raw,
        "next_run": "每日 07:00",
    }
    return write_json("a-share-premarket", data)


def task_forecast():
    """板块 5：大 A 明日预测（15:30 盘后跑）"""
    print("\n═══ 板块 5：大 A 明日预测 ═══")
    raw = call_idea_trade_qa("明日怎么走", scenario="次日推演")

    data = {
        "schema_version": "1.0",
        "板块": "大 A 明日预测",
        "板块英文": "a-share-forecast",
        "板块图标": "🔮",
        "更新日期": today_str(),
        "发布时间": "15:30",
        "明日判断": {
            "方向": "震荡",
            "概率": {"上涨": 0.33, "震荡": 0.34, "下跌": 0.33},
        },
        "关键变量": [],
        "盯盘清单": [],
        "重点关注": [],
        "操作策略": {
            "持仓": "设移动止盈",
            "加仓": "等企稳",
            "减仓": "反弹无量",
        },
        "idea_trade_qa_raw": raw,
        "next_run": "每日 15:30",
    }
    return write_json("a-share-forecast", data)


def task_season_map():
    """板块 6：四季交易地图（年初更新一次 + 每月校准）"""
    print("\n═══ 板块 6：四季交易地图 ═══")
    data = {
        "schema_version": "1.0",
        "板块": "四季交易地图",
        "板块英文": "season-map",
        "板块图标": "🗺️",
        "更新年份": datetime.now().year,
        "四季定义": {
            "春升（1-3 月）": {"特征": "两会政策预期 + 流动性宽松", "策略": "进攻", "胜率": 0.70},
            "夏涨（4-6 月）": {"特征": "业绩真空期 + 题材活跃", "策略": "跟随", "胜率": 0.65},
            "夏末（7-8 月）": {"特征": "中报预期 + 估值消化", "策略": "警惕", "胜率": 0.55},
            "秋伐（9-10 月）": {"特征": "国庆后 + 三季报", "策略": "切换", "胜率": 0.60},
            "冬藏（11-12 月）": {"特征": "业绩真空 + 资金紧张", "策略": "防御", "胜率": 0.50},
        },
        "当前季节": get_current_season(),
        "季节策略": get_current_season_strategy(),
        "全年节奏": get_year_rhythm(),
        "next_run": "每月 1 日校准",
    }
    return write_json("season-map", data, date=str(datetime.now().year))


def get_current_season() -> str:
    """根据当前月份判断季节"""
    month = datetime.now().month
    if month in [1, 2, 3]:
        return "春升（1-3 月）"
    elif month in [4, 5, 6]:
        return "夏涨（4-6 月）"
    elif month in [7, 8]:
        return "夏末（7-8 月）"
    elif month in [9, 10]:
        return "秋伐（9-10 月）"
    else:
        return "冬藏（11-12 月）"


def get_current_season_strategy() -> dict:
    """当前季节策略"""
    season = get_current_season()
    strategies = {
        "春升（1-3 月）": {"建议仓位": "60-80%", "优选板块": "AI 算力 + 新能源 + 半导体", "关键指标": "信贷数据 + 政策落地"},
        "夏涨（4-6 月）": {"建议仓位": "50-70%", "优选板块": "题材股 + 中报预期", "关键指标": "成交量 + 题材热度"},
        "夏末（7-8 月）": {"建议仓位": "30-50%", "优选板块": "结构性机会 + 黄金避险", "关键指标": "中报业绩 + 估值消化"},
        "秋伐（9-10 月）": {"建议仓位": "40-60%", "优选板块": "三季报预期 + 切换", "关键指标": "三季报 + 国庆后"},
        "冬藏（11-12 月）": {"建议仓位": "20-40%", "优选板块": "防御板块 + 高分红", "关键指标": "估值切换 + 资金面"},
    }
    return strategies.get(season, {})


def get_year_rhythm() -> list:
    """全年 12 月节奏"""
    return [
        {"月份": 1, "季节": "春升", "关键事件": "春节躁动", "胜率": 0.70},
        {"月份": 2, "季节": "春升", "关键事件": "两会政策", "胜率": 0.70},
        {"月份": 3, "季节": "春升", "关键事件": "两会落地", "胜率": 0.70},
        {"月份": 4, "季节": "夏涨", "关键事件": "年报披露", "胜率": 0.65},
        {"月份": 5, "季节": "夏涨", "关键事件": "业绩真空", "胜率": 0.65},
        {"月份": 6, "季节": "夏涨", "关键事件": "中报预期", "胜率": 0.65},
        {"月份": 7, "季节": "夏末", "关键事件": "中报披露", "胜率": 0.55},
        {"月份": 8, "季节": "夏末", "关键事件": "中报兑现", "胜率": 0.55},
        {"月份": 9, "季节": "秋伐", "关键事件": "三季报预期", "胜率": 0.60},
        {"月份": 10, "季节": "秋伐", "关键事件": "国庆后行情", "胜率": 0.60},
        {"月份": 11, "季节": "冬藏", "关键事件": "业绩真空", "胜率": 0.50},
        {"月份": 12, "季节": "冬藏", "关键事件": "跨年布局", "胜率": 0.50},
    ]


def write_index():
    """写索引文件"""
    print("\n═══ 写索引文件 latest.json ═══")
    data = {
        "更新日期": today_str(),
        "更新时间": datetime.now().strftime("%H:%M"),
        "板块列表": [
            {"板块": "低位机会逻辑分析", "路径": f"low-position-opportunities/{today_str()}.json", "图标": "🎯"},
            {"板块": "美股明星板块对 A 机会", "路径": f"us-megastar-a-impact/{today_str()}.json", "图标": "🌙"},
            {"板块": "大 A 今日复盘", "路径": f"a-share-daily-review/{today_str()}.json", "图标": "📊"},
            {"板块": "大 A 盘前机会", "路径": f"a-share-premarket/{today_str()}.json", "图标": "🌅"},
            {"板块": "大 A 明日预测", "路径": f"a-share-forecast/{today_str()}.json", "图标": "🔮"},
            {"板块": "四季交易地图", "路径": "season-map/2026.json", "图标": "🗺️"},
        ],
    }
    file_path = ALIYUN_DATA_DIR / "latest.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ {file_path}")
    return file_path


# ═══ 主入口 ═══

def main():
    if len(sys.argv) > 1:
        task_name = sys.argv[1]
        task_map = {
            "low-position": task_low_position_opportunities,
            "us-megastar": task_us_megastar_a_impact,
            "daily-review": task_daily_review,
            "premarket": task_premarket,
            "forecast": task_forecast,
            "season-map": task_season_map,
            "all": lambda: [fn() for fn in [
                task_low_position_opportunities,
                task_us_megastar_a_impact,
                task_premarket,
                task_daily_review,
                task_forecast,
                task_season_map,
            ]] + [write_index()],
        }
        if task_name in task_map:
            task_map[task_name]()
        else:
            print(f"未知任务: {task_name}，可选: {list(task_map.keys())}")
    else:
        print("用法: idea_daily_cron.py <task_name>")
        print("可选: low-position / us-megastar / daily-review / premarket / forecast / season-map / all")


if __name__ == "__main__":
    main()