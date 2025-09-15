import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table, Eye, Zap, Users, FolderOpen, MoreVertical } from 'lucide-react';
import { DatabaseObject } from '../types';

interface DatabaseExplorerProps {
  connectionId: string;
  objects: DatabaseObject[];
  onSelectObject: (object: DatabaseObject) => void;
  onRefresh: () => void;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  connectionId,
  objects,
  onSelectObject,
  onRefresh
}) => {
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedObjects(newExpanded);
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4 text-blue-400" />;
      case 'table': return <Table className="w-4 h-4 text-green-400" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'procedure': return <Zap className="w-4 h-4 text-orange-400" />;
      case 'function': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <FolderOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderObject = (obj: DatabaseObject, path: string, level: number) => {
    const isExpanded = expandedObjects.has(path);
    const hasChildren = obj.children && obj.children.length > 0;
    const isSelected = selectedObject === path;

    return (
      <div key={path} className="select-none">
        <div
          className={`flex items-center space-x-2 py-2 px-3 cursor-pointer hover:bg-gray-800 transition-colors ${
            isSelected ? 'bg-gray-700' : ''
          }`}
          style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}
          onClick={() => {
            setSelectedObject(path);
            onSelectObject(obj);
            if (hasChildren) {
              toggleExpanded(path);
            }
          }}
        >
          <div className="flex items-center space-x-1 flex-1">
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleExpanded(path); }}>
                {isExpanded ? 
                  <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                }
              </button>
            ) : (
              <div className="w-4" />
            )}
            
            {getObjectIcon(obj.type)}
            
            <span className="text-white text-sm">{obj.name}</span>
            
            {obj.rowCount && (
              <span className="text-xs text-gray-500">({obj.rowCount.toLocaleString()})</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Show context menu
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
          >
            <MoreVertical className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        {hasChildren && isExpanded && obj.children && (
          <div>
            {obj.children.map((child, index) => 
              renderObject(child, `${path}.${child.name}`, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">数据库结构</h2>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {objects.length > 0 ? (
          <div className="py-2">
            {objects.map((obj, index) => 
              renderObject(obj, obj.name, 0)
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Database className="w-12 h-12 mb-3" />
            <p className="text-sm">请先连接数据库</p>
          </div>
        )}
      </div>
    </div>
  );
};