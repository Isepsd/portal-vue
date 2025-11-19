<script setup lang="ts">
import NameAvatarRenderer from '@/components/NameAvatarRenderer.vue';
import { createAgGridTheme, getGlobalAgGridTheme, setGlobalAgGridTheme } from '@core/index';
import { useConfigStore } from '@core/stores/config';
import { ModuleRegistry } from 'ag-grid-community';
// ✅ Import module AG Grid terbaru (Enterprise + Community)
import {
  AdvancedFilterModule,
  ClientSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridChartsModule,
  MenuModule, // 🟢 Tambahkan ini
  NumberFilterModule,
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
  StatusBarModule,
  TextFilterModule, // 🟢 Tambahkan ini
} from 'ag-grid-enterprise';

import { AgGridVue } from 'ag-grid-vue3';
import axios from 'axios';
import { debounce } from 'lodash';
import { computed, onMounted, ref, watch } from 'vue';

// 🧩 Register semua modul yang dibutuhkan
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
  SetFilterModule,
  TextFilterModule,     // 🟢 penting untuk floating text filter
  NumberFilterModule,   // (opsional)
  RowGroupingModule,
  ClipboardModule,
  ExcelExportModule,
  RangeSelectionModule,
  StatusBarModule,
  GridChartsModule,
  AdvancedFilterModule,
])


const gridRef = ref()
const loading = ref(false)
const totalData = ref(0)
const totalPages = ref(0)
const rowData = ref<any[]>([])
const router = useRouter();

const filterValues:any = ref({
  page: 1,
  limit: 10,

})
const gridTheme = getGlobalAgGridTheme()
const configStore = useConfigStore()
const gridThemeRef = ref(gridTheme) // bikin reactive theme

// 🟢 API Service
const pathService = API_PATH().admin.user
const source = axios.CancelToken.source()
// 🟢 Handler ketika filter (corong) berubah


const onFilterChanged = debounce((params: any) => {
  const api = params.api;
  const filterModel = api.getFilterModel();

  // 🧩 Ambil semua nilai filter aktif
  const newFilters: Record<string, any> = {};

  // Ambil nilai dari semua kolom aktif
  for (const key in filterModel) {
    const val = filterModel[key]?.filter;
    if (val !== undefined && val !== "") {
      newFilters[key] = val;
    }
  }

  // 🧠 Bersihkan filter lama yang sudah tidak ada di filterModel
  for (const key in filterValues.value) {
    if (!(key in newFilters) && key !== "page" && key !== "limit") {
      delete filterValues.value[key];
    }
  }

  // 🔄 Gabungkan filter baru + panggil API
  filterValues.value = {
    ...filterValues.value,
    ...newFilters,
  };

  getData(filterValues.value.page, filterValues.value.limit);
}, 400);


watch(
  () => configStore.theme,
  themeMode => {
    // buat theme baru untuk AG Grid
   const newAgTheme = createAgGridTheme(themeMode as 'light' | 'dark' | 'system')

    setGlobalAgGridTheme(newAgTheme)
    gridThemeRef.value = newAgTheme

    // optional: CSS var supaya smooth transition
    document.documentElement.style.setProperty('--ag-active-theme', themeMode)
  },
  { immediate: true },
)
// 🧱 Kolom AG Grid
const columnDefs = ref([
  { headerName: 'No', field: 'number', width: 40, filter: false },

  {
    headerName: 'Nama',
    field: 'fullname',
    cellRenderer: NameAvatarRenderer,
    width: 250,
    filter: 'agTextColumnFilter',
  },

  { headerName: 'Email',width: 300, field: 'email', flex: 1 },
  { headerName: 'Level', field: 'level', flex: 1 },
  { headerName: 'Role', field: 'role', flex: 1 },
  { headerName: 'Unit Kerja', field: 'unit', flex: 1 },
  { headerName: 'Status', field: 'status', flex: 1 },

  {
    headerName: 'Aksi',
    field: 'actions',
    width: 180,
    filter: false,
    sortable: false,
    cellRenderer: (params:any) => {
      const row = params.data
      return `
        <div style="display:flex; gap:6px;">
          <button class="btn-action btn-edit" data-id="${row.id}">Edit</button>
          
          <button class="btn-action btn-delete" data-id="${row.id}">Delete</button>
        </div>
      `;
    },
  },
]);


// 🧠 Handler response data
const handleRespDataApi = (data: any[], page: number, limit: number) =>
  data.map((item: any, idx: number) => ({
    id: item.id, // 💥 WAJIB!
    number: (page - 1) * limit + idx + 1,
 
    fullname: item?.fullname,
    username: item?.username,
    avatar: item?.avatar,
    phone: item?.phone,
    email: item?.email,
    jabatan: item?.jabatan?.nama,
    hak_akses: item?.role?.name,
    status: item?.status,
    
        role: item?.role,
        level: item?.level,
        unit: item?.unit,
        url_dashboard: item?.url_dashboard,

  }))

// 🧠 Ambil data dari API
const getData = async (page = 1, limit = 10) => {
  loading.value = true
  try {
    const params = { ...filterValues.value, page, limit }
    const req: any = await getAllByPath(pathService, params, source.token)
    const results = req?.results || req?.data?.results || []
    totalData.value = req?.total || req?.data?.total || results.length
    totalPages.value = Math.ceil(totalData.value / limit)
    rowData.value = handleRespDataApi(results, page, limit)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}


const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  filterValues.value.page = page
  getData(page, filterValues.value.limit)
}

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = filterValues.value.page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch(
  () => filterValues.value.limit,
  (newLimit) => {
    filterValues.value.page = 1
    getData(1, newLimit)
  }
)

onMounted(() => getData(filterValues.value.page, filterValues.value.limit))

// ⚙️ Default column setting
const defaultColDef: any = {
  sortable: true,
  resizable: true,
  flex: 1,
  filter: 'agTextColumnFilter', // ✅ harus string filter type, bukan boolean
  floatingFilter: true,          // ✅ aktifkan floating filter
  suppressMenu: false,
  menuTabs: ['filterMenuTab', 'generalMenuTab'],
  floatingFilterComponentParams: {
    suppressFilterButton: true,
  },
}
const onCellClicked = (params: any) => {
  const target = params.event.target.closest("button");
  if (!target) return;

  const id = target.getAttribute("data-id");
  if (!id) return;

  if (target.classList.contains("btn-edit")) {
    console.log("Edit:", id);
    return;
  }

if (target.classList.contains("btn-privilege")) {
    // ✅ Arahkan ke halaman Role Settings menggunakan NAME
   router.push({ 
  name: 'admin-rolesettings',
  query: { id },
});

    return;
  }

  if (target.classList.contains("btn-delete")) {
    console.log("Delete:", id);
    return;
  }
};

// ✅ Tampilkan semua menu utama
const getMainMenuItems = (params: any) => params.defaultItems
</script>

<template>

  <div>
    <div class="loading-bar-container" v-show="loading">
      <div class="loading-bar"></div>
    </div>

    <!-- 🟢 AG GRID -->
    <AgGridVue
      ref="gridRef"
      style="width: 100%; height: auto;"
        :domLayout="'autoHeight'"

          :theme="gridThemeRef"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :defaultColDef="defaultColDef"
      :getMainMenuItems="getMainMenuItems"
      :gridOptions="{
        rowSelection: 'single',
        suppressHorizontalScroll: false,
        suppressMenuHide: false,
      }"
      
      :sideBar="false"
       @filterChanged="onFilterChanged" 
        @cellClicked="onCellClicked"
    />

    <!-- 🟢 Pagination -->
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 pagination-container pt-2"
      v-show="true"
    >
      <div class="d-flex align-items-center gap-1 flex-wrap">
        <button
          class="btn-pagination"
          :disabled="filterValues.page === 1 || loading"
          @click="changePage(filterValues.page - 1)"
        >
          ‹ Prev
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-pagination"
          :class="{ active: p === filterValues.page }"
          :disabled="loading"
          @click="changePage(p)"
        >
          {{ p }}
        </button>

        <button
          class="btn-pagination"
          :disabled="filterValues.page >= totalPages || loading"
          @click="changePage(filterValues.page + 1)"
        >
          Next ›
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <select
          v-model.number="filterValues.limit"
          class="form-select form-select-sm limit-select"
          :disabled="loading"
        >
          <option v-for="s in [10, 20, 50, 100, 1000]" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap mb-2 border-bottom pb-2">
        <h6 class="fw-bold text-tosca mb-0">Total Data</h6>
        <div class="data-summary text-end">
          <span class="fw-semibold text-muted">{{ totalData.toLocaleString() }} Data</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-tosca {
  color: #009688;
}
.pagination-container {
  border-top: 1px solid #dee2e6;
}
.btn-pagination {
  background-color: #fff;
  border: 1px solid #009688;
  color: #009688;
  font-size: 0.85rem;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.btn-pagination:hover:not(:disabled) {
  background-color: #26a69a;
  color: #fff;
  transform: translateY(-1px);
}
.btn-pagination.active {
  background-color: #009688;
  color: white;
  font-weight: 600;
}
.btn-pagination:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8f8f8;
  color: #aaa;
}
.limit-select {
  border: 1px solid #009688;
  color: #009688;
  border-radius: 6px;
  padding: 3px 6px;
}
.limit-select:focus {
  border-color: #26a69a;
  box-shadow: 0 0 0 0.2rem rgba(0, 150, 136, 0.25);
}
.data-summary {
  font-size: 0.9rem;
  color: #555;
}

/* 🔹 Loading bar style */
.loading-bar-container {
  height: 4px;
  width: 100%;
  background-color: #e0f2f1;
  overflow: hidden;
  position: relative;
  border-radius: 2px;
  margin-bottom: 6px;
}
.loading-bar {
  position: absolute;
  width: 40%;
  height: 100%;
  background-color: #009688;
  animation: loading-bar-move 1.2s ease-in-out infinite;
  border-radius: 2px;
}
:deep(.btn-action) {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

:deep(.btn-edit) { background: #4caf50; color: white; }
:deep(.btn-privilege) { background: #2196f3; color: white; }
:deep(.btn-delete) { background: #f44336; color: white; }

@keyframes loading-bar-move {
  0% {
    left: -40%;
  }
  50% {
    left: 60%;
  }
  100% {
    left: 100%;
  }
}
</style>
