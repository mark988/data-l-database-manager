import React from 'react';
import { Plus, Database, Edit3, Trash2, Power, Key, Shield, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DatabaseConnection } from '../types';

interface ConnectionManagerProps {
  connections: DatabaseConnection[];
  onAddConnection: () => void;
  onEditConnection: (connection: DatabaseConnection) => void;
  onDeleteConnection: (connectionId: string) => void;
  onConnect: (connectionId: string) => void;
  onDisconnect: (connectionId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  connections,
  onAddConnection,
  onEditConnection,
  onDeleteConnection,
  onConnect,
  onDisconnect,
  isCollapsed,
  onToggleCollapse
}) => {

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'mysql': return '🐬';
      case 'postgresql': return '🐘';
      case 'sqlserver': return '🏢';
      case 'sqlite': return '💿';
      default: return '🗃️';
    }
  };

  const handleConnect = (connection: DatabaseConnection) => {
    if (connection.isConnected) {
      onDisconnect(connection.id);
    } else {
      onConnect(connection.id);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
        <button
          onClick={onAddConnection}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mb-4"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
        <div className="space-y-4">
          {connections.map(connection => (
            <div key={connection.id} className="relative group">
              <span className="text-2xl cursor-pointer" onClick={() => handleConnect(connection)}>{getConnectionIcon(connection.type)}</span>
              {connection.isConnected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>}
              <div className="absolute left-full ml-2 w-48 bg-gray-800 text-white text-sm rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {connection.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">连接管理</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddConnection}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getConnectionIcon(connection.type)}</span>
                  <div>
                    <h3 className="text-white font-medium">{connection.name}</h3>
                    <p className="text-sm text-gray-400">{connection.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditConnection(connection)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteConnection(connection.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                <p>{connection.host}:{connection.port}</p>
                <p>{connection.database}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {connection.ssl && (
                    <Shield className="w-3 h-3 text-green-400" title="SSL启用" />
                  )}
                  {connection.sshTunnel && (
                    <Key className="w-3 h-3 text-orange-400" title="SSH隧道" />
                  )}
                </div>
                
                <button
                  onClick={() => handleConnect(connection)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    connection.isConnected
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{connection.isConnected ? '断开' : '连接'}</span>
                </button>
              </div>

              {connection.isConnected && (
                <div className="mt-2 text-xs text-green-400">
                  ✓ 已连接 {connection.lastConnected && 
                    `(${connection.lastConnected.toLocaleTimeString()})`
                  }
                </div>
              )}
            </div>
          ))}

          {connections.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">暂无数据库连接</p>
              <button
                onClick={onAddConnection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                添加第一个连接
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};