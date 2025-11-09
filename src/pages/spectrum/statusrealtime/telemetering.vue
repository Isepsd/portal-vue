<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper'
import { API_PATH } from '@/composables/_path.service'
import FillterFasopRealTimeTelemetering from '@/views/demos/forms/form-elements/autocomplete/FillterFasopRealTimeTelemetering.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PEMBANGKIT_COLUMNS } from '../component/columnref/realtime.config'
import TableIgrid from '../component/TableIgrid.vue'

const router = useRouter()

const filterValues = ref<any>({
  page: 1,
  limit: 10,
  id_induk_pointtype: '798be05c-4df2-4945-9a47-5745a0de66c6'
})
const columnDefs = ref(PEMBANGKIT_COLUMNS())
// Default role (bisa diubah setelah load)
const roleActions = reactive({
  view: true,
  create: true,
  update: true,
  delete: true,
})
const handleRespDataApi = (data: any[], page: number, limit: number) =>
  data.map((item: any, idx: number) => {
    // const status = item?.kesimpulan || 'INVALID'
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


const handleEdit = (item: any) => {
  router.push(`/jaringan/pembangkit/edit/${item.id_ref_lokasi}`)
}

const handleAdd = () => {
  router.push('/jaringan/pembangkit/tambah')
}

onMounted(() => {
  const roleAccess: any = ROLE_ACCESS('pembangkit')
  if (!roleAccess || !Array.isArray(roleAccess) || roleAccess.length === 0) {
    // Keep default values (all true)
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

const handleFilterChange = (newFilterValues: any) => {
  filterValues.value = { ...filterValues.value, ...newFilterValues }
  // getData(filterValues.value.page, filterValues.value.limit)
}
</script>
<template>
 <!-- Header -->
  <VCard class="header-card mb-6 pa-4">
    <VRow class="align-center">
      <VCol cols="12">
    <AppCardCode title="Filter" :code="{ ts: '', js: '' }">
      <FillterFasopRealTimeTelemetering :onFilterChange="handleFilterChange" />
    </AppCardCode>
  </VCol>
      <!-- Kolom kiri: ikon, judul, deskripsi, tombol -->
      <VCol cols="12" md="8" class="d-flex align-start">
        <VAvatar
          size="48"
          color="primary"
          class="mr-4 elevation-2"
        >
          <!-- <VIcon icon="tabler-bolt" size="28" /> -->
        </VAvatar>

        <div class="header-info">
          <h2 class="header-title">Telemetering</h2>
          <p class="header-subtitle">
          </p>
         
        </div>
      </VCol>
    </VRow>
  </VCard>


    <!-- Table -->
    <TableIgrid
   
      :onclickEdit="handleEdit"
      :column="columnDefs"
      :filterValues="filterValues"
      :pathService="API_PATH().fasop.realtime.analog"
      :handleRespDataApi="handleRespDataApi"
      primaryKey=""
    />

</template>
