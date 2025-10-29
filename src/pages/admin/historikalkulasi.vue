<script setup lang="ts">
import AccordionMenu from "@/components/helper/AccordionMenu.vue";
import { JSONtoString, stringToJSON } from "@/components/helper/data.helper";
import { initFlatMenu, initNestedMenu } from "@/components/helper/menu.helper";
import { deleteByPath, getAllByPath, postByPath, putByPath } from "@/composables/main.service";

import axios from "axios";
import { onMounted, reactive, ref } from "vue";

import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

const source = axios.CancelToken.source();

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
};

// DRAG SORT
const moveMenu = async (payload: any) => {
  await putByPath("menu/update_menu_batch", payload, "", source.token);
  loadMenu();
};

onMounted(loadMenu);
</script>

<template>
  <VRow class="g-3">

  <!-- LEFT: MENU LIST -->
  <VCol cols="12" md="8">
    <AccordionMenu
      :menu="nestedMenu"
      @edit="editMenu"
      @delete="deleteMenu"
      @move="moveMenu"
    />
  </VCol>

 <!-- RIGHT: FORM -->
<VCol cols="12" md="4">
  <VCard class="pa-4" elevation="3" style="position: sticky; top: 80px; border-radius: 14px;">

    <VBtn
      block
      color="primary"
      class="mb-4"
      @click="resetForm"
      prepend-icon="mdi-plus"
    >
      Tambah Menu
    </VBtn>

    <div class="text-h6 font-weight-bold mb-4">
      Form Menu
    </div>

    <VForm @submit.prevent="onSubmit">

      <VTextField
        label="Display Menu"
        v-model="values.display"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        placeholder="Nama menu yang ditampilkan"
      />

      <VTextField
        label="Alias Menu"
        v-model="values.name"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        placeholder="Alias menu"
      />

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
      />

      <VTextField
        label="Path"
        v-model="values.path"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        placeholder="/pathmenu/..."
      />

      <VTextField
        label="Icon"
        v-model="values.icon"
        variant="outlined"
        density="comfortable"
        class="mb-2"
        placeholder="Ex: fa-solid fa-house"
      />

      <div class="text-subtitle-2 mt-4 mb-2">Hak Akses</div>
      <div>
        <VCheckbox
          v-for="(p,i) in values.privileges"
          :key="i"
          v-model="p.checked"
          :label="p.priv"
          density="compact"
          hide-details
        />
      </div>

      <div class="d-flex gap-3 mt-5">
        <VBtn type="submit" block color="primary" :loading="loadingForm">
          Simpan
        </VBtn>

        <VBtn block color="secondary" variant="tonal" @click="resetForm">
          Batal
        </VBtn>
      </div>

    </VForm>

  </VCard>
</VCol>


</VRow>

</template>

