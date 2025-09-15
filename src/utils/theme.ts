export type ThemeMode = 'light' | 'dark' | 'auto';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeMode = 'auto';
  private isDarkMode: boolean = false;
  private listeners: ((isDark: boolean) => void)[] = [];

  private constructor() {
    this.init();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private init() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('dataL-theme-mode') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }

    // Set initial theme
    this.updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'auto') {
        this.updateTheme();
      }
    });
  }

  private updateTheme() {
    let isDark: boolean;

    switch (this.currentTheme) {
      case 'light':
        isDark = false;
        break;
      case 'dark':
        isDark = true;
        break;
      case 'auto':
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        break;
    }

    this.isDarkMode = isDark;
    this.applyTheme(isDark);
    this.notifyListeners(isDark);
  }

  private applyTheme(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#111827' : '#ffffff');
    }
  }

  private notifyListeners(isDark: boolean) {
    this.listeners.forEach(listener => listener(isDark));
  }

  setTheme(theme: ThemeMode) {
    this.currentTheme = theme;
    localStorage.setItem('dataL-theme-mode', theme);
    this.updateTheme();

    // Show notification
    const messages = {
      light: '已切换到浅色模式',
      dark: '已切换到深色模式',
      auto: '已切换到自动模式'
    };

    const event = new CustomEvent('show-toast', {
      detail: { 
        message: messages[theme], 
        type: 'info' 
      }
    });
    window.dispatchEvent(event);
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  isDark(): boolean {
    return this.isDarkMode;
  }

  subscribe(listener: (isDark: boolean) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get theme-aware colors
  getColors() {
    return {
      background: this.isDarkMode ? '#111827' : '#ffffff',
      surface: this.isDarkMode ? '#1f2937' : '#f9fafb',
      primary: '#3b82f6',
      text: this.isDarkMode ? '#f9fafb' : '#111827',
      textSecondary: this.isDarkMode ? '#9ca3af' : '#6b7280',
      border: this.isDarkMode ? '#374151' : '#e5e7eb',
    };
  }

  // Export theme settings
  exportSettings() {
    return {
      theme: this.currentTheme,
      isDarkMode: this.isDarkMode,
      colors: this.getColors()
    };
  }

  // Import theme settings
  importSettings(settings: { theme?: ThemeMode }) {
    if (settings.theme) {
      this.setTheme(settings.theme);
    }
  }
}