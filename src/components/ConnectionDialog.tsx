import React, { useState, useEffect } from 'react';
import { X, Database, Eye, EyeOff } from 'lucide-react';
import { DatabaseConnection } from '../types';

interface ConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Omit<DatabaseConnection, 'id' | 'isConnected' | 'lastConnected'>) => void;
  editingConnection?: DatabaseConnection | null;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingConnection
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'mysql' as DatabaseConnection['type'],
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
    ssl: false,
    sshTunnel: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单数据
  useEffect(() => {
    if (isOpen) {
      if (editingConnection) {
        setFormData({
          name: editingConnection.name,
          type: editingConnection.type,
          host: editingConnection.host,
          port: editingConnection.port,
          database: editingConnection.database,
          username: editingConnection.username,
          password: editingConnection.password,
          ssl: editingConnection.ssl,
          sshTunnel: editingConnection.sshTunnel
        });
      } else {
        setFormData({
          name: '',
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          database: '',
          username: '',
          password: '',
          ssl: false,
          sshTunnel: false
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, editingConnection]);

  // 根据数据库类型设置默认端口
  useEffect(() => {
    const defaultPorts = {
      mysql: 3306,
      postgresql: 5432,
      sqlserver: 1433,
      sqlite: 0
    };
    
    setFormData(prev => ({
      ...prev,
      port: defaultPorts[prev.type]
    }));
  }, [formData.type]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '连接名称不能为空';
    }

    if (!formData.host.trim()) {
      newErrors.host = '主机地址不能为空';
    }

    if (formData.type !== 'sqlite') {
      if (!formData.database.trim()) {
        newErrors.database = '数据库名称不能为空';
      }

      if (!formData.username.trim()) {
        newErrors.username = '用户名不能为空';
      }

      if (formData.port <= 0 || formData.port > 65535) {
        newErrors.port = '端口号必须在1-65535之间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleTestConnection = () => {
    // 模拟测试连接
    alert('连接测试功能暂未实现');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            {editingConnection ? '编辑连接' : '新建连接'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 连接名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              连接名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="例如：本地MySQL"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 数据库类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              数据库类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as DatabaseConnection['type'])}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="sqlite">SQLite</option>
            </select>
          </div>

          {/* 主机和端口 */}
          {formData.type !== 'sqlite' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  主机地址 *
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.host ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="localhost"
                />
                {errors.host && <p className="text-red-400 text-sm mt-1">{errors.host}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  端口
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 0)}
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.port ? 'border-red-500' : 'border-gray-600'
                  }`}
                  min="1"
                  max="65535"
                />
                {errors.port && <p className="text-red-400 text-sm mt-1">{errors.port}</p>}
              </div>
            </div>
          )}

          {/* 数据库名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {formData.type === 'sqlite' ? '数据库文件路径 *' : '数据库名称 *'}
            </label>
            <input
              type="text"
              value={formData.database}
              onChange={(e) => handleInputChange('database', e.target.value)}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.database ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder={formData.type === 'sqlite' ? '/path/to/database.db' : '数据库名称'}
            />
            {errors.database && <p className="text-red-400 text-sm mt-1">{errors.database}</p>}
          </div>

          {/* 用户名和密码 */}
          {formData.type !== 'sqlite' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  用户名 *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="用户名"
                />
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 高级选项 */}
          {formData.type !== 'sqlite' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">高级选项</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={formData.ssl}
                  onChange={(e) => handleInputChange('ssl', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="ssl" className="ml-2 text-sm text-gray-300">
                  启用SSL连接
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sshTunnel"
                  checked={formData.sshTunnel}
                  onChange={(e) => handleInputChange('sshTunnel', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="sshTunnel" className="ml-2 text-sm text-gray-300">
                  使用SSH隧道
                </label>
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              测试连接
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};