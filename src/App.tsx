import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConnectionManager } from './components/ConnectionManager';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { SQLEditor } from './components/SQLEditor';
import { QueryResults } from './components/QueryResults';
import { BookmarkPanel } from './components/BookmarkPanel';
import { ContextMenu } from './components/ContextMenu';
import { DatabaseConnection, DatabaseObject, SQLTab, QueryResult, BookmarkedQuery } from './types';

function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Connection management
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: '1',
      name: '本地MySQL',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'test_db',
      username: 'root',
      password: '',
      ssl: false,
      sshTunnel: false,
      isConnected: true,
      lastConnected: new Date()
    },
    {
      id: '2',
      name: '生产PostgreSQL',
      type: 'postgresql',
      host: 'prod.example.com',
      port: 5432,
      database: 'production',
      username: 'app_user',
      password: '',
      ssl: true,
      sshTunnel: true,
      isConnected: false
    }
  ]);

  // Database objects
  const [databaseObjects, setDatabaseObjects] = useState<DatabaseObject[]>([
    {
      name: 'test_db',
      type: 'database',
      children: [
        {
          name: 'users',
          type: 'table',
          rowCount: 1250
        },
        {
          name: 'products',
          type: 'table',
          rowCount: 856
        },
        {
          name: 'orders',
          type: 'table',
          rowCount: 3420
        },
        {
          name: 'user_summary_view',
          type: 'view'
        },
        {
          name: 'calculate_total_sales',
          type: 'procedure'
        }
      ]
    }
  ]);

  // SQL Editor tabs
  const [sqlTabs, setSqlTabs] = useState<SQLTab[]>([
    {
      id: '1',
      title: '查询-1',
      content: 'SELECT * FROM users LIMIT 10;',
      isUnsaved: false,
      connectionId: '1'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  // Query execution
  const [queryResult, setQueryResult] = useState<QueryResult | null>({
    columns: ['id', 'name', 'email', 'created_at'],
    rows: [
      [1, 'John Doe', 'john@example.com', '2024-01-15'],
      [2, 'Jane Smith', 'jane@example.com', '2024-01-16'],
      [3, 'Bob Johnson', 'bob@example.com', '2024-01-17'],
    ],
    rowCount: 3,
    executionTime: 125,
    hasMore: false
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkedQuery[]>([
    {
      id: '1',
      name: '获取用户列表',
      sql: 'SELECT id, name, email FROM users ORDER BY created_at DESC LIMIT 50;',
      description: '获取最新注册的用户列表',
      tags: ['用户', '常用'],
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: '销售统计',
      sql: 'SELECT DATE(created_at) as date, SUM(total_amount) as daily_sales FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date DESC;',
      description: '过去30天的每日销售统计',
      tags: ['统计', '销售'],
      createdAt: new Date('2024-01-12')
    }
  ]);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'table' | 'database' | 'connection';
  } | null>(null);

  // UI State
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(true);

  // Connection handlers
  const handleAddConnection = () => {
    console.log('Adding new connection...');
  };

  const handleEditConnection = (connection: DatabaseConnection) => {
    console.log('Editing connection:', connection.name);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const handleConnect = (connectionId: string) => {
    setConnections(connections.map(c => 
      c.id === connectionId 
        ? { ...c, isConnected: true, lastConnected: new Date() }
        : c
    ));
  };

  const handleDisconnect = (connectionId: string) => {
    setConnections(connections.map(c => 
      c.id === connectionId 
        ? { ...c, isConnected: false }
        : c
    ));
  };

  // SQL Editor handlers
  const handleCreateTab = () => {
    const newId = Date.now().toString();
    const newTab: SQLTab = {
      id: newId,
      title: `查询-${sqlTabs.length + 1}`,
      content: '',
      isUnsaved: false
    };
    setSqlTabs([...sqlTabs, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = sqlTabs.filter(tab => tab.id !== tabId);
    setSqlTabs(newTabs);
    
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleUpdateTab = (tabId: string, content: string) => {
    setSqlTabs(tabs => tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isUnsaved: true }
        : tab
    ));
  };

  const handleSaveTab = (tabId: string) => {
    setSqlTabs(tabs => tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, isUnsaved: false }
        : tab
    ));
  };

  // Query execution handlers
  const handleExecuteSQL = async () => {
    const activeTab = sqlTabs.find(tab => tab.id === activeTabId);
    if (!activeTab || !activeTab.content.trim()) return;

    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result based on query content
      const mockResult: QueryResult = {
        columns: ['id', 'name', 'email', 'status'],
        rows: [
          [1, 'Alice Wilson', 'alice@example.com', 'active'],
          [2, 'Charlie Brown', 'charlie@example.com', 'inactive'],
          [3, 'Diana Prince', 'diana@example.com', 'active'],
          [4, 'Edward Norton', 'edward@example.com', 'pending']
        ],
        rowCount: 4,
        executionTime: 890,
        hasMore: false
      };

      setQueryResult(mockResult);
    } catch (error) {
      setExecutionError('查询执行失败: ' + (error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStopExecution = () => {
    setIsExecuting(false);
  };

  // Other handlers
  const handleGlobalSearch = (query: string) => {
    console.log('Global search:', query);
  };

  const handleSelectObject = (object: DatabaseObject) => {
    console.log('Selected object:', object.name);
  };

  const handleRefreshObjects = () => {
    console.log('Refreshing database objects...');
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    console.log('Exporting as:', format);
  };

  const handleExecuteBookmark = (bookmark: BookmarkedQuery) => {
    // Create new tab with bookmark SQL
    const newId = Date.now().toString();
    const newTab: SQLTab = {
      id: newId,
      title: bookmark.name,
      content: bookmark.sql,
      isUnsaved: false
    };
    setSqlTabs([...sqlTabs, newTab]);
    setActiveTabId(newId);
  };

  const handleEditBookmark = (bookmark: BookmarkedQuery) => {
    console.log('Editing bookmark:', bookmark.name);
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
  };

  const handleCreateBookmark = () => {
    console.log('Creating new bookmark...');
  };

  const handleContextMenuAction = (action: string) => {
    console.log('Context menu action:', action);
    setContextMenu(null);
  };

  // Close context menu on click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onGlobalSearch={handleGlobalSearch}
          onExecuteSQL={handleExecuteSQL}
          onStopExecution={handleStopExecution}
          isExecuting={isExecuting}
        />

        <div className="flex-1 flex overflow-hidden">
          <ConnectionManager
            connections={connections}
            onAddConnection={handleAddConnection}
            onEditConnection={handleEditConnection}
            onDeleteConnection={handleDeleteConnection}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          <DatabaseExplorer
            connectionId="1"
            objects={databaseObjects}
            onSelectObject={handleSelectObject}
            onRefresh={handleRefreshObjects}
          />

          <div className="flex-1 flex flex-col">
            <SQLEditor
              tabs={sqlTabs}
              activeTabId={activeTabId}
              onCreateTab={handleCreateTab}
              onCloseTab={handleCloseTab}
              onSwitchTab={setActiveTabId}
              onUpdateTab={handleUpdateTab}
              onSaveTab={handleSaveTab}
            />

            <QueryResults
              result={queryResult}
              isExecuting={isExecuting}
              error={executionError || undefined}
              onExport={handleExport}
            />
          </div>

          {showBookmarkPanel && (
            <BookmarkPanel
              bookmarks={bookmarks}
              onExecuteBookmark={handleExecuteBookmark}
              onEditBookmark={handleEditBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onCreateBookmark={handleCreateBookmark}
            />
          )}
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type}
            onClose={() => setContextMenu(null)}
            onAction={handleContextMenuAction}
          />
        )}
      </div>
    </div>
  );
}

export default App;