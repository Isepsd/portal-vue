<script setup lang="ts">
import FormData from '@/@core/components/FormData.vue'
import { API_PATH } from '@/composables/_path.service'
import { JaringanUnitPembangkitField } from '@/pages/jaringan/component/interface/jaringan-unit-pembangkit.interface'
import { JENIS_LOKASI } from '@/pages/jaringan/component/jenis-lokasi.config'
import { showNotification } from '@/utils/notification'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// Route dan auth
const route = useRoute()

// Options untuk dropdown
const unitIndukOptions = ref<any[]>([])

// Custom validation function
const validateUnitPembangkitForm = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!formData.nama_lokasi) {
    errors.nama_lokasi = 'Nama Wajib diisi'
  }

  if (typeof formData.lat !== 'number' || isNaN(formData.lat)) {
    errors.lat = 'Latitude harus number'
  }

  if (typeof formData.lon !== 'number' || isNaN(formData.lon)) {
    errors.lon = 'Longitude harus number'
  }

  return errors
}

// Handle data loaded event
const handleDataLoaded = (data: any) => {
  console.log('Data loaded:', data)
}

// Handle form submit event
const handleFormSubmit = (result: any) => {
  if (result.success) {
    const action = route.params.id ? 'mengubah' : 'menambah'
    showNotification(`Sukses ${action} data unit pembangkit`, 'success')
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

// Watch untuk status listrik (mirip dengan React useWatch)
const watchStatusListrik = (form: any) => {
  // Transform status seperti React version
  if (form.status_listrik !== '1') {
    form.status_listrik = '0'
  }
}

// Initialize
onMounted(async () => {
  console.log('Unit Pembangkit form mounted')
})
</script>

<template>
  <!-- Menggunakan FormData component dengan pattern mirip React FormData -->
  <FormData
    :fields="JaringanUnitPembangkitField"
    :path="API_PATH().master.jaringan.ref_lokasi"
    custom-label="Unit Pembangkit"
    @data-loaded="handleDataLoaded"
    @form-submit="handleFormSubmit"
    @loading-change="handleLoadingChange"
    :on-get-data-result="(data) => {
      watchStatusListrik(data)
    }"
  >
    <template #default="{ form, loading, errors, fetchDynamicData, validateForm, submitForm }">
      <VRow class="match-height">
        <!-- Unit Induk - Dynamic data fetching source -->
        <VCol cols="12" md="7">
          <SelectDynamic
            v-model="form.id_unit_induk"
            fieldName="id_unit_induk"
            :items="unitIndukOptions"
            labelField="nama_lokasi"
            valueField="id_ref_lokasi"
            label="Unit Induk *"
            placeholder="Pilih Unit Induk"
            :error-messages="errors.id_unit_induk"
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

        <!-- Nama Unit Pembangkit -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.nama_lokasi"
            label="Nama Unit Pembangkit *"
            placeholder="Masukkan Nama Unit Pembangkit"
            :error-messages="errors.nama_lokasi"
            required
          />
        </VCol>

        <!-- Alamat -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.alamat"
            label="Alamat *"
            placeholder="Masukkan Alamat"
            :error-messages="errors.alamat"
            required
          />
        </VCol>

        <!-- Latitude -->
        <VCol cols="12" md="7">
          <VTextField
            v-model.number="form.lat"
            label="Latitude *"
            type="number"
            placeholder="Masukkan Latitude"
            :error-messages="errors.lat"
            required
          />
        </VCol>

        <!-- Longitude -->
        <VCol cols="12" md="7">
          <VTextField
            v-model.number="form.lon"
            label="Longitude *"
            type="number"
            placeholder="Masukkan Longitude"
            :error-messages="errors.lon"
            required
          />
        </VCol>

        <!-- Path1 -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.path1"
            label="Path1"
            placeholder="Masukkan Path1"
            :error-messages="errors.path1"
            clearable
          />
        </VCol>

        <!-- Path2 -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.path2"
            label="Path2"
            placeholder="Masukkan Path2"
            :error-messages="errors.path2"
            clearable
          />
        </VCol>

        <!-- Path3 -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.path3"
            label="Path3"
            placeholder="Masukkan Path3"
            :error-messages="errors.path3"
            clearable
          />
        </VCol>

        <!-- Status Aktif -->
        <VCol cols="12" md="7">
          <VSwitch
            v-model="form.status_listrik"
            :label="form.status_listrik === '1' ? 'Active' : 'Inactive'"
            true-value="1"
            false-value="0"
            inset
          />
        </VCol>

        <!-- Submit Button -->
        <VCol cols="12" class="mt-4">
          <VBtn 
            color="primary" 
            @click="async () => {
              if (validateForm(validateUnitPembangkitForm)) {
                // Custom submit data preparation (mirip React)
                const submitData = {
                  ...form,
                  id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
                  tree_jaringan: 1,
                }
                // Submit form dengan custom data
                await submitForm(submitData)
              }
            }"
            :loading="loading"
            :disabled="loading"
          >
            Simpan
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
