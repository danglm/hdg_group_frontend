<template>
  <div class="lookup-container h-full flex flex-col">
    <!-- Filter bar -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-4 mb-4 shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <!-- Category Selection -->
      <div class="flex items-center gap-2">
        <span class="whitespace-nowrap text-sm font-medium text-gray-750 dark:text-gray-300">Mục:</span>
        <el-select
          v-model="activeCategory"
          style="width: 200px"
          class="custom-dark-select highlight-select"
          popper-class="custom-dark-select-popper"
          @change="handleCategoryChange"
        >
          <el-option label="Thu hoạch hằng ngày" value="daily_harvest" />
          <el-option label="Vật tư" value="supplies" />
        </el-select>
      </div>

      <!-- Time range filter -->
      <div class="flex items-center gap-2">
        <span class="whitespace-nowrap text-sm font-medium text-gray-750 dark:text-gray-300">Thời gian:</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          class="custom-dark-date-picker highlight-select"
          popper-class="custom-dark-select-popper"
          style="width: 280px"
        />
      </div>

      <!-- Household Code Input (Only for Daily Harvest) -->
      <div v-if="activeCategory === 'daily_harvest'" class="flex items-center gap-2">
        <span class="whitespace-nowrap text-sm font-medium text-gray-750 dark:text-gray-300">Mã Hộ dân:</span>
        <el-input
          v-model="householdCode"
          placeholder="Nhập mã hộ dân..."
          clearable
          class="w-48 custom-dark-input"
        />
      </div>

      <!-- Land Code Input -->
      <div class="flex items-center gap-2">
        <span class="whitespace-nowrap text-sm font-medium text-gray-750 dark:text-gray-300">Mã Đất:</span>
        <el-input
          v-model="landCode"
          placeholder="Nhập mã đất..."
          clearable
          class="w-48 custom-dark-input"
        />
      </div>

      <!-- Search Button -->
      <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading" class="ml-auto">Tìm kiếm</el-button>
    </div>

    <!-- Summary Statistics Cards -->
    <div v-if="hasSearched" class="summary-cards mb-4 shrink-0">
      <!-- 1. Daily Harvest Statistics Cards -->
      <template v-if="activeCategory === 'daily_harvest'">
        <!-- Rubber (Cao su) -->
        <div v-if="cropType === 'cao_su'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="stat-card stat-card--blue">
            <div class="stat-card__label">Tổng khối lượng thu hoạch</div>
            <div class="stat-card__value text-blue-600 dark:text-blue-400">
              {{ formatWeight(totalWeight) }} Kg
            </div>
          </div>
          <div class="stat-card stat-card--emerald">
            <div class="stat-card__label">Tổng chi phí cạo mủ (Tổng thành tiền)</div>
            <div class="stat-card__value text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(totalAmount) }}
            </div>
          </div>
        </div>

        <!-- Durian (Sầu riêng) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="stat-card stat-card--blue">
            <div class="stat-card__label">Tổng khối lượng thu hoạch</div>
            <div class="stat-card__value text-blue-600 dark:text-blue-400">
              {{ formatWeight(totalWeight) }} Kg
            </div>
          </div>
          <div class="stat-card stat-card--indigo">
            <div class="stat-card__label">Tổng Số lượng Trái</div>
            <div class="stat-card__value text-indigo-600 dark:text-indigo-400">
              {{ formatInt(totalFruits) }} trái
            </div>
          </div>
          <div class="stat-card stat-card--emerald">
            <div class="stat-card__label">Tổng thành tiền</div>
            <div class="stat-card__value text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(totalAmount) }}
            </div>
          </div>
        </div>
      </template>

      <!-- 2. Supplies Statistics Cards -->
      <template v-else-if="activeCategory === 'supplies'">
        <div class="grid grid-cols-1 gap-4">
          <div class="stat-card stat-card--emerald">
            <div class="stat-card__label">Tổng thành tiền</div>
            <div class="stat-card__value text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(totalAmount) }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Table Results -->
    <div v-if="hasSearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <!-- 1. Daily Harvest Table -->
      <el-table v-if="activeCategory === 'daily_harvest'" v-loading="loading" :data="paginatedData" style="width: 100%" class="flex-1" height="100%">
        <el-table-column prop="day" label="Ngày" width="130" fixed>
          <template #default="{ row }">
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{ formatDate(row.day) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="household_code" label="Mã Hộ Dân" width="140">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ row.household_code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="household_name" label="Tên Hộ Dân" min-width="160">
          <template #default="{ row }">
            <span class="font-semibold text-gray-700 dark:text-gray-300">{{ row.household_name || getHouseholdName(row.household_code) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="land_code" label="Mã Đất" width="130">
          <template #default="{ row }">
            <span class="font-mono text-gray-500 dark:text-gray-400">{{ row.land_code || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tree_count" :label="cropType === 'cao_su' ? 'Số cây cạo' : 'Số trái hái'" width="150" align="right">
          <template #default="{ row }">
            <span>{{ formatInt(row.tree_count) }} {{ cropType === 'cao_su' ? 'cây' : 'trái' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="harvest_weight" label="Khối lượng thu hoạch (Kg)" width="200" align="right">
          <template #default="{ row }">
            <span class="font-bold">{{ formatWeight(row.harvest_weight) }} Kg</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="Đơn giá" width="140" align="right">
          <template #default="{ row }">
            <span>{{ formatCurrency(row.unit_price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="Thành tiền" min-width="160" align="right">
          <template #default="{ row }">
            <span class="text-emerald-650 dark:text-emerald-400 font-extrabold">
              {{ formatCurrency(row.total_amount) }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 2. Supplies Table -->
      <el-table v-else-if="activeCategory === 'supplies'" v-loading="loading" :data="paginatedData" style="width: 100%" class="flex-1" height="100%">
        <el-table-column prop="day" label="Ngày" width="130" fixed>
          <template #default="{ row }">
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{ formatDate(row.day) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="land_code" label="Mã đất" width="120">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ row.land_code || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplies_name" label="Tên vật tư" min-width="160">
          <template #default="{ row }">
            <span class="font-bold text-gray-850 dark:text-gray-100">{{ row.supplies_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="Nhà cung cấp" min-width="150" show-overflow-tooltip />
        <el-table-column prop="quantity" label="Số lượng" width="130" align="right">
          <template #default="{ row }">
            <span>{{ formatWeight(row.quantity) }} {{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="Đơn giá" width="140" align="right">
          <template #default="{ row }">
            <span>{{ formatCurrency(row.unit_price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="Thành tiền" width="160" align="right">
          <template #default="{ row }">
            <span class="text-emerald-650 dark:text-emerald-400 font-extrabold">
              {{ formatCurrency(row.total_amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="Mục đích sử dụng" min-width="180" show-overflow-tooltip />
        <el-table-column prop="buyer" label="Người mua" width="140" show-overflow-tooltip />
        <el-table-column prop="notes" label="Ghi chú" min-width="150" show-overflow-tooltip />
      </el-table>

      <!-- Pagination -->
      <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchResults.length"
        />
      </div>
    </div>

    <!-- Empty state before search -->
    <div v-if="!hasSearched" class="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="text-center text-gray-400 dark:text-gray-500">
        <el-icon class="text-6xl mb-4"><Search /></el-icon>
        <p class="text-lg font-medium">Vui lòng chọn các tiêu chí và nhấn <strong>Tìm kiếm</strong> để truy xuất thông tin</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { harvestService } from '@/api/harvestService'

const props = defineProps<{
  cropType: 'cao_su' | 'sau_rieng'
}>()

const activeCategory = ref<'daily_harvest' | 'supplies'>('daily_harvest')
const loading = ref(false)
const hasSearched = ref(false)
const dateRange = ref<[string, string] | null>(null)
const householdCode = ref('')
const landCode = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

const searchResults = ref<any[]>([])
const households = ref<any[]>([])

// Total metrics
const totalWeight = computed(() => {
  if (activeCategory.value !== 'daily_harvest') return 0
  return searchResults.value.reduce((sum, item) => {
    const val = parseFloat(item.harvest_weight)
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
})

const totalFruits = computed(() => {
  if (activeCategory.value !== 'daily_harvest') return 0
  return searchResults.value.reduce((sum, item) => {
    const val = parseInt(item.tree_count, 10)
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
})

const totalAmount = computed(() => {
  return searchResults.value.reduce((sum, item) => {
    const val = parseFloat(item.total_amount)
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return searchResults.value.slice(start, end)
})

const getHouseholdName = (code: string) => {
  const matched = households.value.find(h => h.household_code === code)
  return matched ? matched.fullname : '—'
}

// Formatters
const formatDate = (val: string) => {
  if (!val) return '—'
  const [y, m, d] = val.split('-')
  return `${d}/${m}/${y}`
}

const formatCurrency = (val: number) => {
  if (!val) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ'
}

const formatInt = (val: number) => {
  return new Intl.NumberFormat('vi-VN').format(val)
}

const formatWeight = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
}

// Fetch helper data
const fetchHouseholds = async () => {
  try {
    const data = await harvestService.getHouseholds()
    households.value = data
  } catch (error) {
    console.error('Error fetching households:', error)
  }
}

// Reset state when category changes
const handleCategoryChange = () => {
  hasSearched.value = false
  searchResults.value = []
  currentPage.value = 1
  dateRange.value = null
  householdCode.value = ''
  landCode.value = ''
}

// Search
const handleSearch = async () => {
  loading.value = true
  hasSearched.value = true
  currentPage.value = 1
  try {
    let start_date = undefined
    let end_date = undefined
    if (dateRange.value && dateRange.value.length === 2) {
      start_date = dateRange.value[0]
      end_date = dateRange.value[1]
    }

    const params: any = {
      crop_type: props.cropType
    }
    if (start_date) params.start_date = start_date
    if (end_date) params.end_date = end_date
    if (landCode.value.trim()) params.land_code = landCode.value.trim()

    if (activeCategory.value === 'daily_harvest') {
      if (householdCode.value.trim()) params.household_code = householdCode.value.trim()
      const data = await harvestService.getDailyHarvests(params)
      searchResults.value = data
    } else {
      const data = await harvestService.getSuppliesExpenses(params)
      searchResults.value = data
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Lỗi khi truy xuất dữ liệu')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHouseholds()
})

watch(() => props.cropType, () => {
  handleCategoryChange()
})
</script>

<style scoped>
.lookup-container {
  height: 100%;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
  text-align: left;
}

html.dark .stat-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stat-card--blue {
  border-left: 4px solid #3b82f6;
}

.stat-card--indigo {
  border-left: 4px solid #6366f1;
}

.stat-card--emerald {
  border-left: 4px solid #10b981;
}

.stat-card__label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

html.dark .stat-card__label {
  color: #94a3b8;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

/* Custom dark mode styles for table */
html.dark .lookup-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .lookup-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .lookup-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

html.dark .lookup-container :deep(.el-table .el-table-fixed-column--left),
html.dark .lookup-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
}

html.dark .custom-dark-input,
html.dark .custom-dark-date-picker {
  --el-input-text-color: #f3f4f6 !important;
  --el-text-color-regular: #f3f4f6 !important;
  --el-text-color-placeholder: #9ca3af !important;
}

html.dark .custom-dark-input :deep(.el-input__wrapper),
html.dark .custom-dark-date-picker :deep(.el-input__wrapper) {
  background-color: #1f2937;
  box-shadow: 0 0 0 1px #374151 inset;
}

html.dark .custom-dark-input :deep(.el-input__inner),
html.dark .custom-dark-date-picker :deep(.el-input__inner) {
  color: #f3f4f6 !important;
  -webkit-text-fill-color: #f3f4f6 !important;
  opacity: 1 !important;
}

/* Date picker range dark mode overrides */
html.dark .highlight-select.el-date-editor.el-range-editor {
  background-color: #1f2937 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
  border-color: #374151 !important;
}

html.dark .highlight-select.el-date-editor :deep(.el-range-input) {
  background-color: transparent !important;
  color: #f3f4f6 !important;
  -webkit-text-fill-color: #f3f4f6 !important;
}

html.dark .highlight-select.el-date-editor :deep(.el-range-separator) {
  color: #9ca3af !important;
}

html.dark .highlight-select.el-date-editor :deep(.el-range-input::placeholder) {
  color: #6b7280 !important;
}
</style>
