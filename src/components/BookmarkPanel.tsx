import React, { useState } from 'react';
import { BookOpen, Plus, Search, Tag, Clock, Play, Edit3, Trash2 } from 'lucide-react';
import { BookmarkedQuery } from '../types';

interface BookmarkPanelProps {
  bookmarks: BookmarkedQuery[];
  onExecuteBookmark: (bookmark: BookmarkedQuery) => void;
  onEditBookmark: (bookmark: BookmarkedQuery) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onCreateBookmark: () => void;
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  bookmarks,
  onExecuteBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onCreateBookmark
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.sql.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || bookmark.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">SQL书签</h2>
          <button
            onClick={onCreateBookmark}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索书签..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedTag === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedTag === tag 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{bookmark.name}</h3>
                  {bookmark.description && (
                    <p className="text-sm text-gray-400 mb-2">{bookmark.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onExecuteBookmark(bookmark)}
                    className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    title="执行查询"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditBookmark(bookmark)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="编辑书签"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(bookmark.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="删除书签"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-2 mb-3">
                <pre className="text-xs text-gray-300 overflow-hidden">
                  {bookmark.sql.length > 100 
                    ? `${bookmark.sql.substring(0, 100)}...` 
                    : bookmark.sql
                  }
                </pre>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {bookmark.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{bookmark.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredBookmarks.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">
                {searchQuery || selectedTag ? '没有匹配的书签' : '暂无SQL书签'}
              </p>
              <button
                onClick={onCreateBookmark}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                添加第一个书签
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};