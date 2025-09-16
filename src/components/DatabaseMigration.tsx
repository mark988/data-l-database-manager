import React, { useState } from 'react';
import { DatabaseConnection, MigrationTask, MigrationLog } from '../types';
import { 
  Database, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface DatabaseMigrationProps {
  connections: DatabaseConnection[];
}

const DatabaseMigration: React.FC<DatabaseMigrationProps> = ({ connections }) => {
  const [migrationTasks, setMigrationTasks] = useState<MigrationTask[]>([
    {
      id: '1',
      name: 'MySQL到PostgreSQL迁移',
      sourceConnection: connections.find(c => c.type === 'mysql') || connections[0],
      targetConnection: connections.find(c => c.type === 'postgresql') || connections[1],
      tables: ['users', 'orders', 'products'],
      status: 'completed',
      progress: 100,
      createdAt: new Date('2024-01-10'),
      completedAt: new Date('2024-01-10'),
      logs: [
        {
          id: '1',
          timestamp: new Date('2024-01-10T10:00:00'),
          level: 'info',
          message: '开始迁移任务',
          details: { tablesCount: 3 }
        },
        {
          id: '2',
          timestamp: new Date('2024-01-10T10:15:00'),
          level: 'info',
          message: '迁移表 users 完成',
          details: { rowsCount: 1250, duration: '15秒' }
        },
        {
          id: '3',
          timestamp: new Date('2024-01-10T10:30:00'),
          level: 'info',
          message: '迁移完成',
          details: { totalRows: 5526, totalDuration: '30分钟' }
        }
      ]
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MigrationTask | null>(null);
  const [sourceConnection, setSourceConnection] = useState<DatabaseConnection | null>(null);
  const [targetConnection, setTargetConnection] = useState<DatabaseConnection | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [migrationConfig, setMigrationConfig] = useState({
    batchSize: 1000,
    skipExisting: false,
    validateData: true,
    createIndexes: true,
    syncMode: 'one-time' as 'one-time' | 'scheduled'
  });

  // Mock available tables from source connection
  const availableTables = [
    'users', 'orders', 'products', 'categories', 'order_items', 
    'payments', 'shipping_addresses', 'reviews', 'coupons', 'inventory'
  ];

  const handleCreateMigration = () => {
    if (!sourceConnection || !targetConnection || selectedTables.length === 0) return;

    const newTask: MigrationTask = {
      id: Date.now().toString(),
      name: `${sourceConnection.name} → ${targetConnection.name}`,
      sourceConnection,
      targetConnection,
      tables: selectedTables,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      logs: []
    };

    setMigrationTasks([...migrationTasks, newTask]);
    setShowCreateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSourceConnection(null);
    setTargetConnection(null);
    setSelectedTables([]);
  };

  const handleStartMigration = (taskId: string) => {
    setMigrationTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'running' as const, progress: 0 }
          : task
      )
    );

    // Simulate migration progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setMigrationTasks(tasks => 
          tasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  status: 'completed' as const, 
                  progress: 100,
                  completedAt: new Date()
                }
              : task
          )
        );
      } else {
        setMigrationTasks(tasks => 
          tasks.map(task => 
            task.id === taskId 
              ? { ...task, progress: Math.round(progress) }
              : task
          )
        );
      }
    }, 500);
  };

  const handlePauseMigration = (taskId: string) => {
    setMigrationTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'pending' as const }
          : task
      )
    );
  };

  const getStatusIcon = (status: MigrationTask['status']) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'running': return <Play className="text-blue-500" size={16} />;
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'failed': return <XCircle className="text-red-500" size={16} />;
    }
  };

  const getStatusText = (status: MigrationTask['status']) => {
    switch (status) {
      case 'pending': return '待执行';
      case 'running': return '执行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              数据库迁移 & 同步
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              跨数据库数据迁移和同步管理
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Database size={16} />
            <span>创建迁移任务</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Task List */}
        <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">迁移任务</h2>
          </div>
          
          <div className="overflow-y-auto">
            {migrationTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Database size={48} className="mx-auto mb-4" />
                <p>暂无迁移任务</p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  创建第一个迁移任务
                </button>
              </div>
            ) : (
              migrationTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedTask?.id === task.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{task.sourceConnection.name}</span>
                        <ArrowRight size={12} className="mx-2" />
                        <span>{task.targetConnection.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span className="text-xs text-gray-500">{getStatusText(task.status)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{task.tables.length} 个表</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'failed' ? 'bg-red-500' :
                          task.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartMigration(task.id);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                      >
                        <Play size={12} />
                        <span>开始</span>
                      </button>
                    )}
                    
                    {task.status === 'running' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseMigration(task.id);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded"
                      >
                        <Pause size={12} />
                        <span>暂停</span>
                      </button>
                    )}

                    {task.status === 'failed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartMigration(task.id);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded"
                      >
                        <RotateCcw size={12} />
                        <span>重试</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Details */}
        <div className="w-1/2 bg-white dark:bg-gray-800">
          {selectedTask ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  任务详情
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {/* Basic Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">基本信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">任务名称:</span>
                      <span className="text-gray-900 dark:text-white">{selectedTask.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">源数据库:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedTask.sourceConnection.name} ({selectedTask.sourceConnection.type})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">目标数据库:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedTask.targetConnection.name} ({selectedTask.targetConnection.type})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">创建时间:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedTask.createdAt.toLocaleString()}
                      </span>
                    </div>
                    {selectedTask.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">完成时间:</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedTask.completedAt.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tables */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    迁移表 ({selectedTask.tables.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tables.map(table => (
                      <span
                        key={table}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {table}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Logs */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    执行日志
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedTask.logs.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">暂无日志</p>
                    ) : (
                      selectedTask.logs.map(log => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              {log.level === 'error' && <AlertTriangle size={14} className="text-red-500" />}
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                log.level === 'error' ? 'bg-red-100 text-red-800' :
                                log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {log.level.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {log.message}
                          </p>
                          {log.details && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <pre>{JSON.stringify(log.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Database size={48} className="mx-auto mb-4" />
                <p>选择一个迁移任务查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Migration Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                创建迁移任务
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Source Connection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  源数据库
                </label>
                <select
                  value={sourceConnection?.id || ''}
                  onChange={(e) => {
                    const conn = connections.find(c => c.id === e.target.value);
                    setSourceConnection(conn || null);
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">选择源数据库...</option>
                  {connections.filter(c => c.isConnected).map(connection => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name} ({connection.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Connection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  目标数据库
                </label>
                <select
                  value={targetConnection?.id || ''}
                  onChange={(e) => {
                    const conn = connections.find(c => c.id === e.target.value);
                    setTargetConnection(conn || null);
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">选择目标数据库...</option>
                  {connections.filter(c => c.isConnected && c.id !== sourceConnection?.id).map(connection => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name} ({connection.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Table Selection */}
              {sourceConnection && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    选择要迁移的表
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedTables.length === availableTables.length}
                        onChange={(e) => {
                          setSelectedTables(e.target.checked ? availableTables : []);
                        }}
                        className="rounded border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        全选
                      </label>
                    </div>
                    {availableTables.map(table => (
                      <div key={table} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(table)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTables([...selectedTables, table]);
                            } else {
                              setSelectedTables(selectedTables.filter(t => t !== table));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label className="ml-2 text-sm text-gray-900 dark:text-white">
                          {table}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Migration Config */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  迁移配置
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      批处理大小
                    </label>
                    <input
                      type="number"
                      value={migrationConfig.batchSize}
                      onChange={(e) => setMigrationConfig({
                        ...migrationConfig,
                        batchSize: parseInt(e.target.value) || 1000
                      })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={migrationConfig.skipExisting}
                        onChange={(e) => setMigrationConfig({
                          ...migrationConfig,
                          skipExisting: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        跳过已存在的数据
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={migrationConfig.validateData}
                        onChange={(e) => setMigrationConfig({
                          ...migrationConfig,
                          validateData: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        数据校验
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={migrationConfig.createIndexes}
                        onChange={(e) => setMigrationConfig({
                          ...migrationConfig,
                          createIndexes: e.target.checked
                        })}
                        className="rounded border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        创建索引
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleCreateMigration}
                disabled={!sourceConnection || !targetConnection || selectedTables.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseMigration;