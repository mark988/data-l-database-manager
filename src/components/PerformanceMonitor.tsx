import React, { useState, useEffect } from 'react';
import { PerformanceMetric, SlowQuery, OptimizationSuggestion, DatabaseConnection } from '../types';
import { 
  Monitor, 
  Activity, 
  Clock, 
  Users, 
  Database,
  AlertTriangle,
  TrendingUp,
  Cpu,
  MemoryStick,
  Zap,
  FileText,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';

interface PerformanceMonitorProps {
  connections: DatabaseConnection[];
  selectedConnection: DatabaseConnection | null;
  onConnectionSelect: (connection: DatabaseConnection) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  connections,
  selectedConnection,
  onConnectionSelect
}) => {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetric>({
    id: '1',
    connectionId: selectedConnection?.id || '1',
    timestamp: new Date(),
    cpuUsage: 0,
    memoryUsage: 0,
    connectionCount: 0,
    activeQueries: 0,
    locksCount: 0
  });

  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([
    {
      id: '1',
      connectionId: '1',
      sql: 'SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.status = \'active\' ORDER BY u.created_at DESC',
      executionTime: 2450,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      database: 'ecommerce',
      user: 'app_user',
      executionPlan: `Seq Scan on users u  (cost=0.00..1250.00 rows=5000 width=64)
  Filter: (status = 'active')
  ->  Hash Left Join  (cost=125.00..2500.00 rows=5000 width=128)
       Hash Cond: (u.id = p.user_id)
       ->  Sort  (cost=500.00..525.00 rows=5000 width=64)
            Sort Key: u.created_at DESC`,
      suggestions: [
        {
          type: 'index',
          description: '在 users.status 字段上创建索引',
          impact: 'high',
          sql: 'CREATE INDEX idx_users_status ON users(status);'
        },
        {
          type: 'index',
          description: '在 users.created_at 字段上创建索引用于排序',
          impact: 'medium',
          sql: 'CREATE INDEX idx_users_created_at ON users(created_at);'
        }
      ]
    },
    {
      id: '2',
      connectionId: '1',
      sql: 'UPDATE orders SET status = \'processed\' WHERE created_at < NOW() - INTERVAL 1 HOUR AND status = \'pending\'',
      executionTime: 1850,
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      database: 'ecommerce',
      user: 'system',
      suggestions: [
        {
          type: 'index',
          description: '创建复合索引优化WHERE条件',
          impact: 'high',
          sql: 'CREATE INDEX idx_orders_created_status ON orders(created_at, status);'
        }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<'realtime' | 'slowqueries' | 'trends'>('realtime');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [thresholds, setThresholds] = useState({
    slowQueryTime: 1000,
    cpuWarning: 70,
    cpuCritical: 90,
    memoryWarning: 80,
    memoryCritical: 95,
    connectionWarning: 80,
    connectionCritical: 95
  });

  // Mock historical data
  const [historicalMetrics] = useState<PerformanceMetric[]>(() => {
    const metrics = [];
    const now = new Date();
    for (let i = 60; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 1000);
      metrics.push({
        id: i.toString(),
        connectionId: '1',
        timestamp,
        cpuUsage: Math.random() * 100,
        memoryUsage: 60 + Math.random() * 30,
        connectionCount: Math.floor(Math.random() * 100),
        activeQueries: Math.floor(Math.random() * 20),
        locksCount: Math.floor(Math.random() * 5)
      });
    }
    return metrics;
  });

  // Simulate real-time metrics updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCurrentMetrics(prev => ({
        ...prev,
        timestamp: new Date(),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        connectionCount: Math.max(0, prev.connectionCount + Math.floor((Math.random() - 0.5) * 6)),
        activeQueries: Math.max(0, prev.activeQueries + Math.floor((Math.random() - 0.5) * 4)),
        locksCount: Math.max(0, prev.locksCount + Math.floor((Math.random() - 0.5) * 2))
      }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getMetricStatus = (value: number, warning: number, critical: number) => {
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 dark:bg-red-900';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900';
      default: return 'bg-green-100 dark:bg-green-900';
    }
  };

  const handleOptimizationApply = (suggestion: OptimizationSuggestion) => {
    console.log('应用优化建议:', suggestion);
    const event = new CustomEvent('show-toast', {
      detail: { message: '优化建议已应用到新标签页', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleExportReport = () => {
    const report = {
      connection: selectedConnection?.name,
      timestamp: new Date().toISOString(),
      metrics: currentMetrics,
      slowQueries: slowQueries,
      thresholds
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Monitor className="mr-3" size={28} />
              性能监控
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              数据库性能实时监控和慢查询分析
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Selector */}
            <div className="flex items-center space-x-2">
              <Database size={16} className="text-gray-500" />
              <select
                value={selectedConnection?.id || ''}
                onChange={(e) => {
                  const connection = connections.find(c => c.id === e.target.value);
                  if (connection) onConnectionSelect(connection);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">选择数据库...</option>
                {connections.filter(c => c.isConnected).map(connection => (
                  <option key={connection.id} value={connection.id}>
                    {connection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700 dark:text-gray-300">
                自动刷新
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>1秒</option>
                  <option value={5}>5秒</option>
                  <option value={10}>10秒</option>
                  <option value={30}>30秒</option>
                </select>
              )}
            </div>

            <button
              onClick={handleExportReport}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download size={16} />
              <span>导出报告</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mt-6 space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'realtime'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Activity size={16} className="inline mr-2" />
            实时监控
          </button>
          <button
            onClick={() => setActiveTab('slowqueries')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'slowqueries'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock size={16} className="inline mr-2" />
            慢查询分析
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            历史趋势
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'realtime' && (
          <div className="p-6">
            {!selectedConnection ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Database size={64} className="mx-auto mb-4" />
                  <p>请选择一个数据库连接开始监控</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* CPU Usage */}
                  <div className={`p-4 rounded-lg border ${getStatusBgColor(getMetricStatus(currentMetrics.cpuUsage, thresholds.cpuWarning, thresholds.cpuCritical))}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Cpu size={20} className="text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU使用率</span>
                      </div>
                      <AlertTriangle 
                        size={16} 
                        className={getMetricStatus(currentMetrics.cpuUsage, thresholds.cpuWarning, thresholds.cpuCritical) !== 'normal' ? getStatusColor(getMetricStatus(currentMetrics.cpuUsage, thresholds.cpuWarning, thresholds.cpuCritical)) : 'hidden'} 
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentMetrics.cpuUsage.toFixed(1)}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getMetricStatus(currentMetrics.cpuUsage, thresholds.cpuWarning, thresholds.cpuCritical) === 'critical' ? 'bg-red-500' :
                          getMetricStatus(currentMetrics.cpuUsage, thresholds.cpuWarning, thresholds.cpuCritical) === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(currentMetrics.cpuUsage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div className={`p-4 rounded-lg border ${getStatusBgColor(getMetricStatus(currentMetrics.memoryUsage, thresholds.memoryWarning, thresholds.memoryCritical))}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MemoryStick size={20} className="text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">内存使用率</span>
                      </div>
                      <AlertTriangle 
                        size={16} 
                        className={getMetricStatus(currentMetrics.memoryUsage, thresholds.memoryWarning, thresholds.memoryCritical) !== 'normal' ? getStatusColor(getMetricStatus(currentMetrics.memoryUsage, thresholds.memoryWarning, thresholds.memoryCritical)) : 'hidden'} 
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentMetrics.memoryUsage.toFixed(1)}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getMetricStatus(currentMetrics.memoryUsage, thresholds.memoryWarning, thresholds.memoryCritical) === 'critical' ? 'bg-red-500' :
                          getMetricStatus(currentMetrics.memoryUsage, thresholds.memoryWarning, thresholds.memoryCritical) === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(currentMetrics.memoryUsage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Connections */}
                  <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                    <div className="flex items-center mb-2">
                      <Users size={20} className="text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">活跃连接</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentMetrics.connectionCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      最大连接数: 100
                    </div>
                  </div>

                  {/* Active Queries */}
                  <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                    <div className="flex items-center mb-2">
                      <Zap size={20} className="text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">执行中查询</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentMetrics.activeQueries}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      当前执行的SQL数量
                    </div>
                  </div>

                  {/* Locks */}
                  <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                    <div className="flex items-center mb-2">
                      <Settings size={20} className="text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">锁等待</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentMetrics.locksCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      等待锁的事务数
                    </div>
                  </div>
                </div>

                {/* Recent Slow Queries */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <Clock className="mr-2" size={20} />
                      最近的慢查询
                    </h3>
                  </div>
                  <div className="p-4">
                    {slowQueries.slice(0, 3).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        暂无慢查询记录
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {slowQueries.slice(0, 3).map(query => (
                          <div key={query.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                    {query.executionTime}ms
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {query.timestamp.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {query.database} / {query.user}
                                  </span>
                                </div>
                                <code className="text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded block overflow-x-auto">
                                  {query.sql.length > 100 ? query.sql.substring(0, 100) + '...' : query.sql}
                                </code>
                              </div>
                            </div>
                            {query.suggestions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  优化建议 ({query.suggestions.length}):
                                </p>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  {query.suggestions[0].description}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="text-center">
                          <button
                            onClick={() => setActiveTab('slowqueries')}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            查看所有慢查询 →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  最后更新: {currentMetrics.timestamp.toLocaleString()}
                  {autoRefresh && ` | 自动刷新: ${refreshInterval}秒`}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'slowqueries' && (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    慢查询分析
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      阈值: {thresholds.slowQueryTime}ms
                    </span>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      设置阈值
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {slowQueries.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Clock size={48} className="mx-auto mb-4" />
                    <p>暂无慢查询记录</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {slowQueries.map(query => (
                      <div key={query.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                                {query.executionTime}ms
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {query.timestamp.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {query.database} / {query.user}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(query.sql);
                                const event = new CustomEvent('show-toast', {
                                  detail: { message: 'SQL已复制到剪贴板', type: 'success' }
                                });
                                window.dispatchEvent(event);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL语句:</h4>
                            <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto">
                              {query.sql}
                            </pre>
                          </div>

                          {query.executionPlan && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">执行计划:</h4>
                              <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto">
                                {query.executionPlan}
                              </pre>
                            </div>
                          )}

                          {query.suggestions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                优化建议 ({query.suggestions.length}):
                              </h4>
                              <div className="space-y-3">
                                {query.suggestions.map((suggestion, index) => (
                                  <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className={`px-2 py-0.5 text-xs rounded ${
                                            suggestion.type === 'index' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            suggestion.type === 'rewrite' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                          }`}>
                                            {suggestion.type === 'index' ? '索引' :
                                             suggestion.type === 'rewrite' ? '重写' : '模式'}
                                          </span>
                                          <span className={`px-2 py-0.5 text-xs rounded ${
                                            suggestion.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                          }`}>
                                            {suggestion.impact === 'high' ? '高影响' :
                                             suggestion.impact === 'medium' ? '中影响' : '低影响'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-white mb-2">
                                          {suggestion.description}
                                        </p>
                                        {suggestion.sql && (
                                          <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                            {suggestion.sql}
                                          </pre>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleOptimizationApply(suggestion)}
                                        className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                      >
                                        应用
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  性能趋势 (过去1小时)
                </h3>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* CPU Trend */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      CPU使用率趋势
                    </h4>
                    <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded flex items-end justify-between p-2">
                      {historicalMetrics.slice(-20).map((metric, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 rounded-t"
                          style={{
                            height: `${metric.cpuUsage}%`,
                            width: 'calc(100% / 20 - 2px)'
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>1小时前</span>
                      <span>现在</span>
                    </div>
                  </div>

                  {/* Memory Trend */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      内存使用率趋势
                    </h4>
                    <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded flex items-end justify-between p-2">
                      {historicalMetrics.slice(-20).map((metric, index) => (
                        <div
                          key={index}
                          className="bg-green-500 rounded-t"
                          style={{
                            height: `${metric.memoryUsage}%`,
                            width: 'calc(100% / 20 - 2px)'
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>1小时前</span>
                      <span>现在</span>
                    </div>
                  </div>

                  {/* Connection Trend */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      连接数趋势
                    </h4>
                    <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded flex items-end justify-between p-2">
                      {historicalMetrics.slice(-20).map((metric, index) => (
                        <div
                          key={index}
                          className="bg-yellow-500 rounded-t"
                          style={{
                            height: `${(metric.connectionCount / 100) * 100}%`,
                            width: 'calc(100% / 20 - 2px)'
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>1小时前</span>
                      <span>现在</span>
                    </div>
                  </div>

                  {/* Query Trend */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      活跃查询趋势
                    </h4>
                    <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded flex items-end justify-between p-2">
                      {historicalMetrics.slice(-20).map((metric, index) => (
                        <div
                          key={index}
                          className="bg-purple-500 rounded-t"
                          style={{
                            height: `${(metric.activeQueries / 20) * 100}%`,
                            width: 'calc(100% / 20 - 2px)'
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>1小时前</span>
                      <span>现在</span>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(historicalMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / historicalMetrics.length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">平均CPU使用率</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.max(...historicalMetrics.map(m => m.cpuUsage)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">峰值CPU使用率</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.max(...historicalMetrics.map(m => m.connectionCount))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">峰值连接数</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {slowQueries.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">慢查询总数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;