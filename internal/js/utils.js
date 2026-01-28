export function createLogCard(log) {
const card = document.createElement('div');
card.className = 'log-card';

  card.innerHTML = `
<div class="log-date">${log.date}</div>
<div class="log-title">${log.title}</div>
${log.restricted ? '<div class="log-restricted">閲覧制限</div>' : ''}
<p>${log.body}</p>
<div class="log-footer" style="margin-top: 1rem; text-align: right;">
  <a href="log-detail.html?id=${log.id}" class="cta-btn" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">詳細を閲覧</a>
</div>
`;

return card;
}
