<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Thanh điều hướng (sticky, luôn ở trên) -->
    <Navigation v-model:project="currentProject" />
    
    <!-- Đường phân cách nhẹ -->
    <div class="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>

    <!-- Nội dung chính -->
    <main class="flex-1 overflow-hidden">
       <div class="h-full shadow-[0_0_10px_var(--el-border-color-light)]">

         <!-- === Tiến Nga: có sidebar riêng (responsive bên trong) === -->
         <TienNgaDashboard v-if="currentProject === 'Tiến Nga'" />

         <!-- === Các project khác === -->
         <template v-else>
           <!-- Desktop (≥ 1024px): giữ el-splitter -->
           <el-splitter v-if="isDesktop">
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

           <!-- Tablet & Mobile (< 1024px): không cần sidebar, chỉ hiện project name header -->
           <div v-else class="h-full flex flex-col">
             <div
               class="shrink-0 px-4 py-2.5 border-b flex items-center text-sm font-semibold"
               :class="isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'"
             >
               <span>{{ currentProject }}</span>
             </div>
             <div class="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto overflow-x-auto">
               <!-- Chứa các view của project khác sau này -->
             </div>
           </div>
         </template>

       </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWindowSize, useDark } from '@vueuse/core'
import Navigation from '@/layouts/Navigation.vue'
import TienNgaDashboard from '@/components/TienNga/Index.vue'

const route = useRoute()
const currentProject = ref('Tiến Nga')

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/tien-nga')) {
      currentProject.value = 'Tiến Nga'
    }
  },
  { immediate: true }
)
const { width: windowWidth } = useWindowSize()

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const isDesktop = computed(() => windowWidth.value >= 1024)
</script>
