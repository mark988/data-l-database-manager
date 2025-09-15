import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConnectionManager } from './components/ConnectionManager';
import { ConnectionDialog } from './components/ConnectionDialog';
import { ConnectionProgress } from './components/ConnectionProgress';
import { BookmarkDialog } from './components/BookmarkDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ExportProgress } from './components/ExportProgress';
import { BackupRestoreDialog } from './components/BackupRestoreDialog';
import { ToastContainer } from './components/Toast';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { SQLEditor } from './components/SQLEditor';
import { QueryResults } from './components/QueryResults';
import { BookmarkPanel } from './components/BookmarkPanel';
import { ContextMenu } from './components/ContextMenu';
import { DatabaseConnection, DatabaseObject, SQLTab, QueryResult, BookmarkedQuery } from './types';
import { TableDesignerDialog } from './components/TableDesignerDialog';
import { ConfirmationDialog } from './components/ConfirmationDialog';

function App() {
  // Theme state with localStorage and system preference detection
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('dataL-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
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
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [showConnectionProgress, setShowConnectionProgress] = useState(false);
  const [connectingConnection, setConnectingConnection] = useState<DatabaseConnection | null>(null);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkedQuery | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json' | null>(null);
  const [showBackupRestoreDialog, setShowBackupRestoreDialog] = useState(false);
  const [backupRestoreMode, setBackupRestoreMode] = useState<'backup' | 'restore'>('backup');
  const [showTableDesigner, setShowTableDesigner] = useState(false);
  const [selectedObjectForAction, setSelectedObjectForAction] = useState<DatabaseObject | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationDialogConfig, setConfirmationDialogConfig] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
  const [isConnectionManagerCollapsed, setIsConnectionManagerCollapsed] = useState(false);
  const [isBookmarkPanelCollapsed, setIsBookmarkPanelCollapsed] = useState(false);


  // Connection handlers
  const handleAddConnection = () => {
    setEditingConnection(null);
    setShowConnectionDialog(true);
  };

  const handleEditConnection = (connection: DatabaseConnection) => {
    setEditingConnection(connection);
    setShowConnectionDialog(true);
  };

  const handleSaveConnection = (connectionData: Omit<DatabaseConnection, 'id' | 'isConnected' | 'lastConnected'>) => {
    if (editingConnection) {
      // 编辑现有连接
      setConnections(connections.map(c => 
        c.id === editingConnection.id 
          ? { ...c, ...connectionData }
          : c
      ));
    } else {
      // 添加新连接
      const newConnection: DatabaseConnection = {
        ...connectionData,
        id: Date.now().toString(),
        isConnected: false
      };
      setConnections([...connections, newConnection]);
    }
    setShowConnectionDialog(false);
    setEditingConnection(null);
  };

  const handleCloseConnectionDialog = () => {
    setShowConnectionDialog(false);
    setEditingConnection(null);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const handleConnect = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      setConnectingConnection(connection);
      setShowConnectionProgress(true);
    }
  };

  const handleDisconnect = (connectionId: string) => {
    setConnections(connections.map(c => 
      c.id === connectionId 
        ? { ...c, isConnected: false }
        : c
    ));
  };

  const handleConnectionComplete = (success: boolean) => {
    if (success && connectingConnection) {
      setConnections(connections.map(c => 
        c.id === connectingConnection.id 
          ? { ...c, isConnected: true, lastConnected: new Date() }
          : c
      ));
    }
  };

  const handleCloseConnectionProgress = () => {
    setShowConnectionProgress(false);
    setConnectingConnection(null);
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
    if (!query.trim()) return;
    
    // 搜索数据库对象
    const searchResults = databaseObjects.flatMap(db => 
      db.children?.filter(obj => 
        obj.name.toLowerCase().includes(query.toLowerCase())
      ) || []
    );

    // 搜索书签
    const bookmarkResults = bookmarks.filter(bookmark =>
      bookmark.name.toLowerCase().includes(query.toLowerCase()) ||
      bookmark.sql.toLowerCase().includes(query.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(query.toLowerCase())
    );

    // 显示搜索结果
    const event = new CustomEvent('show-toast', {
      detail: { 
        message: `找到 ${searchResults.length} 个数据库对象，${bookmarkResults.length} 个书签`, 
        type: 'info' 
      }
    });
    window.dispatchEvent(event);

    console.log('Search results:', { objects: searchResults, bookmarks: bookmarkResults });
  };

  const handleSelectObject = (object: DatabaseObject) => {
    console.log('Selected object:', object.name);
  };

  const handleRefreshObjects = () => {
    console.log('Refreshing database objects...');
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    setExportFormat(format);
    setShowExportProgress(true);
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
    setEditingBookmark(bookmark);
    setShowBookmarkDialog(true);
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    const event = new CustomEvent('show-toast', {
      detail: { message: '书签已删除', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleCreateBookmark = () => {
    const activeTab = sqlTabs.find(tab => tab.id === activeTabId);
    setEditingBookmark(null);
    setShowBookmarkDialog(true);
  };

  const handleSaveBookmark = (bookmarkData: Omit<BookmarkedQuery, 'id' | 'createdAt'>) => {
    if (editingBookmark) {
      // 编辑现有书签
      setBookmarks(bookmarks.map(b => 
        b.id === editingBookmark.id 
          ? { ...b, ...bookmarkData }
          : b
      ));
      const event = new CustomEvent('show-toast', {
        detail: { message: '书签已更新', type: 'success' }
      });
      window.dispatchEvent(event);
    } else {
      // 添加新书签
      const newBookmark: BookmarkedQuery = {
        ...bookmarkData,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      setBookmarks([...bookmarks, newBookmark]);
      const event = new CustomEvent('show-toast', {
        detail: { message: '书签已保存', type: 'success' }
      });
      window.dispatchEvent(event);
    }
    setShowBookmarkDialog(false);
    setEditingBookmark(null);
  };

  const handleCloseBookmarkDialog = () => {
    setShowBookmarkDialog(false);
    setEditingBookmark(null);
  };

  const handleContextMenuAction = (action: string, object: DatabaseObject) => {
    console.log('Context menu action:', action, object);
    setSelectedObjectForAction(object);
    if (action === 'create-table' || action === 'modify-table') {
      setShowTableDesigner(true);
    } else if (action === 'delete-table') {
      setConfirmationDialogConfig({
        title: '删除表',
        message: `确定要删除表 "${object.name}"? 此操作不可撤销。`,
        onConfirm: () => {
          const sql = `DROP TABLE "${object.name}";`;
          const newId = Date.now().toString();
          const newTab: SQLTab = {
            id: newId,
            title: `删除表 - ${object.name}`,
            content: sql,
            isUnsaved: true,
          };
          setSqlTabs([...sqlTabs, newTab]);
          setActiveTabId(newId);
        }
      });
      setShowConfirmationDialog(true);
    } else if (action === 'truncate-table') {
      setConfirmationDialogConfig({
        title: '清空数据',
        message: `确定要清空表 "${object.name}" 中的所有数据? 此操作不可撤销。`,
        onConfirm: () => {
          const sql = `TRUNCATE TABLE "${object.name}";`;
          const newId = Date.now().toString();
          const newTab: SQLTab = {
            id: newId,
            title: `清空表 - ${object.name}`,
            content: sql,
            isUnsaved: true,
          };
          setSqlTabs([...sqlTabs, newTab]);
          setActiveTabId(newId);
        }
      });
      setShowConfirmationDialog(true);
    }
    setContextMenu(null);
  };

  // 新增处理函数
  const handleShowSettings = () => {
    setShowSettingsDialog(true);
  };

  const handleSaveCurrentTab = () => {
    const activeTab = sqlTabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      handleSaveTab(activeTabId);
      const event = new CustomEvent('show-toast', {
        detail: { message: '查询已保存', type: 'success' }
      });
      window.dispatchEvent(event);
    }
  };

  const handleExportComplete = (success: boolean) => {
    if (success) {
      const event = new CustomEvent('show-toast', {
        detail: { message: '导出成功', type: 'success' }
      });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent('show-toast', {
        detail: { message: '导出失败', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const handleCloseExportProgress = () => {
    setShowExportProgress(false);
    setExportFormat(null);
  };

  const handleShowBackup = () => {
    setBackupRestoreMode('backup');
    setShowBackupRestoreDialog(true);
  };

  const handleShowRestore = () => {
    setBackupRestoreMode('restore');
    setShowBackupRestoreDialog(true);
  };

  const handleCloseBackupRestore = () => {
    setShowBackupRestoreDialog(false);
  };

  // Theme management
  const handleToggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('dataL-theme', newTheme ? 'dark' : 'light');
    
    // Show toast notification
    const event = new CustomEvent('show-toast', {
      detail: { 
        message: `已切换到${newTheme ? '深色' : '浅色'}模式`, 
        type: 'info' 
      }
    });
    window.dispatchEvent(event);
  };

  // Close context menu on click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Theme initialization and system preference monitoring
  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('dataL-theme');
      // Only auto-switch if user hasn't manually set a preference
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onGlobalSearch={handleGlobalSearch}
          onExecuteSQL={handleExecuteSQL}
          onStopExecution={handleStopExecution}
          isExecuting={isExecuting}
          onShowSettings={handleShowSettings}
          onSaveCurrentTab={handleSaveCurrentTab}
          onCreateBookmark={handleCreateBookmark}
          onShowBackup={handleShowBackup}
          onShowRestore={handleShowRestore}
        />

        <div className="flex-1 flex overflow-hidden">
          <ConnectionManager
            connections={connections}
            onAddConnection={handleAddConnection}
            onEditConnection={handleEditConnection}
            onDeleteConnection={handleDeleteConnection}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isCollapsed={isConnectionManagerCollapsed}
            onToggleCollapse={() => setIsConnectionManagerCollapsed(!isConnectionManagerCollapsed)}
          />

          <DatabaseExplorer
            connectionId="1"
            objects={databaseObjects}
            onSelectObject={handleSelectObject}
            onRefresh={handleRefreshObjects}
            onAction={handleContextMenuAction}
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

          <BookmarkPanel
            bookmarks={bookmarks}
            onExecuteBookmark={handleExecuteBookmark}
            onEditBookmark={handleEditBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            onCreateBookmark={handleCreateBookmark}
            isCollapsed={isBookmarkPanelCollapsed}
            onToggleCollapse={() => setIsBookmarkPanelCollapsed(!isBookmarkPanelCollapsed)}
          />
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

        <ConnectionDialog
          isOpen={showConnectionDialog}
          onClose={handleCloseConnectionDialog}
          onSave={handleSaveConnection}
          editingConnection={editingConnection}
        />

        <ConnectionProgress
          isOpen={showConnectionProgress}
          connection={connectingConnection}
          onClose={handleCloseConnectionProgress}
          onComplete={handleConnectionComplete}
        />

        <BookmarkDialog
          isOpen={showBookmarkDialog}
          onClose={handleCloseBookmarkDialog}
          onSave={handleSaveBookmark}
          editingBookmark={editingBookmark}
          currentSQL={sqlTabs.find(tab => tab.id === activeTabId)?.content || ''}
        />

        <SettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        <ExportProgress
          isOpen={showExportProgress}
          format={exportFormat}
          onClose={handleCloseExportProgress}
          onComplete={handleExportComplete}
        />

        <BackupRestoreDialog
          isOpen={showBackupRestoreDialog}
          onClose={handleCloseBackupRestore}
          connections={connections}
          mode={backupRestoreMode}
        />

        <TableDesignerDialog
          isOpen={showTableDesigner}
          onClose={() => {
            setShowTableDesigner(false);
            setSelectedObjectForAction(null);
          }}
          onSave={(sql) => {
            const newId = Date.now().toString();
            const newTab: SQLTab = {
              id: newId,
              title: `修改表 - ${selectedObjectForAction?.name}`,
              content: sql,
              isUnsaved: true,
            };
            setSqlTabs([...sqlTabs, newTab]);
            setActiveTabId(newId);
            setShowTableDesigner(false);
            setSelectedObjectForAction(null);
          }}
          table={selectedObjectForAction}
        />

        {showConfirmationDialog && confirmationDialogConfig && (
          <ConfirmationDialog
            isOpen={showConfirmationDialog}
            onClose={() => setShowConfirmationDialog(false)}
            onConfirm={confirmationDialogConfig.onConfirm}
            title={confirmationDialogConfig.title}
            message={confirmationDialogConfig.message}
          />
        )}

        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
