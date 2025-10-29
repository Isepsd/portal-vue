<script setup lang="ts">
import { computed } from 'vue';
import type { BulkActionsEmits, BulkActionsProps } from './types';

const props = defineProps<BulkActionsProps>();
const emit = defineEmits<BulkActionsEmits>();

// Computed properties
const bulkActionOptions = computed(() => [
  { 
    value: 'select-all', 
    label: 'Select All', 
    icon: 'fas fa-check-square',
    description: 'Select all menus'
  },
  { 
    value: 'deselect-all', 
    label: 'Deselect All', 
    icon: 'fas fa-square',
    description: 'Deselect all menus'
  },
  { 
    value: 'invert-selection', 
    label: 'Invert Selection', 
    icon: 'fas fa-exchange-alt',
    description: 'Invert current selection'
  }
]);

const statistics = computed(() => {
  const totalMenus = props.allPrivileges.length;
  const selectedPrivileges = props.allPrivileges.filter(priv => {
    // This is a simplified check - in real implementation, 
    // you'd check if this privilege is assigned to any menu
    return false; // TODO: Implement actual logic
  });
  
  return {
    total: totalMenus,
    selected: selectedPrivileges.length,
    percentage: totalMenus > 0 ? Math.round((selectedPrivileges.length / totalMenus) * 100) : 0
  };
});

// Methods
const handleBulkAction = (action: string) => {
  switch (action) {
    case 'select-all':
      props.allPrivileges.forEach(privilege => {
        emit('bulk-assign', { privilege, checked: true });
      });
      break;
    case 'deselect-all':
      props.allPrivileges.forEach(privilege => {
        emit('bulk-assign', { privilege, checked: false });
      });
      break;
    case 'invert-selection':
      props.allPrivileges.forEach(privilege => {
        // This is a simplified logic - implement based on your needs
        const currentState = false; // TODO: Get actual state
        emit('bulk-assign', { privilege, checked: !currentState });
      });
      break;
  }
};

const handleResetChanges = () => {
  emit('reset-changes');
};

const handlePrivilegeBulkAction = (privilege: string, checked: boolean) => {
  emit('bulk-assign', { privilege, checked });
};
</script>

<template>
  <div class="bulk-actions">
    <div class="row g-3 align-items-center">
      <!-- Statistics -->
      <div class="col-md-3">
        <div class="statistics-card">
          <div class="stat-item">
            <span class="stat-label">Total Privileges:</span>
            <span class="stat-value">{{ statistics.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Selected:</span>
            <span class="stat-value">{{ statistics.selected }}</span>
          </div>
          <div class="progress mt-2" style="height: 4px;">
            <div 
              class="progress-bar" 
              :style="{ width: `${statistics.percentage}%` }"
              :class="statistics.percentage === 100 ? 'bg-success' : 'bg-primary'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-md-6">
        <div class="btn-group" role="group">
          <button 
            v-for="action in bulkActionOptions"
            :key="action.value"
            class="btn btn-outline-primary"
            type="button"
            @click="handleBulkAction(action.value)"
            :title="action.description"
          >
            <i :class="action.icon" class="me-1"></i>
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Reset Changes -->
      <div class="col-md-3">
        <button 
          v-if="hasChanges"
          class="btn btn-outline-warning w-100"
          type="button"
          @click="handleResetChanges"
          title="Reset all changes"
        >
          <i class="fas fa-undo me-1"></i>
          Reset Changes
        </button>
      </div>
    </div>

    <!-- Privilege-specific Bulk Actions -->
    <div class="mt-3">
      <h6 class="text-muted mb-2">Quick Privilege Actions:</h6>
      <div class="privilege-actions">
        <button 
          v-for="privilege in allPrivileges"
          :key="privilege"
          class="btn btn-sm btn-outline-secondary me-2 mb-2"
          type="button"
          @click="handlePrivilegeBulkAction(privilege, true)"
          :title="`Assign ${privilege} to all applicable menus`"
        >
          <i class="fas fa-plus me-1"></i>
          {{ privilege }}
        </button>
      </div>
    </div>

    <!-- Changes Indicator -->
    <div v-if="hasChanges" class="mt-3">
      <div class="alert alert-info d-flex align-items-center" role="alert">
        <i class="fas fa-info-circle me-2"></i>
        <div class="flex-grow-1">
          <strong>Unsaved Changes:</strong> You have made changes to privileges. 
          Click "Save" to apply changes or "Reset Changes" to discard them.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bulk-actions {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.statistics-card {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.progress-bar {
  transition: width 0.3s ease;
}

.btn-group .btn {
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.privilege-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.privilege-actions .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.alert {
  margin-bottom: 0;
  animation: slideIn 0.3s ease-out;
}

/* Badge for changes count */
.changes-badge {
  background-color: #dc3545;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  margin-left: 0.25rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bulk-actions .row {
    flex-direction: column;
  }
  
  .bulk-actions .col-md-3,
  .bulk-actions .col-md-6 {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
    font-size: 0.875rem;
  }
  
  .privilege-actions {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .bulk-actions {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .statistics-card {
    background: #4a5568;
    border-color: #4a5568;
  }
  
  .stat-label {
    color: #a0aec0;
  }
  
  .stat-value {
    color: #e2e8f0;
  }
  
  .alert-info {
    background-color: #2c5282;
    border-color: #2c5282;
    color: #bee3f8;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-actions {
  animation: slideIn 0.3s ease-out;
}

/* Hover effects for privilege buttons */
.privilege-actions .btn:hover {
  transform: scale(1.05);
}

/* Pulse animation for unsaved changes */
.alert-info {
  position: relative;
  overflow: hidden;
}

.alert-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
