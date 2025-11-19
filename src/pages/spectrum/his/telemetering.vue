<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper'
import { API_PATH } from '@/composables/_path.service'
import moment from 'moment'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HISTORI_SCADATEL_COLUMNS } from '../component/columnref/HistoriColumn.config'
import TableIgrid from '../component/TableIgrid.vue'

const router = useRouter()

const filterValues = ref<any>({
  page: 1,
  limit: 10,
  id_induk_pointtype: "798be05c-4df2-4945-9a47-5745a0de66c6", 
    datum_after: moment().subtract(1, "day").format("YYYY-MM-DD"),
  datum_before: moment().format("YYYY-MM-DD"),

  // auto formatted after submit
  after: moment().format("YYYY-MM-DD") + " 00:00:00",
  before: moment().format("YYYY-MM-DD") + " 23:59:59",
})
const columnDefs = ref(HISTORI_SCADATEL_COLUMNS())
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
        id_his: item?.id_his,
        point_number: item?.point_number,
        jenis: item?.jenis,
        path1: item?.path1,
        path2: item?.path2,
        path3: item?.path3,
        path4: item?.path4,
        path5: item?.path5,
        datum_1: item?.datum_1,
        status_1: item?.status_1,
        value_1: item?.value_1,
        msec_1: item?.msec_1,
        datum_2: item?.datum_2,
        status_2: item?.status_2,
        value_2: item?.value_2,
        msec_2: item?.msec_2,
        durasi: item?.durasi,
      kesimpulan: status,
      color,
    }
  })


const handleEdit = (item: any) => {
  router.push(`/jaringan/pembangkit/edit/${item.id_ref_lokasi}`)
}

// const handleAdd = () => {
//   router.push('/jaringan/pembangkit/tambah')
// }

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

<VCol cols="12">
  <AppCardCode title="Filter" :code="{ ts: '', js: '' }">
    <div class="mt-6">
      <FillterFasopTelemeteringHistory :onFilterChange="handleFilterChange" />
    </div>
  </AppCardCode>
</VCol>


    <!-- Table -->
    <TableIgrid
      :onclickEdit="handleEdit"
      :column="columnDefs"
      :filterValues="filterValues"
      :pathService="API_PATH().fasop.history.analog"
      :handleRespDataApi="handleRespDataApi"
      primaryKey=""
    />

</template>
