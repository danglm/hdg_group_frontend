<template>
  <el-splitter>
    <el-splitter-panel size="15%">
      <Sidebar v-model:activeMenu="activeMenu" />
    </el-splitter-panel>
    <el-splitter-panel :min="200">
      <Overall v-if="activeMenu === '1'" />
      <HR v-else-if="activeMenu === '1-1'" />
      <RubberPurching v-else-if="activeMenu === '2-1'" />
      <MaterialPurchasing v-else-if="activeMenu === '2-2'" />
      <Partner v-else-if="activeMenu === '3'" />
      <Finance v-else-if="activeMenu === '5'" />
      <Warehouse v-else-if="activeMenu === '6'" />
      <ProductWarehouse v-else-if="activeMenu === '7'" />
      <div v-else class="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-500 text-lg">
        Tính năng đang phát triển
      </div>
    </el-splitter-panel>
  </el-splitter>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Overall from './Overall.vue'
import RubberPurching from './RubberPurching/Index.vue'
import MaterialPurchasing from './MaterialPurchasing/Index.vue'
import Partner from './Partner/Index.vue'
import Finance from './Finance/Index.vue'
import Warehouse from './Warehouse/Index.vue'
import ProductWarehouse from './ProductWarehouse/Index.vue'
import HR from './HR/Index.vue'

const activeMenu = ref('1')
</script>
