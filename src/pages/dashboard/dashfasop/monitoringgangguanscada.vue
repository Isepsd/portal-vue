<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper'
import { API_PATH } from '@/composables/_path.service'
import { getAllByPath } from '@/composables/main.service'
import axios from 'axios'
import { onMounted, reactive, ref } from 'vue'
import { VAvatar, VBtn, VCard, VCardText, VCardTitle, VCol, VDivider, VIcon, VRow, VTab, VTabs, VTabsWindow, VTabsWindowItem } from 'vuetify/components'
import TableIgrid from '../component/TableIgrid.vue'
import type { FilterValues } from '../component/types'

// Track expanded nodes
const expandedNodes = ref<Set<string>>(new Set())
const selectedNodeId = ref<string>('')
const allExpanded = ref<boolean>(false)

const toggleExpand = (itemId: string) => {
  if (expandedNodes.value.has(itemId)) {
    expandedNodes.value.delete(itemId)
  } else {
    expandedNodes.value.add(itemId)
  }
}

const toggleAllExpand = () => {
  allExpanded.value = !allExpanded.value
  if (allExpanded.value) {
    // Expand all nodes
    treeData.value.forEach(item => {
      expandedNodes.value.add(item.id)
    })
  } else {
    // Collapse all nodes
    expandedNodes.value.clear()
  }
}

const isExpanded = (itemId: string) => {
  return expandedNodes.value.has(itemId)
}

const selectNode = (node: TreeItem) => {
  selectedNodeId.value = node.id
  onTreeRowClicked({ data: node })
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

// Tree column definitions
const treeColumns = [
  {
    headerName: 'Nama Point',
    field: 'nama_pointtype',
    width: 300,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: 'agGroupCellRenderer',
  },
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
    filter: 'agNumberColumnFilter',
  },
  {
    headerName: 'Jumlah Gangguan',
    field: 'jumlah_ggn',
    width: 120,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  {
    headerName: 'Avability',
    field: 'avability',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
]

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


const remappedTreeJaringanData = (tree: any[], parent: any = null, level = 0): TreeItem[] => {
  if (!tree || !Array.isArray(tree)) return []
  
  return tree.map((item: any, index: number): TreeItem => {
    const uniqueId = item.id_pointtype || `${parent?.nama_pointtype || 'root'}_${item.nama_pointtype}_${index}`
    return {
      id: uniqueId,
      nama_pointtype: item.nama_pointtype,
      jumlah_point: item.jumlah_point,
      jumlah_normal: item.jumlah_normal,
      jumlah_ggn: item.jumlah_ggn,
      avability: item.avability,
      parentPointType: parent?.nama_pointtype || null,
      children: remappedTreeJaringanData(item.children, item, level + 1),
      path: parent ? [...(parent.path || []), item.nama_pointtype] : [item.nama_pointtype],
    }
  })
}


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

// Lifecycle hooks
onMounted(() => {
  const roleAccess: any = ROLE_ACCESS('gangguan-scada')
  if (!roleAccess || !Array.isArray(roleAccess) || roleAccess.length === 0) {
    return
  }
  const roleAct = {
    view: ROLE_ACTION(roleAccess, 'view'),
    create: ROLE_ACTION(roleAccess, 'create'),
    update: ROLE_ACTION(roleAccess, 'update'),
    delete: ROLE_ACTION(roleAccess, 'delete'),
  }

  Object.assign(roleActions, roleAct)


})
  // Load initial tree data
  loadTreeData()
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
        <div class="tree-container" style="height: 400px; overflow-y: auto; padding: 1rem;">
          <div v-if="treeData.length === 0" class="text-center py-8">
            <VIcon icon="tabler-loader-2" size="48" class="text-disabled mb-4" />
            <p class="text-body-2 text-disabled">Loading tree data...</p>
          </div>
          
          <div v-else class="tree-table">
            <!-- Table Header -->
            <div class="tree-header" style="display: flex; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; font-weight: 600; border-radius: 8px 8px 0 0;">
             
              <div class="tree-col-name" style="padding: 12px; flex: 1; display: flex; align-items: center;">
                <VIcon 
                  :icon="allExpanded ? 'tabler-chevron-down' : 'tabler-chevron-right'" 
                  size="16" 
                  @click="toggleAllExpand"
                  style="cursor: pointer; margin-right: 8px;"
                />
                Nama Point
              </div>
              <div class="tree-col-jumlah" style="padding: 12px; min-width: 120px; text-align: center;">Jumlah Point</div>
              <div class="tree-col-normal" style="padding: 12px; min-width: 120px; text-align: center;">Jumlah Normal</div>
              <div class="tree-col-gangguan" style="padding: 12px; min-width: 120px; text-align: center;">Jumlah Gangguan</div>
              <div class="tree-col-avability" style="padding: 12px; min-width: 120px; text-align: center;">Availability</div>
            </div>
            
            <!-- Tree Rows -->
            <div class="tree-body">
              <template v-for="item in treeData" :key="item.id">
                <!-- Parent Row -->
                <div 
                  class="tree-row"
                  :class="{ 'tree-row-selected': selectedNodeId === item.id }"
                  @click="selectNode(item)"
                  style="display: flex; border-bottom: 1px solid #e0e0e0; cursor: pointer; transition: all 0.3s ease;"
                  :style="{ paddingLeft: '0px' }"
                >
                  <div class="tree-col-select" style="padding: 12px; min-width: 60px; display: flex; align-items: center;">
                    <!-- <VRadioGroup v-model="selectedNodeId" hide-details>
                      <VRadio :value="item.id" @click.stop />
                    </VRadioGroup> -->
                  </div>
                  <div class="tree-col-name" style="padding: 12px; flex: 1; display: flex; align-items: center;">
                    <VIcon 
                      v-if="item.children && item.children.length > 0" 
                      :icon="isExpanded(item.id) ? 'tabler-chevron-down' : 'tabler-chevron-right'" 
                      size="16" 
                      @click.stop="toggleExpand(item.id)"
                      style="cursor: pointer; margin-right: 8px; color: #666;"
                    />
                    <span v-else style="width: 24px; display: inline-block;"></span>
                    <VIcon icon="tabler-alert-triangle" size="16" style="color: #ffa726; margin-right: 8px;" />
                    <span style="font-weight: 500;">{{ item.nama_pointtype }}</span>
                    <span v-if="item.children && item.children.length > 0" class="text-disabled" style="margin-left: 8px; font-size: 0.8em; color: #666;">({{ item.children.length }})</span>
                  </div>
                  <div class="tree-col-jumlah" style="padding: 12px; min-width: 120px; text-align: center;">{{ item.jumlah_point }}</div>
                  <div class="tree-col-normal" style="padding: 12px; min-width: 120px; text-align: center;">{{ item.jumlah_normal }}</div>
                  <div class="tree-col-gangguan" style="padding: 12px; min-width: 120px; text-align: center;">{{ item.jumlah_ggn }}</div>
                  <div class="tree-col-avability" style="padding: 12px; min-width: 120px; text-align: center;">{{ item.avability }}%</div>
                </div>
                
                <!-- Child Rows -->
                <template v-if="isExpanded(item.id) && item.children && item.children.length > 0">
                  <div 
                    v-for="child in item.children" 
                    :key="child.id"
                    class="tree-row tree-child-row"
                    :class="{ 'tree-row-selected': selectedNodeId === child.id }"
                    @click="selectNode(child)"
                    style="display: flex; border-bottom: 1px solid #e0e0e0; cursor: pointer; transition: all 0.3s ease; background: #f8f9fa;"
                    :style="{ paddingLeft: '0px' }"
                  >
                    <div class="tree-col-select" style="padding: 12px; min-width: 60px; display: flex; align-items: center;">
                      <!-- <VRadioGroup v-model="selectedNodeId" hide-details>
                        <VRadio :value="child.id" @click.stop />
                      </VRadioGroup> -->
                    </div>
                    <div class="tree-col-name" style="padding: 12px; flex: 1; display: flex; align-items: center;">
                      <span style="width: 24px; display: inline-block;"></span>
                      <span style="width: 24px; display: inline-block;"></span>
                      <VIcon icon="tabler-alert-triangle" size="16" style="color: #ffa726; margin-right: 8px;" />
                      <span style="font-weight: 500;">{{ child.nama_pointtype }}</span>
                    </div>
                    <div class="tree-col-jumlah" style="padding: 12px; min-width: 120px; text-align: center;">{{ child.jumlah_point }}</div>
                    <div class="tree-col-normal" style="padding: 12px; min-width: 120px; text-align: center;">{{ child.jumlah_normal }}</div>
                    <div class="tree-col-gangguan" style="padding: 12px; min-width: 120px; text-align: center;">{{ child.jumlah_ggn }}</div>
                    <div class="tree-col-avability" style="padding: 12px; min-width: 120px; text-align: center;">{{ child.avability }}%</div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
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

<style scoped>
.monitoring-gangguan-scada {
  padding: 1rem;
}

/* Tree Table Styles */
.tree-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.tree-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
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

.tree-row-selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
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
.v-card-title {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px 8px 0 0;
}

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
