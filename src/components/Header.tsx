import React, { useState } from 'react';
import { Search, Sun, Moon, Settings, BookOpen, Database, Save, Play, Square, Download, Upload, Workflow, RefreshCw, FileText, Activity } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onGlobalSearch: (query: string) => void;
  onExecuteSQL: () => void;
  onStopExecution: () => void;
  isExecuting: boolean;
  onShowSettings: () => void;
  onSaveCurrentTab: () => void;
  onCreateBookmark: () => void;
  onShowBackup: () => void;
  onShowRestore: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onGlobalSearch,
  onExecuteSQL,
  onStopExecution,
  isExecuting,
  onShowSettings,
  onSaveCurrentTab,
  onCreateBookmark,
  onShowBackup,
  onShowRestore,
  activeModule,
  onModuleChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const modules = [
    { key: 'sql-editor', label: 'SQL编辑器', icon: Database },
    { key: 'er-model', label: 'ER模型', icon: Workflow },
    { key: 'migration', label: '数据迁移', icon: RefreshCw },
    { key: 'templates', label: 'SQL模板', icon: FileText },
    { key: 'monitor', label: '性能监控', icon: Activity },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onGlobalSearch(searchQuery);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Database className="text-blue-500 w-8 h-8" />
            <h1 className="text-xl font-bold text-white">DATA-L</h1>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">v2.0</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索表、字段、SQL..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={onExecuteSQL}
              disabled={isExecuting}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all ${
                isExecuting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>执行</span>
            </button>
            
            {isExecuting && (
              <button
                onClick={onStopExecution}
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>停止</span>
              </button>
            )}
          </div>

          <div className="w-px h-6 bg-gray-700"></div>

          <button 
            onClick={onCreateBookmark}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="添加书签"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button 
            onClick={onSaveCurrentTab}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="保存当前查询"
          >
            <Save className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button 
            onClick={onShowBackup}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="数据库备份"
          >
            <Download className="w-5 h-5" />
          </button>

          <button 
            onClick={onShowRestore}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="数据库恢复"
          >
            <Upload className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={onShowSettings}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-gray-700">
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isActive = activeModule === module.key;
          
          return (
            <button
              key={module.key}
              onClick={() => onModuleChange(module.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <IconComponent size={16} />
              <span>{module.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};