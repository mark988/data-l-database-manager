import React, { useState, useEffect } from 'react';
import { X, BookOpen, Tag, FileText } from 'lucide-react';
import { BookmarkedQuery } from '../types';

interface BookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<BookmarkedQuery, 'id' | 'createdAt'>) => void;
  editingBookmark?: BookmarkedQuery | null;
  currentSQL?: string;
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBookmark,
  currentSQL = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sql: '',
    description: '',
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单数据
  useEffect(() => {
    if (isOpen) {
      if (editingBookmark) {
        setFormData({
          name: editingBookmark.name,
          sql: editingBookmark.sql,
          description: editingBookmark.description || '',
          tags: [...editingBookmark.tags]
        });
      } else {
        setFormData({
          name: '',
          sql: currentSQL,
          description: '',
          tags: []
        });
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, editingBookmark, currentSQL]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '书签名称不能为空';
    }

    if (!formData.sql.trim()) {
      newErrors.sql = 'SQL语句不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      name: formData.name.trim(),
      sql: formData.sql.trim(),
      description: formData.description.trim() || undefined,
      tags: formData.tags
    });

    onClose();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">
              {editingBookmark ? '编辑书签' : '添加书签'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 书签名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              书签名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="输入书签名称"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* SQL语句 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SQL语句 *
            </label>
            <textarea
              value={formData.sql}
              onChange={(e) => setFormData(prev => ({ ...prev, sql: e.target.value }))}
              rows={8}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.sql ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="输入SQL语句"
            />
            {errors.sql && (
              <p className="mt-1 text-sm text-red-400">{errors.sql}</p>
            )}
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入书签描述（可选）"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              标签
            </label>
            
            {/* 已添加的标签 */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-200 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 添加标签输入框 */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入标签名称"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              按回车键或点击添加按钮来添加标签
            </p>
          </div>

          {/* 预设标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              常用标签
            </label>
            <div className="flex flex-wrap gap-2">
              {['查询', '统计', '报表', '用户', '订单', '产品', '常用', '测试'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (!formData.tags.includes(tag)) {
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, tag]
                      }));
                    }
                  }}
                  disabled={formData.tags.includes(tag)}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {editingBookmark ? '更新书签' : '保存书签'}
          </button>
        </div>
      </div>
    </div>
  );
};