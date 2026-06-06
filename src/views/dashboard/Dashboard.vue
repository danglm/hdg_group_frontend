<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Thanh điều hướng -->
    <Navigation v-model:project="currentProject" />
    
    <!-- Đường phân cách nhẹ -->
    <div class="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>

    <!-- Nội dung chính -->
    <main class="flex-1 overflow-hidden">
       <div class="h-full shadow-[0_0_10px_var(--el-border-color-light)]">
         <TienNgaDashboard v-if="currentProject === 'Tiến Nga'" />
         <el-splitter v-else>
           <el-splitter-panel size="15%">
              <div class="flex items-center justify-center h-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-lg border-r border-gray-100 dark:border-gray-700">
                <span>{{ currentProject }}</span>
              </div>
           </el-splitter-panel>
           <el-splitter-panel :min="200">
              <div class="h-full bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto overflow-x-auto">
                <!-- Chứa các view của project khác sau này -->
              </div>
           </el-splitter-panel>
         </el-splitter>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navigation from '@/layouts/Navigation.vue'
import TienNgaDashboard from '@/components/TienNga/Index.vue'

const currentProject = ref('Tiến Nga')
</script>
