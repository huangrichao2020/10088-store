
// ═══ Sidebar Search ═══
(function() {
  const input = document.getElementById('sb-search');
  const results = document.getElementById('sb-search-results');
  if (!input || !results) return;

  let searchData = null;
  let loading = false;

  async function loadIndex() {
    if (searchData || loading) return;
    loading = true;
    // 计算路径深度：根据当前 URL 推断
    const depth = (location.pathname.match(/\//g) || []).length - 1;
    const dataPath = '../'.repeat(depth) + 'data/search-index.js';
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = dataPath;
      s.onload = () => { searchData = window.SEARCH_INDEX || []; loading = false; resolve(); };
      s.onerror = () => { loading = false; resolve(); };
      document.head.appendChild(s);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    const lc = text.toLowerCase();
    const ql = q.toLowerCase();
    const idx = lc.indexOf(ql);
    if (idx < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx+q.length)) + '</mark>' + escapeHtml(text.slice(idx+q.length));
  }

  function search(q) {
    if (!q || q.length < 1) { results.classList.remove('open'); results.innerHTML = ''; return; }
    if (!searchData) { loadIndex().then(() => search(q)); return; }
    const ql = q.toLowerCase();
    const matches = [];
    for (const item of searchData) {
      let score = 0;
      const name = String(item.n).toLowerCase();
      const title = String(item.t).toLowerCase();
      const aliases = (item.a || []).map(a => String(a).toLowerCase());
      if (name === ql) score = 100;
      else if (name.startsWith(ql)) score = 50;
      else if (name.includes(ql)) score = 30;
      else if (title.includes(ql)) score = 20;
      else if (aliases.some(a => a.includes(ql))) score = 15;
      else if ((item.h || '').toLowerCase().includes(ql)) score = 10;
      if (score > 0) matches.push({ ...item, score });
    }
    matches.sort((a,b) => b.score - a.score);
    const top = matches.slice(0, 12);
    const kindLabel = { companies:'公司', concepts:'概念', people:'人物', events:'事件', subsectors:'子行业', syntheses:'巨头链' };
    const depth = (location.pathname.match(/\//g) || []).length - 1;
    const prefix = '../'.repeat(depth);
    results.innerHTML = top.map(item => `
      <a class="sb-result" href="${prefix}${item.u}">
        <span class="r-kind">${kindLabel[item.k] || item.k}</span>
        ${highlight(item.n, q)}
        ${item.h ? `<span class="r-hint">${escapeHtml(item.h)}</span>` : ''}
      </a>
    `).join('');
    if (top.length) results.classList.add('open');
    else { results.innerHTML = '<div style="padding:12px;color:#888;font-size:12px">无匹配</div>'; results.classList.add('open'); }
  }

  let timer;
  input.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => search(e.target.value.trim()), 150);
  });
  input.addEventListener('focus', () => loadIndex());
  document.addEventListener('click', e => {
    if (!e.target.closest('.spine-search')) results.classList.remove('open');
  });
})();

// ═══ Auto-open backlink groups with high counts ═══
(function() {
  document.querySelectorAll('.bl-group').forEach((g, i) => {
    if (i < 3) g.setAttribute('data-open', '');
  });
})();
