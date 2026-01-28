// Enhanced search functionality with advanced filters
// 拡張された検索機能 - 複数フィルター、タイムライン表示対応

export function initSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchModal = document.getElementById('searchModal');
  const closeModal = document.getElementById('closeModal');
  const modalResults = document.getElementById('modalResults');
  
  // Advanced filter elements
  const divisionFilter = document.getElementById('divisionFilter');
  const threatLevelFilter = document.getElementById('threatLevelFilter');
  const dateFromFilter = document.getElementById('dateFromFilter');
  const dateToFilter = document.getElementById('dateToFilter');
  const sortOrder = document.getElementById('sortOrder');
  
  if (!searchForm || !searchInput) return;

  // Load logs data
  let logsData = [];
  
  async function loadLogs() {
    try {
      const response = await fetch('./deta/logs.json');
      logsData = await response.json();
      
      // Initialize filters after data is loaded
      if (divisionFilter) {
        populateDivisionFilter();
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      showError('データの読み込みに失敗しました');
    }
  }

  // Populate division filter with unique divisions
  function populateDivisionFilter() {
    const divisions = [...new Set(logsData.map(log => log.division).filter(Boolean))];
    divisions.forEach(division => {
      const option = document.createElement('option');
      option.value = division;
      option.textContent = division;
      divisionFilter.appendChild(option);
    });
  }

  // Enhanced search function
  function performSearch(query) {
    const searchTerm = query.toLowerCase();
    
    // Get filter values
    const selectedDivision = divisionFilter ? divisionFilter.value : '';
    const selectedThreatLevel = threatLevelFilter ? parseInt(threatLevelFilter.value) : 0;
    const dateFrom = dateFromFilter ? new Date(dateFromFilter.value) : null;
    const dateTo = dateToFilter ? new Date(dateToFilter.value) : null;
    const sort = sortOrder ? sortOrder.value : 'date-desc';
    
    // Get current user's access level
    const accessLevel = parseInt(sessionStorage.getItem('accessLevel') || '1');
    
    // Filter logs
    let results = logsData.filter(log => {
      // Check access level
      if (log.restricted && log.requiredLevel > accessLevel) {
        return false;
      }
      
      // Check search term
      const matchesSearch = !searchTerm || 
        log.id.toLowerCase().includes(searchTerm) ||
        log.title.toLowerCase().includes(searchTerm) ||
        log.body.toLowerCase().includes(searchTerm) ||
        log.date.includes(searchTerm);
      
      if (!matchesSearch) return false;
      
      // Check division filter
      if (selectedDivision && log.division !== selectedDivision) {
        return false;
      }
      
      // Check threat level filter
      if (selectedThreatLevel > 0 && log.threatLevel !== selectedThreatLevel) {
        return false;
      }
      
      // Check date range
      if (dateFrom || dateTo) {
        const logDate = new Date(log.date);
        if (dateFrom && logDate < dateFrom) return false;
        if (dateTo && logDate > dateTo) return false;
      }
      
      return true;
    });
    
    // Sort results
    results = sortResults(results, sort);
    
    return results;
  }

  // Sort function
  function sortResults(results, sortType) {
    switch(sortType) {
      case 'date-desc':
        return results.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'date-asc':
        return results.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'threat-desc':
        return results.sort((a, b) => (b.threatLevel || 0) - (a.threatLevel || 0));
      case 'threat-asc':
        return results.sort((a, b) => (a.threatLevel || 0) - (b.threatLevel || 0));
      default:
        return results;
    }
  }

  // Display results
  function displayResults(results) {
    if (results.length === 0) {
      modalResults.innerHTML = `
        <div class="no-results">
          <p>該当する記録が見つかりませんでした。</p>
          <p class="text-muted">検索条件を変更して再度お試しください。</p>
        </div>
      `;
      return;
    }

    const accessLevel = parseInt(sessionStorage.getItem('accessLevel') || '1');
    
    let html = `<div class="search-results-count">
      検索結果: ${results.length}件
    </div>`;
    
    results.forEach(log => {
      const isRestricted = log.restricted && log.requiredLevel > accessLevel;
      const threatClass = getThreatLevelClass(log.threatLevel);
      
      if (isRestricted) {
        html += `
          <div class="log-card restricted">
            <div class="log-header">
              <span class="log-date">${log.date}</span>
              <span class="threat-badge ${threatClass}">
                脅威度: ${log.threatLevel || 'N/A'}
              </span>
            </div>
            <h3 class="log-title">[機密] ${log.title}</h3>
            <div class="restriction-notice">
              <p>⚠️ この記録は権限レベル${log.requiredLevel}以上の海蝕員のみ閲覧可能です。</p>
              <p class="text-muted">あなたの現在の権限: レベル${accessLevel}</p>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="log-card" onclick="viewLogDetail('${log.id}')">
            <div class="log-header">
              <span class="log-date">${log.date}</span>
              ${log.division ? `<span class="division-badge">${log.division}</span>` : ''}
              <span class="threat-badge ${threatClass}">
                脅威度: ${log.threatLevel || 'N/A'}
              </span>
            </div>
            <h3 class="log-title">${log.title}</h3>
            <p class="log-excerpt">${getExcerpt(log.body)}</p>
            <button class="view-detail-btn">詳細を表示 →</button>
          </div>
        `;
      }
    });
    
    modalResults.innerHTML = html;
  }

  // Get threat level CSS class
  function getThreatLevelClass(level) {
    if (!level) return 'threat-unknown';
    if (level === 1) return 'threat-low';
    if (level === 2) return 'threat-medium';
    if (level === 3) return 'threat-high';
    if (level >= 4) return 'threat-critical';
    return 'threat-unknown';
  }

  // Get excerpt from body
  function getExcerpt(text, maxLength = 150) {
    if (!text) return '';
    const cleaned = text.replace(/\n/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + '...';
  }

  // Show error message
  function showError(message) {
    modalResults.innerHTML = `
      <div class="error-message">
        <p>⚠️ ${message}</p>
      </div>
    `;
  }

  // View log detail (navigate to detail page)
  window.viewLogDetail = function(logId) {
    window.location.href = `log-detail.html?id=${logId}`;
  };

  // Event listeners
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query.length < 2 && !divisionFilter?.value && !threatLevelFilter?.value) {
      showError('検索キーワードを2文字以上入力するか、フィルターを選択してください。');
      searchModal.style.display = 'block';
      return;
    }
    
    const results = performSearch(query);
    displayResults(results);
    searchModal.style.display = 'block';
  });

  // Filter change listeners
  [divisionFilter, threatLevelFilter, dateFromFilter, dateToFilter, sortOrder].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', () => {
        const query = searchInput.value.trim();
        const results = performSearch(query);
        displayResults(results);
      });
    }
  });

  closeModal?.addEventListener('click', () => {
    searchModal.style.display = 'none';
  });

  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target === searchModal) {
      searchModal.style.display = 'none';
    }
  });

  // Initialize
  loadLogs();
}

// Timeline view function
export function initTimeline() {
  const timelineContainer = document.getElementById('timeline');
  if (!timelineContainer) return;

  async function loadTimeline() {
    try {
      const response = await fetch('./deta/logs.json');
      const logs = await response.json();
      
      const accessLevel = parseInt(sessionStorage.getItem('accessLevel') || '1');
      
      // Filter by access and sort by date
      const visibleLogs = logs
        .filter(log => !log.restricted || log.requiredLevel <= accessLevel)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      renderTimeline(visibleLogs);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  }

  function renderTimeline(logs) {
    let html = '<div class="timeline-container">';
    
    logs.forEach((log, index) => {
      const threatClass = getThreatLevelClass(log.threatLevel);
      const side = index % 2 === 0 ? 'left' : 'right';
      
      html += `
        <div class="timeline-item ${side}">
          <div class="timeline-marker ${threatClass}"></div>
          <div class="timeline-content" onclick="viewLogDetail('${log.id}')">
            <div class="timeline-date">${log.date}</div>
            <h4 class="timeline-title">${log.title}</h4>
            ${log.division ? `<div class="timeline-division">${log.division}</div>` : ''}
            <div class="timeline-threat">脅威度: ${log.threatLevel || 'N/A'}</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    timelineContainer.innerHTML = html;
  }

  function getThreatLevelClass(level) {
    if (!level) return 'threat-unknown';
    if (level === 1) return 'threat-low';
    if (level === 2) return 'threat-medium';
    if (level === 3) return 'threat-high';
    if (level >= 4) return 'threat-critical';
    return 'threat-unknown';
  }

  window.viewLogDetail = function(logId) {
    window.location.href = `log-detail.html?id=${logId}`;
  };

  loadTimeline();
}

// Export functions
export default { initSearch, initTimeline };
