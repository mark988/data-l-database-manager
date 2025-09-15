import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DatabaseConnection } from '../types';

interface ConnectionProgressProps {
  isOpen: boolean;
  connection: DatabaseConnection | null;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

interface ConnectionStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export const ConnectionProgress: React.FC<ConnectionProgressProps> = ({
  isOpen,
  connection,
  onClose,
  onComplete
}) => {
  const [steps, setSteps] = useState<ConnectionStep[]>([
    { id: 'validate', label: '验证连接参数', status: 'pending' },
    { id: 'network', label: '建立网络连接', status: 'pending' },
    { id: 'auth', label: '身份验证', status: 'pending' },
    { id: 'database', label: '连接数据库', status: 'pending' },
    { id: 'complete', label: '连接完成', status: 'pending' }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isOpen && connection && !isConnecting) {
      startConnection();
    }
  }, [isOpen, connection]);

  const startConnection = async () => {
    setIsConnecting(true);
    setConnectionResult(null);
    setCurrentStepIndex(0);

    // 重置所有步骤状态
    setSteps(steps.map(step => ({ ...step, status: 'pending', message: undefined })));

    try {
      // 模拟连接过程
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        
        // 更新当前步骤为运行中
        setSteps(prevSteps => 
          prevSteps.map((step, index) => 
            index === i ? { ...step, status: 'running' } : step
          )
        );

        // 模拟每个步骤的延迟
        const delay = getStepDelay(steps[i].id);
        await new Promise(resolve => setTimeout(resolve, delay));

        // 模拟可能的错误（5% 概率）
        if (Math.random() < 0.05 && steps[i].id !== 'complete') {
          throw new Error(`${steps[i].label}失败`);
        }

        // 更新步骤为成功
        setSteps(prevSteps => 
          prevSteps.map((step, index) => 
            index === i ? { 
              ...step, 
              status: 'success',
              message: getSuccessMessage(step.id)
            } : step
          )
        );
      }

      setConnectionResult('success');
      onComplete(true);
      
      // 自动关闭对话框
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败';
      
      // 更新当前步骤为错误状态
      setSteps(prevSteps => 
        prevSteps.map((step, index) => 
          index === currentStepIndex ? { 
            ...step, 
            status: 'error',
            message: errorMessage
          } : step
        )
      );

      setConnectionResult('error');
      onComplete(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStepDelay = (stepId: string): number => {
    switch (stepId) {
      case 'validate': return 500;
      case 'network': return 800;
      case 'auth': return 600;
      case 'database': return 700;
      case 'complete': return 300;
      default: return 500;
    }
  };

  const getSuccessMessage = (stepId: string): string => {
    switch (stepId) {
      case 'validate': return '参数验证通过';
      case 'network': return '网络连接已建立';
      case 'auth': return '身份验证成功';
      case 'database': return '数据库连接成功';
      case 'complete': return '连接建立完成';
      default: return '完成';
    }
  };

  const getStepIcon = (step: ConnectionStep) => {
    switch (step.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.status === 'success').length;
    return (completedSteps / steps.length) * 100;
  };

  if (!isOpen || !connection) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-96 max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">连接数据库</h3>
          </div>
          {!isConnecting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-300">连接到:</span>
              <span className="text-sm text-white font-medium">{connection.name}</span>
            </div>
            <div className="text-xs text-gray-400">
              {connection.host}:{connection.port} / {connection.database}
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">连接进度</span>
              <span className="text-xs text-gray-400">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* 连接步骤 */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                {getStepIcon(step)}
                <div className="flex-1">
                  <div className={`text-sm ${
                    step.status === 'success' ? 'text-green-400' :
                    step.status === 'error' ? 'text-red-400' :
                    step.status === 'running' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  {step.message && (
                    <div className={`text-xs mt-1 ${
                      step.status === 'error' ? 'text-red-300' : 'text-gray-500'
                    }`}>
                      {step.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 结果消息 */}
          {connectionResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              connectionResult === 'success' 
                ? 'bg-green-900 border border-green-700' 
                : 'bg-red-900 border border-red-700'
            }`}>
              <div className={`text-sm font-medium ${
                connectionResult === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {connectionResult === 'success' ? '连接成功!' : '连接失败'}
              </div>
              {connectionResult === 'success' && (
                <div className="text-xs text-green-400 mt-1">
                  数据库连接已建立，可以开始执行查询
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          {connectionResult === 'error' && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={startConnection}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                重试连接
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};