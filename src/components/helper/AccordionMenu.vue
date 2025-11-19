<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import TreeItem from "./TreeItem.vue";

const props = defineProps<{ menu: any[] }>();
defineEmits(["edit", "delete", "move"]);

const searchQuery = ref("");

const filteredMenu = computed(() => {
  if (!searchQuery.value) return props.menu;
  
  return props.menu.filter(item => 
    item.display.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.path?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const getTotalMenus = () => {
  const countChildren = (items: any[]) => {
    let count = items.length;
    items.forEach(item => {
      if (item.children) {
        count += countChildren(item.children);
      }
    });
    return count;
  };
  return countChildren(props.menu);
};

const getParentMenus = () => {
  return props.menu.filter(item => !item.idParent).length;
};

const getChildMenus = () => {
  return getTotalMenus() - getParentMenus();
};

const expandAll = () => {
  // This would need to be implemented with proper state management
  console.log('Expand all menus');
};

const collapseAll = () => {
  // This would need to be implemented with proper state management
  console.log('Collapse all menus');
};
</script>

<template>
  <div class="accordion-menu">
    <!-- Search/Filter Bar -->
    <div class="search-bar mb-4" v-if="menu.length > 0">
      <VTextField
        v-model="searchQuery"
        placeholder="Cari menu..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="search-field"
      />
    </div>

    <!-- Menu Statistics -->
    <div class="menu-stats mb-4" v-if="menu.length > 0">
      <div class="d-flex gap-3 flex-wrap">
        <VChip
          size="small"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-folder"
        >
          {{ getTotalMenus() }} Menu
        </VChip>
        <VChip
          size="small"
          variant="tonal"
          color="success"
          prepend-icon="mdi-account-tree"
        >
          {{ getParentMenus() }} Induk
        </VChip>
        <VChip
          size="small"
          variant="tonal"
          color="info"
          prepend-icon="mdi-subdirectory-arrow-right"
        >
          {{ getChildMenus() }} Anak
        </VChip>
      </div>
    </div>

    <!-- Tree List -->
    <div class="tree-container">
      <ul class="tree-list">
        <TransitionGroup name="menu-item" tag="div">
          <TreeItem
            v-for="item in filteredMenu"
            :key="item.id"
            :item="item"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @move="$emit('move', $event)"
          />
        </TransitionGroup>
      </ul>

      <!-- No Results -->
      <div v-if="searchQuery && filteredMenu.length === 0" class="no-results text-center py-8">
        <VIcon icon="mdi-magnify-close" size="48" class="text-grey-400 mb-3" />
        <h3 class="text-h6 font-weight-medium text-grey-700 mb-2">Tidak Ada Hasil</h3>
        <p class="text-body-2 text-grey-500">Tidak ada menu yang cocok dengan "{{ searchQuery }}"</p>
        <VBtn
          variant="text"
          color="primary"
          @click="searchQuery = ''"
          class="mt-2"
        >
          Hapus Pencarian
        </VBtn>
      </div>
    </div>

    <!-- Quick Actions -->
    <!-- <div class="quick-actions mt-4" v-if="menu.length > 0">
      <VDivider class="mb-3" />
      <div class="d-flex justify-center gap-2">
        <VBtn
          size="small"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-chevron-double-down"
          @click="expandAll"
        >
          Expand All
        </VBtn>
        <VBtn
          size="small"
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-chevron-double-up"
          @click="collapseAll"
        >
          Collapse All
        </VBtn>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.accordion-menu {
 
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar {
  animation: slideDown 0.3s ease;
}

.search-field {
  border-radius: 8px;
}

.menu-stats {
  animation: slideDown 0.4s ease;
}

.tree-container {
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.tree-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.no-results {
  animation: fadeIn 0.3s ease;
}

.quick-actions {
  animation: slideUp 0.3s ease;
}

/* Custom scrollbar */
.tree-container::-webkit-scrollbar {
  width: 6px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Menu item transitions */
.menu-item-enter-active,
.menu-item-leave-active {
  transition: all 0.3s ease;
}

.menu-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.menu-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.menu-item-move {
  transition: transform 0.3s ease;
}

/* Hover effects */
:deep(.v-chip:hover) {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .accordion-menu {
    padding: 12px;
  }
  
  .menu-stats {
    display: none;
  }
  
  .quick-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
