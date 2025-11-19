<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper'
import { API_PATH } from '@/composables/_path.service'
import { getAllByPath } from '@/composables/main.service'
import { createAgGridTheme, getGlobalAgGridTheme, setGlobalAgGridTheme } from '@core/index'
import { useConfigStore } from '@core/stores/config'
import { ModuleRegistry } from 'ag-grid-community'
import {
  ClientSideRowModelModule,
  ExcelExportModule,
  MenuModule,
  NumberFilterModule,
  RowGroupingModule,
  TextFilterModule,
  TreeDataModule
} from 'ag-grid-enterprise'
import { AgGridVue } from 'ag-grid-vue3'
import axios from 'axios'
import { onMounted, reactive, ref, watch } from 'vue'
import { VAvatar, VBtn, VCard, VCardText, VCardTitle, VCol, VDivider, VIcon, VRow, VTab, VTabs, VTabsWindow, VTabsWindowItem } from 'vuetify/components'
import TableIgrid from '../component/TableIgrid.vue'
import type { FilterValues } from '../component/types'

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  TextFilterModule,
  NumberFilterModule,
  TreeDataModule,
  RowGroupingModule,
  ExcelExportModule,
])


// AG Grid references
const treeGridRef = ref()
const gridTheme = getGlobalAgGridTheme()
const configStore = useConfigStore()
const gridThemeRef = ref(gridTheme)

// Track selected node
const selectedNodeId = ref<string>('')
const selectedNodeData = ref<any>(null)

// Add type declarations for window
declare global {
  interface Window {
    gridApi: any
    gridColumnApi: any
  }
}

// State management
const rowSelected = ref<any>({
  nama_induk_pointtype: null,
  nama_pointtype: null,
})

const treeData = ref<TreeItem[]>([])
const activeTab = ref('invalid')

// Filter values for detail tables
const invalidFilterValues = ref<FilterValues>({
  page: 1,
  limit: 10,
  kesimpulan: 'INVALID',
})

const validFilterValues = ref<FilterValues>({
  page: 1,
  limit: 10,
  kesimpulan: 'VALID',
})

// Handle tree row selection
const onTreeRowClicked = (event: any) => {
  const selected = event.data
  if (selected) {
    let rowParams: any = {}

    if (selected.children && selected.children.length > 0) {
      // Jika ini adalah parent
      rowParams = {
        nama_induk_pointtype: selected.nama_pointtype,
        nama_pointtype: null,
      }
    } else {
      // Jika ini adalah child
      const parentPointType = selected.parentPointType
      rowParams = {
        nama_induk_pointtype: parentPointType,
        nama_pointtype: selected.nama_pointtype,
      }
    }

    rowSelected.value = rowParams
    
    // Update filter values for detail tables
    invalidFilterValues.value.nama_induk_pointtype = rowParams.nama_induk_pointtype
    invalidFilterValues.value.nama_pointtype = rowParams.nama_pointtype
    validFilterValues.value.nama_induk_pointtype = rowParams.nama_induk_pointtype
    validFilterValues.value.nama_pointtype = rowParams.nama_pointtype
  }
}

// Grid ready handler
const onGridReady = (params: any) => {
  const gridApi = params.api
  const gridColumnApi = params.columnApi
  
  // Store grid APIs in window for debugging
  window.gridApi = gridApi
  window.gridColumnApi = gridColumnApi
  
  // Auto-size columns after data is loaded
  setTimeout(() => {
    gridApi.autoSizeAllColumns(false)
  }, 500)
  
  console.log('✅ AG Grid is ready')
}

// AG Grid configuration
const defaultColDef = ref({
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: false,
  suppressMenu: false,
  flex: 1,
})

// Function to get the path for tree data
const getDataPath = (data: any) => {
  return data.path || []
}

// Tree column definitions - Point Type akan dihandle oleh autoGroupColumnDef
const treeColumns = [
  {
    headerName: 'Jumlah Point',
    field: 'jumlah_point',
    width: 120,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  {
    headerName: 'Jumlah Normal',
    field: 'jumlah_normal',
    width: 120,
    sortable: true,
  },
  {
    headerName: 'Jumlah Gangguan',
    field: 'jumlah_ggn',
    width: 120,
    sortable: true,
  },
  {
    headerName: 'Avability',
    field: 'avability',
    width: 120,
    sortable: true,
    valueFormatter: (p:any) => `${p.value ?? 0}%`,
  },
]

// Grid options untuk tree data
const gridOptions:any = ref({
  treeData: true,
  getDataPath: getDataPath,
  groupDefaultExpanded: 0, // Keep all groups collapsed by default
  autoGroupColumnDef: {
    headerName: 'Point Type',
     field: 'nama_pointtype',
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: true,
      showLeafGroup: true,
    },
    sortable: true,
    filter: 'agTextColumnFilter',
    width: 250,
  },
})


// Detail column definitions
const detailColumns = [
  {
    headerName: 'Point Number',
    field: 'point_number',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Nama Point',
    field: 'nama_pointtype',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'B1 (Lokasi)',
    field: 'path1',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'B2 (Tegangan)',
    field: 'path2',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'B3 (Bay)',
    field: 'path3',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Element',
    field: 'path4',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Info',
    field: 'path5',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Tanggal',
    field: 'datum_2',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Status',
    field: 'status_2',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Durasi',
    field: 'durasi',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Kesimpulan',
    field: 'kesimpulan',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true,
  },
  {
    headerName: 'Keterangan',
    field: 'keterangan',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true,
  },
]

// Role management
const roleActions = reactive({
  view: true,
  create: true,
  update: true,
  delete: true,
})

// Tree data remapping function
interface TreeItem {
  id: string
  nama_pointtype: string
  jumlah_point: number
  jumlah_normal: number
  jumlah_ggn: number
  avability: number
  parentPointType: string | null
  children: TreeItem[]
  path: string[]
}

const remappedTreeJaringanData = (tree: any[]): TreeItem[] => {
  const allNodes: TreeItem[] = []
  
  const processNode = (item: any, currentPath: string[]) => {
    const nodePath = [...currentPath, item.nama_pointtype]
    
    const treeNode: TreeItem = {
      id: item.id_pointtype,
      nama_pointtype: item.nama_pointtype,
      jumlah_point: item.jumlah_point || 0,
      jumlah_normal: item.jumlah_normal || 0,
      jumlah_ggn: item.jumlah_ggn || 0,
      avability: item.avability || 0,
      parentPointType: currentPath.length ? currentPath[currentPath.length - 1] : null,
      path: nodePath,
      children: item.children || []
    }
    
    allNodes.push(treeNode)
    
    // Process children if they exist
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      item.children.forEach((child: any) => {
        processNode(child, nodePath)
      })
    }
  }
  
  // Process all root items
  tree.forEach((item: any) => {
    processNode(item, [])
  })
  
  return allNodes
}


const source = axios.CancelToken.source()

// Load tree data
const loadTreeData = async () => {
  try {
    console.log('🌳 Starting tree data load...')
    console.log('📍 API Endpoint:', API_PATH().master.fasop.gangguan_scada_rekap)
    console.log('🔧 Request params:', { status: '1' })
    
    const req: any = await getAllByPath(API_PATH().master.fasop.gangguan_scada_rekap, { status: '1', page: 1, limit: 10 }, source.token)
    const { results, total } = req
    const dataLength = results ? results.length : 0
    
    console.log('📦 API Response:', req)
    console.log('📊 Results:', results)
    console.log('📈 Total count:', total)
    console.log('📏 Data length:', dataLength)
    
    if (results && dataLength > 0) {
      console.log('🔄 Processing tree data...')
      const remappedData = remappedTreeJaringanData(results)
      console.log('📋 Remapped tree data:', remappedData)
      
      treeData.value = remappedData
      console.log('✅ Tree data loaded successfully. Total items:', treeData.value.length)
    } else {
      console.warn('⚠️ No data received from API')
    }
  } catch (error: any) {
    console.error('❌ Error loading tree data:', error)
    console.error('❌ Error details:', error.response || error.message || error)
  }
}

// Process API response data for detail tables
const handleRespDataApi = (data: any[], page: number, limit: number) => {
  return data.map((item: any, idx: number) => {
    return {
      number: (page - 1) * limit + idx + 1,
      id: item?.id,
      point_number: item?.point_number ?? '-',
      nama_pointtype: item?.nama_pointtype ?? '-',
      path1: item?.path1 ?? '-',
      path2: item?.path2 ?? '-',
      path3: item?.path3 ?? '-',
      path4: item?.path4 ?? '-',
      path5: item?.path5 ?? '-',
      nama_dcc: item?.nama_dcc ?? '-',
      nama_up3: item?.nama_up3 ?? '-',
      datum_2: item?.datum_2 ?? '-',
      status_2: item?.status_2 ?? '-',
      durasi: item?.durasi ?? '-',
      kesimpulan: item?.kesimpulan ?? '-',
      keterangan: item?.keterangan ?? '-',
    }
  })
}

// Export functionality
const exportToExcel = (data: any[], filename: string) => {
  // Create a simple CSV export
  const csvContent = [
    Object.keys(data[0] || {}).join(','),
    ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportTreeData = () => {
  exportToExcel(treeData.value, 'Gangguan_Peralatan_Scada_Tree.csv')
}

// Watch for theme changes
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

// Lifecycle hooks
onMounted(() => {
  const roleAccess: any = ROLE_ACCESS('gangguan-scada')
  const roleAct = {
    view: ROLE_ACTION(roleAccess, 'view'),
    create: ROLE_ACTION(roleAccess, 'create'),
    update: ROLE_ACTION(roleAccess, 'update'),
    delete: ROLE_ACTION(roleAccess, 'delete'),
  }

  Object.assign(roleActions, roleAct)
  loadTreeData()
})


// Also add a watcher to ensure data loads when treeData is empty
watch(
  () => treeData.value.length,
  (newLength, oldLength) => {
    if (newLength === 0 && oldLength === 0) {
      console.log('🔄 Tree data is empty, attempting to reload...')
      // Use setTimeout to avoid infinite loops
      setTimeout(() => {
        if (treeData.value.length === 0) {
          loadTreeData()
        }
      }, 1000)
    }
  }
)
</script>

<template>
  <div class="monitoring-gangguan-scada">
    <!-- Header Card -->
    <VCard class="mb-6">
      <VCardText>
        <VRow class="align-center">
          <VCol cols="12" md="8" class="d-flex align-start">
            <VAvatar size="48" color="primary" class="mr-4 elevation-2">
              <VIcon icon="tabler-alert-triangle" size="28" />
            </VAvatar>
            <div>
              <h2 class="text-h4 font-weight-bold">Monitoring Gangguan SCADA</h2>
              <p class="text-subtitle-1 text-medium-emphasis">
                Pemantauan gangguan peralatan SCADA secara real-time
              </p>
            </div>
          </VCol>
          <VCol cols="12" md="4" class="text-end">
            <VBtn
              color="primary"
              variant="elevated"
              @click="exportTreeData"
              class="mr-2"
            >
              <VIcon icon="tabler-download" class="mr-2" />
              Export Tree
            </VBtn>
            <VBtn
              color="success"
              variant="elevated"
              @click="loadTreeData"
            >
              <VIcon icon="tabler-refresh" class="mr-2" />
              Refresh
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Tree Table Section -->
    <VCard class="mb-6">
      <VCardTitle class="pa-4">
        <VIcon icon="tabler-tree" class="mr-2" />
        Hierarki Gangguan SCADA
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-0">
        <div v-if="treeData.length === 0" class="text-center py-8">
          <VIcon icon="tabler-loader-2" size="48" class="text-disabled mb-4" />
          <p class="text-body-2 text-disabled">Loading tree data...</p>
        </div>
        
    <AgGridVue
  v-else
  ref="treeGridRef"
  style="height: 400px; width: 100%;"
  :theme="gridThemeRef"
  :columnDefs="treeColumns"
  :rowData="treeData"
  :defaultColDef="defaultColDef"
  :gridOptions="gridOptions"
  :sideBar="false"
  @grid-ready="onGridReady"
  @row-clicked="onTreeRowClicked"
/>


      </VCardText>
    </VCard>

    <!-- Detail Tables Section -->
    <VCard v-if="rowSelected.nama_induk_pointtype">
      <VCardTitle class="pa-4">
        <VIcon icon="tabler-list-details" class="mr-2" />
        Detail Gangguan: {{ rowSelected.nama_induk_pointtype }}
        <span v-if="rowSelected.nama_pointtype" class="text-primary">
          - {{ rowSelected.nama_pointtype }}
        </span>
      </VCardTitle>
      <VDivider />

      <!-- Tabs -->
      <VTabs v-model="activeTab" class="ml-4">
        <VTab value="invalid">
          <VIcon icon="tabler-alert-circle" class="mr-2" />
          Gangguan
        </VTab>
        <VTab value="valid">
          <VIcon icon="tabler-circle-check" class="mr-2" />
          Normal
        </VTab>
      </VTabs>

      <VDivider />

      <!-- Tab Content -->
      <VCardText class="pa-0">
        <VTabsWindow v-model="activeTab">
          <VTabsWindowItem value="invalid">
            <TableIgrid
              :column="detailColumns"
              :filterValues="invalidFilterValues"
              :pathService="API_PATH().master.fasop.gangguan_scada"
              :handleRespDataApi="handleRespDataApi"
              grid-height="500px"
            />
          </VTabsWindowItem>

          <VTabsWindowItem value="valid">
            <TableIgrid
              :column="detailColumns"
              :filterValues="validFilterValues"
              :pathService="API_PATH().master.fasop.gangguan_scada"
              :handleRespDataApi="handleRespDataApi"
              grid-height="500px"
            />
          </VTabsWindowItem>
        </VTabsWindow>
      </VCardText>
    </VCard>

    <!-- Empty State when no selection -->
    <VCard v-else>
      <VCardText class="text-center py-8">
        <VIcon icon="tabler-click" size="64" class="text-disabled mb-4" />
        <h3 class="text-h6 mb-2">Pilih Data dari Tabel Hierarki</h3>
        <p class="text-body-2 text-disabled">
          Silakan pilih item dari tabel hierarki di atas untuk melihat detail gangguan
        </p>
      </VCardText>
    </VCard>
  </div>
</template>

<style>
/* AG Grid Tree Styles - Non-scoped untuk global AG Grid components */
.monitoring-gangguan-scada {
  padding: 1rem;
}

/* Tree expand/collapse icons */
.ag-theme-alpine .ag-row-group {
  cursor: pointer;
}

.ag-theme-alpine .ag-row-group-leaf {
  font-weight: normal;
}

.ag-theme-alpine .ag-row-group-indent-1 {
  padding-left: 20px;
}

.ag-theme-alpine .ag-row-group-indent-2 {
  padding-left: 40px;
}

.ag-theme-alpine .ag-row-group-indent-3 {
  padding-left: 60px;
}

.ag-theme-alpine .ag-row-group-indent-4 {
  padding-left: 80px;
}

/* Tree icon styling */
.ag-theme-alpine .ag-icon-tree-open,
.ag-theme-alpine .ag-icon-tree-closed,
.ag-theme-alpine .ag-icon-group-expanded,
.ag-theme-alpine .ag-icon-group-contracted {
  color: #1976d2 !important;
  cursor: pointer !important;
  transition: transform 0.2s ease;
}

.ag-theme-alpine .ag-icon-tree-open:hover,
.ag-theme-alpine .ag-icon-tree-closed:hover,
.ag-theme-alpine .ag-icon-group-expanded:hover,
.ag-theme-alpine .ag-icon-group-contracted:hover {
  color: #1565c0 !important;
  transform: scale(1.1);
}

/* Group cell renderer styles */
.ag-theme-alpine .ag-group-cell-value {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.ag-theme-alpine .ag-group-child-count {
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: normal;
}

/* Tree line styling */
.ag-theme-alpine .ag-row-group-leaf .ag-group-cell-value {
  opacity: 0.8;
}

/* Ensure proper spacing for tree hierarchy */
.ag-theme-alpine .ag-cell-value {
  padding: 4px 8px;
}
</style>

<style scoped>

/* Tree Table Styles */
.tree-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}


.tree-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #e0e0e0;
}

.tree-row:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}



.tree-child-row {
  background: #f8f9fa;
}

.tree-child-row:hover {
  background: #e9ecef;
}

.tree-col-select {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 12px;
}

.tree-col-name {
  padding: 12px;
  flex: 1;
  display: flex;
  align-items: center;
}

.tree-col-jumlah,
.tree-col-normal,
.tree-col-gangguan,
.tree-col-avability {
  padding: 12px;
  min-width: 120px;
  text-align: center;
  font-weight: 500;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.tree-container::-webkit-scrollbar {
  width: 8px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Custom styles for better readability */


.v-tab {
  text-transform: none;
  font-weight: 500;
}

.v-tab.v-tab-item--selected {
  color: #1976d2;
}

/* Radio button custom styles */
:deep(.v-radio) {
  margin: 0;
}

:deep(.v-radio .v-selection-control__wrapper) {
  border-radius: 50%;
}

:deep(.v-radio.v-radio--checked .v-selection-control__wrapper) {
  background-color: #1976d2;
  border-color: #1976d2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .monitoring-gangguan-scada {
    padding: 0.5rem;
  }
  
  .tree-col-jumlah,
  .tree-col-normal,
  .tree-col-gangguan,
  .tree-col-avability {
    min-width: 80px;
    font-size: 0.8rem;
  }
  
  .tree-col-name {
    font-size: 0.9rem;
  }
}
</style>
