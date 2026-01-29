// Theme Manager
// テーマ管理 - ダークモードのカスタマイズとシステム設定連動

class ThemeManager {
  constructor() {
    this.storageKey = 'arg_theme';
    this.settings = this.loadSettings();
    this.init();
  }

  // 設定の読み込み
  loadSettings() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      mode: 'auto', // 'auto', 'dark', 'light'
      brightness: 100, // 50-150%
      accentColor: '#00ffff', // アクセントカラー
      fontSize: 100, // 80-120%
      useSystemTheme: true,
      animations: true,
      customColors: {
        bgDark: '#0a0e1a',
        bgCard: '#111827',
        text: '#e5e7eb',
        textMuted: '#9ca3af',
        accent: '#00ffff',
        accentAlpha: 'rgba(0, 255, 255, 0.2)'
      }
    };
  }

  // 設定の保存
  saveSettings() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    this.applyTheme();
  }

  // 初期化
  init() {
    this.applyTheme();
    this.setupSystemThemeListener();
    this.setupAnimationListener();
  }

  // テーマの適用
  applyTheme() {
    const root = document.documentElement;
    const isDark = this.shouldUseDarkMode();

    // モードの適用
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // カスタムカラーの適用
    if (isDark) {
      this.applyColors(this.settings.customColors);
    }

    // 明るさの調整
    this.applyBrightness(this.settings.brightness);

    // フォントサイズの調整
    this.applyFontSize(this.settings.fontSize);

    // アニメーションの設定
    if (!this.settings.animations) {
      root.style.setProperty('--transition-speed', '0s');
    } else {
      root.style.setProperty('--transition-speed', '0.3s');
    }
  }

  // ダークモードを使うべきか判定
  shouldUseDarkMode() {
    if (this.settings.mode === 'dark') return true;
    if (this.settings.mode === 'light') return false;
    
    // autoの場合はシステム設定に従う
    if (this.settings.useSystemTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return true; // デフォルトはダーク
  }

  // カラーの適用
  applyColors(colors) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(cssVar, value);
    });
  }

  // 明るさの調整
  applyBrightness(brightness) {
    const root = document.documentElement;
    const factor = brightness / 100;
    
    // 明るさに応じて色を調整
    const adjustColor = (color, factor) => {
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.min(255, Math.floor(r * factor));
        const newG = Math.min(255, Math.floor(g * factor));
        const newB = Math.min(255, Math.floor(b * factor));
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      }
      return color;
    };

    // アクセントカラーの明るさ調整
    const adjustedAccent = adjustColor(this.settings.customColors.accent, factor);
    root.style.setProperty('--accent-adjusted', adjustedAccent);
    
    // フィルターで全体の明るさを調整
    root.style.setProperty('--brightness-filter', `brightness(${factor})`);
  }

  // フォントサイズの調整
  applyFontSize(size) {
    const root = document.documentElement;
    const baseFontSize = 16; // px
    const adjustedSize = (baseFontSize * size) / 100;
    root.style.fontSize = `${adjustedSize}px`;
  }

  // システムテーマ変更の監視
  setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.settings.useSystemTheme && this.settings.mode === 'auto') {
        this.applyTheme();
      }
    });
  }

  // アニメーション設定の監視
  setupAnimationListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      this.settings.animations = false;
      this.applyTheme();
    }
  }

  // モードの設定
  setMode(mode) {
    this.settings.mode = mode;
    this.saveSettings();
  }

  // 明るさの設定
  setBrightness(brightness) {
    this.settings.brightness = Math.max(50, Math.min(150, brightness));
    this.saveSettings();
  }

  // アクセントカラーの設定
  setAccentColor(color) {
    this.settings.customColors.accent = color;
    this.settings.customColors.accentAlpha = this.hexToRgba(color, 0.2);
    this.saveSettings();
  }

  // フォントサイズの設定
  setFontSize(size) {
    this.settings.fontSize = Math.max(80, Math.min(120, size));
    this.saveSettings();
  }

  // アニメーションの切り替え
  toggleAnimations() {
    this.settings.animations = !this.settings.animations;
    this.saveSettings();
  }

  // システムテーマ連動の切り替え
  toggleSystemTheme() {
    this.settings.useSystemTheme = !this.settings.useSystemTheme;
    this.saveSettings();
  }

  // HEXをRGBAに変換
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // プリセットテーマ
  applyPreset(presetName) {
    const presets = {
      default: {
        customColors: {
          bgDark: '#0a0e1a',
          bgCard: '#111827',
          text: '#e5e7eb',
          textMuted: '#9ca3af',
          accent: '#00ffff',
          accentAlpha: 'rgba(0, 255, 255, 0.2)'
        },
        brightness: 100
      },
      ocean: {
        customColors: {
          bgDark: '#0a1628',
          bgCard: '#132847',
          text: '#e0f2ff',
          textMuted: '#7dd3fc',
          accent: '#06b6d4',
          accentAlpha: 'rgba(6, 182, 212, 0.2)'
        },
        brightness: 110
      },
      crimson: {
        customColors: {
          bgDark: '#1a0a0e',
          bgCard: '#2d1115',
          text: '#ffe5e5',
          textMuted: '#fca5a5',
          accent: '#ff4d4d',
          accentAlpha: 'rgba(255, 77, 77, 0.2)'
        },
        brightness: 95
      },
      midnight: {
        customColors: {
          bgDark: '#000000',
          bgCard: '#0f0f0f',
          text: '#ffffff',
          textMuted: '#888888',
          accent: '#00ff88',
          accentAlpha: 'rgba(0, 255, 136, 0.2)'
        },
        brightness: 85
      },
      terminal: {
        customColors: {
          bgDark: '#0d1117',
          bgCard: '#161b22',
          text: '#c9d1d9',
          textMuted: '#8b949e',
          accent: '#58a6ff',
          accentAlpha: 'rgba(88, 166, 255, 0.2)'
        },
        brightness: 100
      }
    };

    const preset = presets[presetName];
    if (preset) {
      this.settings.customColors = preset.customColors;
      this.settings.brightness = preset.brightness;
      this.saveSettings();
    }
  }

  // 設定UIの生成
  createSettingsUI() {
    const container = document.getElementById('themeSettings');
    if (!container) return;

    container.innerHTML = `
      <div class="theme-settings-panel">
        <h3 class="settings-title">テーマ設定</h3>
        
        <!-- モード選択 -->
        <div class="setting-group">
          <label class="setting-label">表示モード</label>
          <div class="mode-selector">
            <button class="mode-btn ${this.settings.mode === 'dark' ? 'active' : ''}" 
                    onclick="themeManager.setMode('dark')">
              🌙 ダーク
            </button>
            <button class="mode-btn ${this.settings.mode === 'auto' ? 'active' : ''}" 
                    onclick="themeManager.setMode('auto')">
              🔄 自動
            </button>
            <button class="mode-btn ${this.settings.mode === 'light' ? 'active' : ''}" 
                    onclick="themeManager.setMode('light')">
              ☀️ ライト
            </button>
          </div>
        </div>

        <!-- システムテーマ連動 -->
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" 
                   ${this.settings.useSystemTheme ? 'checked' : ''}
                   onchange="themeManager.toggleSystemTheme()">
            <span>システム設定に連動</span>
          </label>
        </div>

        <!-- 明るさ調整 -->
        <div class="setting-group">
          <label class="setting-label">明るさ: <span id="brightnessValue">${this.settings.brightness}%</span></label>
          <input type="range" 
                 min="50" 
                 max="150" 
                 value="${this.settings.brightness}"
                 class="slider"
                 oninput="themeManager.setBrightness(this.value); document.getElementById('brightnessValue').textContent = this.value + '%'">
        </div>

        <!-- フォントサイズ調整 -->
        <div class="setting-group">
          <label class="setting-label">文字サイズ: <span id="fontSizeValue">${this.settings.fontSize}%</span></label>
          <input type="range" 
                 min="80" 
                 max="120" 
                 value="${this.settings.fontSize}"
                 class="slider"
                 oninput="themeManager.setFontSize(this.value); document.getElementById('fontSizeValue').textContent = this.value + '%'">
        </div>

        <!-- アクセントカラー -->
        <div class="setting-group">
          <label class="setting-label">アクセントカラー</label>
          <input type="color" 
                 value="${this.settings.customColors.accent}"
                 class="color-picker"
                 onchange="themeManager.setAccentColor(this.value)">
        </div>

        <!-- プリセット -->
        <div class="setting-group">
          <label class="setting-label">プリセットテーマ</label>
          <div class="preset-buttons">
            <button class="preset-btn" onclick="themeManager.applyPreset('default')">デフォルト</button>
            <button class="preset-btn" onclick="themeManager.applyPreset('ocean')">オーシャン</button>
            <button class="preset-btn" onclick="themeManager.applyPreset('crimson')">クリムゾン</button>
            <button class="preset-btn" onclick="themeManager.applyPreset('midnight')">ミッドナイト</button>
            <button class="preset-btn" onclick="themeManager.applyPreset('terminal')">ターミナル</button>
          </div>
        </div>

        <!-- アニメーション -->
        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" 
                   ${this.settings.animations ? 'checked' : ''}
                   onchange="themeManager.toggleAnimations()">
            <span>アニメーションを有効にする</span>
          </label>
        </div>

        <!-- リセット -->
        <div class="setting-group">
          <button class="btn-secondary" onclick="themeManager.resetToDefault()">
            設定をリセット
          </button>
        </div>
      </div>
    `;
  }

  // デフォルトにリセット
  resetToDefault() {
    if (confirm('テーマ設定をデフォルトに戻しますか？')) {
      localStorage.removeItem(this.storageKey);
      this.settings = this.loadSettings();
      this.applyTheme();
      this.createSettingsUI();
    }
  }

  // エクスポート
  exportSettings() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arg_theme_settings.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // インポート
  importSettings(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        this.settings = imported;
        this.saveSettings();
        this.createSettingsUI();
        alert('テーマ設定をインポートしました。');
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  }
}

// グローバルインスタンス
let themeManager;

// 初期化
export function initThemeManager() {
  themeManager = new ThemeManager();
  
  // グローバルに公開
  window.themeManager = themeManager;
  
  return themeManager;
}

// エクスポート
export { ThemeManager };
export default initThemeManager;
