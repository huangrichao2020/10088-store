// 登录态导航（与 scripts/aichainmap-auth-worker.js 的 /__auth/me 配套）。
// 静态页本身不知道登录态（cookie 是 HttpOnly），加载后异步查 /__auth/me：
//   未登录 → 顶栏/侧栏保持「登录 / 注册」入口；
//   已登录 → 把入口文字换成当前邮箱，并按 免费/付费/管理员 上色，让用户一眼看到自己登录了。
(function () {
  function apply(d) {
    if (!d || !d.authenticated) return; // 未登录：保持默认「登录 / 注册」
    var label = d.email || (d.legacy ? "管理员" : "我的账号");
    var tier = d.admin ? "admin" : d.paid ? "paid" : "free";

    var btn = document.querySelector(".strip .btn-account");
    if (btn) {
      btn.textContent = label;
      btn.title = "已登录：" + label + "（点击查看账号 / 登出）";
      btn.classList.add("logged-in");
      btn.setAttribute("data-tier", tier);
    }
    var sp = document.querySelector(".spine-link.nav-account");
    if (sp) {
      var lab = sp.querySelector(".label");
      if (lab) lab.textContent = label;
      sp.classList.add("logged-in");
      sp.setAttribute("data-tier", tier);
    }
  }
  try {
    fetch("/__auth/me", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(apply)
      .catch(function () {});
  } catch (e) {}
})();
