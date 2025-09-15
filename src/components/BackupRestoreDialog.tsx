import React, { useState, useEffect } from 'react';
import { X, Database, Download, Upload, HardDrive, Clock, CheckCircle, AlertCircle, Loader2, FileText, Calendar } from 'lucide-react';
import { DatabaseConnection } from '../types';

interface BackupRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connections: DatabaseConnection[];
  mode: 'backup' | 'restore';
}

interface BackupFile {
  id: string;
  name: string;
  database: string;
  connection: string;
  size: string;
  createdAt: Date;
  path: string;
}

export const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({
  isOpen,
  onClose,
  connections,
  mode
}) => {
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [backupName, setBackupName] = useState<string>('');
  const [backupPath, setBackupPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [backupOptions, setBackupOptions] = useState({
    includeData: true,
    includeSchema: true,
    includeIndexes: true,
    includeTriggers: true,
    includeViews: true,
    includeProcedures: true,
    compression: true
  });

  // 模拟的备份文件列表
  const [backupFiles] = useState<BackupFile[]>([
    {
      id: '1',
      name: 'test_db_backup_20241201',
      database: 'test_db',
      connection: '本地MySQL',
      size: '15.2 MB',
      createdAt: new Date('2024-12-01 10:30:00'),
      path: '/backups/test_db_backup_20241201.sql'
    },
    {
      id: '2',
      name: 'production_backup_20241130',
      database: 'production',
      connection: '生产PostgreSQL',
      size: '128.5 MB',
      createdAt: new Date('2024-11-30 02:00:00'),
      path: '/backups/production_backup_20241130.sql'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      // 重置状态
      setSelectedConnection('');
      setSelectedDatabase('');
      setBackupName('');
      setBackupPath('');
      setSelectedFile(null);
      setSelectedBackup('');
      setIsProcessing(false);
      setProgress(0);
      setStatus('idle');
      setErrorMessage('');
      
      // 设置默认备份名称
      if (mode === 'backup') {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
        setBackupName(`backup_${timestamp}`);
      }
    }
  }, [isOpen, mode]);

  const connectedConnections = connections.filter(c => c.isConnected);

  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnection(connectionId);
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      setSelectedDatabase(connection.database);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const validateForm = () => {
    if (!selectedConnection) {
      setErrorMessage('请选择数据库连接');
      return false;
    }

    if (mode === 'backup') {
      if (!backupName.trim()) {
        setErrorMessage('请输入备份名称');
        return false;
      }
    } else {
      if (!selectedFile && !selectedBackup) {
        setErrorMessage('请选择要恢复的备份文件');
        return false;
      }
    }

    return true;
  };

  const simulateProcess = async () => {
    const steps = mode === 'backup' 
      ? [
          { label: '连接数据库...', duration: 500 },
          { label: '分析数据库结构...', duration: 800 },
          { label: '导出数据...', duration: 2000 },
          { label: '压缩备份文件...', duration: 600 },
          { label: '保存备份文件...', duration: 400 }
        ]
      : [
          { label: '验证备份文件...', duration: 600 },
          { label: '连接目标数据库...', duration: 500 },
          { label: '清理现有数据...', duration: 800 },
          { label: '恢复数据结构...', duration: 1200 },
          { label: '恢复数据...', duration: 1500 },
          { label: '重建索引...', duration: 700 }
        ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      // 模拟可能的错误（5% 概率）
      if (Math.random() < 0.05) {
        throw new Error(`${step.label}失败`);
      }

      setProgress(((i + 1) / steps.length) * 100);
    }
  };

  const handleProcess = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    try {
      await simulateProcess();
      setStatus('success');
      
      // 显示成功通知
      const event = new CustomEvent('show-toast', {
        detail: { 
          message: mode === 'backup' ? '数据库备份成功' : '数据库恢复成功', 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);

      // 自动关闭对话框
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : `${mode === 'backup' ? '备份' : '恢复'}失败`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return mode === 'backup' ? <Download className="w-6 h-6 text-blue-500" /> : <Upload className="w-6 h-6 text-green-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">
              {mode === 'backup' ? '数据库备份' : '数据库恢复'}
            </h3>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 连接选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              选择数据库连接 *
            </label>
            <select
              value={selectedConnection}
              onChange={(e) => handleConnectionChange(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择连接</option>
              {connectedConnections.map(connection => (
                <option key={connection.id} value={connection.id}>
                  {connection.name} ({connection.host}:{connection.port})
                </option>
              ))}
            </select>
            {connectedConnections.length === 0 && (
              <p className="mt-1 text-sm text-yellow-400">
                没有可用的连接，请先连接到数据库
              </p>
            )}
          </div>

          {/* 数据库名称 */}
          {selectedConnection && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                数据库名称
              </label>
              <input
                type="text"
                value={selectedDatabase}
                onChange={(e) => setSelectedDatabase(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入数据库名称"
              />
            </div>
          )}

          {mode === 'backup' ? (
            <>
              {/* 备份名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  备份名称 *
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入备份名称"
                />
              </div>

              {/* 备份选项 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  备份选项
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries({
                    includeData: '包含数据',
                    includeSchema: '包含结构',
                    includeIndexes: '包含索引',
                    includeTriggers: '包含触发器',
                    includeViews: '包含视图',
                    includeProcedures: '包含存储过程',
                    compression: '压缩备份'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={backupOptions[key as keyof typeof backupOptions]}
                        onChange={(e) => setBackupOptions(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        disabled={isProcessing}
                        className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-300 text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 恢复选项 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  选择恢复方式
                </label>
                <div className="space-y-3">
                  {/* 从文件恢复 */}
                  <div className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">从文件恢复</span>
                    </div>
                    <input
                      type="file"
                      accept=".sql,.dump,.bak"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                      className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-400">
                        已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  {/* 从历史备份恢复 */}
                  <div className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <HardDrive className="w-4 h-4 text-green-400" />
                      <span className="text-white font-medium">从历史备份恢复</span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {backupFiles.map(backup => (
                        <label key={backup.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
                          <input
                            type="radio"
                            name="backup"
                            value={backup.id}
                            checked={selectedBackup === backup.id}
                            onChange={(e) => setSelectedBackup(e.target.value)}
                            disabled={isProcessing}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{backup.name}</div>
                            <div className="text-gray-400 text-xs">
                              {backup.database} • {backup.connection} • {backup.size}
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>{backup.createdAt.toLocaleString()}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 进度显示 */}
          {isProcessing && (
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {getStatusIcon()}
                <span className="text-white font-medium">
                  {mode === 'backup' ? '正在备份数据库...' : '正在恢复数据库...'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right text-sm text-gray-400 mt-1">
                {Math.round(progress)}%
              </div>
            </div>
          )}

          {/* 状态消息 */}
          {status === 'success' && (
            <div className="flex items-center space-x-3 p-4 bg-green-900 border border-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-green-300 font-medium">
                  {mode === 'backup' ? '备份成功!' : '恢复成功!'}
                </div>
                <div className="text-green-400 text-sm">
                  {mode === 'backup' 
                    ? '数据库已成功备份到指定位置' 
                    : '数据库已成功从备份文件恢复'
                  }
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center space-x-3 p-4 bg-red-900 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-red-300 font-medium">
                  {mode === 'backup' ? '备份失败' : '恢复失败'}
                </div>
                <div className="text-red-400 text-sm">
                  {errorMessage}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
          {!isProcessing && status !== 'success' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleProcess}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {mode === 'backup' ? <Download className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                <span>{mode === 'backup' ? '开始备份' : '开始恢复'}</span>
              </button>
            </>
          )}
          
          {status === 'error' && (
            <button
              onClick={handleProcess}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>重试</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};