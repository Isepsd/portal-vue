<template>
  <li class="tree-item">
    <div class="tree-row" @click="toggle">
      <span v-if="hasChildren" class="toggle-icon">
        {{ expanded ? "▼" : "▶" }}
      </span>

      <i :class="item.icon || 'fa-regular fa-folder'" class="me-2"></i>
      <span>{{ item.display }}</span>

      <div class="actions">
        <button @click.stop="$emit('edit', item)">
          ✏️
        </button>
        <button @click.stop="$emit('delete', item)">
          🗑️
        </button>
      </div>
    </div>

    <ul v-show="expanded" v-if="hasChildren" class="tree-children">
      <TreeItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ item: any }>();
defineEmits(["edit", "delete", "move"]);

const expanded = ref(false);

const hasChildren = computed(() => props.item?.children?.length > 0);
const toggle = () => { if (hasChildren.value) expanded.value = !expanded.value; };
</script>
<style scoped>
.tree-item {
  margin: 2px 0;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 10px;
  background: #ffffff; /* ✅ Putih */
  border: 1px solid #dcdcdc; /* ✅ Border abu */
  border-radius: 4px;
  font-size: 14px;
  color: #333; /* ✅ Warna teks gelap */
}

/* Hover lebih lembut */
.tree-row:hover {
  background: #f3f6fa; /* ✅ mirip bootstrap hover */
}

/* Indent untuk children */
.tree-children {
  margin-left: 18px; /* ✅ Rapi */
  padding-left: 6px;
  border-left: 1px dashed #c9c9c9; /* ✅ Penanda anak menu */
}

/* Icon Toggle */
.toggle-icon {
  width: 14px;
  display: inline-block;
  font-size: 10px;
  color: #333;
}

/* Tombol Edit/Delete */
.actions button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px;
  opacity: 0.6;
  font-size: 14px;
}

.actions button:hover {
  opacity: 1;
}
</style>
