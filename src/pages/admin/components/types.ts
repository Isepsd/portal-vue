export interface MenuItem {
  id: string;
  idParent: string;
  display: string;
  name: string;
  path: string;
  icon: string;
  hidden: boolean;
  search: boolean;
  privileges: string[];
  divider: boolean;
  no: number;
  children?: MenuItem[];
  level?: number;
  count?: number;
  root?: boolean;
  index?: number;
}

export interface PrivilegeState {
  [menuName: string]: string[];
}

export interface TreeNodeProps {
  item: MenuItem;
  level: number;
  expanded: boolean;
  selected: boolean;
  allPrivileges: string[];
  privilegesModel: Record<string, string[]>;
  searchQuery: string;
}

export interface SearchFilterProps {
  modelValue: string;
  filterMode: 'all' | 'assigned' | 'unassigned';
}

export interface BulkActionsProps {
  allPrivileges: string[];
  hasChanges: boolean;
}

export interface TreeTableEmits {
  (e: 'toggle', data: { name: string; privileges: string }): void;
  (e: 'toggle-all', data: { name: string; all: boolean; privileges: string[] }): void;
  (e: 'bulk-assign', data: { privilege: string; checked: boolean }): void;
  (e: 'expand-all'): void;
  (e: 'collapse-all'): void;
  (e: 'expand', nodeId: string): void;
}

export interface TreeNodeEmits {
  (e: 'toggle', data: { name: string; privileges: string }): void;
  (e: 'toggle-all', data: { name: string; all: boolean; privileges: string[] }): void;
  (e: 'expand', nodeId: string): void;
}

export interface SearchFilterEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'update:filterMode', value: 'all' | 'assigned' | 'unassigned'): void;
  (e: 'expand-all'): void;
  (e: 'collapse-all'): void;
}

export interface BulkActionsEmits {
  (e: 'bulk-assign', data: { privilege: string; checked: boolean }): void;
  (e: 'reset-changes'): void;
}
