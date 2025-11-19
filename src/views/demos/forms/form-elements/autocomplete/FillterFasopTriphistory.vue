<script setup lang="ts">
import { useEmit } from '@/composables/useemit';
import moment from 'moment';
import { ref, watch } from 'vue';

const props: any = defineProps({
  modelValue: [String, Number, Object, Array], // support berbagai tipe v-model
  onFilterChange: Function, // Ubah menjadi Function untuk memastikan prop ini merupakan fungsi
});

// List Bulan


// console.log("items", items);

// Form values
const form = ref({
  path1: '',
  path2: '',
  path3: '',
  path4: '',
 
// 🔥 DEFAULT DATE (sama seperti React)
datum_after: moment().subtract(1, "day").format("YYYY-MM-DD") + " 00:00:00",
datum_before: moment().format("YYYY-MM-DD") + " 23:59:59",

  // auto formatted after submit
  after: moment().format("YYYY-MM-DD") + " 00:00:00",
  before: moment().format("YYYY-MM-DD") + " 23:59:59",
});

// Emit function to send filter values
const { emitFilterChange } = useEmit()
// 🔥 Watch dependency EXACTLY like React version
watch(() => form.value.path1, (val) => {
  form.value.path2 = '';
  form.value.path3 = '';
  form.value.path4 = '';
  
});

watch(() => form.value.path2, (val) => {
  form.value.path3 = '';
  form.value.path4 = '';
  
});

watch(() => form.value.path3, (val) => {
  form.value.path4 = '';
  
});



// Watch for changes in the filter values and trigger parent update
watch(form, (newVal) => {
  emitFilterChange(newVal) // This will emit the new filter values to parent
}, { deep: true });

// Submit handler
const handleSubmit = () => {
 const awal = form.value.datum_after
  const akhir = form.value.datum_before

  form.value.after = awal + " 00:00:00"
  form.value.before = akhir + " 23:59:59"

  // Trigger parent update with the new filter values
  props.onFilterChange(form.value); // Send the updated form values to the parent component
}
</script>
<template>
  <VRow class="match-height">

    <!-- Range Tanggal -->
    <VCol cols="12" md="4" class="pt-0 mt-n9">
      <label class="text-caption mb-1">Range Tanggal</label>

      <VRow class="align-center" no-gutters>

        <!-- Dari -->
        <VCol cols="5">
          <AppDateTimePicker
            class="w-100"
            style="max-width: 210px"
            v-model="form.datum_after"
            label="Dari"
            placeholder="Pilih tanggal & waktu"
            density="comfortable"
            :config="{
              enableTime: true,
              time_24hr: true,
              enableSeconds: true,
              dateFormat: 'Y-m-d H:i:S'
            }"
          />
        </VCol>

        <!-- Panah -->
       <VCol cols="2" class="d-flex justify-center mt-4">
          <strong>→</strong>
        </VCol>
        <!-- Sampai -->
        <VCol cols="5">
          <AppDateTimePicker
            class="w-100"
            style="max-width: 210px"
            v-model="form.datum_before"
            label="Sampai"
            placeholder="Pilih tanggal & waktu"
            density="comfortable"
            :config="{
              enableTime: true,
              time_24hr: true,
              enableSeconds: true,
              dateFormat: 'Y-m-d H:i:S'
            }"
          />
        </VCol>

      </VRow>
    </VCol>

    <!-- Path 1 -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path1"
        fieldName="path1"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih B1"
        density="comfortable"
        :isClearable="true"
        :queryParams="{ page: 1, limit: 10, path: 'path1' }"
      />
    </VCol>

    <!-- Path 2 -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path2"
        fieldName="path2"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih B2"
        density="comfortable"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path2',
          ...(form.path1 ? { path1: form.path1 } : {})
        }"
      />
    </VCol>

    <!-- Path 3 -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path3"
        fieldName="path3"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih B3"
        density="comfortable"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path3',
          ...(form.path1 ? { path1: form.path1 } : {}),
          ...(form.path2 ? { path2: form.path2 } : {})
        }"
      />
    </VCol>

    <!-- Path 4 -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path4"
        fieldName="path4"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Element"
        density="comfortable"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path4',
          ...(form.path1 ? { path1: form.path1 } : {}),
          ...(form.path2 ? { path2: form.path2 } : {}),
          ...(form.path3 ? { path3: form.path3 } : {})
        }"
      />
    </VCol>

  </VRow>

  <!-- Button -->
  <div class="mt-4">
    <VBtn color="primary" @click="handleSubmit">Filter</VBtn>
  </div>
</template>

