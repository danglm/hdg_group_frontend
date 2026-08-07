<template>
  <!-- ============ DESKTOP (≥ 1024px) ============ -->
  <el-splitter v-if="isDesktop" class="h-full">
    <el-splitter-panel size="15%">
      <Sidebar v-model:activeMenu="activeMenu" />
    </el-splitter-panel>
    <el-splitter-panel :min="200" v-loading="loading">
      <component :is="activeView" v-if="activeView" />
    </el-splitter-panel>
  </el-splitter>

  <!-- ============ TABLET & MOBILE (< 1024px) ============ -->
  <div v-else class="h-full flex" :class="isMobile ? 'flex-col' : 'flex-row'">
    <!-- MOBILE (< 768px): Dropdown menu toggle -->
    <template v-if="isMobile">
      <div
        class="shrink-0 px-4 py-2.5 border-b flex items-center justify-between cursor-pointer select-none transition-colors duration-200"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
        @click="toggleMobileMenu"
      >
        <span
          class="flex items-center text-sm font-medium"
          :class="isDark ? 'text-gray-200' : 'text-gray-700'"
        >
          <el-icon class="mr-2" :size="16">
            <component :is="currentMenuItem?.icon || List" />
          </el-icon>
          <span>{{ currentMenuItem?.label || 'Quản lý task' }}</span>
        </span>
        <span
          class="transition-transform duration-300"
          :class="[
            isMobileMenuOpen ? 'rotate-180' : '',
            isDark ? 'text-gray-400' : 'text-gray-500'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>

      <div class="relative flex-1 overflow-hidden">
        <Transition name="fade">
          <div
            v-if="isMobileMenuOpen"
            class="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
            @click="closeMobileMenu"
          ></div>
        </Transition>

        <Transition name="slide-down">
          <div
            v-if="isMobileMenuOpen"
            class="absolute left-0 right-0 top-0 z-50 border-b"
            :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
            style="box-shadow: 0 8px 24px rgba(0,0,0,0.12);"
          >
            <nav class="flex flex-col">
              <a
                v-for="item in sidebarMenuItems"
                :key="item.index"
                href="#"
                @click.prevent="selectMenu(item.index)"
                class="px-6 py-3 text-sm transition-colors duration-200 border-b last:border-b-0"
                :class="[
                  activeMenu === item.index
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-700 dark:text-gray-200 font-medium',
                  isDark
                    ? 'border-gray-800 hover:bg-gray-800/60'
                    : 'border-gray-100 hover:bg-gray-50'
                ]"
              >
                <span class="flex items-center space-x-3">
                  <el-icon :size="15">
                    <component :is="item.icon" />
                  </el-icon>
                  <span>{{ item.label }}</span>
                </span>
              </a>
            </nav>
          </div>
        </Transition>

        <div class="h-full overflow-hidden" v-loading="loading">
          <component :is="activeView" v-if="activeView" />
        </div>
      </div>
    </template>

    <!-- TABLET (768 – 1023px) -->
    <template v-if="isTablet">
      <div
        class="shrink-0 w-[64px] border-r h-full"
        :class="isDark ? 'border-gray-700' : 'border-gray-200'"
      >
        <Sidebar v-model:activeMenu="activeMenu" :force-collapsed="true" />
      </div>

      <div class="flex-1 overflow-hidden" v-loading="loading">
        <component :is="activeView" v-if="activeView" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWindowSize, useDark } from '@vueuse/core'
import { List, Clock } from '@element-plus/icons-vue'
import Sidebar from './Sidebar.vue'
import TaskManagement from './TaskManagement.vue'
import TaskLogView from './TaskLogView.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

provide('setLoading', (val: boolean) => {
  loading.value = val
})

watch(
  () => route.params.subview,
  () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
)

const subviewMap: Record<string, string> = {
  'task-management': '1',
  'task-log': '2',
}

const indexMap: Record<string, string> = {
  '1': 'task-management',
  '2': 'task-log',
}

const activeMenu = computed({
  get() {
    const subview = (route.params.subview as string) || 'task-management'
    return subviewMap[subview] || '1'
  },
  set(val) {
    const subview = indexMap[val] || 'task-management'
    router.push(`/dashboard/${subview}`)
  }
})

const { width: windowWidth } = useWindowSize()
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const isDesktop = computed(() => windowWidth.value >= 1024)
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
const isMobile = computed(() => windowWidth.value < 768)

const viewMap: Record<string, Component> = {
  '1': TaskManagement,
  '2': TaskLogView,
}

const activeView = computed(() => viewMap[activeMenu.value] || TaskManagement)

const sidebarMenuItems = [
  { index: '1', label: 'Quản lý task', icon: List },
  { index: '2', label: 'Log task', icon: Clock },
]

const currentMenuItem = computed(() =>
  sidebarMenuItems.find(item => item.index === activeMenu.value) || sidebarMenuItems[0]
)

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => { isMobileMenuOpen.value = !isMobileMenuOpen.value }
const closeMobileMenu = () => { isMobileMenuOpen.value = false }
const selectMenu = (index: string) => {
  activeMenu.value = index
  closeMobileMenu()
}
</script>
