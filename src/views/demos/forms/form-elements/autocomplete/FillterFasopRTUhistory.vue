<script setup lang="ts">
import { useEmit } from '@/composables/useemit';
import moment from 'moment';
import { ref, watch } from 'vue';

const props: any = defineProps({
  modelValue: [String, Number, Object, Array], // support berbagai tipe v-model
  onFilterChange: Function, // Ubah menjadi Function untuk memastikan prop ini merupakan fungsi
});

// List Bulan
const items: any = [
    { name: "VALID", value: "VALID" },
    { name: "INVALID", value: "INVALID" },
  // { name: 'Januari', value: '01' },
  // { name: 'Februari', value: '02' },
  // { name: 'Maret', value: '03' },
  // { name: 'April', value: '04' },
  // { name: 'Mei', value: '05' },
  // { name: 'Juni', value: '06' },
  // { name: 'Juli', value: '07' },
  // { name: 'Agustus', value: '08' },
  // { name: 'September', value: '09' },
  // { name: 'Oktober', value: '10' },
  // { name: 'November', value: '11' },
  // { name: 'Desember', value: '12' },
];
const OptionData: any = [
    { name: "> 2 Jam", value: "> 2 jam" },
    { name: "> 4 Jam", value: "> 4 jam" },
    { name: "> 6 Jam", value: "> 6 jam" },
  // { name: 'Januari', value: '01' },
  // { name: 'Februari', value: '02' },
  // { name: 'Maret', value: '03' },
  // { name: 'April', value: '04' },
  // { name: 'Mei', value: '05' },
  // { name: 'Juni', value: '06' },
  // { name: 'Juli', value: '07' },
  // { name: 'Agustus', value: '08' },
  // { name: 'September', value: '09' },
  // { name: 'Oktober', value: '10' },
  // { name: 'November', value: '11' },
  // { name: 'Desember', value: '12' },
];

// console.log("items", items);

// Form values
const form = ref({
  path1: '',
  path2: '',
  path3: '',
  path4: '',
  path5: '',
  durasi: '',
  kesimpulan: '',
  nama_pointtype: '',
// 🔥 DEFAULT DATE (sama seperti React)
  datum_after: moment().subtract(1, "day").format("YYYY-MM-DD"),
  datum_before: moment().format("YYYY-MM-DD"),

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
  form.value.path5 = '';
});

watch(() => form.value.path2, (val) => {
  form.value.path3 = '';
  form.value.path4 = '';
  form.value.path5 = '';
});

watch(() => form.value.path3, (val) => {
  form.value.path4 = '';
  form.value.path5 = '';
});

watch(() => form.value.path4, (val) => {
  form.value.path5 = '';
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
<VCol cols="12" md="3" class="pt-0 mt-n9">
  <label class="text-caption mb-n1">Range Tanggal</label>

  <VRow no-gutters class="align-center">
    <VCol cols="5">
      <AppDateTimePicker
        v-model="form.datum_after"
        label="Dari"
        placeholder="Pilih tanggal"
        density="comfortable"
        :config="{ dateFormat: 'Y-m-d' }"
      />
    </VCol>

  <VCol cols="2" class="d-flex justify-center mt-4">
  <strong>→</strong>
</VCol>

    <VCol cols="5">
      <AppDateTimePicker
        v-model="form.datum_before"
        label="Sampai"
        placeholder="Pilih tanggal"
        density="comfortable"
        :config="{ dateFormat: 'Y-m-d' }"
      />
    </VCol>
  </VRow>
</VCol>


    <!-- Jenis Point -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.nama_pointtype"
        fieldName="nama_pointtype"
        pathServiceName="master.fasop.point_type"
        labelField="name"
        valueField="name"
        placeholder="Pilih Tipe Point"
        density="comfortable"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          status: 1,
          sort_by: '-name',
          id_induk_pointtype: '3d391819-4288-4699-80f4-7ebd5ae0d733',
        }"
      />
    </VCol>

    <!-- Durasi -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <VAutocomplete
        v-model="form.durasi"
        label="Durasi"
        density="comfortable"
        :items="OptionData"
        item-title="name"
        item-value="value"
        placeholder="Pilih Bulan"
        :clearable="true"
      />
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

    <!-- Path 5 -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path5"
        fieldName="path5"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Info"
        density="comfortable"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path5',
          ...(form.path1 ? { path1: form.path1 } : {}),
          ...(form.path2 ? { path2: form.path2 } : {}),
          ...(form.path3 ? { path3: form.path3 } : {}),
          ...(form.path4 ? { path4: form.path4 } : {})
        }"
      />
    </VCol>

    <!-- Kesimpulan -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <VAutocomplete
        v-model="form.kesimpulan"
        label="Kesimpulan"
        density="comfortable"
        :items="items"
        item-title="name"
        item-value="value"
        placeholder="Pilih Bulan"
        :clearable="true"
      />
    </VCol>

  </VRow>

  <!-- Submit Button -->
  <div class="mt-4">
    <VBtn color="primary" @click="handleSubmit">Fillter</VBtn>
  </div>
</template>
