// Bookmark System
// お気に入り機能 - 日報・日記のブックマーク管理

class BookmarkManager {
  constructor() {
    this.storageKey = 'arg_bookmarks';
    this.bookmarks = this.loadBookmarks();
  }

  // ブックマークの読み込み
  loadBookmarks() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      logs: [], // { id, title, date, addedAt, note }
      diaries: [], // { id, author, title, date, addedAt, note }
      tags: [] // カスタムタグ
    };
  }

  // ブックマークの保存
  saveBookmarks() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
    this.updateBookmarkDisplay();
  }

  // 日報をブックマーク
  addLogBookmark(log, note = '') {
    const exists = this.bookmarks.logs.find(b => b.id === log.id);
    if (exists) {
      // 既にブックマーク済みの場合は削除
      this.removeLogBookmark(log.id);
      return false;
    }

    const bookmark = {
      id: log.id,
      title: log.title,
      date: log.date,
      division: log.division,
      threatLevel: log.threatLevel,
      addedAt: new Date().toISOString(),
      note: note,
      tags: []
    };

    this.bookmarks.logs.push(bookmark);
    this.saveBookmarks();
    this.showBookmarkNotification('日報をブックマークしました');
    return true;
  }

  // 日報のブックマークを削除
  removeLogBookmark(logId) {
    this.bookmarks.logs = this.bookmarks.logs.filter(b => b.id !== logId);
    this.saveBookmarks();
    this.showBookmarkNotification('ブックマークを解除しました');
  }

  // 日記をブックマーク
  addDiaryBookmark(diary, note = '') {
    const exists = this.bookmarks.diaries.find(b => b.id === diary.id);
    if (exists) {
      this.removeDiaryBookmark(diary.id);
      return false;
    }

    const bookmark = {
      id: diary.id,
      author: diary.author,
      title: diary.title,
      date: diary.date,
      addedAt: new Date().toISOString(),
      note: note,
      tags: []
    };

    this.bookmarks.diaries.push(bookmark);
    this.saveBookmarks();
    this.showBookmarkNotification('日記をブックマークしました');
    return true;
  }

  // 日記のブックマークを削除
  removeDiaryBookmark(diaryId) {
    this.bookmarks.diaries = this.bookmarks.diaries.filter(b => b.id !== diaryId);
    this.saveBookmarks();
    this.showBookmarkNotification('ブックマークを解除しました');
  }

  // ブックマークされているかチェック
  isLogBookmarked(logId) {
    return this.bookmarks.logs.some(b => b.id === logId);
  }

  isDiaryBookmarked(diaryId) {
    return this.bookmarks.diaries.some(b => b.id === diaryId);
  }

  // ノートの更新
  updateNote(type, id, note) {
    const collection = type === 'log' ? this.bookmarks.logs : this.bookmarks.diaries;
    const bookmark = collection.find(b => b.id === id);
    if (bookmark) {
      bookmark.note = note;
      this.saveBookmarks();
    }
  }

  // タグの追加
  addTag(type, id, tag) {
    const collection = type === 'log' ? this.bookmarks.logs : this.bookmarks.diaries;
    const bookmark = collection.find(b => b.id === id);
    if (bookmark && !bookmark.tags.includes(tag)) {
      bookmark.tags.push(tag);
      
      // グローバルタグリストにも追加
      if (!this.bookmarks.tags.includes(tag)) {
        this.bookmarks.tags.push(tag);
      }
      
      this.saveBookmarks();
    }
  }

  // タグの削除
  removeTag(type, id, tag) {
    const collection = type === 'log' ? this.bookmarks.logs : this.bookmarks.diaries;
    const bookmark = collection.find(b => b.id === id);
    if (bookmark) {
      bookmark.tags = bookmark.tags.filter(t => t !== tag);
      this.saveBookmarks();
    }
  }

  // タグでフィルタ
  filterByTag(tag) {
    return {
      logs: this.bookmarks.logs.filter(b => b.tags.includes(tag)),
      diaries: this.bookmarks.diaries.filter(b => b.tags.includes(tag))
    };
  }

  // ブックマーク通知
  showBookmarkNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'bookmark-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // ブックマーク表示の更新
  updateBookmarkDisplay() {
    const container = document.getElementById('bookmarksContainer');
    if (!container) return;

    const totalBookmarks = this.bookmarks.logs.length + this.bookmarks.diaries.length;

    if (totalBookmarks === 0) {
      container.innerHTML = `
        <div class="no-bookmarks">
          <p>まだブックマークがありません</p>
          <p class="text-muted">重要な日報や日記を保存して、いつでもアクセスできるようにしましょう。</p>
        </div>
      `;
      return;
    }

    let html = '<div class="bookmarks-section">';

    // 日報ブックマーク
    if (this.bookmarks.logs.length > 0) {
      html += '<h3 class="section-title">ブックマークした日報</h3>';
      this.bookmarks.logs
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .forEach(bookmark => {
          html += this.renderLogBookmark(bookmark);
        });
    }

    // 日記ブックマーク
    if (this.bookmarks.diaries.length > 0) {
      html += '<h3 class="section-title">ブックマークした日記</h3>';
      this.bookmarks.diaries
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .forEach(bookmark => {
          html += this.renderDiaryBookmark(bookmark);
        });
    }

    html += '</div>';
    container.innerHTML = html;
  }

  // 日報ブックマークのレンダリング
  renderLogBookmark(bookmark) {
    const threatClass = this.getThreatLevelClass(bookmark.threatLevel);
    return `
      <div class="bookmark-card" data-type="log" data-id="${bookmark.id}">
        <div class="bookmark-header">
          <div class="bookmark-info">
            <span class="bookmark-date">${bookmark.date}</span>
            ${bookmark.division ? `<span class="division-badge">${bookmark.division}</span>` : ''}
            <span class="threat-badge ${threatClass}">脅威度: ${bookmark.threatLevel || 'N/A'}</span>
          </div>
          <button class="bookmark-remove-btn" onclick="bookmarkManager.removeLogBookmark('${bookmark.id}')">
            ✕
          </button>
        </div>
        <h4 class="bookmark-title" onclick="window.location.href='log-detail.html?id=${bookmark.id}'">${bookmark.title}</h4>
        ${bookmark.note ? `<p class="bookmark-note">${bookmark.note}</p>` : ''}
        <div class="bookmark-tags">
          ${bookmark.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          <button class="add-tag-btn" onclick="bookmarkManager.showAddTagDialog('log', '${bookmark.id}')">+ タグ</button>
        </div>
        <div class="bookmark-actions">
          <button class="btn-small" onclick="window.location.href='log-detail.html?id=${bookmark.id}'">開く</button>
          <button class="btn-small" onclick="bookmarkManager.showEditNoteDialog('log', '${bookmark.id}', '${bookmark.note || ''}')">メモ編集</button>
          <button class="btn-small" onclick="bookmarkManager.shareBookmark('log', '${bookmark.id}')">共有</button>
        </div>
      </div>
    `;
  }

  // 日記ブックマークのレンダリング
  renderDiaryBookmark(bookmark) {
    return `
      <div class="bookmark-card" data-type="diary" data-id="${bookmark.id}">
        <div class="bookmark-header">
          <div class="bookmark-info">
            <span class="bookmark-date">${bookmark.date}</span>
            <span class="bookmark-author">${bookmark.author}</span>
          </div>
          <button class="bookmark-remove-btn" onclick="bookmarkManager.removeDiaryBookmark('${bookmark.id}')">
            ✕
          </button>
        </div>
        <h4 class="bookmark-title" onclick="window.location.href='diaries.html#diary-${bookmark.id}'">${bookmark.title}</h4>
        ${bookmark.note ? `<p class="bookmark-note">${bookmark.note}</p>` : ''}
        <div class="bookmark-tags">
          ${bookmark.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          <button class="add-tag-btn" onclick="bookmarkManager.showAddTagDialog('diary', '${bookmark.id}')">+ タグ</button>
        </div>
        <div class="bookmark-actions">
          <button class="btn-small" onclick="window.location.href='diaries.html#diary-${bookmark.id}'">開く</button>
          <button class="btn-small" onclick="bookmarkManager.showEditNoteDialog('diary', '${bookmark.id}', '${bookmark.note || ''}')">メモ編集</button>
          <button class="btn-small" onclick="bookmarkManager.shareBookmark('diary', '${bookmark.id}')">共有</button>
        </div>
      </div>
    `;
  }

  // 脅威レベルのCSSクラス
  getThreatLevelClass(level) {
    if (!level) return 'threat-unknown';
    if (level === 1) return 'threat-low';
    if (level === 2) return 'threat-medium';
    if (level === 3) return 'threat-high';
    if (level >= 4) return 'threat-critical';
    return 'threat-unknown';
  }

  // メモ編集ダイアログ
  showEditNoteDialog(type, id, currentNote) {
    const note = prompt('メモを入力してください:', currentNote);
    if (note !== null) {
      this.updateNote(type, id, note);
    }
  }

  // タグ追加ダイアログ
  showAddTagDialog(type, id) {
    const tag = prompt('タグを入力してください（スペースなし）:');
    if (tag && tag.trim()) {
      this.addTag(type, id, tag.trim());
    }
  }

  // ブックマークの共有
  shareBookmark(type, id) {
    const baseUrl = window.location.origin;
    const url = type === 'log' 
      ? `${baseUrl}/internal/log-detail.html?id=${id}`
      : `${baseUrl}/internal/diaries.html#diary-${id}`;
    
    // クリップボードにコピー
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showBookmarkNotification('URLをクリップボードにコピーしました');
      });
    } else {
      // フォールバック
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.showBookmarkNotification('URLをクリップボードにコピーしました');
    }
  }

  // エクスポート
  exportBookmarks() {
    const dataStr = JSON.stringify(this.bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arg_bookmarks_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // インポート
  importBookmarks(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        // マージするか置き換えるか確認
        if (confirm('既存のブックマークとマージしますか？（いいえを選ぶと上書きされます）')) {
          // マージ
          imported.logs.forEach(log => {
            if (!this.isLogBookmarked(log.id)) {
              this.bookmarks.logs.push(log);
            }
          });
          imported.diaries.forEach(diary => {
            if (!this.isDiaryBookmarked(diary.id)) {
              this.bookmarks.diaries.push(diary);
            }
          });
        } else {
          // 上書き
          this.bookmarks = imported;
        }
        this.saveBookmarks();
        alert('ブックマークをインポートしました。');
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  }

  // 統計情報
  getStats() {
    return {
      totalBookmarks: this.bookmarks.logs.length + this.bookmarks.diaries.length,
      logsBookmarked: this.bookmarks.logs.length,
      diariesBookmarked: this.bookmarks.diaries.length,
      totalTags: this.bookmarks.tags.length,
      mostUsedTags: this.getMostUsedTags(5)
    };
  }

  // よく使うタグ
  getMostUsedTags(limit = 5) {
    const tagCounts = {};
    
    [...this.bookmarks.logs, ...this.bookmarks.diaries].forEach(bookmark => {
      bookmark.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }
}

// グローバルインスタンス
let bookmarkManager;

// 初期化
export function initBookmarkManager() {
  bookmarkManager = new BookmarkManager();
  bookmarkManager.updateBookmarkDisplay();
  
  // グローバルに公開
  window.bookmarkManager = bookmarkManager;
  
  return bookmarkManager;
}

// エクスポート
export { BookmarkManager };
export default initBookmarkManager;
