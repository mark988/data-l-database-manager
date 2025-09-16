import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ERDiagramNode, ForeignKeyRelation, TableColumn } from '../types';
import { Database, Table, Key, Plus, Minus, Download, RefreshCw, Save, Settings } from 'lucide-react';

interface ERDiagramCanvasProps {
  nodes: ERDiagramNode[];
  onNodeUpdate: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeEdit: (node: ERDiagramNode) => void;
  onExportDiagram: (format: 'png' | 'svg' | 'pdf') => void;
  onAutoLayout: () => void;
  onSaveModel: () => void;
}

const ERDiagramCanvas: React.FC<ERDiagramCanvasProps> = ({
  nodes,
  onNodeUpdate,
  onNodeEdit,
  onExportDiagram,
  onAutoLayout,
  onSaveModel
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ nodeId: string; offset: { x: number; y: number } } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const offsetX = (e.clientX - rect.left) / scale - node.position.x - pan.x / scale;
    const offsetY = (e.clientY - rect.top) / scale - node.position.y - pan.y / scale;

    setDragging({ nodeId, offset: { x: offsetX, y: offsetY } });
    setSelectedNode(nodeId);
  }, [nodes, scale, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - pan.x / scale - dragging.offset.x;
    const y = (e.clientY - rect.top) / scale - pan.y / scale - dragging.offset.y;

    onNodeUpdate(dragging.nodeId, { x, y });
  }, [dragging, scale, pan, onNodeUpdate]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.1), 3));
  }, []);

  const renderConnection = (relation: ForeignKeyRelation) => {
    const sourceNode = nodes.find(n => n.tableName === relation.sourceTable);
    const targetNode = nodes.find(n => n.tableName === relation.targetTable);

    if (!sourceNode || !targetNode) return null;

    const sourceX = sourceNode.position.x + 150; // half width of table
    const sourceY = sourceNode.position.y + 25; // header height
    const targetX = targetNode.position.x + 150;
    const targetY = targetNode.position.y + 25;

    const pathD = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

    return (
      <g key={relation.id}>
        <path
          d={pathD}
          stroke="#6366f1"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        <circle cx={sourceX} cy={sourceY} r="3" fill="#6366f1" />
        <circle cx={targetX} cy={targetY} r="3" fill="#6366f1" />
      </g>
    );
  };

  const renderTableNode = (node: ERDiagramNode) => {
    const isSelected = selectedNode === node.id;
    const tableHeight = 30 + (node.columns.length * 25);

    return (
      <g
        key={node.id}
        transform={`translate(${node.position.x}, ${node.position.y})`}
        className="cursor-move"
        onMouseDown={(e) => handleMouseDown(e, node.id)}
        onDoubleClick={() => onNodeEdit(node)}
      >
        <rect
          width="300"
          height={tableHeight}
          fill={isSelected ? "#ede9fe" : "#ffffff"}
          stroke={isSelected ? "#6366f1" : "#e5e7eb"}
          strokeWidth={isSelected ? "2" : "1"}
          rx="4"
          className="drop-shadow-md"
        />
        
        {/* Table header */}
        <rect
          width="300"
          height="30"
          fill="#f3f4f6"
          stroke="#e5e7eb"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="10"
          y="20"
          className="text-sm font-semibold fill-gray-900"
        >
          <tspan>📊 {node.tableName}</tspan>
        </text>

        {/* Table columns */}
        {node.columns.map((column, index) => (
          <g key={column.name} transform={`translate(0, ${30 + (index * 25)})`}>
            <line x1="0" y1="0" x2="300" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
            <text x="10" y="17" className="text-xs fill-gray-700">
              {column.isPrimaryKey && <tspan className="fill-amber-600">🔑 </tspan>}
              {column.isForeignKey && <tspan className="fill-blue-600">🔗 </tspan>}
              <tspan className="font-medium">{column.name}</tspan>
              <tspan className="fill-gray-500"> ({column.type})</tspan>
              {!column.nullable && <tspan className="fill-red-600"> NOT NULL</tspan>}
            </text>
          </g>
        ))}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onAutoLayout}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              <span>自动布局</span>
            </button>
            <button
              onClick={onSaveModel}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Save size={16} />
              <span>保存模型</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              缩放: {Math.round(scale * 100)}%
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setScale(prev => Math.max(prev - 0.1, 0.1))}
                className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => setScale(prev => Math.min(prev + 0.1, 3))}
                className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={() => {
                  const formats = document.getElementById('export-formats');
                  formats?.classList.toggle('hidden');
                }}
              >
                <Download size={16} />
                <span>导出</span>
              </button>
              <div id="export-formats" className="hidden absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
                <button
                  onClick={() => onExportDiagram('png')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  PNG 图片
                </button>
                <button
                  onClick={() => onExportDiagram('svg')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  SVG 矢量图
                </button>
                <button
                  onClick={() => onExportDiagram('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  PDF 文档
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          className="bg-white dark:bg-gray-900"
          style={{ transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6366f1"
              />
            </marker>
          </defs>
          
          {/* Render connections first (behind nodes) */}
          {nodes.flatMap(node => node.foreignKeys).map(renderConnection)}
          
          {/* Render table nodes */}
          {nodes.map(renderTableNode)}
        </svg>
      </div>

      {/* Status bar */}
      <div className="bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>{nodes.length} 个表</span>
          <span>
            {selectedNode ? `已选择: ${nodes.find(n => n.id === selectedNode)?.tableName}` : '双击表进行编辑，拖拽移动位置'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ERDiagramCanvas;