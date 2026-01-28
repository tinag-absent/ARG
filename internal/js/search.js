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
