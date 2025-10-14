<script setup lang="ts">
import { toTitleCase } from '@/components/helper/string.helper';
import CrmEarningReportsYearlyOverviewLine from '@/views/dashboards/crm/CrmEarningReportsYearlyOverviewLine.vue';
import CrmOrderBarChart from '@/views/dashboards/crm/CrmOrderBarChart.vue';
import axios from 'axios';
import { get } from 'lodash';
import { nanoid } from 'nanoid';
import { ref, watch } from 'vue';

// Definisikan reaktif state untuk data, loading, dll.
const categories = ref<any[]>([]);  // Reactive state for categories
const series = ref<any[]>([]);      // Reactive state for series
const simpleStatisticsDemoCards = ref<any[]>([]);  // Reactive state for cards data
const loading = ref<boolean>(true);  // Reactive state for loading indicator
const filterValues = ref<any>({
  tahun: new Date().getFullYear(),
  bulan: '',
  kinerja_scada: 'SCADA',
  nama_induk_pointtype: 'RTU'
});

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
  loading.value = true; // Set loading true saat data sedang diambil
  try {
    const pathService = get(API_PATH(), getPathBasedOnKinerjaScada('dashboard_up2d_banten.kinerja_scada'));

    // Membatalkan request sebelumnya jika ada
    source.cancel('Request canceled due to new filter change.');

    // Membuat token baru untuk request
    source = axios.CancelToken.source();

    const req: any = await getAllByPath(
      pathService,
      filterValues.value,
      source.token
    );

    const { results } = req;

    // Jika datachart ada
    if (results?.datachart) {
      const categoriesData = get(results.datachart[0], 'categories', []);
      const seriesData = get(results.datachart[1], 'series', []);

      categories.value = categoriesData;  // Update categories
      const formattedSeries = seriesData.map((item: any) => ({
        name: toTitleCase(item?.name || "").concat(""),
        data: item?.data || [],
      }));
      series.value = formattedSeries;  // Update series
    } else {
      categories.value = [];
      series.value = [];
    }

    // Jika ada data rekap
    if (results?.rekap) {
      const rekap = results.rekap;
      simpleStatisticsDemoCards.value = rekap.map((item: any) => ({
        value: item.value || 0,
        label: item.name || '',
        subname: item.label || '',
      }));
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false; // Set loading false setelah data diambil
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
  <!-- Top Loader Bar (Progress Bar) -->
  <v-progress-linear
    v-if="loading"
    indeterminate
    color="primary"
    height="4"
    class="position-absolute top-0 left-0 right-0 z-index-10"
  />
  
  <!-- ROW: Filter -->
  <VRow class="match-height">
    <VCol cols="12">
      <AppCardCode
        title="Filter"
        :code="{ ts: '', js: '' }"
      >
        <FillterAutocompleteBasic :onFilterChange="handleFilterChange" />
      </AppCardCode>
    </VCol>
  </VRow>

  <!-- Spacer -->
  <div class="my-6" />

  <!-- ROW: Statistik Cards - Posisi Tengah -->
  <VRow class="justify-center">
    <VCol cols="12">
      <AppCardCode
        title="Kinerja Scada BANTEN"
        :code="{ ts: '', js: '' }"
      >
        <!-- Menampilkan spinner loading jika data sedang diambil -->
        <div v-if="loading">
          <VSpinner />
        </div>
        
        <!-- Menampilkan kartu jika data sudah diambil -->
        <VRow class="justify-center gap-6">
          <VCol
            v-for="(item, index) in simpleStatisticsDemoCards"
            :key="item?.id || nanoid()"
            cols="12"
            sm="6"
            md="4"
            lg="3" 
            class="ma-4"
          >
            <VCard style="border: 2px solid #40E0D0; display: flex; flex-direction: column; height: 100%;">
              <VCardText style="flex-grow: 1;"> <!-- Menambahkan flex-grow agar teks bisa memenuhi area tanpa keluar dari kartu -->
                <h5 class="text-h5 mt-3">{{ item.subname }}</h5>
                <p class="my-1">{{ item.label }}</p>
                <p class="mb-3 text-high-emphasis">{{ item.value }}</p>
                <VChip color="primary" label size="small">
                  {{ item.value }}
                </VChip>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </AppCardCode>
    </VCol>
  </VRow>

  <!-- Spacer -->
  <div class="my-10" />

  <!-- ROW: Earning Overview - Posisi Kiri -->
  <VRow>
    <VCol cols="12" md="8">
      <CrmEarningReportsYearlyOverviewLine 
        :categories="categories"
        :series="series"
      />
    </VCol>
    <VCol cols="12" md="4">
      <CrmOrderBarChart />
    </VCol>
  </VRow>
</template>
