import React, { useState } from 'react';
import { SQLTemplate, TemplateVariable, ScheduledTask, TaskLog } from '../types';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Play, 
  Clock,
  Search,
  Filter,
  Copy,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';

interface SQLTemplateManagerProps {
  onCreateTab: (title: string, content: string) => void;
}

const SQLTemplateManager: React.FC<SQLTemplateManagerProps> = ({ onCreateTab }) => {
  const [templates, setTemplates] = useState<SQLTemplate[]>([
    {
      id: '1',
      name: '分页查询模板',
      description: '通用分页查询SQL模板',
      sql: `SELECT *
FROM {{tableName}}
WHERE {{condition}}
ORDER BY {{orderBy}} {{sortDirection}}
LIMIT {{pageSize}} OFFSET {{offset}};`,
      variables: [
        { name: 'tableName', type: 'string', required: true, description: '表名' },
        { name: 'condition', type: 'string', required: false, defaultValue: '1=1', description: '查询条件' },
        { name: 'orderBy', type: 'string', required: true, defaultValue: 'id', description: '排序字段' },
        { name: 'sortDirection', type: 'string', required: false, defaultValue: 'DESC', description: '排序方向' },
        { name: 'pageSize', type: 'number', required: true, defaultValue: '20', description: '每页数量' },
        { name: 'offset', type: 'number', required: true, defaultValue: '0', description: '偏移量' }
      ],
      category: '查询',
      databaseType: 'all',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: '批量更新模板',
      description: '批量更新记录的SQL模板',
      sql: `UPDATE {{tableName}}
SET {{updateFields}}
WHERE {{condition}};`,
      variables: [
        { name: 'tableName', type: 'string', required: true, description: '表名' },
        { name: 'updateFields', type: 'string', required: true, description: '更新字段，如：name = ?, age = ?' },
        { name: 'condition', type: 'string', required: true, description: '更新条件' }
      ],
      category: '更新',
      databaseType: 'all',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: '3',
      name: 'MySQL备份脚本',
      description: 'MySQL数据库备份命令模板',
      sql: `mysqldump -h {{host}} -P {{port}} -u {{username}} -p{{password}} \\
  --single-transaction --routines --triggers \\
  {{database}} > backup_{{database}}_$(date +%Y%m%d_%H%M%S).sql`,
      variables: [
        { name: 'host', type: 'string', required: true, defaultValue: 'localhost', description: '主机地址' },
        { name: 'port', type: 'number', required: true, defaultValue: '3306', description: '端口号' },
        { name: 'username', type: 'string', required: true, description: '用户名' },
        { name: 'password', type: 'string', required: true, description: '密码' },
        { name: 'database', type: 'string', required: true, description: '数据库名' }
      ],
      category: '备份',
      databaseType: 'mysql',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    }
  ]);

  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([
    {
      id: '1',
      name: '每日用户统计',
      description: '每天生成用户注册统计报告',
      sql: `INSERT INTO daily_stats (date, user_count, new_users)
SELECT CURDATE(), COUNT(*) as user_count, 
       SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_users
FROM users;`,
      connectionId: '1',
      schedule: '0 1 * * *', // 每天凌晨1点
      isActive: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'idle',
      createdAt: new Date('2024-01-01'),
      logs: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'success',
          duration: 150,
          message: '任务执行成功'
        }
      ]
    },
    {
      id: '2',
      name: '清理临时数据',
      description: '每周清理7天前的临时数据',
      sql: `DELETE FROM temp_data WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);`,
      connectionId: '1',
      schedule: '0 2 * * 0', // 每周日凌晨2点
      isActive: true,
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'idle',
      createdAt: new Date('2024-01-01'),
      logs: []
    }
  ]);

  const [activeTab, setActiveTab] = useState<'templates' | 'scheduled'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDatabaseType, setSelectedDatabaseType] = useState('all');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SQLTemplate | null>(null);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    sql: '',
    category: '查询',
    databaseType: 'all' as const
  });
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    sql: '',
    templateId: '',
    connectionId: '',
    schedule: '0 0 * * *',
    isActive: true
  });

  const categories = ['全部', '查询', '更新', '删除', '备份', '维护', '统计', '其他'];
  const databaseTypes = [
    { value: 'all', label: '全部' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlserver', label: 'SQL Server' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.sql.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || template.category === selectedCategory;
    const matchesDatabaseType = selectedDatabaseType === 'all' || template.databaseType === selectedDatabaseType;
    
    return matchesSearch && matchesCategory && matchesDatabaseType;
  });

  const handleUseTemplate = (template: SQLTemplate) => {
    // Replace variables with prompts
    let sql = template.sql;
    template.variables.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      const replacement = variable.defaultValue || `[请输入${variable.description || variable.name}]`;
      sql = sql.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
    });
    
    onCreateTab(template.name, sql);
    
    const event = new CustomEvent('show-toast', {
      detail: { message: '模板已应用到新标签页', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.sql) return;

    const template: SQLTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      ...templateForm,
      variables: extractVariables(templateForm.sql),
      createdAt: editingTemplate?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
    } else {
      setTemplates([...templates, template]);
    }

    setShowTemplateDialog(false);
    setEditingTemplate(null);
    resetTemplateForm();
  };

  const extractVariables = (sql: string): TemplateVariable[] => {
    const matches = sql.match(/\{\{(\w+)\}\}/g) || [];
    const uniqueVars = [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
    
    return uniqueVars.map(varName => ({
      name: varName,
      type: 'string',
      required: true,
      description: ''
    }));
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      sql: '',
      category: '查询',
      databaseType: 'all'
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      name: '',
      description: '',
      sql: '',
      templateId: '',
      connectionId: '',
      schedule: '0 0 * * *',
      isActive: true
    });
  };

  const handleRunTask = (taskId: string) => {
    setScheduledTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'running' as const, lastRun: new Date() }
          : task
      )
    );

    // Simulate task execution
    setTimeout(() => {
      setScheduledTasks(tasks => 
        tasks.map(task => {
          if (task.id === taskId) {
            const newLog: TaskLog = {
              id: Date.now().toString(),
              timestamp: new Date(),
              status: Math.random() > 0.1 ? 'success' : 'failed',
              duration: Math.floor(Math.random() * 1000) + 100,
              message: Math.random() > 0.1 ? '任务执行成功' : '任务执行失败',
              error: Math.random() > 0.1 ? undefined : 'Connection timeout'
            };
            
            return {
              ...task,
              status: newLog.status === 'success' ? 'success' : 'failed',
              logs: [newLog, ...task.logs].slice(0, 10) // Keep last 10 logs
            };
          }
          return task;
        })
      );
    }, 2000);
  };

  const handleToggleTask = (taskId: string) => {
    setScheduledTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, isActive: !task.isActive }
          : task
      )
    );
  };

  const getCronDescription = (cron: string) => {
    // Simple cron description - in real app would use a proper cron parser
    const parts = cron.split(' ');
    if (cron === '0 0 * * *') return '每天午夜';
    if (cron === '0 1 * * *') return '每天凌晨1点';
    if (cron === '0 2 * * 0') return '每周日凌晨2点';
    if (cron === '0 */6 * * *') return '每6小时';
    return cron;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              SQL模板 & 自动化
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              管理SQL模板和定时任务
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                SQL模板
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'scheduled'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Calendar size={16} className="inline mr-2" />
                定时任务
              </button>
            </div>
            
            <button
              onClick={() => {
                if (activeTab === 'templates') {
                  setEditingTemplate(null);
                  resetTemplateForm();
                  setShowTemplateDialog(true);
                } else {
                  setEditingTask(null);
                  resetTaskForm();
                  setShowTaskDialog(true);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              <span>{activeTab === 'templates' ? '创建模板' : '创建任务'}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分类
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  数据库类型
                </label>
                <select
                  value={selectedDatabaseType}
                  onChange={(e) => setSelectedDatabaseType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {databaseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <FileText size={48} className="mx-auto mb-4" />
                  <p>未找到匹配的模板</p>
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <div key={template.id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="p-1 text-green-600 hover:text-green-800 dark:hover:text-green-400"
                          title="使用模板"
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setTemplateForm({
                              name: template.name,
                              description: template.description || '',
                              sql: template.sql,
                              category: template.category,
                              databaseType: template.databaseType
                            });
                            setShowTemplateDialog(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="编辑"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setTemplates(templates.filter(t => t.id !== template.id));
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {template.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {template.category}
                        </span>
                        {template.databaseType !== 'all' && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {template.databaseType.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400">
                        {template.variables.length} 个变量
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <FileText size={64} className="mx-auto mb-4" />
                <p>选择左侧的SQL模板来预览和使用</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6">
            {scheduledTasks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无定时任务
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  创建定时任务来自动执行SQL脚本
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    resetTaskForm();
                    setShowTaskDialog(true);
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>创建任务</span>
                </button>
              </div>
            ) : (
              scheduledTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {task.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {task.status === 'success' && <CheckCircle size={16} className="text-green-500" />}
                          {task.status === 'failed' && <XCircle size={16} className="text-red-500" />}
                          {task.status === 'running' && <Clock size={16} className="text-blue-500" />}
                          <span className={`text-sm px-2 py-0.5 rounded ${
                            task.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            task.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            task.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {task.status === 'success' ? '成功' :
                             task.status === 'failed' ? '失败' :
                             task.status === 'running' ? '运行中' : '空闲'}
                          </span>
                          <span className={`text-sm px-2 py-0.5 rounded ${
                            task.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {task.isActive ? '启用' : '禁用'}
                          </span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">执行计划:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {getCronDescription(task.schedule)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">下次执行:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {task.nextRun?.toLocaleString() || '未设置'}
                          </span>
                        </div>
                        {task.lastRun && (
                          <div>
                            <span className="text-gray-500">上次执行:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {task.lastRun.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">执行日志:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {task.logs.length} 条记录
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleRunTask(task.id)}
                        disabled={task.status === 'running'}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50"
                      >
                        <Play size={14} />
                        <span>立即执行</span>
                      </button>
                      
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`flex items-center space-x-1 px-3 py-1 text-sm rounded ${
                          task.isActive 
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                        }`}
                      >
                        {task.isActive ? <Pause size={14} /> : <Play size={14} />}
                        <span>{task.isActive ? '禁用' : '启用'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setTaskForm({
                            name: task.name,
                            description: task.description || '',
                            sql: task.sql,
                            templateId: task.templateId || '',
                            connectionId: task.connectionId,
                            schedule: task.schedule,
                            isActive: task.isActive
                          });
                          setShowTaskDialog(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => {
                          setScheduledTasks(scheduledTasks.filter(t => t.id !== task.id));
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* SQL Preview */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL:</h4>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded border overflow-x-auto">
                      {task.sql}
                    </pre>
                  </div>

                  {/* Recent Logs */}
                  {task.logs.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        最近日志:
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {task.logs.slice(0, 3).map(log => (
                          <div key={log.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-2 py-0.5 rounded ${
                                log.status === 'success' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {log.status === 'success' ? '成功' : '失败'}
                              </span>
                              <span className="text-gray-500">
                                {log.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white">{log.message}</p>
                            {log.error && (
                              <p className="text-red-600 dark:text-red-400 mt-1">{log.error}</p>
                            )}
                            <div className="flex items-center justify-between mt-1 text-gray-500">
                              <span>执行时间: {log.duration}ms</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Template Dialog */}
      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTemplate ? '编辑模板' : '创建SQL模板'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    模板名称 *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="请输入模板名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类
                  </label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.filter(c => c !== '全部').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    数据库类型
                  </label>
                  <select
                    value={templateForm.databaseType}
                    onChange={(e) => setTemplateForm({...templateForm, databaseType: e.target.value as any})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {databaseTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="请输入模板描述"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SQL模板 *
                </label>
                <textarea
                  value={templateForm.sql}
                  onChange={(e) => setTemplateForm({...templateForm, sql: e.target.value})}
                  rows={12}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="请输入SQL模板，使用 {{variableName}} 格式定义变量"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  使用 {`{{变量名}}`} 来定义模板变量，例如: {`{{tableName}}, {{condition}}`}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowTemplateDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateForm.name || !templateForm.sql}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Dialog */}
      {showTaskDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTask ? '编辑定时任务' : '创建定时任务'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    任务名称 *
                  </label>
                  <input
                    type="text"
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="请输入任务名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    数据库连接 *
                  </label>
                  <select
                    value={taskForm.connectionId}
                    onChange={(e) => setTaskForm({...taskForm, connectionId: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">选择数据库连接...</option>
                    <option value="1">本地MySQL</option>
                    <option value="2">生产PostgreSQL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  任务描述
                </label>
                <input
                  type="text"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="请输入任务描述"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    使用模板
                  </label>
                  <select
                    value={taskForm.templateId}
                    onChange={(e) => {
                      setTaskForm({...taskForm, templateId: e.target.value});
                      if (e.target.value) {
                        const template = templates.find(t => t.id === e.target.value);
                        if (template) {
                          setTaskForm(prev => ({...prev, sql: template.sql}));
                        }
                      }
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">不使用模板</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    执行计划 (Cron表达式) *
                  </label>
                  <input
                    type="text"
                    value={taskForm.schedule}
                    onChange={(e) => setTaskForm({...taskForm, schedule: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    placeholder="0 0 * * *"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    例如：0 0 * * * (每天午夜)，0 */6 * * * (每6小时)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SQL脚本 *
                </label>
                <textarea
                  value={taskForm.sql}
                  onChange={(e) => setTaskForm({...taskForm, sql: e.target.value})}
                  rows={10}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="请输入要定时执行的SQL脚本"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={taskForm.isActive}
                  onChange={(e) => setTaskForm({...taskForm, isActive: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  创建后立即启用任务
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowTaskDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!taskForm.name || !taskForm.sql || !taskForm.connectionId || !taskForm.schedule) return;

                  const task: ScheduledTask = {
                    id: editingTask?.id || Date.now().toString(),
                    ...taskForm,
                    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mock next run
                    status: 'idle',
                    createdAt: editingTask?.createdAt || new Date(),
                    logs: editingTask?.logs || []
                  };

                  if (editingTask) {
                    setScheduledTasks(scheduledTasks.map(t => t.id === editingTask.id ? task : t));
                  } else {
                    setScheduledTasks([...scheduledTasks, task]);
                  }

                  setShowTaskDialog(false);
                  setEditingTask(null);
                  resetTaskForm();
                }}
                disabled={!taskForm.name || !taskForm.sql || !taskForm.connectionId || !taskForm.schedule}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLTemplateManager;