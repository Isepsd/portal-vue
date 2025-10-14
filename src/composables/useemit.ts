// src/composables/useEmit.ts
import { inject } from 'vue'

export function useEmit() {
  const emit:any = inject('emit')
  
  // Fungsi untuk mengirimkan data ke komponen induk
  const emitFilterChange = (data: any) => {
    if (emit) {
      emit('filter-change', data)
    } else {
      console.error('Emit function not found!')
    }
  }

  return { emitFilterChange }
}
