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