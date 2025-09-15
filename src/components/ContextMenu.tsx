import React from 'react';
import { Play, Edit3, Copy, Trash2, Download, Upload, RefreshCw, Table, Eye, Settings } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'table' | 'database' | 'connection';
  onClose: () => void;
  onAction: (action: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  onClose,
  onAction
}) => {
  const menuItems = {
    table: [
      { icon: <Eye className="w-4 h-4" />, label: '查看数据', action: 'view-data' },
      { icon: <Edit3 className="w-4 h-4" />, label: '修改表', action: 'modify-table' },
      { icon: <Trash2 className="w-4 h-4" />, label: '删除表', action: 'delete-table', danger: true },
      { icon: <Trash2 className="w-4 h-4" />, label: '清空数据', action: 'truncate-table', danger: true },
      { icon: <Copy className="w-4 h-4" />, label: '复制表名', action: 'copy-name' },
      { icon: <Download className="w-4 h-4" />, label: '导出数据', action: 'export-data' },
      { icon: <Upload className="w-4 h-4" />, label: '导入数据', action: 'import-data' },
      { icon: <RefreshCw className="w-4 h-4" />, label: '刷新', action: 'refresh' },
    ],
    database: [
      { icon: <Table className="w-4 h-4" />, label: '新建表', action: 'create-table' },
      { icon: <Download className="w-4 h-4" />, label: '备份数据库', action: 'backup-database' },
      { icon: <Upload className="w-4 h-4" />, label: '恢复数据库', action: 'restore-database' },
      { icon: <RefreshCw className="w-4 h-4" />, label: '刷新', action: 'refresh' },
      { icon: <Settings className="w-4 h-4" />, label: '数据库设置', action: 'database-settings' },
    ],
    connection: [
      { icon: <Play className="w-4 h-4" />, label: '连接/断开', action: 'toggle-connection' },
      { icon: <Edit3 className="w-4 h-4" />, label: '编辑连接', action: 'edit-connection' },
      { icon: <Copy className="w-4 h-4" />, label: '复制连接', action: 'copy-connection' },
      { icon: <RefreshCw className="w-4 h-4" />, label: '刷新', action: 'refresh' },
      { icon: <Trash2 className="w-4 h-4" />, label: '删除连接', action: 'delete-connection', danger: true },
    ]
  };

  return (
    <div
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 min-w-48"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={onClose}
    >
      {menuItems[type].map((item, index) => (
        <button
          key={index}
          onClick={() => {
            onAction(item.action);
            onClose();
          }}
          className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
            item.danger ? 'text-red-400 hover:text-red-300' : 'text-white'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};