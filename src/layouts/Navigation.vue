<template>
  <header
    :style="{ backgroundColor: isDark ? '#111827' : '#FFFFFF' }"
    class="h-[60px] flex items-center justify-between px-6 shadow-sm transition-colors duration-300"
    :class="isDark ? 'shadow-gray-800' : 'shadow-gray-200'"
  >
    <!-- Góc trái: Logo -->
    <div class="flex items-center">
      <img src="/icons8-telegram-64.png" alt="Logo" class="w-10 h-10 object-contain cursor-pointer" />
    </div>

    <!-- Góc phải: Các mục điều hướng và hành động -->
    <div class="flex items-center space-x-6">
      <!-- Menu điều hướng -->
      <nav class="hidden md:flex items-center space-x-6">
        <a href="#" @click.prevent="selectedProject = 'Tiến Nga'" :class="selectedProject === 'Tiến Nga' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[#141414] dark:text-gray-200 font-medium'" class="text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Tiến Nga</a>
        <a href="#" @click.prevent="selectedProject = 'Ggomoonsin'" :class="selectedProject === 'Ggomoonsin' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[#141414] dark:text-gray-200 font-medium'" class="text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Ggomoonsin</a>
        <a href="#" @click.prevent="selectedProject = 'Rental'" :class="selectedProject === 'Rental' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[#141414] dark:text-gray-200 font-medium'" class="text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Rental</a>
        <a href="#" @click.prevent="selectedProject = 'Credit'" :class="selectedProject === 'Credit' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[#141414] dark:text-gray-200 font-medium'" class="text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Credit</a>
        <a href="#" @click.prevent="selectedProject = 'Other'" :class="selectedProject === 'Other' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[#141414] dark:text-gray-200 font-medium'" class="text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Other</a>
      </nav>

      <!-- Đường kẻ chia -->
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>

      <!-- Hành động -->
      <div class="flex items-center space-x-4">
        <!-- Nút chuyển đổi Darkmode / Lightmode -->
        <el-button @click="handleToggle" circle :icon="isDark ? Moon : Sunny" />

        <!-- Nút User Avatar (Dropdown) -->
        <el-dropdown trigger="click">
          <span class="flex items-center cursor-pointer outline-none">
            <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="User">Hồ sơ người dùng</el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" divided @click="handleLogout">Đăng xuất</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core'

const selectedProject = defineModel('project', { type: String, default: 'Tiến Nga' })
import { Moon, Sunny, User, SwitchButton } from '@element-plus/icons-vue'

// Trạng thái Darkmode
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

// Toggle thủ công để đảm bảo hoạt động
const handleToggle = () => {
  isDark.value = !isDark.value
}

// Xử lý khi nhấn Đăng xuất
const handleLogout = () => {
  console.log('User logged out')
  // Thêm logic đăng xuất ở đây (ví dụ: xoá token, chuyển về trang login)
}
</script>

