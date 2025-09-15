import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DatabaseObject } from '../types';

interface TableDesignerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sql: string) => void;
  table?: DatabaseObject | null;
}

type Column = {
  id: number;
  name: string;
  type: string;
  length: string;
  isPrimaryKey: boolean;
  defaultValue: string;
};

const DATA_TYPES = ['VARCHAR', 'INT', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN', 'DECIMAL'];

export const TableDesignerDialog: React.FC<TableDesignerDialogProps> = ({ isOpen, onClose, onSave, table }) => {
  const [tableName, setTableName] = useState('new_table');
  const [columns, setColumns] = useState<Column[]>([
    { id: 1, name: 'id', type: 'INT', length: '', isPrimaryKey: true, defaultValue: '' },
    { id: 2, name: '', type: 'VARCHAR', length: '255', isPrimaryKey: false, defaultValue: '' },
  ]);

  useEffect(() => {
    if (table) {
      setTableName(table.name);
      // This is a simplified representation. In a real app, you'd fetch column data.
      setColumns([
        { id: 1, name: 'id', type: 'INT', length: '', isPrimaryKey: true, defaultValue: '' },
        { id: 2, name: 'name', type: 'VARCHAR', length: '255', isPrimaryKey: false, defaultValue: '' },
      ]);
    } else {
      setTableName('new_table');
      setColumns([
        { id: 1, name: 'id', type: 'INT', length: '', isPrimaryKey: true, defaultValue: '' },
        { id: 2, name: '', type: 'VARCHAR', length: '255', isPrimaryKey: false, defaultValue: '' },
      ]);
    }
  }, [table]);

  if (!isOpen) return null;

  const handleColumnChange = (id: number, field: keyof Column, value: any) => {
    setColumns(columns.map(col => col.id === id ? { ...col, [field]: value } : col));
  };

  const addColumn = () => {
    const newId = columns.length > 0 ? Math.max(...columns.map(c => c.id)) + 1 : 1;
    setColumns([...columns, { id: newId, name: '', type: 'VARCHAR', length: '255', isPrimaryKey: false, defaultValue: '' }]);
  };

  const removeColumn = (id: number) => {
    setColumns(columns.filter(col => col.id !== id));
  };

  const handleSave = () => {
    if (table) {
      // Generate ALTER TABLE statement (simplified)
      const newColumns = columns.filter(c => !table.children?.some(tc => tc.name === c.name));
      const alterStatements = newColumns.map(c => {
        let def = `ADD COLUMN \`${c.name}\` ${c.type}`;
        if (c.length) def += `(${c.length})`;
        if (c.defaultValue) def += ` DEFAULT '${c.defaultValue}'`;
        return `ALTER TABLE \`${tableName}\` ${def};`;
      }).join('\n');
      onSave(alterStatements);
    } else {
      // Generate CREATE TABLE statement
      const primaryKeys = columns.filter(c => c.isPrimaryKey).map(c => c.name);
      const columnDefs = columns.map(c => {
        let def = `\`${c.name}\` ${c.type}`;
        if (c.length) def += `(${c.length})`;
        if (c.defaultValue) def += ` DEFAULT '${c.defaultValue}'`;
        return def;
      }).join(',\n  ');

      let sql = `CREATE TABLE \`${tableName}\` (\n  ${columnDefs}`;
      if (primaryKeys.length > 0) {
        sql += `,\n  PRIMARY KEY (${primaryKeys.map(k => `\`${k}\``).join(', ')})`;
      }
      sql += '\n);';
      onSave(sql);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col p-6">
        <h2 className="text-white text-2xl mb-4 font-semibold">表结构设计器</h2>
        
        <div className="mb-4">
          <label htmlFor="tableName" className="text-gray-400 text-sm">表名</label>
          <input
            id="tableName"
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!!table}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3 w-1/12">主键</th>
                <th scope="col" className="px-4 py-3 w-3/12">列名</th>
                <th scope="col" className="px-4 py-3 w-2/12">数据类型</th>
                <th scope="col" className="px-4 py-3 w-1/12">长度</th>
                <th scope="col" className="px-4 py-3 w-3/12">默认值</th>
                <th scope="col" className="px-4 py-3 w-1/12 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => (
                <tr key={col.id} className="border-b border-gray-700 hover:bg-gray-600/50">
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={col.isPrimaryKey}
                      onChange={(e) => handleColumnChange(col.id, 'isPrimaryKey', e.target.checked)}
                      className="w-5 h-5 bg-gray-600 border-gray-500 rounded text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleColumnChange(col.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={col.type}
                      onChange={(e) => handleColumnChange(col.id, 'type', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-white"
                    >
                      {DATA_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={col.length}
                      onChange={(e) => handleColumnChange(col.id, 'length', e.target.value)}
                      className="w-full bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none text-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={col.defaultValue}
                      onChange={(e) => handleColumnChange(col.id, 'defaultValue', e.target.value)}
                      className="w-full bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeColumn(col.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button 
            onClick={addColumn} 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>添加列</span>
          </button>
          <div className="space-x-3">
            <button 
              onClick={onClose} 
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
            >
              保存并生成SQL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};