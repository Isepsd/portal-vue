<script setup lang="ts">
import { ROLE_ACCESS, ROLE_ACTION } from '@/components/helper/auth.helper';
import { useAuthStore } from '@/pages/stores/auth';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormPembangkitComponent from './FormPembangkit.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isEdit = computed(() => !!route.params.id);
const title = computed(() => isEdit.value ? 'Edit Pembangkit' : 'Tambah Pembangkit');
const itemId = computed(() => route.params.id as string);

const loading = ref(false);
const showSaveDialog = ref(false);
const formData = ref<any>(null);

// Check role permissions
const roleActions = ref<any>({});

onMounted(() => {
  let roleAccess = ROLE_ACCESS("pembangkit") as string[];
  const roleAct = {
    view: ROLE_ACTION(roleAccess, 'view'),
    create: ROLE_ACTION(roleAccess, 'create'),
    update: ROLE_ACTION(roleAccess, 'update'),
    delete: ROLE_ACTION(roleAccess, 'delete'),
  };
  roleActions.value = roleAct;

  // Check if user has permission for this operation
  if (isEdit.value && !roleAct.update) {
    router.push('/jaringan/pembangkit');
  }
  if (!isEdit.value && !roleAct.create) {
    router.push('/jaringan/pembangkit');
  }
});

const handleSave = (data: any) => {
  formData.value = data;
  showSaveDialog.value = true;
};

const confirmSave = () => {
  showSaveDialog.value = false;
  loading.value = true;
  
  // TODO: Implement actual save logic
  console.log('Saving data:', formData.value);
  
  setTimeout(() => {
    loading.value = false;
    router.push('/jaringan/pembangkit');
  }, 2000);
};

const cancelSave = () => {
  showSaveDialog.value = false;
};

const goBack = () => {
  router.push('/jaringan/pembangkit');
};
</script>

<template>
  <div>
    <!-- Header -->
    <VRow class="mb-4">
      <VCol cols="12">
        <VCardTitle class="text-h5 font-weight-bold">{{ title }}</VCardTitle>
        <VBtn 
          color="secondary"
          variant="outlined"
          prepend-icon="tabler-arrow-left"
          @click="goBack"
          class="ml-4"
        >
          Kembali
        </VBtn>
      </VCol>
    </VRow>

    <!-- Form -->
    <VCard>
      <VCardText>
        <FormPembangkitComponent 
          :is-edit="isEdit"
          :item-id="itemId"
          @save="handleSave"
          @cancel="goBack"
        />
      </VCardText>
    </VCard>

    <!-- Save Confirmation Dialog -->
    <VDialog
      v-model="showSaveDialog"
      max-width="500"
      persistent
    >
      <VCard>
        <VCardTitle class="text-h6">
          Konfirmasi Simpan
        </VCardTitle>
        
        <VCardText>
          Apakah anda yakin akan menyimpan data ini?
        </VCardText>
        
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="cancelSave"
            :disabled="loading"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            @click="confirmSave"
            :loading="loading"
          >
            Ya, Simpan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
