<template>
  <li class="tree-item">
    <div 
      class="tree-row" 
      :class="{ 'tree-row--expanded': expanded, 'tree-row--has-children': hasChildren }"
      @click="toggle"
    >
      <!-- Toggle Icon -->
      <VIcon 
        v-if="hasChildren"
        :icon="expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        size="20"
        class="toggle-icon me-1"
      />
      <div v-else class="toggle-spacer me-1"></div>

      <!-- Menu Icon -->
      <div class="menu-icon-wrapper me-3">
        <VIcon 
          :icon="getMenuIcon(item.icon)"
          :color="getIconColor(item)"
          size="20"
          class="menu-icon"
        />
      </div>

      <!-- Menu Name -->
      <div class="menu-content flex-grow-1">
        <span class="menu-title">{{ item.display }}</span>
        <div v-if="item.path" class="menu-path text-caption text-grey-500">
          {{ item.path }}
        </div>
      </div>

      <!-- Menu Badges -->
      <div class="menu-badges me-2">
        <VChip
          v-for="priv in getActivePrivileges(item.privileges)"
          :key="priv"
          :color="getPrivilegeBadgeColor(priv)"
          size="x-small"
          variant="tonal"
          class="me-1"
        >
          {{ priv.charAt(0).toUpperCase() }}
        </VChip>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <VBtn
          @click.stop="$emit('edit', item)"
          icon
          size="small"
          variant="text"
          color="primary"
          class="action-btn"
        >
          <VIcon icon="mdi-pencil" size="16" />
          <VTooltip activator="parent" location="top">Edit Menu</VTooltip>
        </VBtn>
        
        <VBtn
          @click.stop="$emit('delete', item)"
          icon
          size="small"
          variant="text"
          color="error"
          class="action-btn"
        >
          <VIcon icon="mdi-delete" size="16" />
          <VTooltip activator="parent" location="top">Hapus Menu</VTooltip>
        </VBtn>
      </div>
    </div>

    <!-- Children Container -->
    <VExpandTransition>
      <ul v-show="expanded" v-if="hasChildren" class="tree-children">
        <TreeItem
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @move="$emit('move', $event)"
        />
      </ul>
    </VExpandTransition>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ item: any }>();
defineEmits(["edit", "delete", "move"]);

const expanded = ref(false);

const hasChildren = computed(() => props.item?.children?.length > 0);

const toggle = () => { 
  if (hasChildren.value) {
    expanded.value = !expanded.value;
  }
};

const getMenuIcon = (icon: string) => {
  if (!icon) return 'mdi-folder-outline';
  
  // Handle different icon formats
  if (icon.includes('fa-')) {
    // FontAwesome icons - return a default Material Design icon
    return 'mdi-folder';
  }
  
  return icon;
};

const getIconColor = (item: any) => {
  if (hasChildren.value) return 'primary';
  if (item.icon) return 'success';
  return 'grey';
};

const getActivePrivileges = (privileges: any[]) => {
  if (!privileges) return [];
  return privileges.filter((p: any) => 
    typeof p === 'string' ? p : p.priv
  ).slice(0, 3); // Show max 3 badges
};

const getPrivilegeBadgeColor = (priv: string) => {
  const colors: Record<string, string> = {
    view: 'info',
    create: 'success',
    update: 'warning',
    delete: 'error'
  };
  return colors[priv] || 'grey';
};
</script>

<style scoped>
.tree-item {
  margin: 2px 0;
  animation: fadeInSlide 0.3s ease;
}

.tree-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.tree-row:hover {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-color: #1976d2;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

.tree-row--expanded {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3f4ff 100%);
  border-color: #1976d2;
}

.tree-row--has-children {
  font-weight: 500;
}

.toggle-icon {
  transition: transform 0.2s ease;
  color: #1976d2;
}

.toggle-spacer {
  width: 20px;
}

.menu-icon-wrapper {
  position: relative;
}

.menu-icon {
  transition: all 0.2s ease;
}

.tree-row:hover .menu-icon {
  transform: scale(1.1);
}

.menu-title {
  font-weight: 500;
  color: #333;
}

.menu-path {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tree-row:hover .menu-path {
  opacity: 1;
}

.menu-badges {
  display: flex;
  align-items: center;
  gap: 2px;
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tree-row:hover .actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.tree-children {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #e3f2fd;
  position: relative;
  animation: slideDown 0.3s ease;
}

.tree-children::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #1976d2 0%, transparent 100%);
  opacity: 0.3;
}

/* Animations */
@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

/* Depth-based styling */
.tree-item:nth-child(1) .tree-row {
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
}

.tree-item:nth-child(even) .tree-row {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

/* Focus states */
.tree-row:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .tree-row {
    padding: 10px 12px;
  }
  
  .menu-badges {
    display: none;
  }
  
  .tree-children {
    margin-left: 16px;
    padding-left: 12px;
  }
}
</style>
