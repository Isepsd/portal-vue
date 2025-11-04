<script setup lang="ts">
import { API_PATH } from '@/composables/_path.service'
import axios from 'axios'
import { debounce, get, orderBy } from 'lodash'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Props
const props: any = defineProps({
  modelValue: [String, Number, Object, Array],
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
  options: Object, // default option saat edit
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Local states
const selectOptions = ref<any[]>([])
const selectOptionsTemp = ref<any[]>([])
const loading = ref(false)
const idParent = ref()
const vModelValue = ref(props.modelValue)
const source = axios.CancelToken.source()

// Cleanup axios request
onBeforeUnmount(() => {
  source.cancel('Component unmounted')
})

// Path service
const pathService: any = computed(() =>
  props.path ? props.path : get(API_PATH(), props.pathServiceName)
)

// Sync v-model ke parent
watch(vModelValue, (val) => {
  emit('update:modelValue', val)
})

// Sync props.modelValue ke vModelValue lokal
watch(() => props.modelValue, (val) => {
  vModelValue.value = val
})

// ======== FETCHING DATA ==========
const getSelectOptions = async (inputVal: string = '', callback?: (data: any[]) => void) => {
  loading.value = true
  try {
    const parentField = props.fieldNameParent
      ? { [props.fieldNameParent]: props.watchParent ?? null }
      : {}

    // Gunakan labelField sebagai key search (mirip React)
    const searchParam = inputVal ? { [props.labelField]: inputVal } : {}

    const params = {
      page: 1,
      limit: 30,
      ...parentField,
      ...props.queryParams,
      ...searchParam,
      sort_by: props.labelField,
    }

    if (props.isDisabled) {
      loading.value = false
      return
    }

    const res: any = await getAllByPath(pathService.value, params, source.token)
    let data =
      res?.results?.map((d: any) => {
        let label = d[props.labelField]
        // Jika punya field jabatan.nama seperti versi React
        if (d?.jabatan?.nama) {
          label = `${d[props.labelField]} - ${d?.jabatan?.nama}`
        }
        return { label, value: d[props.valueField] }
      }) || []

    selectOptions.value = data
    selectOptionsTemp.value = data
    loading.value = false
    callback?.(data)
  } catch (err) {
    loading.value = false
    console.error('Error fetching options:', err)
    callback?.([])
  }
}

// Debounce search
const debouncedSearch = debounce((val: string) => {
  getSelectOptions(val)
}, 800)

// Watch perubahan parent
watch(() => props.watchParent, (newVal) => {
  if (idParent.value !== newVal) {
    if (props.setValue) props.setValue(props.fieldName, null)
    idParent.value = newVal
    getSelectOptions()
  }
})

// Inject default option saat edit data
watch(
  () => props.options,
  (newOpt) => {
    if (newOpt && selectOptionsTemp.value.length) {
      const exists = selectOptionsTemp.value.find((f: any) => f.value === newOpt[props.valueField])
      if (!exists) {
        const prepend = [{ label: newOpt[props.labelField], value: newOpt[props.valueField] }]
        const merged = orderBy([...prepend, ...(selectOptions.value || [])], ['label'], ['asc'])
        selectOptions.value = merged
      }
    }
  },
  { immediate: true }
)

// Fetch initial options
onMounted(() => {
  getSelectOptions()
})
</script>

<template>
  <div>
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
      :error="Boolean(get(props.errors, props.fieldName))"
    />

    <!-- Tampilkan error mirip React -->
    <div v-if="get(props.errors, props.fieldName)" class="text-error text-caption mt-1">
      {{ get(props.errors, `${props.fieldName}.message`) }}
    </div>
  </div>
</template>
