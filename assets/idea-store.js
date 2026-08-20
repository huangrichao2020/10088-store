/**
 * idea-store.js · 前端拉取 JSON + 渲染 5 板块 + 四季地图
 */

const DATA_BASE = '../data/idea-store/';
const PROXY_BASE = '../data/idea-store/';

async function loadJSON(path) {
  try {
    const url = `${DATA_BASE}${path}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`加载 ${path} 失败:`, e);
    return null;
  }
}

async function loadLatest() {
  const res = await fetch(`${DATA_BASE}latest.json`, { cache: 'no-store' });
  return await res.json();
}

// ════════ 板块 1：低位机会 ════════
async function renderLowPosition() {
  const tag = document.getElementById('low-position-tag');
  const content = document.getElementById('low-position-content');

  const data = await loadJSON('low-position-opportunities/latest.json');
  if (!data) {
    content.innerHTML = '<div class="loading">❌ 数据加载失败，可能定时任务还没跑过</div>';
    tag.textContent = '无数据';
    return;
  }

  tag.textContent = `更新 ${data.更新日期} ${data.更新时间 || ''}`;

  let html = '';
  // 候选卡片
  if (data.候选 && data.候选.length > 0) {
    html += '<div class="low-position-grid">';
    for (const stock of data.候选) {
      const ratingClass = stock.SMC评级?.includes('鱼尾') ? 'fish-tail' :
                          stock.SMC评级?.includes('鱼头') ? 'fish-head' : 'fish-body';
      html += `
        <div class="lop-card">
          <div class="lop-name">
            <span>${stock.股票名}</span>
            <span class="lop-code">${stock.代码}</span>
          </div>
          <div class="lop-row"><span>流通市值</span><b>${stock.流通市值_亿 || '-'} 亿</b></div>
          <div class="lop-row"><span>60 日累计</span><b class="${stock.60日累计涨跌 >= 0 ? 'up' : 'down'}">${stock.60日累计涨跌}%</b></div>
          <div class="lop-row"><span>现价 / OB 区</span><b>${stock.现价 || '-'} / ${stock.OB区价位?.join(' ~ ') || '-'}</b></div>
          <div class="lop-row"><span>距 OB</span><b>${stock.距OB折溢价 || '-'}</b></div>
          <div style="margin-top: 8px;">
            ${(stock.信号触发 || []).map(s => `<span class="lop-signal">${s}</span>`).join('')}
          </div>
          <div class="lop-rating">
            <span class="lop-rating-tag ${ratingClass}">${stock.SMC评级 || '-'}</span>
            <span style="font-size: 11px; color: var(--ink-soft);">信号强度 ${stock.信号强度 || '-'}</span>
            <div style="margin-top: 6px; font-size: 11px; color: var(--ink-soft);">${stock.接盘防御 || '-'}</div>
            <div style="margin-top: 4px; font-family: var(--mono); font-size: 11px;">
              仓位 ${stock.建议仓位 || '-'} | 入场 ${stock.入场时机 || '-'} | 止损 ${stock.止损位 || '-'}
            </div>
          </div>
        </div>
      `;
    }
    html += '</div>';
  } else if (data.idea_trade_qa_raw) {
    // 没结构化数据，显示原始 AI 输出
    html += `<div class="lop-strategy"><div class="lop-strategy-title">AI 输出（待结构化）</div><pre style="white-space: pre-wrap; font-size: 12px; font-family: var(--mono); color: var(--ink);">${escapeHtml(data.idea_trade_qa_raw)}</pre></div>`;
  } else {
    html = '<div class="loading">⏳ 数据待生成（cron 任务跑完后会自动出现）</div>';
  }

  // 策略摘要
  if (data.策略摘要) {
    const s = data.策略摘要;
    html += `
      <div class="lop-strategy">
        <div class="lop-strategy-title">📌 整体策略</div>
        <div class="lop-strategy-row"><b>本月主题：</b>${s.本月主题 || '-'}</div>
        <div class="lop-strategy-row"><b>月份判断：</b>${s.月份判断 || '-'}</div>
        <div class="lop-strategy-row"><b>期望年化：</b>${s.期望年化 || '-'}</div>
        <div class="lop-strategy-row"><b>核心风险：</b>${s.核心风险 || '-'}</div>
      </div>
    `;
  }

  content.innerHTML = html;
}

// ════════ 板块 2：美股明星板块 ════════
async function renderUsMegastar() {
  const tag = document.getElementById('us-megastar-tag');
  const content = document.getElementById('us-megastar-content');

  const data = await loadJSON('us-megastar-a-impact/latest.json');
  if (!data) {
    content.innerHTML = '<div class="loading">❌ 数据加载失败</div>';
    tag.textContent = '无数据';
    return;
  }

  tag.textContent = `更新 ${data.更新日期} ${data.更新时间 || ''}`;

  let html = '';
  if (data.明星板块 && data.明星板块.length > 0) {
    html += '<div class="sector-grid">';
    for (const s of data.明星板块) {
      const pctClass = s.美股涨幅?.startsWith('+') ? 'up' : 'down';
      html += `
        <div class="sector-card">
          <div class="sector-card-left">
            <span class="sector-icon">${s.板块名?.slice(0, 1) || '?'}</span>
            <div>
              <div class="sector-name">${s.板块名 || '?'}</div>
              <div style="font-size: 10px; color: var(--ink-faint);">${s.美股代表 || ''}</div>
            </div>
          </div>
          <div class="sector-card-right">
            <span class="sector-pct ${pctClass}">${s.美股涨幅 || '-'}</span>
            <span class="sector-meta">${s.美股强度 || ''}</span>
          </div>
        </div>
      `;
    }
    html += '</div>';
  } else if (data.idea_trade_qa_raw) {
    html += `<div class="lop-strategy"><div class="lop-strategy-title">AI 输出（待结构化）</div><pre style="white-space: pre-wrap; font-size: 12px; font-family: var(--mono);">${escapeHtml(data.idea_trade_qa_raw)}</pre></div>`;
  } else {
    html = '<div class="loading">⏳ 数据待生成</div>';
  }

  // 重点标的
  if (data.重点标的 && data.重点标的.length > 0) {
    html += '<div style="margin-top: 18px;"><div class="review-card-title">🎯 重点标的</div>';
    for (const stock of data.重点标的) {
      html += `
        <div class="news-item">
          <b style="font-size: 14px;">${stock.股票名}</b>
          <span class="lop-code">${stock.代码}</span>
          <div style="margin-top: 4px; font-size: 11px; color: var(--ink-soft);">
            ${stock.逻辑 || '-'}
          </div>
          <div style="margin-top: 4px; font-family: var(--mono); font-size: 11px; color: var(--stamp);">
            建议：${stock.建议 || '-'}
          </div>
        </div>
      `;
    }
    html += '</div>';
  }

  content.innerHTML = html;
}

// ════════ 板块 3：今日复盘 ════════
async function renderDailyReview() {
  const tag = document.getElementById('daily-review-tag');
  const content = document.getElementById('daily-review-content');

  const data = await loadJSON('a-share-daily-review/latest.json');
  if (!data) {
    content.innerHTML = '<div class="loading">❌ 数据加载失败</div>';
    tag.textContent = '无数据';
    return;
  }

  tag.textContent = `更新 ${data.更新日期} ${data.更新时间 || ''}`;

  let html = '<div class="review-content"><div class="review-left">';

  // 大盘指数
  if (data.大盘指数 && data.大盘指数.length > 0) {
    html += '<div class="review-card"><div class="review-card-title">📈 大盘指数</div><div class="review-index-grid">';
    for (const idx of data.大盘指数) {
      const dirClass = idx.涨跌 >= 0 ? 'up' : 'down';
      html += `
        <div class="review-index-card ${dirClass}">
          <div class="review-index-name">${idx.指数}</div>
          <div class="review-index-val ${dirClass}">${idx.涨跌 >= 0 ? '+' : ''}${idx.涨跌}%</div>
          <div style="font-size: 10px; color: var(--ink-faint); margin-top: 2px;">${idx.成交}</div>
        </div>
      `;
    }
    html += '</div></div>';
  }

  // 涨停梯队
  if (data.涨停梯队) {
    const ladder = data.涨停梯队;
    const items = [
      { name: '首板', value: ladder.首板 || 0 },
      { name: '二板', value: ladder.二板 || 0 },
      { name: '三板', value: ladder.三板 || 0 },
      { name: '四板', value: ladder.四板 || 0 },
      { name: '五板+', value: ladder.五板 || 0 },
    ];
    const max = Math.max(...items.map(i => i.value), 1);
    html += `
      <div class="review-card">
        <div class="review-card-title">🔥 涨停梯队（最高 ${ladder.最高板 || '-'})</div>
        <div class="review-ladder">
    `;
    for (const it of items) {
      const height = Math.max((it.value / max) * 70, + 4);
      html += `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
          <div class="ladder-bar" style="height: ${height}px; width: 100%;">${it.value}</div>
          <div class="ladder-label">${it.name}</div>
        </div>
      `;
    }
    html += '</div></div>';
  }

  // AI 原始输出
  if (!data.大盘指数 && data.idea_trade_qa_raw) {
    html += `<div class="review-card"><div class="review-card-title">AI 输出</div><pre style="white-space: pre-wrap; font-size: 12px; font-family: var(--mono);">${escapeHtml(data.idea_trade_qa_raw)}</pre></div>`;
  }

  if (!data.大盘指数 && !data.idea_trade_qa_raw) {
    html += '<div class="review-card"><div class="loading">⏳ 数据待生成</div></div>';
  }

  html += '</div><div class="review-right">';

  // 市场广度
  if (data.市场广度) {
    const b = data.市场广度;
    html += `
      <div class="review-card">
        <div class="review-card-title">🌡️ 市场广度</div>
        <div class="review-card-body">
          <div>上涨占比 <b>${(b.上涨占比 * 100).toFixed(0)}%</b></div>
          <div>涨停 <b>${b.涨停}</b> / 跌停 <b>${b.跌停}</b></div>
          <div>情绪温度 <b>${b.情绪温度}°</b>（${b.情绪标签}）</div>
        </div>
      </div>
    `;
  }

  // 资金流
  if (data.资金流) {
    const f = data.资金流;
    html += '<div class="review-card"><div class="review-card-title">💰 资金流 TOP3</div><div class="review-card-body">';
    if (f.净流入TOP3) {
      html += '<div style="margin-bottom: 8px;"><b>净流入</b></div>';
      for (const r of f.净流入TOP3) {
        html += `<div>${r.板块} <b style="color: var(--up);">+${r.净额_亿} 亿</b></div>`;
      }
    }
    if (f.净流出TOP3) {
      html += '<div style="margin: 12px 0 8px;"><b>净流出</b></div>';
      for (const r of f.净流出TOP3) {
        html += `<div>${r.板块} <b style="color: var(--down);">${r.净额_亿} 亿</b></div>`;
      }
    }
    html += '</div></div>';
  }

  // 情绪周期
  if (data.情绪周期) {
    html += `
      <div class="review-card">
        <div class="review-card-title">🌀 情绪周期</div>
        <div class="review-card-body">
          <div style="font-weight: 700; color: var(--stamp); margin-bottom: 6px;">${data.情绪周期}</div>
          ${data.盯盘信号 ? data.盯盘信号.map(s => `<div>• ${s}</div>`).join('') : ''}
        </div>
      </div>
    `;
  }

  html += '</div></div>';

  content.innerHTML = html;
}

// ════════ 板块 4：盘前机会 ════════
async function renderPremarket() {
  const tag = document.getElementById('premarket-tag');
  const content = document.getElementById('premarket-content');

  const data = await loadJSON('a-share-premarket/latest.json');
  if (!data) {
    content.innerHTML = '<div class="loading">❌ 数据加载失败</div>';
    tag.textContent = '无数据';
    return;
  }

  tag.textContent = `更新 ${data.更新日期} ${data.更新时间 || ''}`;

  let html = '<div class="premarket-content">';

  // 今日要闻
  if (data.今日要闻 && data.今日要闻.length > 0) {
    html += '<div class="premarket-card"><div class="premarket-card-title">📰 今日要闻</div>';
    for (const n of data.今日要闻) {
      html += `
        <div class="news-item">
          <span class="news-tag ${n.类型}">${n.类型}</span>
          ${n.内容}
          <span class="impact-tag ${n.影响 === '利好' ? 'up' : n.影响 === '利空' ? 'down' : 'neutral'}">${n.影响}</span>
        </div>
      `;
    }
    html += '</div>';
  }

  // 美股映射
  if (data.美股映射 && data.美股映射.length > 0) {
    html += '<div class="premarket-card"><div class="premarket-card-title">🌙 美股映射</div>';
    for (const m of data.美股映射) {
      html += `
        <div class="us-mapping-item">
          <div><b>${m.板块}</b> · 美股 ${m.美股}</div>
          <div style="margin-top: 4px; font-size: 11px;">
            A 预期 <b>${m.A预期}</b> · 应对 <b style="color: var(--stamp);">${m.应对}</b>
          </div>
        </div>
      `;
    }
    html += '</div>';
  }

  // 操作建议
  if (data.操作建议) {
    const o = data.操作建议;
    html += `
      <div class="premarket-card">
        <div class="premarket-card-title">💡 操作建议</div>
        <div class="news-item"><b>总仓位</b>：${o.总仓位}</div>
        <div class="news-item"><b>重点方向</b>：${o.重点方向}</div>
        <div class="news-item"><b>避免方向</b>：${o.避免方向}</div>
      </div>
    `;
  }

  if (!data.今日要闻 && !data.美股映射 && data.idea_trade_qa_raw) {
    html += `<div class="premarket-card"><div class="premarket-card-title">AI 输出</div><pre style="white-space: pre-wrap; font-size: 12px; font-family: var(--mono);">${escapeHtml(data.idea_trade_qa_raw)}</pre></div>`;
  }

  if (!data.今日要闻 && !data.idea_trade_qa_raw) {
    html += '<div class="premarket-card"><div class="loading">⏳ 数据待生成</div></div>';
  }

  html += '</div>';

  content.innerHTML = html;
}

// ════════ 板块 5：明日预测 ════════
async function renderForecast() {
  const tag = document.getElementById('forecast-tag');
  const content = document.getElementById('forecast-content');

  const data = await loadJSON('a-share-forecast/latest.json');
  if (!data) {
    content.innerHTML = '<div class="loading">❌ 数据加载失败</div>';
    tag.textContent = '无数据';
    return;
  }

  tag.textContent = `更新 ${data.更新日期} ${data.发布时间 || ''}`;

  let html = '<div class="forecast-content">';

  // 左侧：方向 + 概率
  if (data.明日判断) {
    const j = data.明日判断;
    let directionClass = 'flat';
    if (j.方向?.includes('涨') || j.方向?.includes('上')) directionClass = 'up';
    else if (j.方向?.includes('跌') || j.方向?.includes('下')) directionClass = 'down';

    html += `
      <div class="forecast-summary">
        <div style="font-size: 11px; color: var(--ink-faint); letter-spacing: 1px; margin-bottom: 6px;">明日方向判断</div>
        <div class="forecast-direction ${directionClass}">${j.方向 || '-'}</div>
        <div style="font-size: 12px; color: var(--ink-soft); margin: 8px 0;">${j.核心逻辑 || ''}</div>
        <div class="forecast-prob">
          <div class="forecast-prob-bar">
            <div class="forecast-prob-up" style="width: ${(j.概率?.上涨 || 0) * 100}%;">${((j.概率?.上涨 || 0) * 100).toFixed(0)}%</div>
            <div class="forecast-prob-flat" style="width: ${(j.概率?.震荡 || 0) * 100}%;">${((j.概率?.震荡 || 0) * 100).toFixed(0)}%</div>
            <div class="forecast-prob-down" style="width: ${(j.概率?.下跌 || 0) * 100}%;">${((j.概率?.下跌 || 0) * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    `;
  } else if (data.idea_trade_qa_raw) {
    html += `<div class="forecast-summary"><div class="premarket-card-title">AI 输出</div><pre style="white-space: pre-wrap; font-size: 12px; font-family: var(--mono);">${escapeHtml(data.idea_trade_qa_raw)}</pre></div>`;
  } else {
    html += '<div class="forecast-summary"><div class="loading">⏳ 数据待生成</div></div>';
  }

  // 右侧：细节
  html += '<div class="forecast-detail">';

  if (data.关键变量) {
    html += `
      <div class="forecast-block">
        <div class="forecast-block-title">🔑 关键变量</div>
        <div class="forecast-block-body"><ul>
          ${data.关键变量.map(v => `<li><b>${v.变量}</b>（影响度：${v.影响}）</li>`).join('')}
        </ul></div>
      </div>
    `;
  }

  if (data.盯盘清单) {
    html += `
      <div class="forecast-block">
        <div class="forecast-block-title">👀 盯盘清单</div>
        <div class="forecast-block-body"><ul>
          ${data.盯盘清单.map(s => `<li>${s}</li>`).join('')}
        </ul></div>
      </div>
    `;
  }

  if (data.操作策略) {
    const s = data.操作策略;
    html += `
      <div class="forecast-block">
        <div class="forecast-block-title">💼 操作策略</div>
        <div class="forecast-block-body">
          <div><b>持仓</b>：${s.持仓}</div>
          <div><b>加仓</b>：${s.加仓}</div>
          <div><b>减仓</b>：${s.减仓}</div>
        </div>
      </div>
    `;
  }

  html += '</div></div>';

  content.innerHTML = html;
}

// ════════ 板块 6：四季地图 ════════
async function renderSeasonMap() {
  const tag = document.getElementById('season-map-tag');
  const content = document.getElementById('season-map-content');

  const data = await loadJSON('season-map/2026.json');
  if (!data) {
    content.innerHTML = '<div class="loading">❌ 数据加载失败</div>';
    tag.textContent = '无数据';
    return;
  }

  tag.textContent = `${data.更新年份} 年版`;

  const seasonIcons = {
    "春升": "🌱", "夏涨": "☀️", "夏末": "⛈️", "秋伐": "🍂", "冬藏": "❄️",
  };

  let html = '<div class="season-map-content">';

  // 四季卡片
  html += '<div class="season-grid">';
  for (const [name, def] of Object.entries(data.四季定义 || {})) {
    const isCurrent = data.当前季节 === name;
    const iconKey = name.match(/^(.)/)?.[1];
    const icon = Object.entries(seasonIcons).find((((k, v]) => name.includes(k)))?.[1] || '📅';
    html += `
      <div class="season-card ${isCurrent ? 'current' : ''}">
        <div class="season-icon">${icon}</div>
        <div class="season-name">${name}</div>
        <div class="season-rate">${(def.胜率 * 100).toFixed(0)}%</div>
        <div class="season-strategy">${def.策略}</div>
        <div class="season-feature">${def.特征}</div>
      </div>
    `;
  }
  html += '</div>';

  // 当前季节策略
  if (data.季节策略) {
    const s = data.季节策略;
    html += `
      <div class="season-current-strategy">
        <div class="season-current-title">📍 当前季节策略（${data.当前季节}）</div>
        <div class="season-current-body">
          <div><b>建议仓位：</b>${s.建议仓位}</div>
          <div><b>优选板块：</b>${s.优选板块}</div>
          <div><b>规避板块：</b>${s.规避板块 || '-'}</div>
          <div><b>关键指标：</b>${s.关键指标}</div>
        </div>
      </div>
    `;
  }

  // 全年节奏
  if (data.全年节奏) {
    html += '<div class="season-current-strategy"><div class="season-current-title">📅 全年 12 月节奏</div><div class="year-rhythm">';
    for (const m of data.全年节奏) {
      const seasonKey = m.季节.match(/^(.)/)?.[1];
      const seasonClass = {
        '春': 'spring', '夏': 'summer', '秋': 'autumn', '冬': 'winter',
      }[seasonKey];
      let cssClass = '';
      if (m.季节 === '春升') cssClass = 'spring';
      else if (m.季节 === '夏涨') cssClass = 'summer';
      else if (m.季节 === '夏末') cssClass = 'summer-end';
      else if (m.季节 === '秋伐') cssClass = 'autumn';
      else if (m.季节 === '冬藏') cssClass = 'winter';
      html += `
        <div class="rhythm-month ${cssClass}">
          <div class="rhythm-month-name">${m.月份}月</div>
          <div class="rhythm-month-rate">${(m.胜率 * 100).toFixed(0)}%</div>
        </div>
      `;
    }
    html += '</div></div>';
  }

  html += '</div>';
  content.innerHTML = html;
}

// ════════ 工具 ════════
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function setLastUpdate() {
  fetch(`${DATA_BASE}latest.json`, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('last-update');
      if (data && data.更新日期) {
        el.textContent = `更新 ${data.更新日期} ${data.更新时间 || ''}`;
      } else {
        el.textContent = '待首次更新';
      }
    })
    .catch(() => {
      document.getElementById('last-update').textContent = '暂无数据';
    });
}

// ════════ 启动 ════════
window.addEventListener('DOMContentLoaded', () => {
  setLastUpdate();
  renderLowPosition();
  renderUsMegastar();
  renderDailyReview();
  renderPremarket();
  renderForecast();
  renderSeasonMap();
});