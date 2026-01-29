import { createLogCard } from './utils.js';

export const initSearch = async () => {
const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const modal = document.getElementById('searchModal');
const results = document.getElementById('modalResults');
const closeBtn = document.getElementById('closeModal');

if (!input || !button || !modal || !results || !closeBtn) return;

let logs = [];

try {
const res = await fetch('./deta/logs.json');
logs = await res.json();
} catch (e) {
console.error('Fetch error:', e);
results.innerHTML = '<p class="text-muted">日報データの読み込みに失敗しました。</p>';
return;
}

const openModal = () => {
modal.style.display = 'block';
document.body.style.overflow = 'hidden'; // Scroll lock
};

const closeModal = () => {
modal.style.display = 'none';
document.body.style.overflow = ''; // Release scroll lock
};

const performSearch = () => {
results.innerHTML = '';
const keyword = input.value.trim();

if (!keyword) {
results.innerHTML = '<p class="text-muted">キーワードを入力してください。</p>';
openModal();
return;
}

const filteredLogs = logs.filter(log => 
log.date.includes(keyword) || 
log.title.includes(keyword) ||
(log.body && log.body.includes(keyword))
);

if (filteredLogs.length === 0) {
results.innerHTML = '<p class="text-muted">該当する日報は見つかりませんでした。</p>';
} else {
filteredLogs.forEach(log => results.appendChild(createLogCard(log)));
}

openModal();
};

button.addEventListener('click', performSearch);
input.addEventListener('keypress', (e) => {
if (e.key === 'Enter') performSearch();
});

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
if (e.target === modal) closeModal();
});
};
// search_enhanced.js
// 検索・フィルタ・タイムライン統合版（DOM整合・安全化済）

export function initSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  const divisionFilter = document.getElementById('divisionFilter');
  const threatLevelFilter = document.getElementById('threatLevelFilter');
  const dateFromFilter = document.getElementById('dateFromFilter');
  const dateToFilter = document.getElementById('dateToFilter');
  const sortOrder = document.getElementById('sortOrder');

  const listView = document.getElementById('listView');

  if (!searchForm || !listView) return;

  let logsData = [];

  /* ---------- utils ---------- */

  const escapeHTML = (str = '') =>
    str.replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));

  const getThreatClass = lvl => {
    if (!lvl) return 'threat-unknown';
    if (lvl === 1) return 'threat-low';
    if (lvl === 2) return 'threat-medium';
    if (lvl === 3) return 'threat-high';
    return 'threat-critical';
  };

  /* ---------- load ---------- */

  async function loadLogs() {
    const res = await fetch('./deta/logs.json');
    logsData = await res.json();
    populateDivisions();
  }

  function populateDivisions() {
    if (!divisionFilter) return;
    [...new Set(logsData.map(l => l.division).filter(Boolean))]
      .forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        divisionFilter.appendChild(opt);
      });
  }

  /* ---------- search ---------- */

  function searchLogs(query) {
    const q = query.toLowerCase();
    const access = Number(sessionStorage.getItem('accessLevel') || 1);

    return logsData.filter(log => {
      if (log.restricted && log.requiredLevel > access) return false;

      if (q && !(
        log.id?.toLowerCase().includes(q) ||
        log.title?.toLowerCase().includes(q) ||
        log.body?.toLowerCase().includes(q) ||
        log.date?.includes(q)
      )) return false;

      if (divisionFilter?.value && log.division !== divisionFilter.value) return false;
      if (threatLevelFilter?.value > 0 && log.threatLevel !== Number(threatLevelFilter.value)) return false;

      const d = new Date(log.date);
      if (dateFromFilter?.value && d < new Date(dateFromFilter.value)) return false;
      if (dateToFilter?.value && d > new Date(dateToFilter.value)) return false;

      return true;
    });
  }

  function sortLogs(logs) {
    switch (sortOrder.value) {
      case 'date-asc': return logs.sort((a,b)=>new Date(a.date)-new Date(b.date));
      case 'threat-desc': return logs.sort((a,b)=>(b.threatLevel||0)-(a.threatLevel||0));
      case 'threat-asc': return logs.sort((a,b)=>(a.threatLevel||0)-(b.threatLevel||0));
      default: return logs.sort((a,b)=>new Date(b.date)-new Date(a.date));
    }
  }

  function renderList(logs) {
    if (!logs.length) {
      listView.innerHTML = `<div class="no-results">該当記録なし</div>`;
      return;
    }

    listView.innerHTML =
      `<div class="search-results-count">${logs.length} 件</div>` +
      logs.map(log => `
        <div class="log-card" data-id="${log.id}">
          <div class="log-header">
            <span class="log-date">${log.date}</span>
            ${log.division ? `<span class="division-badge">${escapeHTML(log.division)}</span>` : ''}
            <span class="threat-badge ${getThreatClass(log.threatLevel)}">
              脅威度: ${log.threatLevel ?? 'N/A'}
            </span>
          </div>
          <h3 class="log-title">${escapeHTML(log.title)}</h3>
          <p class="log-excerpt">${escapeHTML(log.body?.slice(0,150))}...</p>
          <button class="view-detail-btn">詳細</button>
        </div>
      `).join('');
  }

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const results = sortLogs(searchLogs(searchInput.value.trim()));
    renderList(results);
  });

  [divisionFilter, threatLevelFilter, dateFromFilter, dateToFilter, sortOrder]
    .forEach(f => f?.addEventListener('change', () => {
      renderList(sortLogs(searchLogs(searchInput.value.trim())));
    }));

  listView.addEventListener('click', e => {
    const card = e.target.closest('.log-card');
    if (card) location.href = `log-detail.html?id=${encodeURIComponent(card.dataset.id)}`;
  });

  loadLogs();
}

/* ---------- timeline ---------- */

export function initTimeline() {
  const timelineView = document.getElementById('timelineView');
  if (!timelineView) return;

  fetch('./deta/logs.json')
    .then(r => r.json())
    .then(logs => {
      const access = Number(sessionStorage.getItem('accessLevel') || 1);
      timelineView.innerHTML =
        `<div class="timeline-container">` +
        logs
          .filter(l => !l.restricted || l.requiredLevel <= access)
          .sort((a,b)=>new Date(b.date)-new Date(a.date))
          .map((l,i)=>`
            <div class="timeline-item ${i%2?'right':'left'}">
              <div class="timeline-marker ${getThreatClass(l.threatLevel)}"></div>
              <div class="timeline-content" onclick="location.href='log-detail.html?id=${l.id}'">
                <div class="timeline-date">${l.date}</div>
                <h4>${escapeHTML(l.title)}</h4>
              </div>
            </div>
          `).join('') +
        `</div>`;
    });
}
