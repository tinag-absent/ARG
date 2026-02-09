import { initMenu } from './menu.js';
import { initSearch } from './search.js';
import { loadComponents } from './components.js';
// 閲覧回数の記録
let visitCount = localStorage.getItem('kaishoku_visit') || 0;
visitCount = parseInt(visitCount) + 1;
localStorage.setItem('kaishoku_visit', visitCount);

// 段階に応じたクラス付与
const body = document.body;
if (visitCount >= 2) body.classList.add('erosion-stage-1');
if (visitCount >= 3) body.classList.add('erosion-stage-2');
if (visitCount >= 4) body.classList.add('erosion-stage-3');
if (visitCount >= 5) {
    body.classList.add('corrupted');
    console.warn("警告: 海蝕率が許容値を超えました。直ちに退避してください。");
}

document.addEventListener('DOMContentLoaded', async () => {
  // コンポーネントの読み込み
  await loadComponents();

  // ログインチェック
  const path = window.location.pathname;
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const accessLevel = sessionStorage.getItem('accessLevel') || 0;
  const userName = sessionStorage.getItem('userName') || 'GUEST';

  if (!isLoggedIn && !path.includes('login.html')) {
    window.location.href = 'login.html';
    return;
  }

  // 権限表示の追加
  if (isLoggedIn) {
    const levelDisplayContainer = document.getElementById('accessLevelContainer');
    if (levelDisplayContainer) {
      levelDisplayContainer.className = 'access-level-display';
      levelDisplayContainer.innerHTML = `LEVEL: ${accessLevel} [${userName}]`;
      levelDisplayContainer.style.fontSize = '0.7rem';
      levelDisplayContainer.style.color = 'var(--accent)';
      levelDisplayContainer.style.fontFamily = 'DotGothic16, sans-serif';
    }
  }

  // ログアウトボタンの制御
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && isLoggedIn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }

  initMenu();
  initSearch();
});
