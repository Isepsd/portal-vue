<script setup lang="ts">
import { computed } from 'vue';
import type { MenuItem } from './types';

interface Props {
  item: MenuItem;
  level: number;
  expanded: boolean;
  selected: boolean;
  allPrivileges: string[];
  privilegesModel: Record<string, string[]>;
  searchQuery: string;
}

interface Emits {
  (e: 'toggle', data: { name: string; privileges: string }): void;
  (e: 'toggle-all', data: { name: string; all: boolean; privileges: string[] }): void;
  (e: 'expand', nodeId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed properties
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0;
});

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false;
  const query = props.searchQuery.toLowerCase();
  return props.item.display.toLowerCase().includes(query) || 
         props.item.name.toLowerCase().includes(query);
});

const expandIcon = computed(() => {
  return props.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
});

const indentStyle = computed(() => {
  return {
    paddingLeft: `${props.level * 24 + (hasChildren.value ? 0 : 24)}px`
  };
});

const treeLineStyle = computed(() => {
  if (props.level === 0) return {};
  
  return {
    borderLeft: '1px solid #dee2e6',
    marginLeft: `${(props.level - 1) * 24}px`
  };
});

// Methods
const toggleExpansion = () => {
  if (hasChildren.value) {
    emit('expand', props.item.id);
  }
};

const handleToggle = (privilege: string) => {
  emit('toggle', { name: props.item.name, privileges: privilege });
};

const handleToggleAll = () => {
  const allChecked = checkAllPriv(props.item.name, props.item.privileges);
  emit('toggle-all', { 
    name: props.item.name, 
    all: !allChecked, 
    privileges: props.item.privileges 
  });
};

const checkPriv = (name: string, privilege: string): boolean => {
  return props.privilegesModel[name]?.includes(privilege) ?? false;
};

const checkAllPriv = (name: string, privList: string[]): boolean => {
  if (privList.length === 0) return false;
  return privList.every(val => checkPriv(name, val));
};

const highlightText = (text: string): string => {
  if (!props.searchQuery || !isHighlighted.value) return text;
  
  const query = props.searchQuery.toLowerCase();
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
</script>

<template>
  <tr class="tree-node" :class="{ 'highlighted': isHighlighted }">
    <!-- Menu Column -->
    <td class="tree-node-cell" :style="indentStyle">
      <div class="d-flex align-items-center">
        <!-- Expand/Collapse Icon -->
        <button 
          v-if="hasChildren"
          @click="toggleExpansion"
          class="btn btn-sm btn-link p-0 me-2 expand-btn"
          :aria-expanded="expanded"
          :aria-label="expanded ? 'Collapse' : 'Expand'"
        >
          <i :class="expandIcon" class="text-muted"></i>
        </button>
        <span v-else class="expand-placeholder me-2"></span>
        
        <!-- Tree Icon -->
        <i v-if="item.icon" :class="item.icon" class="me-2 text-muted"></i>
        
        <!-- Menu Name -->
        <span class="menu-name" v-html="highlightText(item.display)"></span>
        
        <!-- Badge for children count -->
        <span 
          v-if="hasChildren" 
          class="badge bg-secondary ms-2"
          :title="`${item.children?.length} child menus`"
        >
          {{ item.children?.length }}
        </span>
      </div>
    </td>

    <!-- Privilege Columns -->
    <td 
      v-for="privilege in allPrivileges" 
      :key="privilege"
      class="privilege-cell text-center"
    >
      <div class="form-check form-check-inline">
        <input
          v-if="item.privileges.includes(privilege)"
          type="checkbox"
          class="form-check-input"
          :checked="checkPriv(item.name, privilege)"
          @change="handleToggle(privilege)"
          :id="`${item.id}-${privilege}`"
        />
        <span v-else class="text-muted">—</span>
      </div>
    </td>

    <!-- All Column -->
    <td class="all-cell text-center">
      <input
        v-if="item.privileges.length > 0"
        type="checkbox"
        class="form-check-input"
        :checked="checkAllPriv(item.name, item.privileges)"
        @change="handleToggleAll"
        :indeterminate="
          item.privileges.some(p => checkPriv(item.name, p)) && 
          !checkAllPriv(item.name, item.privileges)
        "
      />
      <span v-else class="text-muted">—</span>
    </td>
  </tr>

  <!-- Tree Line Visual -->
  <tr v-if="level > 0" class="tree-line-row">
    <td colspan="100%" class="tree-line-cell p-0" :style="treeLineStyle">
      <div class="tree-line-visual"></div>
    </td>
  </tr>

  <!-- Child Nodes -->
  <template v-if="hasChildren && expanded">
    <TreeNode
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :level="level + 1"
      :expanded="false"
      :selected="false"
      :all-privileges="allPrivileges"
      :privileges-model="privilegesModel"
      :search-query="searchQuery"
      @toggle="$emit('toggle', $event)"
      @toggle-all="$emit('toggle-all', $event)"
      @expand="$emit('expand', $event)"
    />
  </template>
</template>

<style scoped>
.tree-node {
  transition: background-color 0.2s ease;
}

.tree-node:hover {
  background-color: #f8f9fa;
}

.tree-node.highlighted {
  background-color: #fff3cd;
}

.tree-node-cell {
  vertical-align: middle;
  position: relative;
}

.expand-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.expand-btn:hover {
  background-color: #e9ecef;
}

.expand-placeholder {
  width: 20px;
  display: inline-block;
}

.menu-name {
  font-weight: 500;
  flex: 1;
}

.privilege-cell {
  vertical-align: middle;
  width: 100px;
}

.all-cell {
  vertical-align: middle;
  width: 80px;
}

.form-check-input {
  cursor: pointer;
}

.form-check-input:indeterminate {
  background-color: #6c757d;
  border-color: #6c757d;
}

.tree-line-row {
  height: 1px;
}

.tree-line-cell {
  position: relative;
}

.tree-line-visual {
  height: 1px;
  background: linear-gradient(to right, #dee2e6, transparent);
}

/* Highlight styling */
:deep(mark) {
  background-color: #fff3cd;
  padding: 1px 2px;
  border-radius: 2px;
}

/* Badge styling */
.badge {
  font-size: 0.7em;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .menu-name {
    font-size: 0.875rem;
  }
  
  .expand-btn {
    width: 16px;
    height: 16px;
  }
  
  .badge {
    font-size: 0.6em;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tree-node:hover {
    background-color: #343a40;
  }
  
  .tree-node.highlighted {
    background-color: #664d03;
  }
  
  .expand-btn:hover {
    background-color: #495057;
  }
  
  :deep(mark) {
    background-color: #664d03;
    color: #fff;
  }
}

/* Animation for expand/collapse */
.tree-row-enter-active,
.tree-row-leave-active {
  transition: all 0.3s ease;
}

.tree-row-enter-from,
.tree-row-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
