<script setup lang="ts">
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog.vue';
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
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
  StatusBarModule,
  TextFilterModule
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';
import axios from 'axios';
import { debounce } from 'lodash';
import { computed, ref, watch } from 'vue';
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
console.log("prmarykey",props.primaryKey)
// 🧩 Register semua modul yang dibutuhkan
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  RowGroupingModule,
  ClipboardModule,
  ExcelExportModule,
  RangeSelectionModule,
  StatusBarModule,
  AdvancedFilterModule,
])

const gridRef = ref()
const loading = ref(false)
const totalData = ref(0)
const totalPages = ref(0)
const rowData = ref<any[]>([])
const internalFilterValues = ref({ ...props.filterValues })

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
    console.log(`✅ Sukses menghapus data dengan ID: ${itemId}`)
    await getData(internalFilterValues.value.page, internalFilterValues.value.limit)
  } catch (err) {
    console.error('❌ Gagal menghapus data:', err)
  } finally {
    loading.value = false
    isDeleteDialogVisible.value = false
  }
}

console.log('editbtn',props.editBtn)
const gridTheme = getGlobalAgGridTheme()
const configStore = useConfigStore()
const gridThemeRef = ref(gridTheme)

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
  for (const key in internalFilterValues.value) {
    if (!(key in newFilters) && key !== "page" && key !== "limit") {
      delete internalFilterValues.value[key];
    }
  }

  // 🔄 Gabungkan filter baru + panggil API
  internalFilterValues.value = {
    ...internalFilterValues.value,
    ...newFilters,
  };

  getData(internalFilterValues.value.page, internalFilterValues.value.limit);
}, 400);

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

// 🧠 Ambil data dari API
const getData = async (page = 1, limit = 10) => {
  console.log('🚀 getData called with page:', page, 'limit:', limit)
  console.log('📋 Current internalFilterValues:', internalFilterValues.value)
  
  loading.value = true
  console.log('⏳ Loading set to TRUE')
  
  try {
    const params = { ...internalFilterValues.value, page, limit }
    console.log('📤 API params:', params)
    
    const req: any = await getAllByPath(props.pathService, params, source.token)
    console.log('📦 Raw API response:', req)
    
    const results = req?.results || req?.data?.results || []
    totalData.value = req?.total || req?.data?.total || results.length
    totalPages.value = Math.ceil(totalData.value / limit)
    
    console.log('📊 Processed results:', results.length)
    console.log('📈 Total data:', totalData.value)
    console.log('📄 Total pages:', totalPages.value)
    
    rowData.value = props.handleRespDataApi(results, page, limit)
    console.log('🗂️ Final rowData:', rowData.value.length, 'items')
  } catch (err) {
    console.error('❌ API Error:', err)
  } finally {
    loading.value = false
    console.log('✅ Loading set to FALSE')
  }
}

const changePage = (page: number) => {
  console.log('🔄 Changing page to:', page, 'Total pages:', totalPages.value)
  if (page < 1 || page > totalPages.value) {
    console.log('❌ Invalid page change:', page)
    return
  }
  internalFilterValues.value.page = page
  getData(page, internalFilterValues.value.limit)
}

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = internalFilterValues.value.page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Generate complete column definitions with No and Action columns
const columnDefs = computed(() => {
  const columns: any[] = []

  // Kolom No
  columns.push({
    headerName: 'No',
    field: 'number',
    width: 80,
    pinned: "left",
    filter: false,
    sortable: false,
  })

  // Kolom Aksi (muncul setelah No)
  if (props.editBtn || props.deleteBtn) {
  columns.push({
    headerName: 'Aksi',
    field: 'action',
    width: 160,
    pinned: "left",
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


// Watch for external filter changes
watch(
  () => props.filterValues,
  (newFilterValues) => {
    internalFilterValues.value = { ...newFilterValues }
    getData(internalFilterValues.value.page, internalFilterValues.value.limit)
  },
  { deep: true }
)

watch(
  () => internalFilterValues.value.limit,
  (newLimit) => {
    internalFilterValues.value.page = 1
    getData(1, newLimit)
  }
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

  // 🔹 Tambahan agar semua kolom rata tengah otomatis
  cellStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  headerClass: 'ag-header-center',
}


// ✅ Tampilkan semua menu utama
const getMainMenuItems = (params: any) => params.defaultItems

onMounted(() => {
  getData(internalFilterValues.value.page, internalFilterValues.value.limit)
})

const handleRefresh = async () => {
  try {
    await getData(
      internalFilterValues.value.page || 1,
      internalFilterValues.value.limit || 10
    )
  } catch (error) {
    console.error('Gagal refresh data:', error)
  }
}

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
  :rowData="rowData"
  :defaultColDef="
   defaultColDef
  "
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

</div>
    <!-- 🟢 Pagination -->
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 pagination-container pt-2"
      v-show="true"
    >
      <div class="d-flex align-items-center gap-1 flex-wrap">
        <button
          class="btn-pagination"
          :disabled="internalFilterValues.page === 1 || loading"
          @click="changePage(internalFilterValues.page - 1)"
        >
          ‹ Prev
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-pagination"
          :class="{ active: p === internalFilterValues.page }"
          :disabled="loading"
          @click="changePage(p)"
        >
          {{ p }}
        </button>

        <button
          class="btn-pagination"
          :disabled="internalFilterValues.page >= totalPages || loading"
          @click="changePage(internalFilterValues.page + 1)"
        >
          Next ›
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <select
          v-model.number="internalFilterValues.limit"
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

.table-wrapper {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden; /* supaya grid dan toolbar menyatu tanpa jarak */

}

/* Toolbar */
.table-toolbar {
  padding: 8px 12px;
  border-bottom: 1px solid #ddd; /* garis pemisah halus */

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

  background: transparent;
}

.btn-outline-secondary:hover {
  background-color: #eee;
}


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
