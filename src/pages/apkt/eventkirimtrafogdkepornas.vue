<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper';
import { API_PATH } from '@/composables/_path.service';
import CrmEarningReportsYearlyOverviewLineNew from '@/views/dashboards/crm/CrmEarningReportsYearlyOverviewLineNew.vue';
import moment from 'moment';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import TableIgrid from '../spectrum/component/TableIgrid.vue';
const router = useRouter()


// Dummy fallback
const statistics = ref({
  jumlah_mapping: 35738,
  persen_mapping: 23.06,
  jumlah_not_mapping: 119239,
  persen_not_mapping: 76.94,

  jumlah_aset: 154977,
  jumlah_status: 34764,
  jumlah_gap: 974,

  persen_nyala: 94.64,
  jumlah_nyala: 32902,

  persen_padam: 5.36,
  jumlah_padam: 1862,
})

// Chart dummy

// OPTIONAL: replace later with real backend call
const getData = async () => {
  try {
    // const res = await getAllByPath('your-service')
    // if(res.data) statistics.value = res.data
  } catch {
    console.warn("Backend belum ready — pakai dummy")
  }
}
const categories = ref<any[]>([])
const series = ref<any[]>([])

const loadDummyData = () => {
  categories.value = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"
  ]

  series.value = [
    {
      name: "Success",
      data: [10, 25, 35, 40, 60, 75, 90]
    },
    {
      name: "Failed",
      data: [5, 10, 7, 12, 15, 8, 5]
    },
    {
      name: "Pending",
      data: [20, 15, 10, 18, 25, 22, 10]
    }
  ]
}

onMounted(() => {
  getData()
 loadDummyData()
  
})


// Active tab
const activeTab = ref('tree')

// Filter values for different tabs
const filterValues = ref<any>({
  page: 1,
  limit: 10,
  fungsi: 'TRAFO GD',
  asset: [],
  tree: true,
  start_date: moment().format("YYYY-MM-DD 00:00:00"),
  end_date: moment().format("YYYY-MM-DD 23:59:59"),
  status: 'All',
  pengiriman: 'All',
})

// Column definitions for event tables
const columnDefs = ref([
  {
    headerName: "Nama Aset",
    field: "nama",
    pinned: "left",
    width: 200,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Kode Aset",
    field: "kode",
    pinned: "left",
    width: 150,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "APD Code",
    field: "apd_code",
    width: 150,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Jenis Aset",
    field: "fungsi",
    width: 120,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Area ULP",
    field: "ulp",
    width: 120,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Area UP3",
    field: "up3",
    width: 120,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Kirim Portal",
    field: "kafka",
    width: 120,
    filter: "agSetColumnFilter",
    cellRenderer: (params: any) => {
      const value = params.value
      const color = value === 'Ya' ? '#28a745' : value === 'Tidak' ? '#dc3545' : '#6c757d'
      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          display: inline-block;
          text-align: center;
          width: 100%;
        ">
          ${value || 'Tidak'}
        </span>`
    }
  },
  {
    headerName: "Mode Pengiriman",
    field: "mode_kafka",
    width: 140,
    filter: "agSetColumnFilter",
    cellRenderer: (params: any) => {
      const value = params.value
      const color = value === 'OTOMATIS' ? '#28a745' : value === 'MANUAL' ? '#007bff' : '#6c757d'
      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          display: inline-block;
          text-align: center;
          width: 100%;
        ">
          ${value || 'Not Set'}
        </span>`
    }
  },
  {
    headerName: "Status Listrik",
    field: "status",
    width: 120,
    filter: "agSetColumnFilter",
    cellRenderer: (params: any) => {
      const value = params.value
      const color = value === 'NYALA' ? '#28a745' : value === 'PADAM' ? '#dc3545' : '#17a2b8'
      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          display: inline-block;
          text-align: center;
          width: 100%;
        ">
          ${value || 'NOT DETECTED'}
        </span>`
    }
  },
  {
    headerName: "Status Time",
    field: "datum",
    width: 150,
  },
  {
    headerName: "Station",
    field: "station",
    width: 120,
    filter: "agSetColumnFilter",
  },
  {
    headerName: "Bay",
    field: "point_name",
    width: 120,
    filter: "agSetColumnFilter",
  },
])

// Event history column definitions
const eventHistoryColumns = [
  {
    headerName: "Event ID",
    field: "event_id",
    width: 150,
    filter: true,
  },
  {
    headerName: "Status Event",
    field: "status_2",
    width: 120,
    filter: true,
    cellRenderer: (params: any) => {
      const value = params.value
      const color = value === 'NYALA' ? '#28a745' : value === 'PADAM' ? '#dc3545' : '#17a2b8'
      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          display: inline-block;
          text-align: center;
          width: 100%;
        ">
          ${value}
        </span>`
    }
  },
  {
    headerName: "Waktu Event",
    field: "datetime_created",
    width: 150,
    filter: true,
  },
  {
    headerName: "Jumlah Aset",
    field: "jlh",
    width: 100,
    filter: true,
  },
  {
    headerName: "Status Pengiriman",
    field: "status_pengiriman",
    width: 140,
    filter: true,
    cellRenderer: (params: any) => {
      const value = params.value
      let color = '#6c757d'
      let text = value

      switch(value) {
        case 0: color = '#ffc107'; text = 'Pending'; break
        case 1: color = '#28a745'; text = 'Success'; break
        case 2: color = '#dc3545'; text = 'Failed'; break
        case 3: color = '#6c757d'; text = 'Blocked'; break
        case 4: color = '#007bff'; text = 'On Hold'; break
      }

      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          display: inline-block;
          text-align: center;
          width: 100%;
        ">
          ${text}
        </span>`
    }
  },
  {
    headerName: "Durasi Pengiriman",
    field: "durasi_pengiriman",
    width: 140,
    filter: true,
  },
  {
    headerName: "Area ULP",
    field: "ulp",
    width: 120,
    filter: true,
  },
  {
    headerName: "Area UP3",
    field: "up3",
    width: 120,
    filter: true,
  },
  {
    headerName: "Transaction ID",
    field: "transaction_id",
    width: 150,
    filter: true,
    cellRenderer: (params: any) => {
      if (params.value) {
        return `<button type="button" onclick="showPayload('${params.value}')" class="btn btn-sm btn-primary"> <i class="fas fa-eye"></i> ${params.value}</button>`
      }
      return ''
    }
  },
]

// Default role actions
const roleActions = reactive({
  view: true,
  create: true,
  update: true,
  delete: true,
})

// Handle response data from API
const handleRespDataApi = (data: any[], page: number, limit: number) =>
  data.map((item: any, idx: number) => ({
    number: (page - 1) * limit + idx + 1,
    id: item?.id,
    nama: item?.nama,
    kode: item?.kode,
    apd_code: item?.apd_code,
    fungsi: item?.fungsi,
    ulp: item?.ulp,
    up3: item?.up3,
    kafka: item?.kafka,
    mode_kafka: item?.mode_kafka,
    status: item?.status,
    datum: item?.datum,
    station: item?.station,
    point_name: item?.point_name,
  }))

const handleRespDataEventApi = (data: any[], page: number, limit: number) =>
  data.map((item: any, idx: number) => ({
    number: (page - 1) * limit + idx + 1,
    event_id: item?.event_id,
    status_2: item?.status_2,
    datetime_created: item?.datetime_created,
    jlh: item?.jlh,
    status_pengiriman: item?.status_pengiriman,
    durasi_pengiriman: item?.durasi_pengiriman,
    ulp: item?.ulp,
    up3: item?.up3,
    transaction_id: item?.transaction_id,
  }))

// Handle edit action
const handleEdit = (item: any) => {
  router.push(`/apkt/eventkirimtrafogdkepornas/edit/${item.id}`)
}

// Get current API path based on active tab
const currentApiPath = computed(() => {
  if (activeTab.value === 'tree') {
    return API_PATH().apkt.monitoring_gardu_status || 'app/event/data'
  } else if (activeTab.value === 'scada') {
    return 'app/event/histori'
  } else if (activeTab.value === 'manual') {
    return 'app/event/histori'
  }
  return API_PATH().fasop.history.digital
})

const currentColumns = computed(() => {
  if (activeTab.value === 'tree') {
    return columnDefs.value
  } else {
    return eventHistoryColumns
  }
})

const currentHandleRespData = computed(() => {
  if (activeTab.value === 'tree') {
    return handleRespDataApi
  } else {
    return handleRespDataEventApi
  }
})

// Load statistics on mount
onMounted(() => {
  loadStatistics()
  
  const roleAccess: any = ROLE_ACCESS('eventkirimtrafogdkepornas')
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

// Load statistics data
const loadStatistics = async () => {
  try {
    // This would be replaced with actual API call
    Object.assign(statistics, {
      jumlah_mapping: 1250,
      persen_mapping: 85,
      jumlah_not_mapping: 220,
      persen_not_mapping: 15,
      jumlah_aset: 1470,
      jumlah_status: 1180,
      jumlah_gap: 90,
      jumlah_nyala: 980,
      jumlah_padam: 200,
      persen_nyala: 83,
      persen_padam: 17
    })
  } catch (error) {
    console.error('Error loading statistics:', error)
  }
}

// Load chart data

// Handle tab change
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  // Reset filters when switching tabs
  filterValues.value = {
    ...filterValues.value,
    page: 1,
  }
}

// Handle filter change
const handleFilterChange = (newFilterValues: any) => {
  filterValues.value = { ...filterValues.value, ...newFilterValues }
}
</script>
<template>
 <div class="event-kirim-trafo-gd-kepornas">

    <!-- GRID → STATISTICS + CHART -->
  <div class="dashboard-grid">


  <!-- LEFT SIDE -->
<div class="left-column">

  <!-- CARD 1 → STAT MAPPING -->
  <VCard class="panel-card pa-4 mb-4" elevation="2">
    <div class="stat-wrapper">

      <!-- Card 1 -->
      <div class="stat-card stat-info">
        <div class="stat-icon">
          <i class="ti ti-route"></i>
        </div>
        <div class="stat-value">{{ statistics.jumlah_mapping }}</div>
        <div class="stat-title">Aset sudah dimapping</div>
        <div class="stat-sub">
          <span>{{ statistics.persen_mapping }}%</span>
          <small>dari total aset</small>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="stat-card stat-warning">
        <div class="stat-icon">
          <i class="ti ti-route-off"></i>
        </div>
        <div class="stat-value">{{ statistics.jumlah_not_mapping }}</div>
        <div class="stat-title">Aset belum dimapping</div>
        <div class="stat-sub">
          <span>{{ statistics.persen_not_mapping }}%</span>
          <small>dari total aset</small>
        </div>
      </div>

    </div>
  </VCard>



<!-- CARD 2 → STATUS SUMMARY -->
<VCard class="panel-card pa-4 stretch-card" elevation="2">

    <div class="summary-header">
      <span>Ikhtisar Status</span>

      <div class="summary-count">
        <span class="count-main">{{ statistics.jumlah_status }}</span>
        <span v-if="statistics.jumlah_gap > 0" class="gap-badge">
          ≈-{{ statistics.jumlah_gap }}
        </span>
      </div>
    </div>

    <h2 class="total-asset">
      {{ statistics.jumlah_aset }}
      <small>Total aset</small>
    </h2>

    <div class="status-row">
      <div class="status-item">
        <span class="status-icon success"><i class="ti ti-bulb"></i></span>
        <strong>NYALA</strong>
        <p>{{ statistics.persen_nyala }}%</p>
        <small>{{ statistics.jumlah_nyala }}</small>
      </div>

      <div class="divider">VS</div>

      <div class="status-item right">
        <strong>PADAM</strong>
        <span class="status-icon danger"><i class="ti ti-bulb-off"></i></span>
        <p>{{ statistics.persen_padam }}%</p>
        <small>{{ statistics.jumlah_padam }}</small>
      </div>
    </div>

    <div class="progress-bar-wrapper">
      <div class="bar success" :style="`width: ${statistics.persen_nyala}%`"></div>
      <div class="bar danger" :style="`width: ${statistics.persen_padam}%`"></div>
    </div>
  </VCard>

</div>


  <!-- RIGHT -->
  <VCard class="panel-card pa-4" elevation="2">

    <div class="d-flex justify-space-between align-center mb-3">
      <div>
        <h4>Statistik Pengiriman Event</h4>
        <small>Total pengiriman sukses: <b>{{ 123 }}</b></small>
      </div>
      <input type="text" class="date-input" placeholder="2025/11/21 - 2025/11/21"/>
    </div>

    <VCard class="chart-inner-card" elevation="0">
      <VCardText class="pa-0">
        <CrmEarningReportsYearlyOverviewLineNew 
          :categories="categories"
          :series="series"
        />
      </VCardText>
    </VCard>
  </VCard>
</div>


    <!-- TABS -->
<div class="tabs-wrapper">
  <VBtn
    variant="outlined"
    color="primary"
    class="tab-btn"
    :class="{ active: activeTab === 'tree' }"
    @click="handleTabChange('tree')"
  >
    <i class="fa fa-sitemap mr-2"></i>
    Tree Jaringan
  </VBtn>

  <VBtn
    variant="outlined"
    color="primary"
    class="tab-btn"
    :class="{ active: activeTab === 'scada' }"
    @click="handleTabChange('scada')"
  >
    <i class="fa fa-cogs mr-2"></i>
    Event SCADA

    <VChip size="small" class="ml-2" color="primary" variant="flat">
      8
    </VChip>
  </VBtn>

  <VBtn
    variant="outlined"
    color="primary"
    class="tab-btn"
    :class="{ active: activeTab === 'manual' }"
    @click="handleTabChange('manual')"
  >
    <i class="fa fa-desktop mr-2"></i>
    Event Entri (Non-SCADA)
  </VBtn>

</div>


    <!-- FILTER -->
    <div class="filter-card">
      <div class="filter-header">
        <i class="ti ti-filter"></i> Filter Data
      </div>

      <div class="filter-grid">
        <div>
          <label>Root Aset</label>
          <select v-model="filterValues.fungsi">
            <option>TRAFO GD</option>
            <option>GARDU DISTRIBUSI</option>
            <option>PENYULANG</option>
          </select>
        </div>

        <div>
          <label>Pilih Trafo GD</label>
          <input type="text" placeholder="Cari / pilih aset..." />
        </div>

        <div class="toggle-section">
          <label>Tree List</label>
          <input type="checkbox" v-model="filterValues.tree"/>
        </div>

        <button class="btn-apply">Apply</button>
      </div>
    </div>


    <!-- AG Grid Tables -->
    <TableIgrid
      v-if="activeTab === 'tree'"
      :onclickEdit="handleEdit"
      :column="currentColumns"
      :filterValues="filterValues"
      :pathService="currentApiPath"
      :handleRespDataApi="currentHandleRespData"
      primaryKey="id"
    />

    <!-- Event SCADA Table -->
    <TableIgrid
      v-if="activeTab === 'scada'"
      :onclickEdit="handleEdit"
      :column="currentColumns"
      :filterValues="filterValues"
      :pathService="currentApiPath"
      :handleRespDataApi="currentHandleRespData"
      primaryKey="event_id"
    />

    <!-- Event Manual Table -->
    <TableIgrid
      v-if="activeTab === 'manual'"
      :onclickEdit="handleEdit"
      :column="currentColumns"
      :filterValues="filterValues"
      :pathService="currentApiPath"
      :handleRespDataApi="currentHandleRespData"
      primaryKey="event_id"
    />
  </div>
</template>
<style scoped>

.event-kirim-trafo-gd-kepornas {
  font-family: Inter, sans-serif;
}

/* ------------ GRID MAIN LAYOUT ------------ */

.dashboard-grid {
  display: grid;
  grid-template-columns: 400px auto;
  gap: 20px;
}
/* ------------ STAT CARDS ------------ */
/* Buat kolom kiri auto mengikuti tinggi konten kanan */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* Paksa card summary memanjang */
.stretch-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Biar progress bar tetap di bawah card */
.stretch-card .progress-bar-wrapper {
  margin-top: auto;
}


.mb-4 {
  margin-bottom: 20px;
}

.stat-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.stat-card {
  border: 1px solid #e6e6e6;
  padding: 16px;
  border-radius: 10px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.stat-info { border-left: 4px solid #38bdf8; }
.stat-warning { border-left: 4px solid #fbbf24; }

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-title {
  opacity: .7;
  font-size: 14px;
}

.stat-sub {
  font-size: 13px;
  opacity: .8;
}

.stat-sub span {
  font-weight: 600;
}

/* ------------ STATUS SUMMARY ------------ */

.summary-card {
  margin-top: 12px;
  
  padding: 20px;
  border-radius: 12px;
}

.summary-header {
  display:flex;
  justify-content:space-between;
  font-size:14px;
  opacity:.8;
}

.count-main {
  color:#38bdf8;
  font-weight:600;
}

.gap-badge {
  /* background:#334155; */
  padding:2px 6px;
  color:#f87171;
  border-radius:6px;
  font-size:12px;
}

.total-asset {
  margin-top:6px;
  font-size:22px;
  font-weight:700;
}

.total-asset small {
  opacity:.6;
  font-size:13px;
}

/* Status Comparison */
.stat-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Optional responsive: auto stack on small screens */
@media (max-width: 768px) {
  .stat-wrapper {
    grid-template-columns: 1fr;
  }
}

.status-row {
  margin-top:15px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.status-item {
  text-align:left;
}

.status-item.right{text-align:right;}

.status-icon {
  padding:6px;
  border-radius:8px;
  font-size:18px;
}

.success { background:#16a34a33;color:#22c55e; }
.danger { background:#dc262633;color:#f87171; }

.status-item p {
  margin:5px 0;
  font-size:18px;
  font-weight:700;
}

.progress-bar-wrapper {
  background:#334155;
  border-radius:10px;
  margin-top:15px;
  height:10px;
  display:flex;
  overflow:hidden;
}

.bar {
  height:10px;
}

.bar.success { background:#22c55e; }
.bar.danger { background:#ef4444; }

/* ------------ CHART SECTION ------------ */

.chart-card {

  border-radius:12px;
  padding:20px;
}

.chart-header {
  display:flex;
  justify-content:space-between;
}

.date-input {

  border:1px solid #334155;
  padding:6px 10px;
  border-radius:6px;

}

.chart-box {
  height:260px;
  margin-top:15px;
}

/* ------------ TABS ------------ */
.tabs-wrapper {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 16px;
}

.tab-btn {
  text-transform: none;
  border-radius: 8px;
  flex: 1;
  justify-content: center;
  font-weight: 500;
}

.tab-btn.active {


  border-color: #46e54e !important;
}


.tab-badge {

  padding:2px 6px;
  border-radius:6px;
}

/* ------------ FILTER PANEL ------------ */

.filter-card {
 
  margin-top:20px;
  padding:20px;
  border-radius:12px;
  border:1px solid #334155;
}

.filter-header {
  font-weight:600;
  margin-bottom:12px;
  display:flex;
  align-items:center;
  gap:6px;
}

.filter-grid {
  display:grid;
  grid-template-columns: repeat(4,1fr);
  gap:20px;
}

select, input {

  border:1px solid #334155;
  padding:8px;
  border-radius:8px;
  width:100%;

}

.btn-apply {
  background:#6366f1;
  border:none;
  padding:10px;
  border-radius:8px;
  cursor:pointer;
}

.btn-apply:hover {
  background:#4f46e5;
}
</style>
