<script setup lang="ts">
import axios from 'axios';
import { debounce, get } from 'lodash';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Cleanup axios request on component unmount
onBeforeUnmount(() => {
  source.cancel('Component unmounted');
});

const props: any = defineProps({
  modelValue: [String, Number, Object, Array], // support berbagai tipe v-model
  control: Object,
  fieldName: String,
  fieldNameParent: String,
  watchParent: [String, Number],
  errors: Object,
  placeholder: { type: String, default: 'Pilih...' },
  pathServiceName: String,
  path: String,
  labelField: String,
  valueField: String,
  queryParams: { type: Object, default: () => ({}) },
  setValue: Function,
  required: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  isClearable: { type: Boolean, default: true },
  isMulti: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  styles: Object,
  options: Object,
});

const emit = defineEmits(['update:modelValue']);

const selectOptions = ref<any[]>([]);
const loading = ref(false);
const idParent = ref();
const source = axios.CancelToken.source();

// Define pathService dynamically
const pathService: any = computed(() =>
  props.path ? props.path : get(API_PATH(), props.pathServiceName)
);

// Local v-model sync
const vModelValue = ref(props.modelValue);

// Sync v-model with the parent component
watch(vModelValue, (val) => {
  emit('update:modelValue', val);
});

// Watch for changes in `modelValue` prop and update the internal vModelValue
watch(() => props.modelValue, (val) => {
  vModelValue.value = val;
});

// Fetch options for select
const getSelectOptions = async (inputVal: string = '', callback?: (data: any[]) => void) => {
  loading.value = true;
  try {
    const parentField = props.fieldNameParent
      ? { [props.fieldNameParent]: props.watchParent ?? null }
      : {};

    const params = {
      page: 1,
      keyword: inputVal || undefined,
      limit: 30,
      ...parentField,
      ...props.queryParams,
    };

    const res: any = await getAllByPath(pathService.value, params, source.token);

    const data = res?.results?.map((d: any) => ({
      label: d[props.labelField],
      value: d[props.valueField],
    })) || [];

    selectOptions.value = data;
    loading.value = false;
    callback?.(data);
  } catch (err) {
    loading.value = false;
    console.error('Error fetching options:', err);
    callback?.([]); // Return empty array on error
  }
};

// Debounced search for user input
const debouncedSearch = debounce((val: string) => {
  getSelectOptions(val);
}, 500);

// Watch for changes in parent field to trigger new select options
watch(() => props.watchParent, (newVal) => {
  if (idParent.value !== newVal) {
    if (props.setValue) props.setValue(props.fieldName, null);
    idParent.value = newVal;
    getSelectOptions();
  }
});

// Fetch initial options when component is mounted
onMounted(() => {
  getSelectOptions();
});
</script>

<template>
  <VAutocomplete
    v-model="vModelValue"
    :items="selectOptions"
    item-title="label"
    item-value="value"
    :label="props.placeholder"
    :disabled="props.isDisabled || props.isLocked"
    :loading="loading"
    :clearable="props.isClearable"
    :multiple="props.isMulti"
    @update:search="debouncedSearch"
    persistent-hint
    density="compact"
    hide-details="auto"
  />
</template>
