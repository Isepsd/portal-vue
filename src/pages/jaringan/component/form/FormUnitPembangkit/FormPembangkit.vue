<script setup lang="ts">
import { API_PATH } from '@/composables/_path.service';
// import { getAllByPath } from '@/composables/useApi';
import { JENIS_LOKASI } from '@/pages/jaringan/component/jenis-lokasi.config';
import { computed, onMounted, ref, watch } from 'vue';
import * as Yup from 'yup';

interface Props {
  isEdit?: boolean;
  itemId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  itemId: ''
});

const emit = defineEmits<{
  save: [data: any];
  cancel: [];
}>();

const loading = ref(false);
const dataSelected = ref<any>(null);
// const dataParams = ref<any>();

// Form validation schema
const validationSchema = Yup.object().shape({
  id_unit_induk: Yup.string().nullable(),
  nama_lokasi: Yup.string().required('Nama Wajib diisi'),
  alamat: Yup.string().nullable(),
  id_parent_lokasi: Yup.string().required('Belum pilih unit pembangkit'),
  id_ref_jenis_pembangkit: Yup.string().required('Belum pilih jenis pembangkit'),
  status_listrik: Yup.string().nullable().transform((_, v) => (v == '1' ? '1' : '0')),
  lat: Yup.number().typeError('Latitude harus number').required('Latitude Wajib diisi'),
  lon: Yup.number().typeError('Longitude harus number').required('Longitude Wajib diisi'),
  no_urut: Yup.number().typeError('No Urut Cell harus number').required('Urut Cell Wajib diisi'),
  sinkron_data: Yup.string().required('Sinkron data harus diisi'),
  path1: Yup.string().nullable(),
  path2: Yup.string().nullable(),
  path3: Yup.string().nullable(),
  id_i: Yup.string().nullable(),
  id_v: Yup.string().nullable(),
  id_p: Yup.string().nullable(),
  id_amr: Yup.string().nullable(),
  url_webservice: Yup.string().nullable(),
  id_portal_ext: Yup.string().nullable(),
});

const formModel = ref<any>({ 
  status_listrik: '1', 
  lat: 0, 
  lon: 0, 
  id_ref_province: process.env.VITE_ADM_PROVINCE 
});

const formData = ref<any>({ ...formModel.value });
const errors = ref<any>({});

// Watch for form changes and validate
watch(formData, (newData) => {
  validateForm(newData);
}, { deep: true });

const validateForm = async (data: any) => {
  try {
    await validationSchema.validate(data, { abortEarly: false });
    errors.value = {};
    return true;
  } catch (err: any) {
    errors.value = {};
    if (err.inner) {
      err.inner.forEach((error: any) => {
        errors.value[error.path] = error.message;
      });
    }
    return false;
  }
};

const onSubmit = async () => {
  const isValid = await validateForm(formData.value);
  if (!isValid) {
    return;
  }

  loading.value = true;
  
  const submitData = {
    ...formData.value,
    id_ref_jenis_lokasi: JENIS_LOKASI().pembangkit,
    tree_jaringan: 1,
  };

  if (props.isEdit && props.itemId) {
    submitData.id_ref_lokasi = props.itemId;
    submitData.id_user_updated = 1; // TODO: Get from auth store
  } else {
    submitData.id_user_created = 1; // TODO: Get from auth store
  }

  emit('save', submitData);
};

const onCancel = () => {
  emit('cancel');
};

// Load data for edit mode
onMounted(async () => {
  if (props.isEdit && props.itemId) {
    try {
      const response = await getAllByPath(
        `${API_PATH().master.jaringan.ref_lokasi}/${props.itemId}`,
        {},
        null
      );
      
      if (response?.data) {
        dataSelected.value = response.data;
        formData.value = { ...formModel.value, ...response.data };
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
});

// Computed properties for form fields
const watchStatus = computed(() => formData.value.status_listrik);
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <VRow>
      <!-- Left Column -->
      <VCol md="7">
        <VCard class="mb-4">
          <VCardTitle>Informasi Utama</VCardTitle>
          <VCardText>
            <!-- Unit Induk -->
            <VFormGroup class="mt-3">
              <VLabel>
                Unit Induk <span class="text-error">*</span>
              </VLabel>
              <VSelect
                v-model="formData.id_unit_induk"
                :items="[]"
                item-title="nama_lokasi"
                item-value="id_ref_lokasi"
                :error-messages="errors.id_unit_induk"
                outlined
              />
            </VFormGroup>

            <!-- Unit Pembangkit -->
            <VFormGroup class="mt-3">
              <VLabel>
                Unit Pembangkit <span class="text-error">*</span>
              </VLabel>
              <VSelect
                v-model="formData.id_parent_lokasi"
                :items="dataSelected?.parent_lokasi || []"
                item-title="nama_lokasi"
                item-value="id_ref_lokasi"
                :error-messages="errors.id_parent_lokasi"
                outlined
              />
            </VFormGroup>

            <!-- Jenis Pembangkit -->
            <VFormGroup class="mt-3">
              <VLabel>
                Jenis Pembangkit <span class="text-error">*</span>
              </VLabel>
              <VSelect
                v-model="formData.id_ref_jenis_pembangkit"
                :items="[]"
                item-title="nama"
                item-value="id_ref_jenis_pembangkit"
                :error-messages="errors.id_ref_jenis_pembangkit"
                outlined
              />
            </VFormGroup>

            <!-- Nama Pembangkit -->
            <VFormGroup class="mt-3">
              <VLabel>
                Nama Pembangkit <span class="text-error">*</span>
              </VLabel>
              <VTextField
                v-model="formData.nama_lokasi"
                :error-messages="errors.nama_lokasi"
                outlined
              />
            </VFormGroup>

            <!-- No Urut -->
            <VFormGroup class="mt-3">
              <VLabel>
                No Urut <span class="text-error">*</span>
              </VLabel>
              <VTextField
                v-model.number="formData.no_urut"
                type="number"
                :error-messages="errors.no_urut"
                outlined
              />
            </VFormGroup>

            <!-- Status Listrik -->
            <VFormGroup class="mt-3">
              <VLabel>Status Listrik</VLabel>
              <div class="ms-3 py-2">
                <VSwitch
                  v-model="formData.status_listrik"
                  :label="watchStatus ? 'Active' : 'Inactive'"
                  inset
                />
              </div>
            </VFormGroup>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Right Column -->
      <VCol md="5">
        <VCard class="mb-4">
          <VCardTitle>Konfigurasi SCADA</VCardTitle>
          <VCardText>
            <!-- Path 1 -->
            <VFormGroup class="mt-3">
              <VLabel>Path 1</VLabel>
              <VTextField
                v-model="formData.path1"
                :error-messages="errors.path1"
                outlined
              />
            </VFormGroup>

            <!-- Path 2 -->
            <VFormGroup class="mt-3">
              <VLabel>Path 2</VLabel>
              <VTextField
                v-model="formData.path2"
                :error-messages="errors.path2"
                outlined
              />
            </VFormGroup>

            <!-- Path 3 -->
            <VFormGroup class="mt-3">
              <VLabel>Path 3</VLabel>
              <VTextField
                v-model="formData.path3"
                :error-messages="errors.path3"
                outlined
              />
            </VFormGroup>

            <!-- ID I -->
            <VFormGroup class="mt-3">
              <VLabel>ID I</VLabel>
              <VTextField
                v-model="formData.id_i"
                :error-messages="errors.id_i"
                outlined
              />
            </VFormGroup>

            <!-- ID V -->
            <VFormGroup class="mt-3">
              <VLabel>ID V</VLabel>
              <VTextField
                v-model="formData.id_v"
                :error-messages="errors.id_v"
                outlined
              />
            </VFormGroup>

            <!-- ID P -->
            <VFormGroup class="mt-3">
              <VLabel>ID P</VLabel>
              <VTextField
                v-model="formData.id_p"
                :error-messages="errors.id_p"
                outlined
              />
            </VFormGroup>

            <!-- ID AMR -->
            <VFormGroup class="mt-3">
              <VLabel>ID AMR</VLabel>
              <VTextField
                v-model="formData.id_amr"
                :error-messages="errors.id_amr"
                outlined
              />
            </VFormGroup>

            <!-- URL Web Service -->
            <VFormGroup class="mt-3">
              <VLabel>URL Web Service</VLabel>
              <VTextField
                v-model="formData.url_webservice"
                :error-messages="errors.url_webservice"
                outlined
              />
            </VFormGroup>

            <!-- ID Portal External -->
            <VFormGroup class="mt-3">
              <VLabel>ID Portal External</VLabel>
              <VTextField
                v-model="formData.id_portal_ext"
                :error-messages="errors.id_portal_ext"
                outlined
              />
            </VFormGroup>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Form Actions -->
    <VRow class="mt-4">
      <VCol cols="12" class="d-flex gap-3">
        <VBtn
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="loading"
        >
          {{ props.isEdit ? 'Update' : 'Simpan' }}
        </VBtn>
        
        <VBtn
          color="secondary"
          variant="outlined"
          @click="onCancel"
          :disabled="loading"
        >
          Batal
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>

<style scoped>
.text-error {
  color: #f44336;
}
</style>
