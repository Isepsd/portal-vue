<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SearchFilterEmits, SearchFilterProps } from './types';

const props = defineProps<SearchFilterProps>();
const emit = defineEmits<SearchFilterEmits>();

// Local state for search input with debounce
const searchInput = ref(props.modelValue);
const debounceTimer = ref<NodeJS.Timeout>();

// Computed properties
const filterOptions = computed(() => [
  { value: 'all', label: 'All Menus', icon: 'fas fa-list' },
  { value: 'assigned', label: 'Assigned Privileges', icon: 'fas fa-check-circle' },
  { value: 'unassigned', label: 'Unassigned Privileges', icon: 'fas fa-times-circle' }
]);

// Methods
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchInput.value = target.value;
  
  // Debounce search
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  
  debounceTimer.value = setTimeout(() => {
    emit('update:modelValue', searchInput.value);
  }, 300);
};

const handleFilterModeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:filterMode', target.value as 'all' | 'assigned' | 'unassigned');
};

const clearSearch = () => {
  searchInput.value = '';
  emit('update:modelValue', '');
};

const handleExpandAll = () => {
  emit('expand-all');
};

const handleCollapseAll = () => {
  emit('collapse-all');
};
</script>

<template>
  <div class="search-filter">
    <div class="row g-3 align-items-center">
      <!-- Search Input -->
      <div class="col-md-4">
        <div class="input-group">
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
          <input
            type="text"
            class="form-control"
            placeholder="Search menus..."
            :value="searchInput"
            @input="handleSearchInput"
          />
          <button 
            v-if="searchInput"
            class="btn btn-outline-secondary"
            type="button"
            @click="clearSearch"
            title="Clear search"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
<br>
<br>
      <!-- Filter Mode -->
      <div class="col-md-3">
        <select 
          class="form-select"
          :value="filterMode"
          @change="handleFilterModeChange"
        >
          <option 
            v-for="option in filterOptions" 
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Expand/Collapse Actions -->
      <!-- <div class="col-md-5">
        <div class="btn-group" role="group">
          <button 
            class="btn btn-outline-primary"
            type="button"
            @click="handleExpandAll"
            title="Expand all menus"
          >
            <i class="fas fa-expand-alt me-1"></i>
            Expand All
          </button>
          <button 
            class="btn btn-outline-secondary"
            type="button"
            @click="handleCollapseAll"
            title="Collapse all menus"
          >
            <i class="fas fa-compress-alt me-1"></i>
            Collapse All
          </button>
        </div>
      </div> -->
    </div>

    <!-- Search Status -->
    <div v-if="searchInput" class="mt-2">
      <small class="text-muted">
        <i class="fas fa-info-circle me-1"></i>
        Searching for "{{ searchInput }}" - Auto-expanding matching menus
      </small>
    </div>
  </div>
</template>

<style scoped>
.search-filter {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-group .btn {
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Badge for search count */
.search-count {
  background-color: #6c757d;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-filter .row {
    flex-direction: column;
  }
  
  .search-filter .col-md-4,
  .search-filter .col-md-3,
  .search-filter .col-md-5 {
    width: 100%;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-filter {
    background: #dee3eb;
    color: #e2e8f0;
  }
  
  .input-group-text {
    background-color: #4a5568;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .form-control {
    background-color: #4a5568;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .form-control:focus {
    background-color: #4a5568;
    border-color: #63b3ed;
    color: #e2e8f0;
  }
  
  .form-select {
    background-color: #4a5568;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .form-select:focus {
    border-color: #63b3ed;
  }
}

/* Animation for search results */
.search-filter {
  animation: slideDown 0.3s ease-out;
}

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
</style>
