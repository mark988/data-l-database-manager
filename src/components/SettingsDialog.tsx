import React, { useState, useEffect } from 'react';
import { X, Settings, Monitor, Sun, Moon, Database, Code, Save, RotateCcw } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface SettingsData {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  tabSize: number;
  autoSave: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  queryTimeout: number;
  maxRows: number;
  autoComplete: boolean;
  syntaxHighlight: boolean;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme
}) => {
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    showLineNumbers: true,
    wordWrap: true,
    queryTimeout: 30,
    maxRows: 1000,
    autoComplete: true,
    syntaxHighlight: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载设置
    const savedSettings = localStorage.getItem('dataL-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('dataL-settings', JSON.stringify(settings));
      setHasChanges(false);
      
      // 应用主题设置
      if (settings.theme === 'light' && isDarkMode) {
        onToggleTheme();
      } else if (settings.theme === 'dark' && !isDarkMode) {
        onToggleTheme();
      }

      // 显示保存成功提示
      const event = new CustomEvent('show-toast', {
        detail: { message: '设置已保存', type: 'success' }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('Failed to save settings:', error);
      const event = new CustomEvent('show-toast', {
        detail: { message: '保存设置失败', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const handleReset = () => {
    const defaultSettings: SettingsData = {
      theme: 'dark',
      fontSize: 14,
      tabSize: 2,
      autoSave: true,
      showLineNumbers: true,
      wordWrap: true,
      queryTimeout: 30,
      maxRows: 1000,
      autoComplete: true,
      syntaxHighlight: true
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">设置</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 外观设置 */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>外观</span>
            </h4>
            
            <div className="space-y-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  主题
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'light', label: '浅色', icon: Sun },
                    { value: 'dark', label: '深色', icon: Moon },
                    { value: 'auto', label: '自动', icon: Monitor }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSettingChange('theme', value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        settings.theme === value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  字体大小: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* 编辑器设置 */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>编辑器</span>
            </h4>
            
            <div className="space-y-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  制表符大小: {settings.tabSize} 个空格
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={settings.tabSize}
                  onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">自动保存</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showLineNumbers}
                    onChange={(e) => handleSettingChange('showLineNumbers', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">显示行号</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.wordWrap}
                    onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">自动换行</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoComplete}
                    onChange={(e) => handleSettingChange('autoComplete', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">自动完成</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.syntaxHighlight}
                    onChange={(e) => handleSettingChange('syntaxHighlight', e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">语法高亮</span>
                </label>
              </div>
            </div>
          </div>

          {/* 查询设置 */}
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>查询</span>
            </h4>
            
            <div className="space-y-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  查询超时时间: {settings.queryTimeout} 秒
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={settings.queryTimeout}
                  onChange={(e) => handleSettingChange('queryTimeout', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  最大显示行数: {settings.maxRows.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={settings.maxRows}
                  onChange={(e) => handleSettingChange('maxRows', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重置默认</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>保存设置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};