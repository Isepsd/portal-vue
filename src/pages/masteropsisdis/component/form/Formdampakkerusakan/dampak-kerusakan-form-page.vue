<script setup lang="ts">
import FormData from '@/@core/components/FormData.vue'
import { API_PATH } from '@/composables/_path.service'
import { JaringanUnitPembangkitField } from '@/pages/jaringan/component/interface/jaringan-jenis-pembangkit.interface'
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

  if (!formData.nama) {
    errors.nama = 'Nama Wajib diisi'
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
    showNotification(`Sukses ${action} data dampak kerusakan`, 'success')
  } else {
    showNotification('Gagal menyimpan data', 'error')
  }
}

// Handle loading change
const handleLoadingChange = (loading: boolean) => {
  console.log('Loading state:', loading)
}

// Initialize
onMounted(async () => {
  console.log('Dampak Kerusakan form mounted')
})
</script>

<template>
  <!-- Menggunakan FormData component dengan pattern mirip React FormData -->
  <FormData
    :fields="JaringanUnitPembangkitField"
    :path="API_PATH().master.opsisdis.rekap_padam.dampak_kerusakan"
    custom-label="Dampak Kerusakan"
    @data-loaded="handleDataLoaded"
    @form-submit="handleFormSubmit"
    @loading-change="handleLoadingChange"
    :on-get-data-result="(data) => {
      // watchStatusListrik(data)
    }"
  >
    <template #default="{ form, loading, errors, fetchDynamicData, validateForm, submitForm }">
      <VRow class="match-height">
        <!-- Nama dampak kerusakan -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.nama"
            label="Nama Dampak Kerusakan *"
            placeholder="Masukkan Nama Dampak Kerusakan"
            :error-messages="errors.nama"
            required
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
