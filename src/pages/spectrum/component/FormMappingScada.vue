<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  form: any
  errors: any
}

const props = defineProps<Props>()

// Computed untuk menentukan field mana yang ditampilkan
const showScadaFields = computed(() => props.form?.sinkron_data === 'SCADA')
console.log("show sinc scada")
const showAmrFields = computed(() => props.form?.sinkron_data === 'AMR')
const showPortalExtFields = computed(() => props.form?.sinkron_data === 'PORTAL EXT')
</script>

<template>
  <!-- SCADA Fields -->
  <template v-if="showScadaFields">
    <!-- Path Fields -->
    <VCol cols="12" md="4">
      <VTextField
        v-model="form.path1"
        label="Path 1"
        placeholder="Masukkan Path 1"
        :error-messages="errors.path1"
        clearable
      />
    </VCol>

    <VCol cols="12" md="4">
      <VTextField
        v-model="form.path2"
        label="Path 2"
        placeholder="Masukkan Path 2"
        :error-messages="errors.path2"
        clearable
      />
    </VCol>

    <VCol cols="12" md="4">
      <VTextField
        v-model="form.path3"
        label="Path 3"
        placeholder="Masukkan Path 3"
        :error-messages="errors.path3"
        clearable
      />
    </VCol>

    <!-- ID Fields -->
    <VCol cols="12" md="3">
      <VTextField
        v-model="form.id_i"
        label="ID I (Arus)"
        placeholder="Masukkan ID I"
        :error-messages="errors.id_i"
        clearable
      />
    </VCol>

    <VCol cols="12" md="3">
      <VTextField
        v-model="form.id_v"
        label="ID V (Tegangan)"
        placeholder="Masukkan ID V"
        :error-messages="errors.id_v"
        clearable
      />
    </VCol>

 
  </template>

  <!-- AMR Fields -->
  <template v-if="showAmrFields">
    <VCol cols="12">
      <VTextField
        v-model="form.id_amr"
        label="ID AMR"
        placeholder="Masukkan ID AMR"
        :error-messages="errors.id_amr"
        required
      />
    </VCol>
  </template>

  <!-- PORTAL EXT Fields -->
  <template v-if="showPortalExtFields">
    <VCol cols="12" md="6">
      <VTextField
        v-model="form.id_portal_ext"
        label="ID Portal EXT"
        placeholder="Masukkan ID Portal Ext"
        :error-messages="errors.id_portal_ext"
        required
      />
    </VCol>

    <VCol cols="12" md="6">
      <VTextField
        v-model="form.url_webservice"
        label="URL Webservice"
        placeholder="Masukkan URL Webservice"
        :error-messages="errors.url_webservice"
        required
      />
    </VCol>
  </template>
</template>
