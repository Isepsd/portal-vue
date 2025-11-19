# Vue FormData Implementation - Dynamic Data Fetching Pattern

## Overview
Implementasi Vue yang setara dengan React FormData component dengan dynamic data fetching pattern. Ini memungkinkan form handling yang konsisten dan reusable di seluruh aplikasi Vue.

## Files Created/Modified

### 1. FormData Composable (`src/composables/useFormData.ts`)
- Handle form state management
- Dynamic data fetching
- Form submission (POST/PUT)
- Error handling dan validation
- Loading states
- Auto-populate data untuk edit mode

### 2. FormData Component (`src/@core/components/FormData.vue`)
- Reusable form component dengan slot-based architecture
- Mirip dengan React FormData pattern
- Provide context ke child components
- Event-driven communication

### 3. Refactored Form Component (`src/pages/jaringan/component/form/FormPembangkit/pembangkit-form-page.vue`)
- Menggunakan useFormData composable
- Dynamic data fetching pattern
- Auto-populate dropdown berdasarkan selection
- Conditional fields berdasarkan Sinkron Data selection
- Clean dan maintainable code

### 4. FormMappingScada Component (`src/pages/jaringan/component/FormMappingScada.vue`)
- Conditional form fields component
- React berdasarkan `sinkron_data` value
- Support untuk SCADA, AMR, dan PORTAL EXT
- Reusable untuk form lainnya

### 5. Sinkron Data Config (`src/pages/jaringan/component/sinkron-data.config.ts`)
- Konfigurasi options untuk Sinkron Data
- Mendukung SCADA, AMR, dan PORTAL EXT
- Centralized configuration

### 6. Jaringan Unit Pembangkit Interface (`src/pages/jaringan/component/interface/jaringan-unit-pembangkit.interface.ts`)
- Interface khusus untuk Unit Pembangkit form
- Field definitions sesuai React version
- Default values initialization

### 7. Unit Pembangkit Form (`src/pages/jaringan/component/form/FormUnitPembangkit/unit-pembangkit-form-page.vue`)
- Form khusus untuk Unit Pembangkit
- Dynamic data fetching untuk Unit Induk
- Status listrik dengan switch (Active/Inactive)
- Path fields (Path1, Path2, Path3)
- Coordinate fields (Latitude, Longitude)

## Key Features

### Dynamic Data Fetching
```typescript
// Mirip dengan SelectAsyncDynamic di React
const fetchUnitPembangkit = async (idUnitInduk?: string) => {
  await fetchDynamicData(
    API_PATH().master.jaringan.ref_lokasi,
    {
      page: 1,
      limit: 1000,
      sort_by: 'nama_lokasi',
      id_ref_jenis_lokasi: JENIS_LOKASI().unit_pembangkit,
      id_unit_induk: unitIndukId // Dynamic filtering
    },
    {
      onSuccess: (result: any) => {
        unitPembangkitOptions.value = result;
      }
    }
  );
};
```

### Auto-populate Pattern
```typescript
// Watch untuk perubahan id_unit_induk
watch(() => form.value.id_unit_induk, (newValue) => {
  if (newValue) {
    fetchUnitPembangkit(newValue);
  } else {
    unitPembangkitOptions.value = [];
    form.value.id_parent_lokasi = '';
  }
});
```

### Form Validation
```typescript
const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  if (!form.value.nama_lokasi) {
    errors.nama_lokasi = 'Nama Pembangkit wajib diisi';
  }
  
  // ... other validations
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};
```

## Usage Patterns

### 1. Basic Usage dengan useFormData Composable
```typescript
const {
  form,
  loading,
  errors,
  dataSelected,
  fetchDynamicData,
  submitForm,
  isEdit
} = useFormData<IJaringanPembangkit>({
  fields: JarianganPembangkitField,
  path: API_PATH().master.jaringan.ref_lokasi,
  onGetDataResult: async (data) => {
    // Handle loaded data
  }
});
```

### 2. Component-based Usage dengan FormData Component
```vue
<template>
  <FormData
    :fields="JarianganPembangkitField"
    :path="API_PATH().master.jaringan.ref_lokasi"
    @data-loaded="handleDataLoaded"
    @form-submit="handleFormSubmit"
  >
    <template #default="{ form, loading, errors, fetchDynamicData }">
      <!-- Your form fields here -->
      <VTextField
        v-model="form.nama_lokasi"
        :error-messages="errors.nama_lokasi"
        label="Nama Pembangkit"
      />
    </template>
  </FormData>
</template>
```

## Comparison dengan React FormData

| Feature | React FormData | Vue Implementation |
|---------|----------------|-------------------|
| Dynamic Data Fetching | SelectAsyncDynamic | fetchDynamicData function |
| Form State | useState | useFormData composable |
| Error Handling | setError | setErrors function |
| Loading States | onLoading | loading ref + onLoading callback |
| Auto-populate | useEffect | watch function |
| Form Submission | onSubmit | submitForm function |
| Data Validation | Custom logic | validateForm function |

## Benefits

1. **Consistency**: Pattern yang konsisten di seluruh aplikasi
2. **Reusability**: Composable dan component dapat digunakan ulang
3. **Maintainability**: Code lebih terstruktur dan mudah maintenance
4. **Type Safety**: Full TypeScript support
5. **Performance**: Efficient reactive updates dan data fetching
6. **Developer Experience**: Mirip dengan React pattern yang sudah familiar

## Migration Guide

### Dari React ke Vue
1. Ganti `useState` dengan `useFormData` composable
2. Ganti `SelectAsyncDynamic` dengan `fetchDynamicData` function
3. Ganti `useEffect` dengan `watch` Vue
4. Ganti JSX dengan Vue template syntax
5. Ganti React events dengan Vue events

### Best Practices
1. Gunakan `fetchDynamicData` untuk dynamic data fetching
2. Implementasi proper error handling
3. Gunakan `watch` untuk auto-populate patterns
4. Validasi form sebelum submit
5. Handle loading states appropriately
6. Gunakan TypeScript untuk type safety

## Example Implementation

Lihat file:
- `src/pages/jaringan/component/form/FormPembangkit/pembangkit-form-page.vue` (Refactored version)
- `src/@core/components/FormData.vue` (Reusable component)
- `src/composables/useFormData.ts` (Core logic)

## Testing

Untuk testing implementasi:
1. Test dynamic data fetching
2. Test form validation
3. Test edit mode data loading
4. Test form submission
5. Test error handling

## Next Steps

1. Integrasikan dengan notification system yang ada
2. Add unit tests
3. Create documentation untuk team
4. Implement di form lainnya
5. Performance optimization
