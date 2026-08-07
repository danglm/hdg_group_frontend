<template>
  <div class="h-full flex flex-col p-4 md:p-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-y-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Log Task & Lịch Sử Hoạt Động</span>
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Theo dõi chi tiết các thao tác đổi trạng thái, tạo task, phân công và bình luận
        </p>
      </div>

      <el-button plain :icon="Refresh" @click="fetchLogs">
        Làm mới
      </el-button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between text-xs">
      <div class="flex items-center space-x-3">
        <span class="font-bold text-gray-600 dark:text-gray-300">Lọc theo:</span>
        <el-input
          v-model="searchQuery"
          placeholder="Tìm kiếm người thực hiện hoặc chi tiết..."
          clearable
          class="!w-64"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="text-gray-400 text-xs font-semibold">
        Hiển thị {{ filteredLogs.length }} nhật ký
      </div>
    </div>

    <!-- Activity Log Timeline List -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <template v-if="filteredLogs.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="log in filteredLogs"
            :key="log.id"
            :timestamp="formatDate(log.created_at)"
            placement="top"
            :type="getLogType(log.action)"
          >
            <div class="p-3.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ log.actor_id }}</span>
                <el-tag size="small" :type="getLogType(log.action)">{{ log.action }}</el-tag>
              </div>

              <div class="text-xs text-gray-800 dark:text-gray-200 font-medium">
                {{ log.details || 'Có thay đổi trên công việc' }}
              </div>

              <div v-if="log.field_name" class="text-[11px] text-gray-500 font-mono bg-white dark:bg-gray-900 p-1.5 rounded border border-gray-100 dark:border-gray-800">
                Trường [<span class="font-semibold">{{ log.field_name }}</span>]: {{ log.old_value || 'None' }} ➔ <span class="text-green-600 font-semibold">{{ log.new_value }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </template>

      <div v-else class="text-center py-12 text-gray-400 italic text-sm">
        Chưa có nhật ký hoạt động nào được ghi nhận.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { projectManagementService, type TaskActivityLog } from '@/api/projectManagementService'

const logs = ref<TaskActivityLog[]>([])
const searchQuery = ref('')

const fetchLogs = async () => {
  try {
    logs.value = await projectManagementService.getActivityLogs()
  } catch (e) {
    console.error(e)
  }
}

const filteredLogs = computed(() => {
  if (!searchQuery.value.trim()) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(
    l => l.actor_id.toLowerCase().includes(q) || (l.details && l.details.toLowerCase().includes(q))
  )
})

const getLogType = (act: string) => {
  if (act.includes('CREATE')) return 'success'
  if (act.includes('STATUS')) return 'primary'
  if (act.includes('DELETE')) return 'danger'
  return 'info'
}

const formatDate = (dt: string) => {
  const d = new Date(dt)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

onMounted(() => {
  fetchLogs()
})
</script>
