import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle, AlertCircle, FileText, FileSpreadsheet, Code } from 'lucide-react';

interface ExportProgressProps {
  isOpen: boolean;
  format: 'csv' | 'excel' | 'json' | null;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
  isOpen,
  format,
  onClose,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'preparing' | 'exporting' | 'success' | 'error'>('preparing');
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && format) {
      startExport();
    }
  }, [isOpen, format]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'success' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (status === 'success' && countdown === 0) {
      onClose();
    }
    return () => clearTimeout(timer);
  }, [status, countdown, onClose]);

  const startExport = async () => {
    setProgress(0);
    setStatus('preparing');
    setCountdown(5);
    setErrorMessage('');

    try {
      // 模拟导出过程
      const steps = [
        { label: '准备数据...', duration: 500 },
        { label: '格式化数据...', duration: 800 },
        { label: '生成文件...', duration: 1200 },
        { label: '压缩文件...', duration: 600 },
        { label: '完成导出...', duration: 400 }
      ];

      setStatus('exporting');

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        // 模拟可能的错误（5% 概率）
        if (Math.random() < 0.05) {
          throw new Error(`导出失败: ${step.label}`);
        }

        setProgress(((i + 1) / steps.length) * 100);
      }

      setStatus('success');
      onComplete(true);

      // 模拟文件下载
      downloadFile();

    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '导出失败');
      onComplete(false);
    }
  };

  const downloadFile = () => {
    // 创建模拟文件内容
    let content = '';
    let mimeType = '';
    let filename = '';

    switch (format) {
      case 'csv':
        content = 'id,name,email,status\n1,Alice Wilson,alice@example.com,active\n2,Charlie Brown,charlie@example.com,inactive';
        mimeType = 'text/csv';
        filename = 'query_results.csv';
        break;
      case 'excel':
        content = 'id,name,email,status\n1,Alice Wilson,alice@example.com,active\n2,Charlie Brown,charlie@example.com,inactive';
        mimeType = 'application/vnd.ms-excel';
        filename = 'query_results.xlsx';
        break;
      case 'json':
        content = JSON.stringify([
          { id: 1, name: 'Alice Wilson', email: 'alice@example.com', status: 'active' },
          { id: 2, name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive' }
        ], null, 2);
        mimeType = 'application/json';
        filename = 'query_results.json';
        break;
    }

    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = () => {
    switch (format) {
      case 'csv':
        return <FileText className="w-6 h-6 text-green-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      case 'json':
        return <Code className="w-6 h-6 text-blue-500" />;
      default:
        return <Download className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFormatName = () => {
    switch (format) {
      case 'csv': return 'CSV';
      case 'excel': return 'Excel';
      case 'json': return 'JSON';
      default: return '';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return '正在准备导出...';
      case 'exporting':
        return '正在导出数据...';
      case 'success':
        return '导出成功！';
      case 'error':
        return '导出失败';
      default:
        return '';
    }
  };

  if (!isOpen || !format) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-96 max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">导出数据</h3>
          </div>
          {status !== 'exporting' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* 格式信息 */}
          <div className="flex items-center space-x-3 mb-6">
            {getFormatIcon()}
            <div>
              <div className="text-white font-medium">导出为 {getFormatName()} 格式</div>
              <div className="text-sm text-gray-400">
                {format === 'csv' && '逗号分隔值文件'}
                {format === 'excel' && 'Microsoft Excel 工作表'}
                {format === 'json' && 'JavaScript 对象表示法'}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">{getStatusMessage()}</span>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  status === 'success' ? 'bg-green-500' :
                  status === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 状态图标和消息 */}
          <div className="flex items-center justify-center mb-4">
            {status === 'preparing' || status === 'exporting' ? (
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : status === 'error' ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : null}
          </div>

          {/* 成功消息 */}
          {status === 'success' && (
            <div className="text-center">
              <div className="text-green-400 font-medium mb-2">文件已成功下载！</div>
              <div className="text-sm text-gray-400 mb-4">
                文件已保存到您的下载文件夹
              </div>
              <div className="text-sm text-blue-400">
                {countdown > 0 ? `${countdown} 秒后自动关闭` : '正在关闭...'}
              </div>
            </div>
          )}

          {/* 错误消息 */}
          {status === 'error' && (
            <div className="text-center">
              <div className="text-red-400 font-medium mb-2">导出失败</div>
              <div className="text-sm text-gray-400 mb-4">
                {errorMessage || '导出过程中发生错误'}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={startExport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  重试
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          )}

          {/* 导出中的提示 */}
          {(status === 'preparing' || status === 'exporting') && (
            <div className="text-center">
              <div className="text-sm text-gray-400">
                请稍候，正在处理您的数据...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};