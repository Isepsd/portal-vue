<script setup lang="ts">
import FormData from '@/@core/components/FormData.vue'
import { API_PATH } from '@/composables/_path.service'
// import { useEmit } from '@/composables/useemit'
import { JarianganPembangkitField } from '@/pages/jaringan/component/interface/jaringan-pembangkit.interface'
import { JENIS_LOKASI } from '@/pages/jaringan/component/jenis-lokasi.config'
import { SINKRON_DATA } from '@/pages/jaringan/component/sinkron-data.config'
// import { useAuthStore } from '@/pages/stores/auth'
import FormMappingScada from '@/pages/jaringan/component/FormMappingScada.vue'
import { showNotification } from '@/utils/notification'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// Route dan auth
const route = useRoute()
// const authStore = useAuthStore()
// const { emitFilterChange } = useEmit()

// Options untuk dropdown
const unitIndukOptions = ref<any[]>([])
const unitPembangkitOptions = ref<any[]>([])
const jenisPembangkitOptions = ref<any[]>([])
const sinkronDataOptions = ref(SINKRON_DATA)

// Custom validation function
const validatePembangkitForm = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!formData.nama_lokasi) {
    errors.nama_lokasi = 'Nama Pembangkit wajib diisi'
  }

  if (!formData.id_parent_lokasi) {
    errors.id_parent_lokasi = 'Unit Pembangkit wajib dipilih'
  }

  if (!formData.id_ref_jenis_pembangkit) {
    errors.id_ref_jenis_pembangkit = 'Jenis Pembangkit wajib dipilih'
  }

  if (typeof formData.lat !== 'number' || isNaN(formData.lat)) {
    errors.lat = 'Latitude harus berupa angka'
  }

  if (typeof formData.lon !== 'number' || isNaN(formData.lon)) {
    errors.lon = 'Longitude harus berupa angka'
  }

  if (typeof formData.no_urut !== 'number' || isNaN(formData.no_urut)) {
    errors.no_urut = 'No Urut harus berupa angka'
  }

  if (!formData.sinkron_data) {
    errors.sinkron_data = 'Sinkron data wajib diisi'
  }

  return errors
}

// Handle data loaded event
const handleDataLoaded = (data: any) => {
  console.log('Data loaded:', data)
  // Trigger auto-populate untuk unit pembangkit saat load data edit
  if (data.id_unit_induk) {
    fetchUnitPembangkit(data.id_unit_induk)
  }
}

// Handle form submit event
const handleFormSubmit = (result: any) => {
  if (result.success) {
    const action = route.params.id ? 'mengubah' : 'menambah'
    showNotification(`Sukses ${action} data pembangkit`, 'success')
  } else {
    showNotification('Gagal menyimpan data', 'error')
  }
}

// Handle loading change
const handleLoadingChange = (loading: boolean) => {
  console.log('Loading state:', loading)
}

// Dynamic data fetching functions
const fetchUnitInduk = async (fetchDynamicData: any) => {
  await fetchDynamicData(
    API_PATH().master.jaringan.ref_lokasi,
    {
      page: 1,
      limit: 1000,
      id_ref_jenis_lokasi_in: `${JENIS_LOKASI().uiw},${JENIS_LOKASI().uid}`
    },
    {
      onSuccess: (result: any) => {
        unitIndukOptions.value = result
      }
    }
  )
}

const fetchUnitPembangkit:any = async (idUnitInduk: string, fetchDynamicData: any) => {
  if (!idUnitInduk) {
    unitPembangkitOptions.value = []
    return
  }

  await fetchDynamicData(
    API_PATH().master.jaringan.ref_lokasi,
    {
      page: 1,
      limit: 1000,
      sort_by: 'nama_lokasi',
      id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
      id_unit_induk: idUnitInduk
    },
    {
      onSuccess: (result: any) => {
        unitPembangkitOptions.value = result
      }
    }
  )
}

const fetchJenisPembangkit = async (fetchDynamicData: any) => {
  await fetchDynamicData(
    API_PATH().master.jaringan.jenis_pembangkit,
    {
      page: 1,
      limit: 1000
    },
    {
      onSuccess: (result: any) => {
        jenisPembangkitOptions.value = result
      }
    }
  )
}

// Initialize
onMounted(async () => {
  // Will be called after FormData component initializes
  console.log('Pembangkit form mounted')
})
</script>

<template>
  <!-- Menggunakan FormData component dengan pattern mirip React FormData -->
  <FormData
    :fields="JarianganPembangkitField"
    :path="API_PATH().master.jaringan.ref_lokasi"
    custom-label="Pembangkit"
    @data-loaded="handleDataLoaded"
    @form-submit="handleFormSubmit"
    @loading-change="handleLoadingChange"
    :on-get-data-result="async (data) => {
      if (data.id_unit_induk) {
        await fetchUnitPembangkit(data.id_unit_induk)
      }
    }"
  >
    <template #default="{ form, loading, errors, fetchDynamicData, validateForm, submitForm }">
      <VRow class="match-height">
        <!-- Unit Induk - Dynamic data fetching source -->
        <VCol cols="12" md="6">
          <SelectDynamic
            v-model="form.id_pemilik"
            fieldName="id_pemilik"
            :items="unitIndukOptions"
            labelField="nama_lokasi"
            valueField="id_ref_lokasi"
            label="Unit Induk"
            placeholder="Pilih Unit Induk"
            :error-messages="errors.id_pemilik"
            :isClearable="true"
            pathServiceName="master.jaringan.ref_lokasi"
            :queryParams="{
              page: 1,
              limit: 1000,
              id_ref_jenis_lokasi_in: `${JENIS_LOKASI().uiw},${JENIS_LOKASI().uid}`
            }"
            @update:model-value="() => fetchUnitInduk(fetchDynamicData)"
          />
        </VCol>

        <!-- Unit Pembangkit - Auto-populate based on selected Unit Induk -->
        <VCol cols="12" md="6">
          <SelectDynamic
            v-model="form.id_parent_lokasi"
            fieldName="id_parent_lokasi"
            :items="unitPembangkitOptions"
            labelField="nama_lokasi"
            valueField="id_ref_lokasi"
            label="Unit Pembangkit"
            placeholder="Pilih Unit Pembangkit"
            :error-messages="errors.id_parent_lokasi"
            :isClearable="true"
            :disabled="!form.id_unit_induk"
            pathServiceName="master.jaringan.ref_lokasi"
            :queryParams="{
              page: 1,
              limit: 1000,
              sort_by: 'nama_lokasi',
              id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
              id_unit_induk: form.id_unit_induk
            }"
            @update:model-value="(val) => {
              if (val) {
                fetchUnitPembangkit(val, fetchDynamicData)
              }
            }"
          />
        </VCol>

        <!-- Jenis Pembangkit -->
        <VCol cols="12" md="6">
          <SelectDynamic
            v-model="form.id_ref_jenis_pembangkit"
            fieldName="id_ref_jenis_pembangkit"
            :items="jenisPembangkitOptions"
            labelField="nama"
            valueField="id_ref_jenis_pembangkit"
            label="Jenis Pembangkit"
            placeholder="Pilih Jenis Pembangkit"
            :error-messages="errors.id_ref_jenis_pembangkit"
            :isClearable="true"
            pathServiceName="master.jaringan.jenis_pembangkit"
            :queryParams="{ page: 1, limit: 1000 }"
            @update:model-value="() => fetchJenisPembangkit(fetchDynamicData)"
          />
        </VCol>

        <!-- Nama Pembangkit -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.nama_lokasi"
            label="Nama Pembangkit"
            placeholder="Masukkan Nama Pembangkit"
            :error-messages="errors.nama_lokasi"
            required
          />
        </VCol>

        <!-- Latitude -->
        <VCol cols="12" md="6">
          <VTextField
            v-model.number="form.lat"
            label="Latitude"
            type="number"
            placeholder="Masukkan Latitude"
            :error-messages="errors.lat"
            required
          />
        </VCol>

        <!-- Longitude -->
        <VCol cols="12" md="6">
          <VTextField
            v-model.number="form.lon"
            label="Longitude"
            type="number"
            placeholder="Masukkan Longitude"
            :error-messages="errors.lon"
            required
          />
        </VCol>

        <!-- No Urut -->
        <VCol cols="12" md="6">
          <VTextField
            v-model.number="form.no_urut"
            label="No Urut"
            type="number"
            placeholder="Masukkan No Urut"
            :error-messages="errors.no_urut"
            required
          />
        </VCol>

        <!-- Status Listrik -->
        <VCol cols="12" md="6">
          <VSwitch
            v-model="form.status_listrik"
            label="Status Listrik"
            true-value="1"
            false-value="0"
            inset
          />
        </VCol>

        <!-- Sinkron Data -->
        <VCol cols="12">
          <VSelect
            v-model="form.sinkron_data"
            label="Sinkron Data *"
            placeholder="Pilih Sinkron Data"
            :error-messages="errors.sinkron_data"
            :items="sinkronDataOptions"
            item-title="label"
            item-value="value"
            required
            clearable
          />
        </VCol>

        <!-- Conditional SCADA Fields -->
        <FormMappingScada
          :form="form"
          :errors="errors"
        />

        <!-- Submit Button -->
        <VCol cols="12" class="mt-4">
          <VBtn 
            color="primary" 
            @click="async () => {
              if (validateForm(validatePembangkitForm)) {
                // Custom submit data preparation
                const submitData = {
                  ...form,
                  id_unit_pembangkit: form.id_parent_lokasi,
                  id_ref_jenis_lokasi: JENIS_LOKASI().pembangkit,
                  tree_jaringan: 1,
                }
                // Submit form dengan custom data
                await submitForm(submitData)
              }
            }"
            :loading="loading"
            :disabled="loading"
          >
            {{ route.params.id ? 'Update' : 'Simpan' }}
          </VBtn>
          <VBtn 
            color="secondary" 
            class="ml-2"
            @click="$router.go(-1)"
          >
            Batal
          </VBtn>
        </VCol>
      </VRow>
    </template>
  </FormData>
</template>
