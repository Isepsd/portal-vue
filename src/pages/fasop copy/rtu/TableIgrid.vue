<script setup lang="ts">
import { ModuleRegistry } from "ag-grid-community";
import {
  AdvancedFilterModule,
  ClientSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridChartsModule,
  MenuModule,
  NumberFilterModule,
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
  StatusBarModule,
  TextFilterModule,
} from "ag-grid-enterprise";
import { computed, onMounted, PropType, ref, watch } from "vue";

import {
  createAgGridTheme,
  getGlobalAgGridTheme,
  setGlobalAgGridTheme,
} from "@core/index";
import { useConfigStore } from "@core/stores/config";
import { AgGridVue } from "ag-grid-vue3";
import axios from "axios";
import { debounce } from "lodash";

// ✅ Perbaikan: props dengan tipe yang benar
const props = defineProps({
  filterValues: { type: Object as PropType<Record<string, any>>, required: true },
  pathService: { type: String, required: true },
  handleRespDataApi: { type: Function as PropType<(data: any[], page: number, limit: number) => any[]>, required: true },
});

// 🧩 Register semua modul AG Grid
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
  SetFilterModule,
  TextFilterModule,
  NumberFilterModule,
  RowGroupingModule,
  ClipboardModule,
  ExcelExportModule,
  RangeSelectionModule,
  StatusBarModule,
  GridChartsModule,
  AdvancedFilterModule,
]);

// 📦 Store dan state dasar
const gridRef = ref();
const loading = ref(false);
const totalData = ref(0);
const totalPages = ref(0);
const rowData = ref<any[]>([]);
const gridTheme = getGlobalAgGridTheme();
const configStore = useConfigStore();
const gridThemeRef = ref(gridTheme);
const source = axios.CancelToken.source();

// 🧠 Handler AG Grid Filter
const onFilterChanged = debounce((params: any) => {
  const api = params.api;
  const filterModel = api.getFilterModel();

  const newFilters: Record<string, any> = {};

  for (const key in filterModel) {
    const val = filterModel[key]?.filter;
    if (val !== undefined && val !== "") {
      newFilters[key] = val;
    }
  }

  // hapus filter lama
  for (const key in props.filterValues) {
    if (!(key in newFilters) && key !== "page" && key !== "limit") {
      delete props.filterValues[key];
    }
  }

  Object.assign(props.filterValues, newFilters);
  getData(props.filterValues.page, props.filterValues.limit);
}, 400);

// 🧱 Kolom Grid
const columnDefs = ref([
  { headerName: "No", field: "number", width: 80, filter: false },
  { headerName: "Point Number", field: "point_number" },
  { headerName: "Tipe Point", field: "nama_pointtype" },
  { headerName: "B1 (Lokasi)", field: "path1" },
  { headerName: "B2 (Tegangan)", field: "path2" },
  { headerName: "B3 (Bay)", field: "path3" },
  { headerName: "B4 (Element)", field: "path4" },
  { headerName: "B5 (Info)", field: "path5" },
  { headerName: "Tanggal Value", field: "datum_capture" },
  { headerName: "Value", field: "value" },
  { headerName: "Tanggal Status", field: "datum_2" },
  { headerName: "Status", field: "status_2" },
  { headerName: "Durasi", field: "durasi" },
  {
    headerName: "Kesimpulan",
    field: "kesimpulan",
    cellRenderer: (params: any) => {
      const status = params.value || "INVALID";
      const color =
        status === "VALID"
          ? "#198754"
          : status === "INVALID"
          ? "#dc3545"
          : "#6c757d";
      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
        ">
          ${status}
        </span>`;
    },
  },
]);

// 🧠 Ambil data dari API
const getData = async (page = 1, limit = 10) => {
  loading.value = true;
  try {
    const params = { ...props.filterValues, page, limit };
    const req: any = await getAllByPath(props.pathService, params, source.token);
    const results = req?.results || req?.data?.results || [];
    totalData.value = req?.total || req?.data?.total || results.length;
    totalPages.value = Math.ceil(totalData.value / limit);
    rowData.value = props.handleRespDataApi(results, page, limit);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 🧭 Pagination handler
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  props.filterValues.page = page;
  getData(page, props.filterValues.limit);
};

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = props.filterValues.page;
  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

watch(
  () => props.filterValues.limit,
  (newLimit) => {
    props.filterValues.page = 1;
    getData(1, newLimit);
  }
);

onMounted(() => getData(props.filterValues.page, props.filterValues.limit));

// ⚙️ Default column setting
const defaultColDef: any = {
  sortable: true,
  resizable: true,
  filter: "agTextColumnFilter",
  floatingFilter: true,
  suppressMenu: false,
  menuTabs: ["filterMenuTab", "generalMenuTab"],
  floatingFilterComponentParams: {
    suppressFilterButton: true,
  },
};

// 🌙 Theme Watcher
watch(
  () => configStore.theme,
  (themeMode) => {
    const newAgTheme = createAgGridTheme(themeMode as "light" | "dark" | "system");
    setGlobalAgGridTheme(newAgTheme);
    gridThemeRef.value = newAgTheme;
    document.documentElement.style.setProperty("--ag-active-theme", themeMode);
  },
  { immediate: true }
);

const getMainMenuItems = (params: any) => params.defaultItems;
</script>


<template>



  <div>
    <div class="loading-bar-container" v-show="loading">
      <div class="loading-bar"></div>
    </div>

    <!-- 🟢 AG GRID -->
    <AgGridVue
      ref="gridRef"
      style="height: 600px; width: 100%"
     :theme="gridThemeRef"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :defaultColDef="defaultColDef"
      :getMainMenuItems="getMainMenuItems"
      :gridOptions="{
        rowSelection: 'single',
        suppressHorizontalScroll: false,
        suppressMenuHide: false,
      }"
      :sideBar="false"
       @filterChanged="onFilterChanged" 
    />

    <!-- 🟢 Pagination -->
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 pagination-container pt-2"
      v-show="true"
    >
      <div class="d-flex align-items-center gap-1 flex-wrap">
        <button
          class="btn-pagination"
          :disabled="filterValues.page === 1 || loading"
          @click="changePage(filterValues.page - 1)"
        >
          ‹ Prev
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="btn-pagination"
          :class="{ active: p === filterValues.page }"
          :disabled="loading"
          @click="changePage(p)"
        >
          {{ p }}
        </button>

        <button
          class="btn-pagination"
          :disabled="filterValues.page >= totalPages || loading"
          @click="changePage(filterValues.page + 1)"
        >
          Next ›
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <select
          v-model.number="filterValues.limit"
          class="form-select form-select-sm limit-select"
          :disabled="loading"
        >
          <option v-for="s in [10, 20, 50, 100, 1000]" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap mb-2 border-bottom pb-2">
        <h6 class="fw-bold text-tosca mb-0">Total Data</h6>
        <div class="data-summary text-end">
          <span class="fw-semibold text-muted">{{ totalData.toLocaleString() }} Data</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-tosca {
  color: #009688;
}
.pagination-container {
  border-top: 1px solid #dee2e6;
}
.btn-pagination {
  background-color: #fff;
  border: 1px solid #009688;
  color: #009688;
  font-size: 0.85rem;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.btn-pagination:hover:not(:disabled) {
  background-color: #26a69a;
  color: #fff;
  transform: translateY(-1px);
}
.btn-pagination.active {
  background-color: #009688;
  color: white;
  font-weight: 600;
}
.btn-pagination:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8f8f8;
  color: #aaa;
}
.limit-select {
  border: 1px solid #009688;
  color: #009688;
  border-radius: 6px;
  padding: 3px 6px;
}
.limit-select:focus {
  border-color: #26a69a;
  box-shadow: 0 0 0 0.2rem rgba(0, 150, 136, 0.25);
}
.data-summary {
  font-size: 0.9rem;
  color: #555;
}

/* 🔹 Loading bar style */
.loading-bar-container {
  height: 4px;
  width: 100%;
  background-color: #e0f2f1;
  overflow: hidden;
  position: relative;
  border-radius: 2px;
  margin-bottom: 6px;
}
.loading-bar {
  position: absolute;
  width: 40%;
  height: 100%;
  background-color: #009688;
  animation: loading-bar-move 1.2s ease-in-out infinite;
  border-radius: 2px;
}

@keyframes loading-bar-move {
  0% {
    left: -40%;
  }
  50% {
    left: 60%;
  }
  100% {
    left: 100%;
  }
}
</style>
