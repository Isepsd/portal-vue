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
const pembangkitOptions = ref<any[]>([])

const up2bOptions = ref<any[]>([])
const unitindukOptions = ref<any[]>([])

// Custom validation function
const validateGarduIndukForm = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {}

  // if (!formData.ssot_number) {
  //   errors.ssot_number = 'Nama Wajib diisi'
  // }

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

const jenisOptions = ref([
  { value: 'AMR', text: 'AMR' },
  { value: 'SCADA', text: 'SCADA' },
  { value: 'PORTAL EXT', text: 'PORTAL EXT' },
])

const jenislayananOptions = ref([
  { text: 'NON KTT', value: 'NON KTT' },
  { text: 'KTT', value: 'KTT' },
  { text: 'CAMPURAN', value: 'CAMPURAN' }
])

const jenisgiOptions = ref([
  { value: '', text: '-' },
  { value: 'GI', text: 'GI' },
  { value: 'GIS', text: 'GIS' },
])

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
const fetchpembangkit = async (fetchDynamicData: any) => {
  await fetchDynamicData(
    API_PATH().master.jaringan.ref_lokasi,
    {
      page: 1,
      limit: 1000,
      id_ref_jenis_lokasi_in: `${JENIS_LOKASI().uiw},${JENIS_LOKASI().uid}`
    },
    {
      onSuccess: (result: any) => {
        pembangkitOptions.value = result
      }
    }
  )
}

const fetchunitinduk = async (fetchDynamicData: any) => {
  await fetchDynamicData(
    API_PATH().master.jaringan.ref_lokasi,
    {
      page: 1,
      limit: 1000,
      id_ref_jenis_lokasi_in: `${JENIS_LOKASI().uiw},${JENIS_LOKASI().uid}`
    },
    {
      onSuccess: (result: any) => {
        unitindukOptions.value = result
      }
    }
  )
}

const fetchup2b = async (fetchDynamicData: any) => {
  await fetchDynamicData(
    API_PATH().master.jaringan.ref_lokasi,
    {
      page: 1,
      limit: 1000,
      id_ref_jenis_lokasi_in: `${JENIS_LOKASI().up2b}`
    },
    {
      onSuccess: (result: any) => {
        up2bOptions.value = result
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
    custom-label="Gardu Induk"
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
            v-model="form.id_pembangkit"
            fieldName="id_pembangkit"
            :items="pembangkitOptions"
            labelField="nama_lokasi"
            valueField="id_ref_lokasi"
            label="Pembangkit *"
            placeholder="Pilih Pembangkit"
            :error-messages="errors.id_pembangkit"
            :isClearable="true"
            pathServiceName="master.jaringan.ref_lokasi"
            :queryParams="{
              page: 1,
              limit: 1000,
              id_ref_jenis_lokasi_in: `${JENIS_LOKASI().pembangkit}`
            }"
            @update:model-value="() => fetchpembangkit(fetchDynamicData)"
          />
        </VCol>
        <VCol cols="12" md="5">
          <VSelect
            v-model="form.sinkron_data"
            :items="jenisOptions"
            item-title="text"
            item-value="value"
            label="Sinkron Data *"
            placeholder="Pilih Sinkron Data"
            :error-messages="errors.sinkron_data"
            required
            clearable
          />
        </VCol>
        <template v-if="form.sinkron_data === 'SCADA'">
  <VCol cols="12" md="4">
    <VTextField
      v-model="form.path1"
      label="Path1"
      :error-messages="errors.path1"
    />
  </VCol>
  <VCol cols="12" md="4">
    <VTextField
      v-model="form.path2"
      label="Path2"
      :error-messages="errors.path2"
    />
  </VCol>
  <VCol cols="12" md="4">
    <VTextField
      v-model="form.path3"
      label="Path3"
      :error-messages="errors.path3"
    />
  </VCol>
  <VCol cols="12" md="6">
    <VTextField
      v-model="form.id_i"
      label="ID I (Arus)"
      :error-messages="errors.id_i"
    />
  </VCol>
  <VCol cols="12" md="6">
    <VTextField
      v-model="form.id_v"
      label="ID V (Tegangan)"
      :error-messages="errors.id_v"
    />
  </VCol>
</template>

<!-- AMR Field -->
<template v-if="form.sinkron_data === 'AMR'">
  <VCol cols="12" md="6">
    <VTextField
      v-model="form.id_amr"
      label="ID AMR *"
      :error-messages="errors.id_amr"
      required
    />
  </VCol>
</template>

<!-- PORTAL EXT Fields -->
<template v-if="form.sinkron_data === 'PORTAL EXT'">
  <VCol cols="12" md="6">
    <VTextField
      v-model="form.id_portal_ext"
      label="ID Portal EXT *"
      :error-messages="errors.id_portal_ext"
      required
    />
  </VCol>
  <VCol cols="12" md="6">
    <VTextField
      v-model="form.url_webservice"
      label="URL Webservice *"
      :error-messages="errors.url_webservice"
      required
    />
  </VCol>
</template>

        <!-- Nama Unit Pembangkit -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.ssot_number"
            label="Kode SSOT"
            placeholder="Masukkan Kode SSOT"
            :error-messages="errors.ssot_number"
          />
        </VCol>
        <VCol cols="12" md="5">
          <VTextField
            v-model="form.load"
            label="LOAD"
            placeholder="Masukkan LOAD"
            :error-messages="errors.load"
          />
        </VCol>
        <VCol cols="12" md="7">
          <SelectDynamic
            v-model="form.id_up2b"
            fieldName="id_up2b"
            :items="up2bOptions"
            labelField="nama_lokasi"
            valueField="id_ref_lokasi"
            label="Pembangkit *"
            placeholder="Pilih UP2B"
            :error-messages="errors.id_up2b"
            :isClearable="true"
            pathServiceName="master.jaringan.ref_lokasi"
            :queryParams="{
              page: 1,
              limit: 1000,
              id_ref_jenis_lokasi_in: `${JENIS_LOKASI().up2b}`
            }"
            @update:model-value="() => fetchup2b(fetchDynamicData)"
          />
        </VCol>
        <VCol cols="12" md="7">
          <SelectDynamic
            v-model="form.id_unit_induk"
            fieldName="id_unit_induk"
            :items="unitindukOptions"
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
            @update:model-value="() => fetchunitinduk(fetchDynamicData)"
          />
        </VCol>
        <!-- Kode Gardu Induk -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.kode_lokasi"
            label="Kode Gardu Induk *"
            placeholder="Masukkan Kode Gardu Induk"
            :error-messages="errors.kode_lokasi"
          />
        </VCol>
        <!-- Nama Gardu Induk -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.nama_lokasi"
            label="Nama Gardu Induk *"
            placeholder="Masukkan Nama Gardu Induk"
            :error-messages="errors.nama_lokasi"
            required
          />
        </VCol>
        <!---Jenis Layanan --->
        <VCol cols="12" md="7">
          <VSelect
            v-model="form.jenis_layanan"
            :items="jenislayananOptions"
            item-title="text"
            item-value="value"
            label="Jenis Layanan *"
            placeholder="Pilih Jenis Layanan"
            :error-messages="errors.jenis_layanan"
            clearable
          />
        </VCol>
        <!--Jenis GI-->
        <VCol cols="12" md="7">
          <VSelect
            v-model="form.jenis_gi"
            :items="jenisgiOptions"
            item-title="text"
            item-value="value"
            label="Jenis GI *"
            placeholder="Pilih Jenis GI"
            :error-messages="errors.jenis_gi"
            clearable
          />
        </VCol>
        <!-- Alamat -->
        <VCol cols="12" md="7">
          <VTextField
            v-model="form.alamat"
            label="Alamat"
            placeholder="Masukkan Alamat"
            :error-messages="errors.alamat"
            clearable
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

        <!-- Status Aktif -->
        <VCol cols="12" md="7">
          <VLabel>Status Listrik</VLabel>
          <VSwitch
            v-model="form.status_listrik"
            :label="form.status_listrik === '1' ? 'Active' : 'Inactive'"
            true-value="1"
            false-value="0"
            inset
          />
        </VCol>

        <!-- Rekon Beban -->
        <VCol cols="12" md="7">
          <VLabel>Rekon Beban</VLabel>
          <VSwitch
            v-model="form.rekon_beban"
            :label="form.rekon_beban === '1' ? 'Iya' : 'Tidak'"
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
              if (validateForm(validateGarduIndukForm)) {
                // Custom submit data preparation (mirip React)
                const submitData = {
                  ...form,
                  id_ref_jenis_lokasi: JENIS_LOKASI().gardu_induk,
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
