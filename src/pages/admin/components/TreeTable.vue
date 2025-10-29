<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MenuItem } from './types';

interface Props {
  items: MenuItem[];
  allPrivileges: string[];
  privilegesModel: Record<string, string[]>;
}

interface Emits {
  (e: 'toggle', data: { name: string; privileges: string }): void;
  (e: 'toggle-all', data: { name: string; all: boolean; privileges: string[] }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// State for expanded nodes
const expandedNodes = ref<Set<string>>(new Set());

// Computed properties
const flatItems = computed(() => {
  const result: Array<{ item: MenuItem; level: number; parentId?: string }> = [];
  
  const flatten = (items: MenuItem[], level: number = 0, parentId?: string) => {
    items.forEach(item => {
      result.push({ item, level, parentId });
      if (item.children && item.children.length > 0) {
        flatten(item.children, level + 1, item.id);
      }
    });
  };
  
  flatten(props.items);
  return result;
});

// Methods
const toggleExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
};

const isExpanded = (nodeId: string) => {
  return expandedNodes.value.has(nodeId);
};

const hasChildren = (item: MenuItem) => {
  return item.children && item.children.length > 0;
};

const checkPriv = (name: string, privilege: string): boolean => {
  return props.privilegesModel[name]?.includes(privilege) ?? false;
};

const checkAllPriv = (name: string, privList: string[]): boolean => {
  if (privList.length === 0) return false;
  return privList.every(val => checkPriv(name, val));
};

const handleToggle = (data: { name: string; privileges: string }) => {
  emit('toggle', data);
};

const handleToggleAll = (data: { name: string; all: boolean; privileges: string[] }) => {
  emit('toggle-all', data);
};

// Check if item should be shown (based on parent expansion)
const shouldShow = (item: MenuItem, level: number): boolean => {
  if (level === 0) return true;
  
  // Find parent in flat items
  const parentIndex = flatItems.value.findIndex(
    flat => flat.item.children?.some((child: MenuItem) => child.id === item.id)
  );
  
  if (parentIndex === -1) return true;
  
  const parent = flatItems.value[parentIndex];
  return isExpanded(parent.item.id);
};

// Get tree indentation and lines
const getTreeStyle = (item: MenuItem, level: number) => {
  const indent = level * 24;
  return {
    paddingLeft: `${indent}px`,
    position: 'relative' as const
  };
};

const getTreeLines = (level: number) => {
  if (level === 0) return [];
  
  const lines = [];
  for (let i = 0; i < level; i++) {
    lines.push({
      left: i * 24 + 12,
      height: '100%' as const
    });
  }
  return lines;
};

// Toggle all privileges for item
const toggleAllPrivilegesForItem = (item: MenuItem) => {
  const allPrivsForItem = item.privileges;
  const currentPrivs = props.privilegesModel[item.name] || [];
  
  if (allPrivsForItem.every(priv => currentPrivs.includes(priv))) {
    // Deselect all
    allPrivsForItem.forEach(priv => {
      handleToggle({ name: item.name, privileges: priv });
    });
  } else {
    // Select all
    allPrivsForItem.forEach(priv => {
      if (!currentPrivs.includes(priv)) {
        handleToggle({ name: item.name, privileges: priv });
      }
    });
  }
};

// Check if all privileges are selected for item
const isAllSelectedForItem = (item: MenuItem): boolean => {
  const allPrivsForItem = item.privileges;
  const currentPrivs = props.privilegesModel[item.name] || [];
  return allPrivsForItem.length > 0 && allPrivsForItem.every(priv => currentPrivs.includes(priv));
};
</script>

<template>
  <div class="tree-table-wrapper">
    <table class="table table-bordered table-hover tree-table">
      <thead class="table-light">
        <tr>
          <th class="menu-column">Menu</th>
          <th class="privilege-column text-center">Privileges</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="{ item, level } in flatItems" :key="item.id">
          <tr 
            v-if="shouldShow(item, level)"
            class="tree-row"
            :class="{ 
              'parent-row': hasChildren(item),
              'child-row': level > 0,
              'expanded': hasChildren(item) && isExpanded(item.id)
            }"
          >
            <!-- Menu Column -->
            <td class="menu-cell">
              <div class="menu-content" :style="getTreeStyle(item, level) as any">
                <!-- Tree Lines for hierarchy visualization -->
                <div class="tree-lines">
                  <div 
                    v-for="(line, index) in getTreeLines(level)" 
                    :key="index"
                    class="tree-line"
                    :style="{ left: `${line.left}px` } as any"
                  ></div>
                </div>
                
                <!-- Expand/Collapse Button -->
                <button 
                  v-if="hasChildren(item)"
                  @click="toggleExpand(item.id)"
                  class="expand-btn"
                  :aria-expanded="isExpanded(item.id)"
                  title="Expand/Collapse"
                >
                  <i 
                    class="fas" 
                    :class="isExpanded(item.id) ? 'fa-chevron-down' : 'fa-chevron-right'"
                  ></i>
                </button>
                <span v-else class="tree-node-dot" title="Leaf node"></span>
                
                <!-- Icon -->
                <i v-if="item.icon" :class="item.icon" class="menu-icon"></i>
                
                <!-- Menu Name -->
                <span class="menu-name">{{ item.display }}</span>
                
                <!-- Children Count Badge -->
                <span 
                  v-if="hasChildren(item)" 
                  class="badge bg-secondary ms-2"
                  :title="`${item.children?.length} child items`"
                >
                  {{ item.children?.length }}
                </span>
              </div>
            </td>

            <!-- Privileges Column (Single Column) -->
            <td class="privilege-cell">
              <div class="privileges-container">
                <div class="privileges-header">
                  <span class="privileges-title">Available Privileges ({{ item.privileges.length }})</span>
                  <button 
                    v-if="item.privileges.length > 0"
                    @click="toggleAllPrivilegesForItem(item)"
                    class="btn-select-all"
                    :class="{ 'selected': isAllSelectedForItem(item) }"
                    :title="isAllSelectedForItem(item) ? 'Deselect All' : 'Select All'"
                  >
                    <i class="fas" :class="isAllSelectedForItem(item) ? 'fa-check-square' : 'fa-square'"></i>
                    All
                  </button>
                </div>
                
                <div class="privileges-list">
                  <label 
                    v-for="privilege in item.privileges" 
                    :key="privilege"
                    class="privilege-item"
                    :class="{ 'selected': checkPriv(item.name, privilege) }"
                  >
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="checkPriv(item.name, privilege)"
                      @change="handleToggle({ name: item.name, privileges: privilege })"
                    />
                    <span class="privilege-label">{{ privilege }}</span>
                  </label>
                </div>
              </div>
            </td>
          </tr>
        </template>
        
        <!-- Empty State -->
        <tr v-if="items.length === 0">
          <td colspan="2" class="text-center py-4">
            <div class="empty-state">
              <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <p class="text-muted">No menu items available</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tree-table-wrapper {
  background: rgb(211, 206, 206);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 70vh;
  width: auto;
  min-width: 600px;
}

.tree-table {
  margin: 0;
  font-size: 0.875rem;
  width: 100%;
  table-layout: auto;
}

.tree-table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
  color: #000000;
}

.menu-column {
  min-width: 300px;
  max-width: 400px;
  width: auto;
  position: relative;
}

.privilege-column {
  min-width: 400px;
  width: auto;
  max-width: none;
}

.tree-row {
  transition: all 0.3s ease;
  position: relative;
  color: #000000;
}

.tree-row:hover {
  background-color: #f8f9fa;
}

.parent-row {
  font-weight: 600;
  background: linear-gradient(90deg, #f8f9fa 0%, transparent 100%);
  color: #000000;
}

.child-row {
  font-size: 0.9em;
  color: #000000;
}

.child-row.expanded {
  background-color: #f0f8ff;
}

.menu-cell {
  vertical-align: middle;
  color: #000000;
}

.menu-content {
  display: flex;
  align-items: center;
  position: relative;
  padding: 8px 0;
  min-height: 40px;
  color: #000000;
}

/* Tree Lines */
.tree-lines {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.tree-line {
  position: absolute;
  top: 0;
  width: 1px;
  background-color: #dee2e6;
  height: 100%;
}

.tree-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 12px;
  height: 1px;
  background-color: #dee2e6;
}

/* Expand/Collapse Button */
.expand-btn {
  background: none;
  border: 1px solid #000000;
  padding: 0;
  margin-right: 0.5rem;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s ease;
  z-index: 2;
  position: relative;
  color: #000000;
}

.expand-btn:hover {
  background-color: #e9ecef;
  border-color: #007bff;
  transform: scale(1.1);
  color: #000000;
}

.tree-node-dot {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  position: relative;
  z-index: 2;
}

.tree-node-dot::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background-color: #000000;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.tree-node-dot:hover::before {
  background-color: #007bff;
  width: 8px;
  height: 8px;
}

.menu-icon {
  margin-right: 0.5rem;
  color: #000000;
  font-size: 1em;
}

.menu-name {
  flex: 1;
  font-weight: 500;
  color: #000000;
}

.privilege-cell {
  vertical-align: top;
  padding: 12px 8px;
  color: #000000;
}

.privileges-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.privileges-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.privileges-title {
  font-weight: 600;
  color: #000000;
  font-size: 0.9em;
}

.btn-select-all {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #000000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-select-all:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.btn-select-all.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.privileges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.privilege-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.privilege-item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.privilege-item.selected {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.privilege-item input[type="checkbox"] {
  margin: 0;
}

.privilege-label {
  font-size: 0.85em;
  font-weight: 500;
}

.form-check-input {
  cursor: pointer;
  transform: scale(1.1);
}

.badge {
  font-size: 0.7em;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background-color: #000000;
  color: #ffffff;
}

.empty-state {
  padding: 2rem;
}

.text-muted {
  color: #000000 !important;
}

/* Animation for expand/collapse */
.expand-btn i {
  transition: transform 0.3s ease;
  font-size: 0.75em;
  color: #000000;
}

.expand-btn[aria-expanded="true"] i {
  transform: rotate(0deg);
}

.expand-btn[aria-expanded="false"] i {
  transform: rotate(-90deg);
}

/* Enhanced tree visual */
.tree-row.child-row {
  border-left: 3px solid #e9ecef;
  margin-left: 1px;
}

.tree-row.child-row:hover {
  border-left-color: #007bff;
  background-color: #f0f8ff;
}

.tree-row.parent-row {
  border-left: 3px solid #007bff;
}

.tree-row.expanded {
  background-color: #e7f3ff;
}

/* Tree indentation visual */
.menu-content::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #007bff, transparent);
  opacity: 0.3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tree-table {
    font-size: 0.75rem;
  }
  
  .menu-column {
    min-width: 250px;
  }
  
  .privilege-column {
    min-width: 300px;
  }
  
  .menu-content {
    padding: 6px 0;
    min-height: 35px;
  }
  
  .expand-btn {
    width: 18px;
    height: 18px;
  }
  
  .privileges-list {
    flex-direction: column;
    gap: 4px;
  }
}

/* Focus styles for accessibility */
.expand-btn:focus,
.form-check-input:focus,
.btn-select-all:focus,
.privilege-item:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Smooth animations */
.tree-row {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Enhanced hover effects */
.tree-row:hover .expand-btn {
  transform: scale(1.1) rotate(5deg);
}

.tree-row:hover .tree-node-dot::before {
  transform: translate(-50%, -50%) scale(1.3);
}

/* Ensure table scrolls properly */
.tree-table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tree-table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tree-table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tree-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* For Firefox */
.tree-table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}
</style>
