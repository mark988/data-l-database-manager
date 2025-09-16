import React, { useState } from 'react';
import { ERDiagramModel, DatabaseConnection, DatabaseObject } from '../types';
import { Database, Plus, Edit2, Trash2, Download, Upload, Search, Filter } from 'lucide-react';
import ERDiagramCanvas from './ERDiagramCanvas';

interface ERModelManagerProps {
  connections: DatabaseConnection[];
  selectedConnection: DatabaseConnection | null;
  onConnectionSelect: (connection: DatabaseConnection) => void;
}

const ERModelManager: React.FC<ERModelManagerProps> = ({
  connections,
  selectedConnection,
  onConnectionSelect
}) => {
  const [models, setModels] = useState<ERDiagramModel[]>([
    {
      id: '1',
      name: '电商系统ER模型',
      description: '包含用户、产品、订单等核心表结构',
      nodes: [
        {
          id: 'users',
          tableName: 'users',
          position: { x: 50, y: 50 },
          columns: [
            { name: 'id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: 'username', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'email', type: 'VARCHAR(100)', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, isPrimaryKey: false, isForeignKey: false }
          ],
          foreignKeys: []
        },
        {
          id: 'orders',
          tableName: 'orders',
          position: { x: 400, y: 50 },
          columns: [
            { name: 'id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: 'user_id', type: 'INT', nullable: false, isPrimaryKey: false, isForeignKey: true },
            { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'status', type: 'VARCHAR(20)', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, isPrimaryKey: false, isForeignKey: false }
          ],
          foreignKeys: [
            {
              id: 'fk_orders_user',
              sourceTable: 'orders',
              sourceColumn: 'user_id',
              targetTable: 'users',
              targetColumn: 'id',
              type: 'many-to-one'
            }
          ]
        },
        {
          id: 'products',
          tableName: 'products',
          position: { x: 50, y: 300 },
          columns: [
            { name: 'id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: 'name', type: 'VARCHAR(200)', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'price', type: 'DECIMAL(10,2)', nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: 'stock', type: 'INT', nullable: false, isPrimaryKey: false, isForeignKey: false }
          ],
          foreignKeys: []
        }
      ],
      connections: ['1'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15')
    }
  ]);

  const [selectedModel, setSelectedModel] = useState<ERDiagramModel | null>(models[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<ERDiagramModel | null>(null);

  const handleGenerateFromDatabase = async () => {
    if (!selectedConnection) return;

    // Simulate generating ER model from database
    const mockTables = [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'username', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'email', type: 'VARCHAR(100)', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ]
      },
      {
        name: 'posts',
        columns: [
          { name: 'id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'user_id', type: 'INT', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'title', type: 'VARCHAR(200)', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'content', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ];

    const newModel: ERDiagramModel = {
      id: Date.now().toString(),
      name: `${selectedConnection.name} - 自动生成`,
      description: `从数据库 ${selectedConnection.database} 自动生成的ER模型`,
      nodes: mockTables.map((table, index) => ({
        id: table.name,
        tableName: table.name,
        position: { x: 50 + (index * 350), y: 50 + (index % 2 * 200) },
        columns: table.columns,
        foreignKeys: table.name === 'posts' ? [
          {
            id: 'fk_posts_user',
            sourceTable: 'posts',
            sourceColumn: 'user_id',
            targetTable: 'users',
            targetColumn: 'id',
            type: 'many-to-one'
          }
        ] : []
      })),
      connections: [selectedConnection.id],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setModels([...models, newModel]);
    setSelectedModel(newModel);
  };

  const handleNodeUpdate = (nodeId: string, position: { x: number; y: number }) => {
    if (!selectedModel) return;

    const updatedModel = {
      ...selectedModel,
      nodes: selectedModel.nodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      ),
      updatedAt: new Date()
    };

    setModels(models.map(m => m.id === selectedModel.id ? updatedModel : m));
    setSelectedModel(updatedModel);
  };

  const handleNodeEdit = (node: any) => {
    console.log('编辑表:', node.tableName);
  };

  const handleExportDiagram = (format: 'png' | 'svg' | 'pdf') => {
    console.log('导出图表为:', format);
    const event = new CustomEvent('show-toast', {
      detail: { message: `正在导出为 ${format.toUpperCase()}...`, type: 'info' }
    });
    window.dispatchEvent(event);
  };

  const handleAutoLayout = () => {
    if (!selectedModel) return;

    // Simple auto-layout algorithm
    const updatedNodes = selectedModel.nodes.map((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return {
        ...node,
        position: {
          x: col * 350 + 50,
          y: row * 250 + 50
        }
      };
    });

    const updatedModel = {
      ...selectedModel,
      nodes: updatedNodes,
      updatedAt: new Date()
    };

    setModels(models.map(m => m.id === selectedModel.id ? updatedModel : m));
    setSelectedModel(updatedModel);
  };

  const handleSaveModel = () => {
    if (!selectedModel) return;

    const event = new CustomEvent('show-toast', {
      detail: { message: '模型已保存', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar - Model List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ER 模型管理</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="搜索模型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Connection Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择数据源
            </label>
            <select
              value={selectedConnection?.id || ''}
              onChange={(e) => {
                const connection = connections.find(c => c.id === e.target.value);
                if (connection) onConnectionSelect(connection);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">选择连接...</option>
              {connections.filter(c => c.isConnected).map(connection => (
                <option key={connection.id} value={connection.id}>
                  {connection.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleGenerateFromDatabase}
              disabled={!selectedConnection}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database size={16} />
              <span>从数据库生成</span>
            </button>
            
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus size={16} />
              <span>创建新模型</span>
            </button>
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto">
          {filteredModels.map(model => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedModel?.id === model.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {model.name}
                  </h3>
                  {model.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {model.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{model.nodes.length} 个表</span>
                    <span>{new Date(model.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingModel(model);
                      setShowCreateDialog(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModels(models.filter(m => m.id !== model.id));
                      if (selectedModel?.id === model.id) {
                        setSelectedModel(null);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredModels.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? '未找到匹配的模型' : '暂无ER模型，请创建一个'}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1">
        {selectedModel ? (
          <ERDiagramCanvas
            nodes={selectedModel.nodes}
            onNodeUpdate={handleNodeUpdate}
            onNodeEdit={handleNodeEdit}
            onExportDiagram={handleExportDiagram}
            onAutoLayout={handleAutoLayout}
            onSaveModel={handleSaveModel}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <Database size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                请选择或创建ER模型
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                选择左侧的模型来查看和编辑ER图
              </p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                <span>创建新模型</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERModelManager;