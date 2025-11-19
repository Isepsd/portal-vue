<script setup lang="ts">
import AccordionMenu from "@/components/helper/AccordionMenu.vue";
import { JSONtoString, stringToJSON } from "@/components/helper/data.helper";
import { initFlatMenu, initNestedMenu } from "@/components/helper/menu.helper";
import { deleteByPath, getAllByPath, postByPath, putByPath } from "@/composables/main.service";
import { useNavigationStore } from '@/pages/stores/navigation';

import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";

import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

const source = axios.CancelToken.source();
const navigationStore = useNavigationStore()

// STATE
const nestedMenu = ref<any[]>([]);
const parentMenuOptions = ref<any[]>([]);
const loading = ref(false);
const loadingForm = ref(false);
const selectedMenu = ref<any>(null);

// FORM MODEL
const values = reactive({
  id: "",
  display: "",
  name: "",
  icon: "",
  path: "",
  idParent: "",
  privileges: ["view", "create", "update", "delete"].map((priv) => ({
    priv,
    checked: true,
  })),
});

// VALIDATION RULES
const rules = {
  display: { required },
  name: { required },
};

const v$ = useVuelidate(rules, values);

// Helper functions for privilege colors and icons
const getPrivilegeColor = (priv: string) => {
  const colors: Record<string, string> = {
    view: 'info',
    create: 'success',
    update: 'warning',
    delete: 'error'
  };
  return colors[priv] || 'primary';
};

const getPrivilegeIcon = (priv: string) => {
  const icons: Record<string, string> = {
    view: 'mdi-eye',
    create: 'mdi-plus-circle',
    update: 'mdi-pencil',
    delete: 'mdi-delete'
  };
  return icons[priv] || 'mdi-shield-account';
};

// LOAD MENU
const loadMenu = async () => {
  loading.value = true;
  const req: any = await getAllByPath("menu", { page: -1, limit: -1 }, source.token);

  const menus = req.results.map((m: any) => ({
    ...m,
    idParent: m.idParent || "",
    privileges: stringToJSON(m.privileges),
  }));

  nestedMenu.value = initNestedMenu("", menus, null);

  parentMenuOptions.value = initFlatMenu(nestedMenu.value).map((item: any) => ({
    value: item.id,
    label: `${"--".repeat(item.index)} ${item.display}`,
  }));

  loading.value = false;
};

// fungsi convert path
function convertPathFormat(path?: string | null): string | undefined {
  if (!path) return undefined

  let clean = path.startsWith('/') ? path.slice(1) : path
  clean = clean.replace(/-/g, '')      // hapus semua -
               .replace(/\//g, '-')    // ubah / jadi -
               .replace(/_/g, '')      // hapus semua _
  return clean.trim()
}

// computed untuk "To Folder"
const pathTo = computed(() => convertPathFormat(values.path))

// SUBMIT
const onSubmit = async () => {
  await v$.value.$validate();
  if (v$.value.$error) return;

  loadingForm.value = true;

  const payload = {
    ...values,
    privileges: JSONtoString(values.privileges.filter((v) => v.checked).map((v) => v.priv)),
  };

  try {
    values.id
      ? await putByPath("menu", payload, values.id, source.token)
      : await postByPath("menu", payload, source.token);

    await loadMenu();
    // 🔹 Tambahkan ini supaya sidebar ikut update
    await navigationStore.fetchNavigation();

    resetForm();
  } finally {
    loadingForm.value = false;
  }
};

// EDIT
const editMenu = (item: any) => {
  selectedMenu.value = item;
  Object.assign(values, {
    ...item,
    privileges: item.privileges.map((priv: any) => ({ priv, checked: true })),
  });
};

// DELETE
const deleteMenu = async (item: any) => {
  await deleteByPath("menu", item.id, source.token);
  await navigationStore.fetchNavigation();
  loadMenu();
};

// RESET FORM
const resetForm = () => {
  Object.assign(values, {
    id: "",
    display: "",
    name: "",
    icon: "",
    path: "",
    idParent: "",
    privileges: ["view", "create", "update", "delete"].map((priv) => ({
      priv,
      checked: true,
    })),
  });
  selectedMenu.value = null;
  v$.value.$reset();
};

// DRAG SORT
const moveMenu = async (payload: any) => {
  await putByPath("menu/update_menu_batch", payload, "", source.token);
  loadMenu();
};

onMounted(loadMenu);
</script>

<template>
  <div class="menu-management-container">
    <!-- Header Section -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-900 mb-1">
            <VIcon icon="mdi-menu" class="me-2" size="28" />
            Manajemen Menu
          </h1>
          <p class="text-grey-600 mb-0">Kelola struktur menu dan hak akses aplikasi</p>
        </div>
        <div class="d-flex gap-2">
          <VChip
            :color="nestedMenu.length > 0 ? 'success' : 'grey'"
            variant="tonal"
            size="small"
            class="text-caption"
          >
            <VIcon icon="mdi-format-list-checks" size="16" class="me-1" />
            {{ nestedMenu.length }} Menu Utama
          </VChip>
        </div>
      </div>
    </div>

    <VRow class="g-4">
      <!-- LEFT: MENU LIST -->
      <VCol cols="12" md="8">
        <VCard class="menu-list-card" elevation="2">
          <VCardItem class="pa-4 border-b">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="mdi-view-list" size="20" class="me-2 text-primary" />
                <span class="text-h6 font-weight-medium">Struktur Menu</span>
              </div>
              <VBtn
                v-if="nestedMenu.length > 0"
                size="small"
                variant="text"
                color="primary"
                @click="loadMenu"
                :loading="loading"
              >
                <VIcon icon="mdi-refresh" size="18" class="me-1" />
                Refresh
              </VBtn>
            </div>
          </VCardItem>
          
          <VCardText class="pa-4 position-relative">
            <AccordionMenu
              :menu="nestedMenu"
              @edit="editMenu"
              @delete="deleteMenu"
              @move="moveMenu"
            />

            <!-- Empty State -->
            <div v-if="!loading && nestedMenu.length === 0" class="empty-state text-center py-8">
              <VIcon icon="mdi-folder-open-outline" size="64" class="text-grey-400 mb-3" />
              <h3 class="text-h6 font-weight-medium text-grey-700 mb-2">Belum Ada Menu</h3>
              <p class="text-body-2 text-grey-500 mb-4">Tambahkan menu pertama untuk memulai</p>
              <VBtn
                color="primary"
                variant="elevated"
                @click="resetForm"
                prepend-icon="mdi-plus"
              >
                Tambah Menu Pertama
              </VBtn>
            </div>

            <!-- Loading Overlay -->
            <VOverlay
              v-if="loading"
              v-model="loading"
              class="loading-overlay"
              contained
              persistent
            >
              <div class="d-flex flex-column align-center">
                <VProgressCircular indeterminate color="primary" size="48" class="mb-3" />
                <span class="text-body-2 text-grey-600">Memuat data menu...</span>
              </div>
            </VOverlay>
          </VCardText>
        </VCard>
      </VCol>

      <!-- RIGHT: FORM -->
      <VCol cols="12" md="4">
        <VCard class="form-card" elevation="2" style="position: sticky; top: 80px;">
          <VCardItem class="pa-4 border-b bg-primary-light">
            <div class="d-flex align-center">
              <VIcon icon="mdi-form-select" size="20" class="me-2 text-primary" />
              <span class="text-h6 font-weight-medium">Form Menu</span>
            </div>
          </VCardItem>
          
          <VCardText class="pa-4">
            <!-- Quick Action Button -->
            <VBtn
              block
              color="primary"
              variant="elevated"
              class="mb-4"
              @click="resetForm"
              prepend-icon="mdi-plus-circle"
              size="large"
            >
              {{ values.id ? 'Edit Menu' : 'Tambah Menu Baru' }}
            </VBtn>

            <!-- Form Status Indicator -->
            <div class="form-status mb-4 pa-3 rounded-lg bg-warning-light" v-if="values.id">
              <div class="d-flex align-center gap-2">
                <VIcon icon="mdi-pencil" size="16" color="warning" />
                <span class="text-body-2 text-warning font-weight-medium">Sedang Mengedit Menu</span>
              </div>
              <div class="text-caption text-grey-600 mt-1">{{ values.display }}</div>
            </div>

            <VForm @submit.prevent="onSubmit">
              <!-- Form Fields with better styling -->
              <div class="form-section mb-4">
                <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                  <VIcon icon="mdi-information" size="18" class="me-2 text-primary" />
                  Informasi Dasar
                </div>

                <VTextField
                  label="Display Menu"
                  v-model="values.display"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  placeholder="Nama menu yang ditampilkan"
                  prepend-inner-icon="mdi-form-textbox"
                  :error-messages="v$.display.$error ? ['Display menu wajib diisi'] : []"
                  @blur="v$.display.$touch()"
                />

                <VTextField
                  label="Alias Menu"
                  v-model="values.name"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  placeholder="Alias menu"
                  prepend-inner-icon="mdi-rename-box"
                  :error-messages="v$.name.$error ? ['Alias menu wajib diisi'] : []"
                  @blur="v$.name.$touch()"
                />
              </div>

              <div class="form-section mb-4">
                <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                  <VIcon icon="mdi-link-variant" size="18" class="me-2 text-primary" />
                  Struktur Menu
                </div>

                <VSelect
                  label="Parent Menu"
                  v-model="values.idParent"
                  :items="parentMenuOptions"
                  item-title="label"
                  item-value="value"
                  clearable
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  placeholder="Pilih parent menu"
                  prepend-inner-icon="mdi-account-tree"
                />

                <VTextField
                  label="Path"
                  v-model="values.path"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  placeholder="/pathmenu/..."
                  prepend-inner-icon="mdi-route"
                />

                <VTextField
                  label="To Folder"
                  :model-value="pathTo"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  placeholder="To Folder"
                  readonly
                  prepend-inner-icon="mdi-folder-outline"
                />
              </div>

              <div class="form-section mb-4">
                <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                  <VIcon icon="mdi-palette" size="18" class="me-2 text-primary" />
                  Tampilan
                </div>

                <VTextField
                  label="Icon"
                  v-model="values.icon"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  placeholder="Ex: fa-solid fa-house"
                  prepend-inner-icon="mdi-emoticon-outline"
                >
                  <template #append-inner>
                    <VIcon v-if="values.icon" :class="values.icon" />
                  </template>
                </VTextField>
              </div>

              <div class="form-section mb-4">
                <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                  <VIcon icon="mdi-shield-account" size="18" class="me-2 text-primary" />
                  Hak Akses
                </div>
                
                <div class="privileges-container pa-3 rounded-lg bg-grey-50">
                  <div class="grid grid-cols-2 gap-2">
                    <VCheckbox
                      v-for="(p, i) in values.privileges"
                      :key="i"
                      v-model="p.checked"
                      :label="p.priv.charAt(0).toUpperCase() + p.priv.slice(1)"
                      density="compact"
                      hide-details
                      :color="getPrivilegeColor(p.priv)"
                    >
                      <template #prepend>
                        <VIcon :icon="getPrivilegeIcon(p.priv)" :color="getPrivilegeColor(p.priv)" size="16" />
                      </template>
                    </VCheckbox>
                  </div>
                </div>
              </div>

              <div class="d-flex gap-3 mt-5">
                <VBtn 
                  type="submit" 
                  block 
                  color="primary" 
                  :loading="loadingForm"
                  size="large"
                  prepend-icon="mdi-content-save"
                >
                  {{ values.id ? 'Update Menu' : 'Simpan Menu' }}
                </VBtn>

                <VBtn 
                  block 
                  color="secondary" 
                  variant="tonal" 
                  @click="resetForm"
                  size="large"
                  prepend-icon="mdi-close-circle"
                >
                  Batal
                </VBtn>
              </div>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.menu-management-container {
  padding: 24px;

  min-height: 100vh;
}

.page-header {

  padding: 24px;
  border-radius: 12px;

}

.menu-list-card,
.form-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.menu-list-card:hover,
.form-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.form-section {
  padding: 16px;
  border-radius: 8px;
}

.form-status {
  border-left: 4px solid #ff9800;
  animation: slideIn 0.3s ease;
}

.privileges-container {
  border: 1px solid #e0e0e0;
 
}

.empty-state {
  animation: fadeIn 0.5s ease;
}

.loading-overlay {
  backdrop-filter: blur(2px);
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .form-card {
    position: static !important;
    margin-top: 16px;
  }
}

/* Custom scrollbar for menu list */
.menu-list-card ::-webkit-scrollbar {
  width: 6px;
}

.menu-list-card ::-webkit-scrollbar-track {

  border-radius: 3px;
}

.menu-list-card ::-webkit-scrollbar-thumb {

  border-radius: 3px;
}




/* Button hover effects */
:deep(.v-btn:hover) {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}


</style>
