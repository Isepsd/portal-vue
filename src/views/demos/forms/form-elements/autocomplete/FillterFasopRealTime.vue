<script setup lang="ts">
import { useEmit } from '@/composables/useemit';
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

});

// Emit function to send filter values
const { emitFilterChange } = useEmit()

// Watch for changes in the filter values and trigger parent update
watch(form, (newVal) => {
  emitFilterChange(newVal) // This will emit the new filter values to parent
}, { deep: true });

// Submit handler
const handleSubmit = () => {
  console.log('Form Submitted:', form.value);
  
  // Trigger parent update with the new filter values
  props.onFilterChange(form.value); // Send the updated form values to the parent component
}
</script>

<template>
  <VRow class="match-height">




    <!-- Conditional Select for Jenis Point when Jenis Kinerja is SCADA -->
    <VCol  cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.nama_pointtype"
        fieldName="nama_pointtype"
        pathServiceName="master.fasop.point_type"
        labelField="name"
        valueField="name"
        placeholder="Pilih Tipe Point"
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

    
  <VCol cols="6" md="3" sm="6" lg="2">
      <VAutocomplete
        v-model="form.durasi"
        label="Durasi"
        :items="OptionData"
        item-title="name"
        item-value="value"
        placeholder="Pilih Bulan"
        :clearable="true"
      />
    </VCol>

   
    <!-- Dynamic Async Select for Path 2 (Only shown for RC or TRIP) -->
    <VCol  cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path2"
        fieldName="path2"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Path 2"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path1'
        }"
      />
    </VCol>
    <VCol  cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path2"
        fieldName="path2"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Path 2"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path2'
        }"
      />
    </VCol>

    <!-- Dynamic Async Select for Path 3 (Only shown for RC or TRIP) -->
    <VCol  cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path3"
        fieldName="path3"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Path 3"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path3'
        }"
      />
    </VCol>

    <!-- Conditional Select for Path 4 and Path 5 when needed -->
    <VCol  cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path4"
        fieldName="path4"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Path 4"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path4'
        }"
      />
    </VCol>

    <VCol  cols="6" md="3" sm="6" lg="2">
      <AppAutocomplete
        v-model="form.path5"
        fieldName="path5"
        pathServiceName="fasop.laporan_scada.path"
        labelField="pathname"
        valueField="pathname"
        placeholder="Pilih Path 5"
        :isClearable="true"
        :queryParams="{
          page: 1,
          limit: 10,
          path: 'path5'
        }"
      />
    </VCol>

        <!-- Static Select for Bulan -->
    <VCol cols="6" md="3" sm="6" lg="2">
      <VAutocomplete
        v-model="form.kesimpulan"
        label="Kesimpulan"
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
