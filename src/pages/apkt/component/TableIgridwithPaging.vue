<script setup lang="ts">
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog.vue';
import { deleteByPath, getAllByPath } from '@/composables/main.service';
import { createAgGridTheme, getGlobalAgGridTheme, setGlobalAgGridTheme } from '@core/index';
import { useConfigStore } from '@core/stores/config';
import { ModuleRegistry } from 'ag-grid-community';
import {
  AdvancedFilterModule,
  ClientSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MenuModule,
  NumberFilterModule,
  PaginationModule,
  RangeSelectionModule,
  RowGroupingModule,
  ServerSideRowModelModule,
  SetFilterModule,
  StatusBarModule,
  TextFilterModule,
  ValidationModule
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import type { FilterValues, HandleRespDataApiFn } from './types';

// Props
interface Props {
  column: any
  filterValues: FilterValues
  pathService: string
  handleRespDataApi: HandleRespDataApiFn
  primaryKey?: string
  editBtn?: boolean
  deleteBtn?: boolean
  onclickEdit?: (item: any) => void

}

const props = withDefaults(defineProps<Props>(), {
  primaryKey: 'id',
  editBtn: false,
  deleteBtn: false,
  onclickEdit: undefined,

})

// 🧩 Register semua modul yang dibutuhkan
ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  ClientSideRowModelModule,
  MenuModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  RowGroupingModule,
  ClipboardModule,
  ExcelExportModule,
  RangeSelectionModule,
  StatusBarModule,
  AdvancedFilterModule,
  ValidationModule, // 🔥 Tambahkan ValidationModule untuk fix error #252
])

const gridRef = ref()
const loading = ref(false)
const totalData = ref(0)
const totalPages = ref(0)
const isGridReady = ref(false)

// 🔥 Store current filter values for use in datasource
const currentFilterValues = ref(props.filterValues || {})

// Dialog state
const isDeleteDialogVisible = ref(false)
const itemToDelete = ref<any>(null)

// Delete handlers
const handleDeleteClick = (item: any) => {
  itemToDelete.value = item
  isDeleteDialogVisible.value = true
}

const confirmDelete = async (itemId: string | number) => {
  if (!itemId) return
  await deleteData(itemId)
}

const cancelDelete = () => {
  itemToDelete.value = null
  isDeleteDialogVisible.value = false
}

const deleteData = async (itemId: string | number) => {
  loading.value = true
  try {
    await deleteByPath(props.pathService, itemId, source.token)
    // Refresh data after delete
    await loadTableData();
  } catch (err) {
    // Error handling without console.log
  } finally {
    loading.value = false
    isDeleteDialogVisible.value = false
  }
}

const gridTheme = getGlobalAgGridTheme()
const configStore = useConfigStore()
const gridThemeRef = ref(gridTheme)

const source = axios.CancelToken.source()

watch(
  () => configStore.theme,
  themeMode => {
    const newAgTheme = createAgGridTheme(themeMode as 'light' | 'dark' | 'system')
    setGlobalAgGridTheme(newAgTheme)
    gridThemeRef.value = newAgTheme
    document.documentElement.style.setProperty('--ag-active-theme', themeMode)
  },
  { immediate: true },
)

// 🔄 Server-side datasource untuk AG Grid
const getServerSideDatasource = () => {
  return {
    getRows: async (params: any) => {
      try {
        const { request } = params;
        const startRow = request.startRow || 0;
        const endRow = request.endRow || 10;
        const filterModel = request.filterModel || {};

        // 🔥 NEW: Get filter values from current stored values
        const filterParams = currentFilterValues.value || {};

        // 🧮 Hitung pageSize dan currentPage dari AG Grid parameters dengan validasi yang lebih baik
        const startRowNum = Number(startRow) || 0;
        const endRowNum = Number(endRow) || 10;
        const rawPageSize = endRowNum - startRowNum;
        const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;

        // Gunakan startRow dari AG Grid untuk menghitung currentPage dengan validasi
        let currentPage = 1;
        if (pageSize > 0 && startRowNum >= 0) {
          currentPage = Math.floor(startRowNum / pageSize) + 1;
        }

        // 🧾 Bangun parameter API - Gunakan filter values dari current stored values
        const apiParams: Record<string, any> = {
          ...filterParams,
        };

        // 🔍 Tambahkan filter dari AG Grid (kalau ada)
        const newFilters: Record<string, any> = {};
        for (const key in filterModel) {
          const filter = filterModel[key];
          if (filter?.filter !== undefined && filter?.filter !== '') {
            newFilters[key] = filter.filter;
          } else if (filter?.filterType === 'text' && filter?.type) {
            newFilters[key] = filter.filter;
          } else if (filter?.filterType === 'number' && filter?.filter) {
            newFilters[key] = filter.filter;
          } else if (filter?.filterType === 'set' && filter?.values) {
            newFilters[key] = filter.values.join(',');
          }
        }

        Object.assign(apiParams, newFilters);

        // ✅ Gunakan currentPage dan pageSize dari AG Grid dengan validasi tambahan
        apiParams.page = currentPage;
        apiParams.limit = pageSize;

        console.log('📡 ServerSide Params:', apiParams); // Debug sementara

        // 🚀 Panggil API
        const req: any = await getAllByPath(props.pathService, apiParams, source.token);

        // 📦 Ambil hasil API
        const results = req?.results || req?.data?.results || [];
        const totalCount = req?.total || req?.data?.total || results.length;

        // 🔄 Update state untuk total data (hanya total, jangan sentuh pagination)
        totalData.value = totalCount;
        totalPages.value = Math.ceil(totalCount / pageSize);

        // 🧩 Proses hasil API sebelum dikirim ke grid
        const processedData = props.handleRespDataApi(results, currentPage, pageSize);

        // ✅ Kirim ke AG Grid
        params.success({
          rowData: processedData,
          rowCount: totalCount,
        })
      } catch (error) {
        console.error('❌ Server-side datasource error:', error);
        params.fail();
      }
    },
  };
};

// 🔄 Data loading function untuk refresh
const loadTableData = async () => {
  if (gridRef.value?.api) {
    gridRef.value.api.refreshServerSide({ purge: true });
  }
};

// Generate complete column definitions with No and Action columns
const columnDefs = computed(() => {
  const columns: any[] = []

  // ✅ Kolom No dengan valueGetter untuk server-side pagination
  columns.push({
    headerName: 'No',
    valueGetter: (params: any) => {
      // 🔥 FIX: Gunakan pendekatan yang lebih sederhana dan reliable
      // Coba dapatkan startRow dari berbagai sumber
      let startRow = 0;
      
      // Method 1: Coba dari pagination API
      if (params.api?.paginationGetCurrentPage && params.api?.paginationGetPageSize) {
        const currentPage = params.api.paginationGetCurrentPage();
        const pageSize = params.api.paginationGetPageSize();
        startRow = currentPage * pageSize;
      }
      // Method 2: Fallback ke rowIndex dengan asumsi
      else {
        // Ini adalah fallback - tidak sempurna tapi lebih aman
        const pageSize = params.api?.paginationGetPageSize() || 10;
        startRow = Math.floor((params.node.rowIndex || 0) / pageSize) * pageSize;
      }
      
      return startRow + (params.node.rowIndex || 0) + 1;
    },
    width: 80,
    filter: false,
    sortable: false,
  })

  // Kolom Aksi (muncul setelah No)
  if (props.editBtn || props.deleteBtn) {
  columns.push({
    headerName: 'Aksi',
    field: 'action',
    width: 160,
    filter: false,
    sortable: false,
    suppressHtmlEscape: true,
    cellRenderer: (params: any) => {
      const id = params.data?.[props.primaryKey] || params.data?.id
      const buttons: string[] = []

      if (props.editBtn) {
        buttons.push(`
          <button 
            class="btn-action btn-edit" 
            title="Edit Data" 
            data-id="${id}">
            <i class="fa fa-pen"></i> Edit
          </button>
        `)
      }

      if (props.deleteBtn) {
        buttons.push(`
          <button 
            class="btn-action btn-delete" 
            title="Hapus Data" 
            data-id="${id}">
            <i class="fa fa-trash"></i> Hapus
          </button>
        `)
      }

      return `
        <div class="ag-action-container">
          ${buttons.join('')}
        </div>
      `
    },
  })
}

  // Tambahkan kolom sisanya
  columns.push(...props.column)

  return columns
})

// Watch for external filter changes - refresh grid when filters change
watch(
  () => props.filterValues,
  (newFilterValues) => {
    console.log("ada filter", props.filterValues)
    // 🔥 UPDATE: Update current filter values and refresh
    currentFilterValues.value = { ...newFilterValues }
    loadTableData()
  },
  { deep: true }
)

const onCellClicked = (params: any) => {
  const target = params.event.target.closest("button");
  if (!target) return;

  const id = target.getAttribute("data-id");
  
  // Find the row data
  const rowDataItem = params.data;
  
  if (target.classList.contains("btn-edit") && props.onclickEdit && rowDataItem) {
    props.onclickEdit(rowDataItem);
  } else if (target.classList.contains("btn-delete") && rowDataItem) {
    handleDeleteClick(rowDataItem);
  }
};

// ⚙️ Default column setting
const defaultColDef: any = {
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressMenu: false,
  menuTabs: ['filterMenuTab', 'generalMenuTab'],
  floatingFilterComponentParams: {
    suppressFilterButton: true,
  },

  // 🔹 Header class untuk center alignment
  headerClass: 'ag-header-center',
}

// ✅ Tampilkan semua menu utama
const getMainMenuItems = (params: any) => params.defaultItems

// 🧭 Tombol refresh handler
const handleRefresh = () => {
  loadTableData(); // Load fresh data
}

// 🔄 Model updated handler (called after data load) - HANYA update total data
const onModelUpdated = (params: any) => {
  if (!params.api) return;
  
  // Hanya update total data, jangan sentuh pagination state
  const totalCount = params.api.getDisplayedRowCount();
  totalData.value = totalCount;
};

// 🚀 Grid ready handler - Using correct AG Grid Vue3 API
const onGridReady = (params: any) => {
  gridRef.value = params.api;
  isGridReady.value = true;
  
  console.log("✅ Grid ready!");
  
  // Set server-side datasource for server-side model - Use correct method
  const datasource = getServerSideDatasource();
  
  // Try multiple approaches to set datasource
  try {
    if (params.api.setServerSideDatasource) {
      params.api.setServerSideDatasource(datasource);
    } else if (params.api.setGridOption) {
      params.api.setGridOption('serverSideDatasource', datasource);
    } else {
      console.error('❌ setServerSideDatasource method not available');
    }
  } catch (error) {
    console.error('❌ Error setting datasource:', error);
  }
  
  console.log("✅ Server-side datasource attached!");
};

onMounted(() => {
  console.log("🚀 Component mounted, waiting for grid ready...");
})

</script>

<template>
  <div>
    <div class="loading-bar-container" v-show="loading">
      <div class="loading-bar"></div>
    </div>
<!-- 🔲 Table Wrapper -->
<div class="table-wrapper">
  <!-- 🔄 Toolbar -->
  <div class="table-toolbar d-flex justify-content-between align-items-center">
    <div>
      <!-- (opsional) Judul tabel -->
    </div>

    <div class="d-flex gap-2">
      <button
        class="btn btn-outline-secondary btn-sm"
        :disabled="loading"
        @click="handleRefresh"
      >
        <i class="fa fa-sync-alt me-1"></i> Refresh
      </button>
    </div>
  </div>


  <AgGridVue
  ref="gridRef"
  style="height: 600px; width: 100%"
  
  :theme="gridThemeRef"
  :columnDefs="columnDefs"
  :defaultColDef="defaultColDef"
  :getMainMenuItems="getMainMenuItems"
  :gridOptions="{
  rowModelType: 'serverSide',
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 25, 50, 100],

  cacheBlockSize: 10,            // ⬅️ WAJIB
  blockLoadDebounceMillis: 100,   // opsional, biar halus

  rowSelection: 'single',
  suppressHorizontalScroll: false,
  suppressMenuHide: false,
  domLayout: 'normal',
  animateRows: false,
  suppressCellFocus: true,
  suppressRowClickSelection: true,
  serverSideDatasource: getServerSideDatasource()
}"

  :sideBar="false"
  @cellClicked="onCellClicked"
  @gridReady="onGridReady"
  @modelUpdated="onModelUpdated"
/>

</div>

    <!-- 🟢 Total Data Summary -->
    <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
      <h6 class="fw-bold text-tosca mb-0">Total Data</h6>
      <div class="data-summary text-end">
        <span class="fw-semibold text-muted">{{ totalData.toLocaleString() }} Data</span>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model:isDialogVisible="isDeleteDialogVisible"
      :itemData="itemToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
/* 🔹 Center semua header kolom biasa */
:deep(.ag-header-cell-label) {
  justify-content: center !important;
  text-align: center !important;
}

/* 🔹 Center semua group header (termasuk "Mapping SCADA") */
:deep(.ag-header-group-cell-label) {
  justify-content: center !important;
  text-align: center !important;
  width: 100%;
  display: flex;
}

/* (Opsional) agar teksnya tidak kepotong */
:deep(.ag-header-group-text) {
  width: 100%;
  text-align: center;
}
/* Edit Button */


/* Delete Button */
.btn-delete {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
}
.text-tosca {
  color: #009688;
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
.table-wrapper {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden; /* supaya grid dan toolbar menyatu tanpa jarak */
  background-color: #fff;
}

/* Toolbar */
.table-toolbar {
  padding: 8px 12px;
  border-bottom: 1px solid #ddd; /* garis pemisah halus */
  background-color: #f9f9f9;
}

/* Tombol kecil */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-sm {
  font-size: 0.8rem;
  padding: 4px 8px;
}

.btn-outline-secondary {
  border: 1px solid #ccc;
  color: #555;
  background: transparent;
}

.btn-outline-secondary:hover {
  background-color: #eee;
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

/* Action buttons styling */
.ag-action-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}


.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* Tombol Edit */
.btn-edit {
  background: linear-gradient(135deg, #4caf50, #81c784);
}

.btn-edit:hover {
  background: linear-gradient(135deg, #388e3c, #66bb6a);
  transform: translateY(-1px);
}

/* Tombol Delete */
.btn-delete {
  background: linear-gradient(135deg, #e53935, #ef5350);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #c62828, #e57373);
  transform: translateY(-1px);
}

/* Ikon Font Awesome (gunakan <i class="fa ...">) */
.btn-action i {
  font-size: 14px;
}

</style>
