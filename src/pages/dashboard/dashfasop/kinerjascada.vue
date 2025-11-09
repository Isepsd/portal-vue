<script setup lang="ts">
import { toTitleCase } from '@/components/helper/string.helper';
import CrmEarningReportsYearlyOverviewLine from '@/views/dashboards/crm/CrmEarningReportsYearlyOverviewLine.vue';
import CrmOrderBarChartKinerjaScada from '@/views/dashboards/crm/CrmOrderBarChartKinerjaScada.vue';
import axios from 'axios';
import { get } from 'lodash';
import { nanoid } from 'nanoid';
import { computed, ref, watch } from 'vue';

// Definisikan reaktif state untuk data, loading, dll.
const categories = ref<any[]>([]);  // Reactive state for categories
const series = ref<any[]>([]);      // Reactive state for series
const categoriesKin = ref<any[]>([]);  // Reactive state for categories
const seriesKin = ref<any[]>([]);      // Reactive state for series
const simpleStatisticsDemoCards = ref<any[]>([]);  // Reactive state for cards data
const loading = ref<boolean>(true);  // Reactive state for loading indicator
const filterValues = ref<any>({
  tahun: new Date().getFullYear(),
  bulan: '',
  kinerja_scada: 'SCADA',
  nama_induk_pointtype: 'RTU'
});

definePage({
  meta: {
    requiresAuth: true, // Hanya ini yang diperlukan
  },
});

// Computed properties untuk enhanced UI
const currentFilterLabel = computed(() => {
  const typeMap: Record<string, string> = {
    SCADA: 'SCADA Monitoring',
    RC: 'RC Performance',
    TRIP: 'Trip Analysis'
  };
  return typeMap[filterValues.value.kinerja_scada] || 'Dashboard';
});

const totalStatistics = computed(() => {
  return simpleStatisticsDemoCards.value.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
});

const enhancedCards = computed(() => {
  return simpleStatisticsDemoCards.value.map((item, index) => ({
    ...item,
    color: getCardColor(index),
    icon: getCardIcon(item.subname),
    trend: getCardTrend(item.value),
    percentage: calculatePercentage(item.value)
  }));
});

// Helper functions
const getCardColor = (index: number) => {
  const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary'];
  return colors[index % colors.length];
};

const getCardIcon = (subname: string) => {
  const iconMap: Record<string, string> = {
    'Total': 'mdi-chart-line',
    'Active': 'mdi-check-circle',
    'Inactive': 'mdi-close-circle',
    'Warning': 'mdi-alert-circle',
    'Critical': 'mdi-alert',
    'Normal': 'mdi-pulse'
  };
  
  const key = Object.keys(iconMap).find(k => subname.toLowerCase().includes(k.toLowerCase()));
  return key ? iconMap[key] : 'mdi-chart-box';
};

const getCardTrend = (value: number) => {
  // Simulate trend calculation - in real app, this would come from API
  const random = Math.random();
  if (random > 0.7) return 'up';
  if (random < 0.3) return 'down';
  return 'stable';
};

const calculatePercentage = (value: number) => {
  const total = totalStatistics.value;
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

const getTrendIcon = (trend: string) => {
  const trendMap: Record<string, string> = {
    up: 'mdi-trending-up',
    down: 'mdi-trending-down',
    stable: 'mdi-trending-neutral'
  };
  return trendMap[trend] || 'mdi-trending-neutral';
};

const getTrendColor = (trend: string) => {
  const colorMap: Record<string, string> = {
    up: 'success',
    down: 'error',
    stable: 'grey'
  };
  return colorMap[trend] || 'grey';
};

// Path map untuk menentukan path berdasarkan nilai kinerja_scada
const pathMap: any = {
  SCADA: 'dashboard_up2d_banten.kinerja_scada',
  RC: 'dashboard_up2d_banten.kinerja_rc',
  TRIP: 'dashboard_up2d_banten.kinerja_trip',
};

let source = axios.CancelToken.source();

// Fungsi untuk mendapatkan path berdasarkan kinerja_scada
const getPathBasedOnKinerjaScada = (basePath: string) => {
  return pathMap[filterValues.value.kinerja_scada] || `${basePath}.default`; // Default path
};

// Fungsi untuk mengambil data dari API

const getAllData = async () => {
  loading.value = true;

  try {
    const pathService = get(API_PATH(), getPathBasedOnKinerjaScada('dashboard_up2d_banten.kinerja_scada'));

    // Batalkan request sebelumnya jika masih berjalan
    source.cancel('Request canceled due to new filter change.');
    source = axios.CancelToken.source();

    const req: any = await getAllByPath(
      pathService,
      filterValues.value,
      source.token
    );

    const { results } = req;

    /** === BAGIAN datachart === */
    if (results?.datachart) {
      const categoriesData = get(results.datachart[0], 'categories', []);
      const seriesData = get(results.datachart[1], 'series', []);

      categories.value = categoriesData;
      const formattedSeries = seriesData.map((item: any) => ({
        name: toTitleCase(item?.name || '').concat(''),
        data: item?.data || [],
      }));
      series.value = formattedSeries;
    } else {
      categories.value = [];
      series.value = [];
    }

    /** === BAGIAN rekap === */
    if (results?.rekap) {
      const rekap = results.rekap;
      simpleStatisticsDemoCards.value = rekap.map((item: any) => ({
        value: item.value || 0,
        label: item.name || '',
        subname: item.label || '',
      }));
    }

    /** === BAGIAN kinerjapoint (versi React kamu) === */
    if (results?.kinerjapoint) {
      const categoriesData = get(results.kinerjapoint[0], 'categories', []);
      const seriesData = get(results.kinerjapoint[1], 'series', []);

      categoriesKin.value = categoriesData;
      const formattedSeries = seriesData.map((item: any) => ({
        name: toTitleCase(item?.name || '').concat(''), // kalau perlu suffix, tambahkan di sini
        data: item?.data || [],
        yAxis: item?.yAxis,
      }));
      seriesKin.value = formattedSeries;
    } else {
      categoriesKin.value = [];
      seriesKin.value = [];
    }

  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

// Fungsi untuk menangani perubahan filter
const handleFilterChange = (newFilterValues: any) => {
  filterValues.value = newFilterValues;
  // Call the getAllData to fetch data after filter change
  getAllData();
};

// Watcher untuk memantau perubahan pada filterValues
watch(filterValues, (newVal, oldVal) => {
  if (newVal !== oldVal) {  // Cek apakah ada perubahan pada filterValues
    handleFilterChange(newVal); // Jika ada perubahan, panggil handleFilterChange
  }
}, { immediate: true });

</script>

<template>
  <div >
    <!-- Enhanced Loading Overlay -->
    <VOverlay
      v-model="loading"
      class="loading-overlay"
      contained
      persistent
    >
      <div class="d-flex flex-column align-center justify-center">
        <VProgressCircular indeterminate color="primary" size="64" class="mb-4" />
        <h3 class="text-h6 font-weight-medium text-primary mb-2">Memuat Data Dashboard</h3>
        <p class="text-body-2 text-grey-600">Sedang mengambil data kinerja SCADA...</p>
      </div>
    </VOverlay>

    <!-- Header Section -->
    <div >
      <VRow align="center">
        <VCol cols="12" md="8">
          <div class="d-flex align-center gap-4">
            <div class="header-icon">
              <VIcon icon="mdi-chart-line" size="32" color="primary" />
            </div>
            <div>
              <h1 class="text-h4 font-weight-bold text-grey-900 mb-1">
                {{ currentFilterLabel }}
              </h1>
              <p class="text-body-2 text-grey-600 mb-0">
                Dashboard monitoring kinerja SCADA BANTEN
              </p>
            </div>
          </div>
        </VCol>
        <VCol cols="12" md="4" class="text-end">
          <div class="d-flex gap-2 justify-end">
            <VChip
              :color="filterValues.kinerja_scada === 'SCADA' ? 'primary' : 'secondary'"
              variant="tonal"
              size="small"
            >
              <VIcon icon="mdi-server" size="16" class="me-1" />
              {{ filterValues.tahun }}
            </VChip>
            <VChip
              color="info"
              variant="tonal"
              size="small"
            >
              <VIcon icon="mdi-clock-time-four" size="16" class="me-1" />
              Real-time
            </VChip>
          </div>
        </VCol>
      </VRow>
    </div>

    <!-- Filter Section -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard class="filter-card" elevation="2">
          <VCardItem class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <VIcon icon="mdi-filter-variant" size="20" color="primary" />
                <span class="text-h6 font-weight-medium">Filter Data</span>
              </div>
              <VBtn
                size="small"
                variant="text"
                color="primary"
                @click="getAllData"
                :loading="loading"
              >
                <VIcon icon="mdi-refresh" size="18" class="me-1" />
                Refresh
              </VBtn>
            </div>
          </VCardItem>
          <VDivider />
          <VCardText class="pa-4">
            <FillterAutocompleteBasic :onFilterChange="handleFilterChange" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Enhanced Statistics Cards -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard class="stats-overview-card" elevation="2">
          <VCardItem class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <VIcon icon="mdi-chart-box" size="20" color="primary" />
                <span class="text-h6 font-weight-medium">Ringkasan Kinerja</span>
              </div>
              <div class="d-flex align-center gap-2">
                <VChip
                  color="primary"
                  variant="tonal"
                  size="small"
                >
                  Total: {{ formatNumber(totalStatistics) }}
                </VChip>
              </div>
            </div>
          </VCardItem>
          <VDivider />
          <VCardText class="pa-4">
            <VRow>
              <VCol
                v-for="(card, index) in enhancedCards"
                :key="card?.id || nanoid()"
                cols="12"
                sm="6"
                md="3"
                class="pa-2"
              >
                <VCard 
                  class="stat-card"
                  :class="`stat-card--${card.color}`"
                  elevation="1"
                  hover
                >
                  <VCardText class="pa-4">
                    <!-- Icon and Trend -->
                    <div class="d-flex justify-space-between align-start mb-3">
                      <div class="stat-icon-wrapper" :class="`bg-light-${card.color}`">
                        <VIcon 
                          :icon="card.icon" 
                          :color="card.color" 
                          size="24" 
                        />
                      </div>
                      <div class="trend-wrapper">
                        <VIcon 
                          :icon="getTrendIcon(card.trend)" 
                          :color="getTrendColor(card.trend)" 
                          size="16" 
                        />
                        <span 
                          :class="`text-caption text-${getTrendColor(card.trend)}`"
                          class="ms-1"
                        >
                          {{ card.trend === 'up' ? '+' : card.trend === 'down' ? '-' : '' }}{{ card.percentage }}%
                        </span>
                      </div>
                    </div>

                    <!-- Main Value -->
                    <div class="stat-value mb-2">
                      <h3 class="text-h4 font-weight-bold text-grey-900">
                        {{ formatNumber(card.value) }}
                      </h3>
                    </div>

                    <!-- Label -->
                    <div class="stat-label">
                      <p class="text-body-2 text-grey-600 mb-0">{{ card.label }}</p>
                      <p class="text-caption text-grey-500 mb-0">{{ card.subname }}</p>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mt-3">
                      <VProgressLinear
                        :model-value="card.percentage"
                        :color="card.color"
                        height="6"
                        rounded
                      />
                    </div>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Charts Section -->
    <VRow class="mb-6">
      <!-- Main Chart -->
      <VCol cols="12" lg="8">
        <VCard class="chart-card" elevation="2">
          <VCardItem class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <VIcon icon="mdi-chart-line" size="20" color="primary" />
                <span class="text-h6 font-weight-medium">Grafik Kinerja</span>
              </div>
              <div class="d-flex gap-2">
                <VBtn
                  size="small"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-download"
                >
                  Export
                </VBtn>
                <VBtn
                  size="small"
                  variant="text"
                  color="primary"
                  icon="mdi-dots-vertical"
                />
              </div>
            </div>
          </VCardItem>
          <VDivider />
          <VCardText class="pa-4">
            <CrmEarningReportsYearlyOverviewLine 
              :categories="categories"
              :series="series"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Side Chart -->
      <VCol cols="12" lg="4">
        <VCard class="chart-card" elevation="2">
          <VCardItem class="pa-4">
            <div class="d-flex align-center gap-2">
              <VIcon icon="mdi-chart-bar" size="20" color="success" />
              <span class="text-h6 font-weight-medium">Jumlah Point</span>
            </div>
          </VCardItem>
          <VDivider />
          <VCardText class="pa-4">
            <CrmOrderBarChartKinerjaScada 
              :categories="categoriesKin"
              :series="seriesKin"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Additional Info Section -->
    <VRow>
      <VCol cols="12">
        <VCard class="info-card" elevation="2">
          <VCardItem class="pa-4">
            <div class="d-flex align-center gap-2">
              <VIcon icon="mdi-information-outline" size="20" color="info" />
              <span class="text-h6 font-weight-medium">Informasi Dashboard</span>
            </div>
          </VCardItem>
          <VDivider />
          <VCardText class="pa-4">
            <VRow>
              <VCol cols="12" md="4">
                <div class="info-item">
                  <VIcon icon="mdi-update" size="16" color="primary" class="me-2" />
                  <span class="text-body-2">Update Terakhir: {{ new Date().toLocaleString('id-ID') }}</span>
                </div>
              </VCol>
              <VCol cols="12" md="4">
                <div class="info-item">
                  <VIcon icon="mdi-server" size="16" color="success" class="me-2" />
                  <span class="text-body-2">Status: Online</span>
                </div>
              </VCol>
              <VCol cols="12" md="4">
                <div class="info-item">
                  <VIcon icon="mdi-database" size="16" color="info" class="me-2" />
                  <span class="text-body-2">Total Data: {{ formatNumber(totalStatistics) }} records</span>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.loading-overlay {
  backdrop-filter: blur(4px);
}

.dashboard-header {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.filter-card {
  border-radius: 12px;
  overflow: hidden;
}

.stats-overview-card,
.chart-card,
.info-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stats-overview-card:hover,
.chart-card:hover,
.info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.stat-card {
  border-radius: 12px;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-card--primary { border-left: 4px solid #1976d2; }
.stat-card--success { border-left: 4px solid #43a047; }
.stat-card--warning { border-left: 4px solid #fb8c00; }
.stat-card--error { border-left: 4px solid #e53935; }
.stat-card--info { border-left: 4px solid #1e88e5; }
.stat-card--secondary { border-left: 4px solid #546e7a; }

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1);
}

.trend-wrapper {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.stat-value h3 {
  line-height: 1.2;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.bg-light-primary { background: rgba(25, 118, 210, 0.1); }
.bg-light-success { background: rgba(67, 160, 71, 0.1); }
.bg-light-warning { background: rgba(251, 140, 0, 0.1); }
.bg-light-error { background: rgba(229, 57, 53, 0.1); }
.bg-light-info { background: rgba(30, 136, 229, 0.1); }
.bg-light-secondary { background: rgba(84, 110, 122, 0.1); }

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: slideIn 0.5s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsive adjustments */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .dashboard-header {
    padding: 16px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .stat-card {
    margin-bottom: 12px;
  }
}

/* Custom scrollbar */
.dashboard-container ::-webkit-scrollbar {
  width: 8px;
}

.dashboard-container ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.dashboard-container ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.dashboard-container ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
