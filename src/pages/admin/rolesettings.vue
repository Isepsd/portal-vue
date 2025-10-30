<script setup lang="ts">
import { stringToJSON } from '@/components/helper/data.helper';
import { MENU } from "@/components/helper/menu.config";
import { initNestedMenu } from '@/components/helper/menu.helper';
import { getAllByPath, getByIdPath, putByPath } from '@/composables/main.service';
import { useAuthStore } from '@/pages/stores/auth';
import { useNavigationStore } from '@/pages/stores/navigation';
import axios from 'axios';
import { union } from "lodash";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TreeTable from './components/TreeTable.vue';
// ambil instance store
const navigationStore = useNavigationStore()
const auth = useAuthStore();
const rolePrivileges:any = auth.roleAccess?.privileges || {};
const route = useRoute();
const router = useRouter();
const id = route.query.id;
const menuPrivileges = ref<any[]>([]);
const dataModel = ref<any>({});
const privilegesModel = ref<any>({});
const loading = ref<boolean>(false);

// Enhanced features state
const searchQuery = ref('');
const filterMode = ref<'all' | 'assigned' | 'unassigned'>('all');
const expandedNodes = ref<Set<string>>(new Set());

// Cancel token global
const source = axios.CancelToken.source();
onBeforeUnmount(() => source.cancel("Component unmounted"));

// Semua privilege unik untuk tabel header
const allPrivileges = computed(() => {
  const privs: string[] = [];
  const traverse = (items: any[]) => {
    items.forEach(i => {
      if (i.privileges) privs.push(...i.privileges);
      if (i.children) traverse(i.children);
    });
  };
  traverse(menuPrivileges.value);
  return Array.from(new Set(privs));
});

// Filtered items based on search and filter mode
const filteredItems = computed(() => {
  let filtered = menuPrivileges.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filterBySearch(filtered, query);
  }

  // Apply privilege filter
  if (filterMode.value !== 'all') {
    filtered = filterByPrivilege(filtered, filterMode.value);
  }

  return filtered;
});

// Toggle single privilege
const toggleSetPrivilegesModel = (priv: any) => {
  const pm = JSON.parse(JSON.stringify(privilegesModel.value));
  if (pm[priv.name]?.includes(priv.privileges)) {
    pm[priv.name] = pm[priv.name].filter((p: any) => p !== priv.privileges);
  } else {
    pm[priv.name] = union(pm[priv.name] ?? [], [priv.privileges]);
  }
  privilegesModel.value = pm;
};

// Toggle all privileges for a menu
const toggleSetAllPrivileges = (payload: any) => {
  privilegesModel.value[payload.name] = payload.all ? payload.privileges : [];
};

// Handle bulk actions
const handleBulkAssign = (data: { privilege: string; checked: boolean }) => {
  menuPrivileges.value.forEach((menu: any) => {
    if (menu.privileges.includes(data.privilege)) {
      toggleSetPrivilegesModel({ name: menu.name, privileges: data.privilege });
    }
  });
};

// Handle expand/collapse
const handleExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
};

const handleExpandAll = () => {
  const allNodeIds = menuPrivileges.value.map((menu: any) => menu.id);
  expandedNodes.value = new Set(allNodeIds);
};

const handleCollapseAll = () => {
  expandedNodes.value.clear();
};

// Check single privilege
const checkPriv = (name: string, privilege: string) =>
  privilegesModel.value[name]?.includes(privilege) ?? false;

// Check if all privileges selected
const checkAllPriv = (name: string, privList: any[]) => {
  return privList.every((val) =>
    privilegesModel.value[name]?.includes(val)
  );
};

// Filter functions
const filterBySearch = (items: any[], query: string): any[] => {
  return items.filter(item => {
    const matchesSearch = item.display.toLowerCase().includes(query) ||
                         item.name.toLowerCase().includes(query);
    
    if (matchesSearch) return true;
    
    // Check children recursively
    if (item.children && item.children.length > 0) {
      return filterBySearch(item.children, query).length > 0;
    }
    
    return false;
  }).map(item => ({
    ...item,
    children: item.children ? filterBySearch(item.children, query) : undefined
  }));
};

const filterByPrivilege = (items: any[], mode: 'assigned' | 'unassigned'): any[] => {
  return items.filter(item => {
    const hasAssignedPrivileges = privilegesModel.value[item.name]?.length > 0;
    
    if (mode === 'assigned' && !hasAssignedPrivileges) return false;
    if (mode === 'unassigned' && hasAssignedPrivileges) return false;
    
    // Check children recursively
    if (item.children && item.children.length > 0) {
      item.children = filterByPrivilege(item.children, mode);
      return item.children.length > 0 || hasAssignedPrivileges;
    }
    
    return true;
  });
};

// Save privileges
const saveChangePrivileges = async () => {
  try {
    loading.value = true

    // 🔹 Simpan perubahan hak akses ke backend
    await putByPath(
      'roles',
      {
        ...dataModel.value,
        privileges: JSON.stringify(privilegesModel.value),
      },
      id,
      source.token
    )
//  const reqUserDetail = await AuthUserDetailService(source.token);
    // auth.setLoggedInUserDetail(reqUserDetail?.data);
const user:any = auth.currentUser.roleId
// console .log ("user",user)
    // 🔹 Ambil roleAccess terbaru dari backend
 const reqRole: any = await getByIdPath('roles', user, source.token);
    const roleData = { ...reqRole?.results, privileges: stringToJSON(reqRole?.results?.privileges) };
    auth.setRoleAccess(roleData);

    // 🔹 Refresh menu navigation dengan rolePrivileges terbaru
    await navigationStore.fetchNavigation()

    alert('✅ Berhasil menyimpan perubahan hak akses')
  } catch (error) {
    console.error('❌ Gagal menyimpan perubahan:', error)
    alert('Terjadi kesalahan saat menyimpan hak akses')
  } finally {
    loading.value = false
  }
}


// Get menu data
const getAllDataMenu = async () => {
  const req: any = await getAllByPath(
    'menu',
    { page: -1, limit: -1 },
    source.token
  );

  const menus = req.results.map((m: any) => ({
    ...m,
    idParent: m.idParent || "",
    privileges: stringToJSON(m.privileges),
  }));

  menuPrivileges.value = initNestedMenu("", [...menus, ...MENU], null);
};

// Get role by id
const getDataById = async () => {
  const req: any = await getByIdPath("roles", id, source.token);
  dataModel.value = req.results;
  privilegesModel.value = stringToJSON(req.results.privileges) || {};
};

// Watch for search query changes
const handleSearchQuery = (query: string) => {
  searchQuery.value = query;
  if (query) {
    // Auto-expand nodes with search results
    handleExpandAll();
  }
};

onMounted(() => {
  getDataById();
  getAllDataMenu();
});
</script>

<template>
  <!-- <div class="role-settings"> -->
    <!-- Header -->
<div class="d-flex justify-content-between align-items-center mb-4" style="gap: 1rem;">
  <!-- Judul Role -->
  <div class="mb-0">Role Settings - {{ dataModel.name || 'New Role' }}</div>

  <!-- Info total -->
  <div class="text-muted d-flex align-items-center" style="gap: 0.5rem;">
    <small>Total Menus: {{ menuPrivileges.length }}</small>
    <span>|</span>
    <small>Total Privileges: {{ allPrivileges.length }}</small>
  </div>
</div>


    <!-- Search and Filter Controls -->
    <div class="mb-4">
      <!-- <SearchFilter
        v-model="searchQuery"
        v-model:filter-mode="filterMode"
        @update:modelValue="handleSearchQuery"
        @expand-all="handleExpandAll"
        @collapse-all="handleCollapseAll"
      /> -->
    </div>

    <!-- Bulk Actions -->
   
      <!-- <BulkActions
        :all-privileges="allPrivileges"
        :has-changes="false"
        @bulk-assign="handleBulkAssign"
      /> -->
  

    <!-- Tree Table -->
    <div class="tree-table-container" :class="{ loading: loading }">
      <TreeTable
        :items="filteredItems"
        :all-privileges="allPrivileges"
        :privileges-model="privilegesModel"
        @toggle="toggleSetPrivilegesModel"
        @toggle-all="toggleSetAllPrivileges"
      />
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 d-flex gap-2 justify-content-end">
      <button 
        @click="saveChangePrivileges" 
        :disabled="loading"
        class="btn btn-primary"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
        <i v-else class="fas fa-save me-2"></i>
        Simpan Perubahan
      </button>
      <button 
        @click="router.back()" 
        class="btn btn-secondary"
      >
        <i class="fas fa-times me-2"></i>
        Batal
      </button>
    </div>
  <!-- </div> -->
</template>

<style scoped>
.role-settings {
  padding: 1rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.tree-table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.tree-table-container.loading {
  opacity: 0.6;
  pointer-events: none;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
  transform: none;
  box-shadow: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .role-settings {
    padding: 0.5rem;
  }
  
  .d-flex {
    flex-direction: column;
  }
  
  .gap-2 {
    gap: 0.5rem;
  }
  
  .btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .role-settings {
    background: #1a2c2b;
    color: #e2e8f0;
  }
  
  .tree-table-container {
    background: #2d3748;
    color: #e2e8f0;
  }
}

/* Loading animation */
.fa-spinner.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Smooth transitions */
.tree-table-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
