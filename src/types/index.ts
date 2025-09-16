export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'sqlserver' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  sshTunnel: boolean;
  isConnected: boolean;
  lastConnected?: Date;
}

export interface DatabaseObject {
  name: string;
  type: 'database' | 'table' | 'view' | 'procedure' | 'function';
  children?: DatabaseObject[];
  schema?: string;
  rowCount?: number;
}

export interface SQLTab {
  id: string;
  title: string;
  content: string;
  isUnsaved: boolean;
  connectionId?: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
  hasMore: boolean;
}

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
  length?: number;
}

export interface UserPermission {
  id: string;
  username: string;
  database: string;
  table?: string;
  permissions: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER')[];
  grantOption: boolean;
}

export interface BookmarkedQuery {
  id: string;
  name: string;
  sql: string;
  description?: string;
  tags: string[];
  createdAt: Date;
}

export interface ERDiagramNode {
  id: string;
  tableName: string;
  columns: TableColumn[];
  position: { x: number; y: number };
  foreignKeys: ForeignKeyRelation[];
}

export interface ForeignKeyRelation {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface ERDiagramModel {
  id: string;
  name: string;
  description?: string;
  nodes: ERDiagramNode[];
  connections: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MigrationTask {
  id: string;
  name: string;
  sourceConnection: DatabaseConnection;
  targetConnection: DatabaseConnection;
  tables: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  logs: MigrationLog[];
}

export interface MigrationLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface SQLTemplate {
  id: string;
  name: string;
  description?: string;
  sql: string;
  variables: TemplateVariable[];
  category: string;
  databaseType: 'mysql' | 'postgresql' | 'sqlserver' | 'all';
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: string;
  required: boolean;
  description?: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  sql: string;
  templateId?: string;
  connectionId: string;
  schedule: string; // cron expression
  isActive: boolean;
  nextRun?: Date;
  lastRun?: Date;
  status: 'idle' | 'running' | 'success' | 'failed';
  createdAt: Date;
  logs: TaskLog[];
}

export interface TaskLog {
  id: string;
  timestamp: Date;
  status: 'success' | 'failed';
  duration: number;
  message?: string;
  error?: string;
}

export interface PerformanceMetric {
  id: string;
  connectionId: string;
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  connectionCount: number;
  activeQueries: number;
  locksCount: number;
}

export interface SlowQuery {
  id: string;
  connectionId: string;
  sql: string;
  executionTime: number;
  timestamp: Date;
  database: string;
  user: string;
  executionPlan?: string;
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  type: 'index' | 'rewrite' | 'schema';
  description: string;
  impact: 'low' | 'medium' | 'high';
  sql?: string;
}

export interface DatabaseStats {
  connectionId: string;
  timestamp: Date;
  totalQueries: number;
  slowQueries: number;
  avgExecutionTime: number;
  peakConnections: number;
  indexHitRatio: number;
}