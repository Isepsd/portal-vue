<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  id: [String, Number],
  canEdit: Boolean,
  canDelete: Boolean,
})

const emit = defineEmits(['edit', 'delete'])

const onEdit = () => emit('edit', props.id)
const onDelete = () => emit('delete', props.id)
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <button
      v-if="canEdit"
      class="px-2 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition"
      @click="onEdit"
    >
      <i class="fa fa-edit mr-1"></i> Edit
    </button>

    <button
      v-if="canDelete"
      class="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition"
      @click="onDelete"
    >
      <i class="fa fa-trash mr-1"></i> Delete
    </button>
  </div>
</template>
