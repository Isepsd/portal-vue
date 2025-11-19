<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper'
import { API_PATH } from '@/composables/_path.service'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TableIgrid from './component/TableIgrid.vue'
import { JENIS_PEMBANGKIT_COLUMNS } from './component/columnref/pembangkit.config'
import { JENIS_LOKASI } from './component/jenis-lokasi.config'

const router = useRouter()

const filterValues = ref<any>({
  id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
  sort_by: '-tgl_update,id',
  page: 1,
  limit: 10,
})
const columnDefs = ref(JENIS_PEMBANGKIT_COLUMNS())
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
    let alamat: string = item?.alamat;
      if (item?.ref_district) {
        alamat += ", " + item?.ref_district?.name
      }
      if (item?.ref_regency) {
        alamat += ", " + item?.ref_regency?.name
      }
      if (item?.ref_province) {
        alamat += ", " + item?.ref_province?.name
      }
    return {
      number: (page - 1) * limit + idx + 1,
        id: item?.id,
        nama: item?.nama,
    }
  })


const handleEdit = (item: any) => {
  router.push(`/masteropsisdis/kelompokgangguan/edit/${item.id}`)
}

const handleAdd = () => {
  router.push('/masteropsisdis/kelompokgangguan/tambah')
}

onMounted(() => {
  const roleAccess: any = ROLE_ACCESS('jenispembangkit')
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
</script>
<template>
 <!-- Header -->
  <VCard class="header-card mb-6 pa-4">
    <VRow class="align-center">
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
          <h2 class="header-title">Kelompok Gangguan</h2>
          <p class="header-subtitle">
          </p>
          <VBtn
            v-if="roleActions.create"
            color="primary"
            prepend-icon="tabler-plus"
            class="elevated-btn mt-3"
            @click="handleAdd"
          >
            Tambah Kelompok Gangguan
          </VBtn>
        </div>
      </VCol>
    </VRow>
  </VCard>


    <!-- Table -->
    <TableIgrid
      :editBtn="roleActions?.update"
      :deleteBtn="roleActions?.delete"
      :onclickEdit="handleEdit"
      :column="columnDefs"
      :filterValues="filterValues"
      :pathService="API_PATH().master.opsisdis.rekap_padam.kelompok_penyebab"
      :handleRespDataApi="handleRespDataApi"
      primaryKey="id"
    />

</template>
