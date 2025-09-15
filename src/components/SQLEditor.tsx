import React, { useState, useRef } from 'react';
import { Plus, X, Save, FileText, Settings } from 'lucide-react';
import { SQLTab } from '../types';

interface SQLEditorProps {
  tabs: SQLTab[];
  activeTabId: string;
  onCreateTab: () => void;
  onCloseTab: (tabId: string) => void;
  onSwitchTab: (tabId: string) => void;
  onUpdateTab: (tabId: string, content: string) => void;
  onSaveTab: (tabId: string) => void;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  tabs,
  activeTabId,
  onCreateTab,
  onCloseTab,
  onSwitchTab,
  onUpdateTab,
  onSaveTab
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      if (activeTab) {
        onUpdateTab(activeTab.id, newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  const formatSQL = () => {
    if (activeTab) {
      // Simple SQL formatting
      const formatted = activeTab.content
        .replace(/\b(SELECT|FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|GROUP BY|ORDER BY|HAVING)\b/gi, '\n$1')
        .replace(/,/g, ',\n  ')
        .replace(/\n\s+\n/g, '\n')
        .trim();
      onUpdateTab(activeTab.id, formatted);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-900 border-b border-gray-700">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-3 border-r border-gray-700 cursor-pointer transition-colors ${
                tab.id === activeTabId
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => onSwitchTab(tab.id)}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">
                {tab.title}
                {tab.isUnsaved && <span className="text-orange-400 ml-1">*</span>}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={onCreateTab}
          className="p-3 text-gray-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      {activeTab ? (
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSaveTab(activeTab.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                <Save className="w-3 h-3" />
                <span>保存</span>
              </button>
              
              <button
                onClick={formatSQL}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                格式化 (Ctrl+Shift+F)
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>行 1, 列 1</span>
              <span>•</span>
              <span>UTF-8</span>
              <span>•</span>
              <span>SQL</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={activeTab.content}
              onChange={(e) => onUpdateTab(activeTab.id, e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-gray-800 text-white font-mono text-sm p-4 resize-none outline-none border-none"
              placeholder="-- 输入你的SQL查询
-- 支持语法高亮和智能补全
SELECT * FROM users WHERE id = 1;"
              spellCheck={false}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="mb-4">没有打开的查询标签页</p>
            <button
              onClick={onCreateTab}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              新建查询
            </button>
          </div>
        </div>
      )}
    </div>
  );
};