// Progress Tracker System
// プログレス追跡システム - 日報閲覧履歴、達成度、バッジ管理

class ProgressTracker {
  constructor() {
    this.storageKey = 'arg_progress';
    this.progress = this.loadProgress();
  }

  // プログレスデータの読み込み
  loadProgress() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    
    // デフォルトのプログレスデータ
    return {
      readLogs: [], // 読んだ日報のID配列
      readDiaries: [], // 読んだ日記のID配列
      unlockedBadges: [], // 獲得したバッジのID配列
      firstLoginDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
      stats: {
        totalLogins: 1,
        totalTimeSpent: 0, // 分単位
        searchCount: 0,
        divisionVisits: {
          '収束部門': 0,
          '支援部門': 0,
          '工作部門': 0,
          '外事部門': 0,
          '港湾部': 0
        }
      }
    };
  }

  // プログレスデータの保存
  saveProgress() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    this.updateProgressDisplay();
  }

  // 日報を既読としてマーク
  markLogAsRead(logId) {
    if (!this.progress.readLogs.includes(logId)) {
      this.progress.readLogs.push(logId);
      this.saveProgress();
      this.checkAchievements();
    }
  }

  // 日記を既読としてマーク
  markDiaryAsRead(diaryId) {
    if (!this.progress.readDiaries.includes(diaryId)) {
      this.progress.readDiaries.push(diaryId);
      this.saveProgress();
      this.checkAchievements();
    }
  }

  // 検索カウントを増加
  incrementSearchCount() {
    this.progress.stats.searchCount++;
    this.saveProgress();
  }

  // 部門訪問を記録
  recordDivisionVisit(divisionName) {
    if (this.progress.stats.divisionVisits[divisionName] !== undefined) {
      this.progress.stats.divisionVisits[divisionName]++;
      this.saveProgress();
      this.checkAchievements();
    }
  }

  // 最終アクティブ日時を更新
  updateLastActive() {
    this.progress.lastActiveDate = new Date().toISOString();
    this.saveProgress();
  }

  // 達成状況の取得
  getAchievementStats() {
    return {
      logsRead: this.progress.readLogs.length,
      diariesRead: this.progress.readDiaries.length,
      badgesEarned: this.progress.unlockedBadges.length,
      searchCount: this.progress.stats.searchCount,
      daysSinceFirstLogin: this.getDaysSinceFirstLogin()
    };
  }

  // 初回ログインからの日数
  getDaysSinceFirstLogin() {
    const first = new Date(this.progress.firstLoginDate);
    const now = new Date();
    const diff = now - first;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // 達成度のチェック
  checkAchievements() {
    const badges = this.getBadgeDefinitions();
    
    badges.forEach(badge => {
      // すでに獲得済みならスキップ
      if (this.progress.unlockedBadges.includes(badge.id)) {
        return;
      }

      // 条件を満たしているかチェック
      if (badge.checkCondition(this)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  // バッジの獲得
  unlockBadge(badgeId) {
    if (!this.progress.unlockedBadges.includes(badgeId)) {
      this.progress.unlockedBadges.push(badgeId);
      this.saveProgress();
      this.showBadgeNotification(badgeId);
    }
  }

  // バッジ定義
  getBadgeDefinitions() {
    return [
      {
        id: 'first_log',
        name: '初めての記録',
        description: '最初の日報を読んだ',
        icon: '📖',
        checkCondition: (tracker) => tracker.progress.readLogs.length >= 1
      },
      {
        id: 'explorer',
        name: '探索者',
        description: '5つの日報を読んだ',
        icon: '🔍',
        checkCondition: (tracker) => tracker.progress.readLogs.length >= 5
      },
      {
        id: 'researcher',
        name: '調査員',
        description: '10の日報を読んだ',
        icon: '📚',
        checkCondition: (tracker) => tracker.progress.readLogs.length >= 10
      },
      {
        id: 'completionist',
        name: 'コンプリート',
        description: '全ての日報を読んだ',
        icon: '⭐',
        checkCondition: (tracker) => tracker.progress.readLogs.length >= 11
      },
      {
        id: 'diary_reader',
        name: '日記読者',
        description: '5つの日記を読んだ',
        icon: '📔',
        checkCondition: (tracker) => tracker.progress.readDiaries.length >= 5
      },
      {
        id: 'all_diaries',
        name: '全日記制覇',
        description: '全ての日記を読んだ',
        icon: '📕',
        checkCondition: (tracker) => tracker.progress.readDiaries.length >= 12
      },
      {
        id: 'search_master',
        name: '検索の達人',
        description: '10回検索を実行した',
        icon: '🔎',
        checkCondition: (tracker) => tracker.progress.stats.searchCount >= 10
      },
      {
        id: 'convergence_specialist',
        name: '収束専門家',
        description: '収束部門のページを5回訪問',
        icon: '⚡',
        checkCondition: (tracker) => tracker.progress.stats.divisionVisits['収束部門'] >= 5
      },
      {
        id: 'all_divisions',
        name: '全部門訪問',
        description: '全ての部門を訪問した',
        icon: '🏢',
        checkCondition: (tracker) => {
          const visits = tracker.progress.stats.divisionVisits;
          return Object.values(visits).every(count => count > 0);
        }
      },
      {
        id: 'week_veteran',
        name: '1週間の海蝕員',
        description: '初回ログインから7日経過',
        icon: '🗓️',
        checkCondition: (tracker) => tracker.getDaysSinceFirstLogin() >= 7
      },
      {
        id: 'dedicated',
        name: '献身的な海蝕員',
        description: '初回ログインから30日経過',
        icon: '🎖️',
        checkCondition: (tracker) => tracker.getDaysSinceFirstLogin() >= 30
      },
      {
        id: 'truth_seeker',
        name: '真実の探求者',
        description: '全ての日報と日記を読んだ',
        icon: '🔮',
        checkCondition: (tracker) => {
          return tracker.progress.readLogs.length >= 11 && 
                 tracker.progress.readDiaries.length >= 12;
        }
      }
    ];
  }

  // バッジ獲得通知の表示
  showBadgeNotification(badgeId) {
    const badge = this.getBadgeDefinitions().find(b => b.id === badgeId);
    if (!badge) return;

    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification-content">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-info">
          <h4>バッジ獲得！</h4>
          <p class="badge-name">${badge.name}</p>
          <p class="badge-desc">${badge.description}</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // アニメーション
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 5秒後に非表示
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // プログレス表示の更新
  updateProgressDisplay() {
    const container = document.getElementById('progressDisplay');
    if (!container) return;

    const stats = this.getAchievementStats();
    const percentage = Math.round((stats.logsRead / 11) * 100);

    container.innerHTML = `
      <div class="progress-stats">
        <div class="stat-item">
          <span class="stat-label">読んだ日報</span>
          <span class="stat-value">${stats.logsRead} / 11</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">読んだ日記</span>
          <span class="stat-value">${stats.diariesRead} / 12</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">獲得バッジ</span>
          <span class="stat-value">${stats.badgesEarned} / ${this.getBadgeDefinitions().length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">在籍日数</span>
          <span class="stat-value">${stats.daysSinceFirstLogin}日</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percentage}%"></div>
        <span class="progress-percentage">${percentage}%</span>
      </div>
    `;
  }

  // バッジ一覧の表示
  displayBadges() {
    const container = document.getElementById('badgesContainer');
    if (!container) return;

    const badges = this.getBadgeDefinitions();
    const unlockedIds = this.progress.unlockedBadges;

    container.innerHTML = badges.map(badge => {
      const isUnlocked = unlockedIds.includes(badge.id);
      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-large">${isUnlocked ? badge.icon : '🔒'}</div>
          <h4 class="badge-name">${badge.name}</h4>
          <p class="badge-description">${badge.description}</p>
          ${!isUnlocked ? '<span class="badge-status">未獲得</span>' : '<span class="badge-status unlocked">獲得済み</span>'}
        </div>
      `;
    }).join('');
  }

  // プログレスのリセット（デバッグ用）
  resetProgress() {
    if (confirm('本当に進捗をリセットしますか？この操作は取り消せません。')) {
      localStorage.removeItem(this.storageKey);
      this.progress = this.loadProgress();
      this.updateProgressDisplay();
      this.displayBadges();
      alert('進捗がリセットされました。');
    }
  }

  // エクスポート（データのバックアップ）
  exportProgress() {
    const dataStr = JSON.stringify(this.progress, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arg_progress_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // インポート（データの復元）
  importProgress(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        this.progress = imported;
        this.saveProgress();
        alert('進捗データをインポートしました。');
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  }
}

// グローバルインスタンス
let progressTracker;

// 初期化
export function initProgressTracker() {
  progressTracker = new ProgressTracker();
  progressTracker.updateLastActive();
  progressTracker.updateProgressDisplay();
  progressTracker.checkAchievements();
  
  return progressTracker;
}

// エクスポート
export { ProgressTracker };
export default initProgressTracker;
