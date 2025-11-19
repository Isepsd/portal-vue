<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper'
import { API_PATH } from '@/composables/_path.service'
import moment from 'moment'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HISTORI_TRIP_COLUMNS } from '../component/columnref/HistoriColumn.config'
import TableIgrid from '../component/TableIgrid.vue'

const router = useRouter()

const filterValues = ref<any>({
  page: 1,
  limit: 10,
  id_induk_pointtype: "3d391819-4288-4699-80f4-7ebd5ae0d733", kinerja: 1 ,
  datum_after: moment().subtract(1, "day").format("YYYY-MM-DD") + " 00:00:00",
  datum_before: moment().format("YYYY-MM-DD") + " 23:59:59",

  // auto formatted after submit
  after: moment().format("YYYY-MM-DD") + " 00:00:00",
  before: moment().format("YYYY-MM-DD") + " 23:59:59",
})
const columnDefs = ref(HISTORI_TRIP_COLUMNS())
// Default role (bisa diubah setelah load)
const roleActions = reactive({
  view: true,
  create: true,
  update: true,
  delete: true,
})
const handleRespDataApi = (data: any[], page: number, limit: number) =>
  data.map((item: any, idx: number) => {
 
    return {
        number: (page - 1) * limit + idx + 1,
        path1: item?.path1,
        path2: item?.path2,
        path3: item?.path3,
        path4: item?.path4,
        datum_1: item.datum_1,
        datum_2: item.datum_2,
        ocr: item?.ocr,
        gfr: item?.gfr,
        beban: item?.i,
        ifr: item?.ifr,
        ifs: item?.ifs,
        ift: item?.ift,
        ifn: item?.ifn,
        cbtr: item?.cbtr
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
      <FillterFasopTriphistory :onFilterChange="handleFilterChange" />
    </div>
  </AppCardCode>
</VCol>


    <!-- Table -->
    <TableIgrid
      :onclickEdit="handleEdit"
      :column="columnDefs"
      :filterValues="filterValues"
      :pathService="API_PATH().fasop.history.trip"
      :handleRespDataApi="handleRespDataApi"
      primaryKey=""
    />

</template>
