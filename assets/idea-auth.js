/* idea-auth.js · 前端账号 + 会员管理（共用脚本）
 * 依赖：assets/shared.css + assets/idea-store.css
 * 用法：<script defer src="assets/idea-auth.js?v=001"></script>
 */

const IdeaAuth = (() => {
  const API_BASE = '/api';
  const TOKEN_KEY = 'idea_auth_token';
  const USER_KEY = 'idea_auth_user';

  // === Token 管理 ===
  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    renderAuthState();
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    renderAuthState();
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  }

  // === API 调用 ===
  async function api(path, options = {}) {
    const { method = 'GET', body, auth = false } = options;
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
    return data;
  }

  // === 注册 / 登录 / 退出 ===
  async function register(payload) {
    const data = await api('/auth/register', { method: 'POST', body: payload });
    setToken(data.access_token, data.user);
    return data;
  }

  async function login(payload) {
    const data = await api('/auth/login', { method: 'POST', body: payload });
    setToken(data.access_token, data.user);
    return data;
  }

  async function logout() {
    try { await api('/auth/logout', { method: 'POST', auth: true }); } catch {}
    clearToken();
  }

  async function me() {
    return api('/auth/me', { auth: true });
  }

  // === 会员 ===
  async function myMembership() {
    return api('/memberships/me', { auth: true });
  }

  async function tiers() {
    return api('/memberships/tiers');
  }

  async function createOrder(tierId) {
    return api('/payments/create', { method: 'POST', body: { tier_id: tierId }, auth: true });
  }

  // === 渲染顶部登录状态（id="idea-auth-status"） ===
  function renderAuthState() {
    const el = document.getElementById('idea-auth-status');
    if (!el) return;

    const user = getUser();
    if (user && user.id) {
      el.innerHTML = `
        <a class="btn" href="/account.html">Hi ${escapeHtml(user.nickname || user.username)} · 会员中心</a>
        <a class="btn ghost" href="#" onclick="IdeaAuth.logout(); return false;">退出</a>
      `;
    } else {
      el.innerHTML = `
        <a class="btn" href="/login.html">登录 / 注册</a>
      `;
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // 页面加载时自动渲染
  document.addEventListener('DOMContentLoaded', renderAuthState);

  return {
    getToken, setToken, clearToken, getUser,
    api, register, login, logout, me,
    myMembership, tiers, createOrder,
    renderAuthState, escapeHtml,
  };
})();