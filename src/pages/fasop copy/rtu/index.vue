<script setup lang="ts">
import type { FilterValues, HandleRespDataApiFn } from '././types';
import TableIgrid from './TableIgrid.vue';
const filterparams = ref<any>({
  tahun: new Date().getFullYear(),
  bulan: '',
  kinerja_scada: 'SCADA',
  nama_induk_pointtype: 'RTU'
});
const filterValues: FilterValues = {
  page: 1,
  limit: 10,
  path1: '',
  path2: '',
  path3: '',
  path4: '',
  path5: '',
  durasi: '',
  kesimpulan: '',
  nama_pointtype: '',
  id_induk_pointtype: '3d391819-4288-4699-80f4-7ebd5ae0d733',
  ...filterparams
}


// 🧠 Fungsi untuk mapping response API
const handleRespDataApi: HandleRespDataApiFn = (data, page, limit) =>
  data.map((item: any, idx: number) => {
    const status = item?.kesimpulan || 'INVALID'
    const color =
      status === 'VALID'
        ? '#198754'
        : status === 'INVALID'
        ? '#dc3545'
        : '#6c757d'

    return {
      number: (page - 1) * limit + idx + 1,
      point_number: item?.point_number ?? '-',
      nama_pointtype: item?.nama_pointtype ?? '-',
      path1: item?.path1 ?? '-',
      path2: item?.path2 ?? '-',
      path3: item?.path3 ?? '-',
      path4: item?.path4 ?? '-',
      path5: item?.path5 ?? '-',
      status_2: item?.status_2 ?? '-',
      datum_2: item?.datum_2 ?? '-',
      durasi: item?.durasi ?? '-',
      value: item?.value ?? '-',
      datum_capture: item?.datum_capture ?? '-',
      kesimpulan: status,
      color,
    }
  })

  const handleFilterChange = (newFilterValues: any) => {
  filterparams.value = newFilterValues;
  // Call the getAllData to fetch data after filter change

};

</script>

<template>

  <VRow class="match-height mb-4">
  <VCol cols="12">
    <AppCardCode title="Filter" :code="{ ts: '', js: '' }">
      <FillterFasopRealTime :onFilterChange="handleFilterChange" />
    </AppCardCode>
  </VCol>
</VRow>
  <TableIgrid
    :filterValues="filterValues"
    :pathService="API_PATH().fasop.realtime.digital"
    :handleRespDataApi="handleRespDataApi"
  />
</template>
