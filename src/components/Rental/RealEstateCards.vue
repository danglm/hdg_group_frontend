<template>
  <div class="rental-container h-full flex flex-col">
    <!-- Filter Bar -->
    <div class="flex justify-between items-center mb-6 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tình trạng:</span>
          <el-select
            v-model="filterStatus"
            placeholder="Tất cả"
            style="width: 150px"
            clearable
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="" />
            <el-option label="Đang trống" value="vacant" />
            <el-option label="Đã thuê" value="occupied" />
            <el-option label="Đang bán" value="selling" />
            <el-option label="Đã bán" value="sold" />
            <el-option label="Bảo trì" value="maintenance" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
          <el-input
            v-model="searchQuery"
            placeholder="Tìm mã BĐS, địa chỉ..."
            :prefix-icon="Search"
            clearable
            class="w-64 custom-dark-input"
          />
        </div>
      </div>
      <el-button type="primary" :icon="Plus" @click="emit('add')">Thêm bất động sản</el-button>
    </div>

    <!-- Cards Grid -->
    <div class="flex-1 min-h-0 overflow-y-auto pb-4">
      <div v-if="filteredProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <el-card
          v-for="prop in filteredProperties"
          :key="prop.id"
          shadow="hover"
          class="prop-card border border-gray-100 dark:border-gray-700/80 rounded-2xl bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <!-- Card Header -->
          <div class="flex items-start gap-3 mb-4">
            <div class="p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center bg-blue-500 dark:bg-blue-600">
              <el-icon :size="20">
                <OfficeBuilding />
              </el-icon>
            </div>
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center justify-between gap-1">
                <h4 class="font-bold text-gray-800 dark:text-gray-100 text-[15px] line-clamp-1 leading-snug flex-1">
                  {{ prop.real_estate_id }}
                </h4>
                
                <!-- Dropdown Menu -->
                <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, prop)">
                  <el-button link type="info" class="p-1 !text-gray-400 hover:!text-gray-600 dark:hover:!text-gray-200">
                    <el-icon :size="16"><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">Chi tiết</el-dropdown-item>
                      <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                      <el-dropdown-item command="delete" divided class="!text-red-500">Xóa</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <el-icon><Location /></el-icon>
                <span class="truncate">{{ prop.address }}</span>
              </div>
            </div>
          </div>

          <!-- Status Tag -->
          <div class="mb-4 flex justify-start">
            <el-tag :type="getStatusTag(prop.status)" size="small" class="capitalize" effect="plain">
              {{ getStatusText(prop.status) }}
            </el-tag>
          </div>

          <!-- Card Body details -->
          <div class="space-y-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400 dark:text-gray-500 font-medium">Tổng đầu tư</span>
              <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatCurrency(prop.total_cost) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400 dark:text-gray-500 font-medium">Tiền đã góp</span>
              <span class="font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(prop.contributed_cost) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400 dark:text-gray-500 font-medium">LN Cho thuê</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">+{{ formatCurrency(prop.rental_profit) }}</span>
            </div>

            <!-- Estimated value box -->
            <div class="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex justify-between items-center border border-gray-100/50 dark:border-gray-800">
              <div class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Giá tạm tính hiện tại</div>
              <div class="text-[14px] font-extrabold text-indigo-600 dark:text-indigo-400">
                {{ formatCurrency(prop.current_estimated) }}
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-gray-400">
        <el-empty description="Không tìm thấy bất động sản nào" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, OfficeBuilding, MoreFilled, Location } from '@element-plus/icons-vue'

interface Property {
  id: string
  real_estate_id: string
  address: string
  start_buy: string
  end_buy: string
  total_cost: number
  real_estate_cost: number
  construction_cost: number
  furniture_cost: number
  sale_cost: number
  contributed_cost: number
  monthly_interest_rate: number
  mining_profit: number
  rental_profit: number
  start_sale: string
  end_sale: string
  profit_after_tax: number
  profit_after_sale: number
  status: string
  note: string
  current_estimated: number
}

const props = defineProps<{
  properties: Property[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', val: Property): void
  (e: 'delete', val: Property): void
  (e: 'detail', val: Property): void
}>()

const searchQuery = ref('')
const filterStatus = ref('')

const filteredProperties = computed(() => {
  return props.properties.filter(p => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q ||
      p.real_estate_id.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    
    const matchesStatus = !filterStatus.value || p.status === filterStatus.value

    return matchesSearch && matchesStatus
  })
})

const getStatusTag = (status: string) => {
  if (status === 'occupied') return 'success'
  if (status === 'vacant') return 'primary'
  if (status === 'selling') return 'warning'
  if (status === 'sold') return 'danger'
  return 'info'
}

const getStatusText = (status: string) => {
  if (status === 'occupied') return 'Đã thuê'
  if (status === 'vacant') return 'Đang trống'
  if (status === 'selling') return 'Đang bán'
  if (status === 'sold') return 'Đã bán'
  return 'Bảo trì'
}

const formatCurrency = (val: number) => {
  if (!val) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ'
}

const handleCommand = (cmd: string, prop: Property) => {
  if (cmd === 'detail') {
    emit('detail', prop)
  } else if (cmd === 'edit') {
    emit('edit', prop)
  } else if (cmd === 'delete') {
    emit('delete', prop)
  }
}
</script>

<style scoped>
.rental-container {
  height: 100%;
}
.prop-card:hover {
  transform: translateY(-4px);
}
/* Custom el-card layout */
:deep(.el-card) {
  border-radius: 1rem;
}
:deep(.el-card__body) {
  padding: 1.5rem;
}

html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #4b5563 inset !important;
}
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}

html.dark .custom-dark-select :deep(.el-input__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #4b5563 inset !important;
}
html.dark .custom-dark-select :deep(.el-input__inner) {
  color: #f3f4f6;
}
</style>
