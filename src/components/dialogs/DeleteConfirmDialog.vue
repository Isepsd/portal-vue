<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isDialogVisible: boolean
  itemData?: any
  itemName?: string
  itemId?: string | number
}

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'confirm', itemId: string | number): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const updateModelValue = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const onConfirm = () => {
  const itemId = props.itemId || props.itemData?.id_ref_lokasi || props.itemData?.id
  if (itemId) {
    emit('confirm', itemId)
  }
  updateModelValue(false)
}

const onCancel = () => {
  emit('cancel')
  updateModelValue(false)
}

// Computed property to get the item name for display
const displayName = computed(() => {
  return props.itemName || props.itemData?.nama || props.itemData?.name || `Data dengan ID: ${props.itemId || props.itemData?.id_ref_lokasi || props.itemData?.id}`
})
</script>

<template>
  <!-- 👉 Delete Confirmation Dialog -->
  <VDialog
    max-width="450"
    :model-value="props.isDialogVisible"
    @update:model-value="updateModelValue"
    persistent
  >
    <VCard class="text-center px-8 py-6">
      <VCardText class="pb-4">
        <VBtn
          icon
          variant="outlined"
          color="error"
          class="my-4"
          style="block-size: 80px; inline-size: 80px; pointer-events: none;"
        >
          <VIcon
            icon="tabler-trash"
            size="36"
          />
        </VBtn>

        <h6 class="text-lg font-weight-medium mb-2">
          Konfirmasi Hapus Data
        </h6>
        
        <p class="text-body-1 text-medium-emphasis mb-0">
          Apakah Anda yakin ingin menghapus data:
        </p>
        
        <p class="text-body-1 font-weight-bold text-error mt-2">
          {{ displayName }}
        </p>
        
        <p class="text-sm text-medium-emphasis mt-3">
          Data yang telah dihapus tidak dapat dikembalikan.
        </p>
      </VCardText>

      <VCardActions class="justify-center gap-3 px-4 pb-4">
        <VBtn
          variant="elevated"
          color="error"
          prepend-icon="tabler-trash"
          @click="onConfirm"
        >
          Hapus
        </VBtn>

        <VBtn
          color="secondary"
          variant="tonal"
          prepend-icon="tabler-x"
          @click="onCancel"
        >
          Batal
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.text-error {
  color: rgb(var(--v-theme-error));
}
</style>
