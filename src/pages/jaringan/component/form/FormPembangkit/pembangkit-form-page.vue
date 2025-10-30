<script setup lang="ts">
import { API_PATH } from '@/composables/_path.service';
import { getAllByPath, getByIdPath, postByPath, putByPath } from '@/composables/main.service';
import { useEmit } from '@/composables/useemit';
import { IJaringanPembangkit, JarianganPembangkitField } from '@/pages/jaringan/component/interface/jaringan-pembangkit.interface';
import { JENIS_LOKASI } from '@/pages/jaringan/component/jenis-lokasi.config';
import { useAuthStore } from '@/pages/stores/auth';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
// Interface untuk data pembangkit


// Form fields default values

// Route dan auth
const route = useRoute();
const authStore = useAuthStore();
const { emitFilterChange } = useEmit();

// Form data
const form = ref<IJaringanPembangkit>({...JarianganPembangkitField });
const loading = ref<boolean>(false);
const dataSelected = ref<any>(null);
const dataParams = ref<any>(null);

// Options untuk dropdown
const unitIndukOptions = ref<any[]>([]);
const unitPembangkitOptions = ref<any[]>([]);
const jenisPembangkitOptions = ref<any[]>([]);

// Get current user
const currentUser = computed(() => authStore.credentials);

// Validasi form
const formErrors = ref<Record<string, string>>({});

// Get data by ID untuk edit
const getDataById = async (id: string) => {
  loading.value = true;
  try {
    const response:any = await getByIdPath(API_PATH().master.jaringan.ref_lokasi, id, null);
    if (response?.results) {
      dataSelected.value = response.results;
      // Set form values
      Object.keys(response.results).forEach((key) => {
        if (key in form.value) {
          (form.value as any)[key] = response.results[key];
        }
      });
      
      // Trigger auto-populate untuk unit pembangkit
      if (response.results.id_unit_induk) {
        await getUnitPembangkit(response.results.id_unit_induk);
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// Get Unit Induk options
const getUnitInduk = async () => {
  try {
    const response:any = await getAllByPath(API_PATH().master.jaringan.ref_lokasi, {
      page: 1,
      limit: 1000,
      id_ref_jenis_lokasi_in: `${JENIS_LOKASI().uiw},${JENIS_LOKASI().uid}`
    }, null);
    
    if (response?.results?.data) {
      unitIndukOptions.value = response.results.data;
    }
  } catch (error) {
    console.error('Error fetching unit induk:', error);
  }
};

// Get Unit Pembangkit based on selected Unit Induk - ini yang dinamis berdasarkan fieldName="id_unit_induk"
const getUnitPembangkit = async (idUnitInduk?: string) => {
  const unitIndukId = idUnitInduk || form.value.id_unit_induk;
  if (!unitIndukId) {
    unitPembangkitOptions.value = [];
    return;
  }

  try {
    const response:any = await getAllByPath(API_PATH().master.jaringan.ref_lokasi, {
      page: 1,
      limit: 1000,
      sort_by: 'nama_lokasi',
      id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
      id_unit_induk: unitIndukId // Dynamic filtering berdasarkan selected unit induk
    }, null);
    
    if (response?.results?.data) {
      unitPembangkitOptions.value = response.results.data;
    }
  } catch (error) {
    console.error('Error fetching unit pembangkit:', error);
  }
};

// Get Jenis Pembangkit options
const getJenisPembangkit = async () => {
  try {
    const response:any = await getAllByPath(API_PATH().master.jaringan.jenis_pembangkit, {
      page: 1,
      limit: 1000
    }, null);
    
    if (response?.results?.data) {
      jenisPembangkitOptions.value = response.results.data;
    }
  } catch (error) {
    console.error('Error fetching jenis pembangkit:', error);
  }
};

// Watch untuk perubahan id_unit_induk - ini adalah kunci dynamic data fetching
watch(() => form.value.id_unit_induk, (newValue) => {
  if (newValue) {
    getUnitPembangkit(newValue);
  } else {
    unitPembangkitOptions.value = [];
    form.value.id_parent_lokasi = '';
  }
});

// Watch untuk perubahan form values
watch(form, (newVal) => {
  emitFilterChange(newVal);
}, { deep: true });

// Validasi form
const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  if (!form.value.nama_lokasi) {
    errors.nama_lokasi = 'Nama Wajib diisi';
  }

  if (!form.value.id_parent_lokasi) {
    errors.id_parent_lokasi = 'Belum pilih unit pembangkit';
  }

  if (!form.value.id_ref_jenis_pembangkit) {
    errors.id_ref_jenis_pembangkit = 'Belum pilih jenis pembangkit';
  }

  if (typeof form.value.lat !== 'number' || isNaN(form.value.lat)) {
    errors.lat = 'Latitude harus number';
  }

  if (typeof form.value.lon !== 'number' || isNaN(form.value.lon)) {
    errors.lon = 'Longitude harus number';
  }

  if (typeof form.value.no_urut !== 'number' || isNaN(form.value.no_urut)) {
    errors.no_urut = 'No Urut Cell harus number';
  }

  if (!form.value.sinkron_data) {
    errors.sinkron_data = 'Sinkron data harus diisi';
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  // Prepare data
  const submitData: any = {
    ...form.value,
    id_unit_pembangkit: form.value.id_parent_lokasi,
    id_ref_jenis_lokasi: JENIS_LOKASI().pembangkit,
    tree_jaringan: 1,
  };

  // Add user info
  const isEdit = route.params.id;
  if (isEdit) {
    submitData.id_user_updated = currentUser.value?.id_user;
  } else {
    submitData.id_user_created = currentUser.value?.id_user;
  }

  dataParams.value = submitData;

  try {
    let response:any;
    if (isEdit) {
      response = await putByPath(API_PATH().master.jaringan.ref_lokasi, submitData, route.params.id, null);
    } else {
      response = await postByPath(API_PATH().master.jaringan.ref_lokasi, submitData, null);
    }

    if (response?.status === 200 || response?.status === 201) {
      console.log('Success:', response);
      // Reset form jika baru
      if (!isEdit) {
        form.value = { ...JarianganPembangkitField };
      }
    } else {
      console.error('Error:', response?.message);
    }
  } catch (error: any) {
    console.error('Submit error:', error);
    if (error?.response?.data?.results) {
      // Handle validation errors from server
      const serverErrors = error.response.data.results;
      Object.keys(serverErrors).forEach((key) => {
        formErrors.value[key] = serverErrors[key].join(' ');
      });
    }
  } finally {
    loading.value = false;
  }
};

// Initialize
onMounted(async () => {
  // Load initial data
  await Promise.all([
    getUnitInduk(),
    getJenisPembangkit()
  ]);

  // Check if edit mode
  if (route.params.id) {
    await getDataById(route.params.id as string);
  }
});
</script>

<template>
  <VRow class="match-height">
    <!-- Loading overlay -->
    <VOverlay v-if="loading" class="align-center justify-center">
      <VProgressCircular indeterminate size="64" />
    </VOverlay>

    <!-- Unit Induk - Dynamic data fetching source -->
    <VCol cols="12" md="6">
      <AppAutocomplete
        v-model="form.id_pemilik"
        fieldName="id_pemilik"
        :items="unitIndukOptions"
        labelField="nama_lokasi"
        valueField="id_ref_lokasi"
        label="Unit Induk"
        placeholder="Pilih Unit Induk"
        :error-messages="formErrors.id_pemilik"
        :isClearable="true"
        pathServiceName="master.jaringan.ref_lokasi"
        :queryParams="{
          page: 1,
          limit: 1000,
          id_ref_jenis_lokasi_in: `${JENIS_LOKASI().uiw},${JENIS_LOKASI().uid}`
        }"
      />
    </VCol>

    <!-- Unit Pembangkit - Auto-populate based on selected Unit Induk -->
    <VCol cols="12" md="6">
      <AppAutocomplete
        v-model="form.id_parent_lokasi"
        fieldName="id_parent_lokasi"
        :items="unitPembangkitOptions"
        labelField="nama_lokasi"
        valueField="id_ref_lokasi"
        label="Unit Pembangkit"
        placeholder="Pilih Unit Pembangkit"
        :error-messages="formErrors.id_parent_lokasi"
        :isClearable="true"
        :disabled="!form.id_unit_induk"
        pathServiceName="master.jaringan.ref_lokasi"
        :queryParams="{
          page: 1,
          limit: 1000,
          sort_by: 'nama_lokasi',
          id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
          id_unit_induk: form.id_unit_induk // Dynamic filter based on selected unit induk
        }"
      />
    </VCol>

    <!-- Jenis Pembangkit -->
    <VCol cols="12" md="6">
      <AppAutocomplete
        v-model="form.id_ref_jenis_pembangkit"
        fieldName="id_ref_jenis_pembangkit"
        :items="jenisPembangkitOptions"
        labelField="nama"
        valueField="id_ref_jenis_pembangkit"
        label="Jenis Pembangkit"
        placeholder="Pilih Jenis Pembangkit"
        :error-messages="formErrors.id_ref_jenis_pembangkit"
        :isClearable="true"
        pathServiceName="master.jaringan.jenis_pembangkit"
        :queryParams="{
          page: 1,
          limit: 1000
        }"
      />
    </VCol>

    <!-- Nama Pembangkit -->
    <VCol cols="12" md="6">
      <VTextField
        v-model="form.nama_lokasi"
        label="Nama Pembangkit"
        placeholder="Masukkan Nama Pembangkit"
        :error-messages="formErrors.nama_lokasi"
        required
      />
    </VCol>

    <!-- Alamat -->
    <VCol cols="12">
      <VTextField
        v-model="form.alamat"
        label="Alamat"
        placeholder="Masukkan Alamat"
      />
    </VCol>

    <!-- Latitude -->
    <VCol cols="12" md="6">
      <VTextField
        v-model.number="form.lat"
        label="Latitude"
        type="number"
        placeholder="Masukkan Latitude"
        :error-messages="formErrors.lat"
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
        :error-messages="formErrors.lon"
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
        :error-messages="formErrors.no_urut"
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
      <VTextField
        v-model="form.sinkron_data"
        label="Sinkron Data"
        placeholder="Masukkan Sinkron Data"
        :error-messages="formErrors.sinkron_data"
        required
      />
    </VCol>

    <!-- Additional SCADA fields (optional) -->
    <VCol cols="12" md="4">
      <VTextField
        v-model="form.path1"
        label="Path 1"
        placeholder="Masukkan Path 1"
        clearable
      />
    </VCol>

    <VCol cols="12" md="4">
      <VTextField
        v-model="form.path2"
        label="Path 2"
        placeholder="Masukkan Path 2"
        clearable
      />
    </VCol>

    <VCol cols="12" md="4">
      <VTextField
        v-model="form.path3"
        label="Path 3"
        placeholder="Masukkan Path 3"
        clearable
      />
    </VCol>

    <!-- SCADA Mapping Fields -->
    <VCol cols="12" md="3">
      <VTextField
        v-model="form.id_i"
        label="ID I"
        placeholder="Masukkan ID I"
        clearable
      />
    </VCol>

    <VCol cols="12" md="3">
      <VTextField
        v-model="form.id_v"
        label="ID V"
        placeholder="Masukkan ID V"
        clearable
      />
    </VCol>

    <VCol cols="12" md="3">
      <VTextField
        v-model="form.id_p"
        label="ID P"
        placeholder="Masukkan ID P"
        clearable
      />
    </VCol>

    <VCol cols="12" md="3">
      <VTextField
        v-model="form.id_amr"
        label="ID AMR"
        placeholder="Masukkan ID AMR"
        clearable
      />
    </VCol>

    <!-- Additional fields -->
    <VCol cols="12" md="6">
      <VTextField
        v-model="form.id_portal_ext"
        label="ID Portal Ext"
        placeholder="Masukkan ID Portal Ext"
        clearable
      />
    </VCol>

    <VCol cols="12" md="6">
      <VTextField
        v-model="form.url_webservice"
        label="URL Webservice"
        placeholder="Masukkan URL Webservice"
        clearable
      />
    </VCol>

    <!-- Submit Button -->
    <VCol cols="12" class="mt-4">
      <VBtn 
        color="primary" 
        @click="handleSubmit"
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
