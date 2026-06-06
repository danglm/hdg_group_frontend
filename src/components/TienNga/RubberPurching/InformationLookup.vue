<template>
  <div class="lookup-container h-full flex flex-col">
    <!-- Filter bar -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Mục:</span>
          <el-select 
            v-model="selectedCategory" 
            placeholder="Chọn mục" 
            style="width: 160px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Hộ dân" value="household" />
            <el-option label="Thu mua" value="purchasing" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Điểm thu mua:</span>
          <el-select 
            v-model="selectedPoint" 
            placeholder="Chọn xưởng/đại lý" 
            style="width: 200px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="all" />
            <el-option label="Xưởng Gia An" value="Xưởng Gia An" />
            <el-option label="Xưởng Phê" value="Xưởng Phê" />
            <el-option label="Xưởng Lạc Tánh" value="Xưởng Lạc Tánh" />
            <el-option label="Đại lý Hải" value="Đại lý Hải" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="custom-dark-input highlight-select"
            popper-class="custom-dark-select-popper"
            style="width: 280px"
          />
        </div>

        <el-button type="primary" :icon="Search" @click="handleSearch">Tìm kiếm</el-button>
      </div>
    </div>

    <!-- Summary Statistics Cards -->
    <div v-if="hasSearched" class="summary-cards mb-4 shrink-0">
      <!-- Hộ dân stats -->
      <div v-if="selectedCategory === 'household'" class="grid grid-cols-3 gap-4">
        <div class="stat-card stat-card--red">
          <div class="stat-card__label">Tổng số tiền nợ</div>
          <div class="stat-card__value text-red-500 dark:text-red-400">{{ formatCurrency(householdStats.totalDebt) }} đ</div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-card__label">Tổng số tiền ứng</div>
          <div class="stat-card__value text-orange-500 dark:text-orange-400">{{ formatCurrency(householdStats.totalAdvance) }} đ</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__label">Tổng Công nợ</div>
          <div class="stat-card__value text-blue-600 dark:text-blue-400">{{ formatCurrency(householdStats.totalBalance) }} đ</div>
        </div>
      </div>

      <!-- Thu mua stats -->
      <div v-if="selectedCategory === 'purchasing'" class="grid grid-cols-3 gap-4 mb-3">
        <div class="stat-card stat-card--cyan">
          <div class="stat-card__label">Tổng khối lượng</div>
          <div class="stat-card__value text-cyan-600 dark:text-cyan-400">{{ formatNumber(purchasingStats.totalWeight) }} kg</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__label">Tổng KL thực tế</div>
          <div class="stat-card__value text-blue-600 dark:text-blue-400">{{ formatNumber(purchasingStats.totalNetWeight) }} kg</div>
        </div>
        <div class="stat-card stat-card--indigo">
          <div class="stat-card__label">Mủ khô</div>
          <div class="stat-card__value text-indigo-600 dark:text-indigo-400">{{ formatNumber(purchasingStats.totalDryRubber, 2) }} kg</div>
        </div>
      </div>
      <div v-if="selectedCategory === 'purchasing'" class="grid grid-cols-3 gap-4">
        <div class="stat-card stat-card--green">
          <div class="stat-card__label">Tổng thành tiền</div>
          <div class="stat-card__value text-green-600 dark:text-green-400">{{ formatCurrency(purchasingStats.totalAmount) }} đ</div>
        </div>
        <div class="stat-card stat-card--emerald">
          <div class="stat-card__label">Tổng đã thanh toán</div>
          <div class="stat-card__value text-emerald-600 dark:text-emerald-400">{{ formatCurrency(purchasingStats.totalPaid) }} đ</div>
        </div>
        <div class="stat-card stat-card--amber">
          <div class="stat-card__label">Tổng lưu sổ</div>
          <div class="stat-card__value text-amber-600 dark:text-amber-400">{{ formatCurrency(purchasingStats.totalBookSaved) }} đ</div>
        </div>
      </div>
    </div>

    <!-- Table Results -->
    <div v-if="hasSearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <!-- Hộ dân table -->
      <template v-if="selectedCategory === 'household'">
        <el-table :data="householdTableData" style="width: 100%" class="flex-1" height="100%">
          <el-table-column type="selection" width="55" fixed />
          <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />
          <el-table-column prop="name" label="Họ và tên" width="180" />
          <el-table-column prop="purchasingPoint" label="Điểm thu mua" width="150" />
          <el-table-column prop="phone" label="Số điện thoại" width="130" />
          <el-table-column prop="address" label="Địa chỉ" min-width="250" />
          <el-table-column prop="bankAccount" label="STK Ngân hàng" width="150" />
          <el-table-column prop="bankName" label="Ngân hàng" width="150" />
          <el-table-column prop="status" label="Trạng thái" width="140" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'Hoạt động' ? 'success' : 'danger'" effect="light" round>
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="debtAmount" label="Số tiền nợ" width="150" align="right">
            <template #default="scope">
              <span class="font-medium text-red-500">{{ formatCurrency(scope.row.debtAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="advanceAmount" label="Ứng tiền" width="150" align="right">
            <template #default="scope">
              <span class="font-medium text-orange-500">{{ formatCurrency(scope.row.advanceAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalDebt" label="Công nợ" width="150" align="right">
            <template #default="scope">
              <span class="font-bold">{{ formatCurrency(scope.row.totalDebt) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- Thu mua table -->
      <template v-if="selectedCategory === 'purchasing'">
        <el-table :data="purchasingTableData" style="width: 100%" class="flex-1" height="100%">
          <el-table-column type="selection" width="55" fixed />
          <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />
          <el-table-column prop="name" label="Họ và tên" min-width="180" />
          <el-table-column prop="purchasingPoint" label="Điểm thu mua" min-width="150" />
          <el-table-column prop="date" label="Ngày" min-width="120" />
          <el-table-column prop="subsidize" label="Trợ giá" min-width="120" align="right">
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.subsidize) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="Khối lượng" min-width="120" align="right">
            <template #default="scope">
              <span>{{ formatNumber(scope.row.weight) }} kg</span>
            </template>
          </el-table-column>
          <el-table-column prop="tare" label="Trừ bì" min-width="100" align="right">
            <template #default="scope">
              <span class="text-gray-500">{{ formatNumber(scope.row.tare) }} kg</span>
            </template>
          </el-table-column>
          <el-table-column prop="netWeight" label="KL thực tế" min-width="130" align="right">
            <template #default="scope">
              <span class="font-medium text-blue-500">{{ formatNumber(scope.row.netWeight) }} kg</span>
            </template>
          </el-table-column>
          <el-table-column prop="drc" label="Số độ" min-width="100" align="right">
            <template #default="scope">
              <span>{{ scope.row.drc }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="dryRubber" label="Mủ khô" min-width="120" align="right">
            <template #default="scope">
              <span class="font-medium">{{ formatNumber(scope.row.dryRubber, 2) }} kg</span>
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="Đơn giá" min-width="130" align="right">
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.unitPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="Thành tiền" min-width="150" align="right">
            <template #default="scope">
              <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="paid" label="Đã thanh toán" min-width="150" align="right">
            <template #default="scope">
              <span class="font-medium text-emerald-500">{{ formatCurrency(scope.row.paid) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="bookSaved" label="Lưu sổ" min-width="130" align="right">
            <template #default="scope">
              <span class="font-medium text-amber-500">{{ formatCurrency(scope.row.bookSaved) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- Phân trang -->
      <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Empty state before search -->
    <div v-if="!hasSearched" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-400 dark:text-gray-500">
        <el-icon class="text-6xl mb-4"><Search /></el-icon>
        <p class="text-lg">Vui lòng chọn các tiêu chí và nhấn <strong>Tìm kiếm</strong> để truy xuất thông tin</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const selectedCategory = ref('household')
const selectedPoint = ref('all')
const dateRange = ref<[string, string] | null>(null)
const hasSearched = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)

// --- Handlers ---
const handleSearch = () => {
  hasSearched.value = true
  currentPage.value = 1
  console.log('Searching with:', {
    category: selectedCategory.value,
    point: selectedPoint.value,
    dateRange: dateRange.value,
  })
}

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}

const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

// --- Formatters ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatNumber = (value: number, decimals: number = 0) => {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

// --- Mock Data: Hộ dân ---
const generateHouseholdData = () => {
  const data = []
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const middleNames = ['Văn', 'Thị', 'Hữu', 'Minh', 'Đức', 'Ngọc', 'Quang', 'Hải', 'Thanh', 'Tuấn']
  const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phong', 'Giang', 'Hải', 'Linh', 'Khánh']
  const points = ['Xưởng Gia An', 'Xưởng Phê', 'Xưởng Lạc Tánh', 'Đại lý Hải']
  const banks = ['Techcombank', 'Vietcombank', 'VietinBank', 'MB Bank', 'ACB', 'BIDV', 'Agribank']

  for (let i = 1; i <= 20; i++) {
    const debtAmount = Math.floor(Math.random() * 30) * 1000000
    const advanceAmount = Math.floor(Math.random() * 15) * 1000000
    const fullName = `${firstNames[i % 10]} ${middleNames[(i * 3) % 10]} ${lastNames[(i * 7) % 10]}`

    data.push({
      id: i,
      code: `HD${String(i).padStart(3, '0')}`,
      name: fullName,
      purchasingPoint: points[i % 4],
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      address: `Thôn ${i % 9 + 1}, Khu vực ${i % 5 + 1}, Tỉnh Bình Phước`,
      bankAccount: `1903${Math.floor(Math.random() * 900000000 + 100000000)}`,
      bankName: banks[i % 7],
      status: i % 8 === 0 ? 'Ngừng hoạt động' : 'Hoạt động',
      debtAmount,
      advanceAmount,
      totalDebt: debtAmount - advanceAmount
    })
  }
  return data
}

// --- Mock Data: Thu mua ---
const generatePurchasingData = () => {
  const data = []
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const middleNames = ['Văn', 'Thị', 'Hữu', 'Minh', 'Đức', 'Ngọc', 'Quang', 'Hải', 'Thanh', 'Tuấn']
  const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phong', 'Giang', 'Hải', 'Linh', 'Khánh']
  const points = ['Xưởng Gia An', 'Xưởng Phê', 'Xưởng Lạc Tánh', 'Đại lý Hải']

  for (let i = 1; i <= 20; i++) {
    const fullName = `${firstNames[i % 10]} ${middleNames[(i * 3) % 10]} ${lastNames[(i * 7) % 10]}`
    const weight = Math.floor(Math.random() * 500) + 100
    const tare = Math.floor(Math.random() * 20) + 5
    const netWeight = weight - tare
    const drc = Math.floor(Math.random() * 10) + 25
    const dryRubber = netWeight * drc / 100
    const unitPrice = 30000
    const supportPrice = 1000
    const subsidize = 500
    const totalAmount = dryRubber * (unitPrice + supportPrice + subsidize)
    const paid = Math.random() > 0.3 ? totalAmount : Math.floor(totalAmount * 0.6)
    const bookSaved = totalAmount - paid

    data.push({
      id: i,
      code: `HD${String(i).padStart(3, '0')}`,
      name: fullName,
      purchasingPoint: points[i % 4],
      date: `2026-05-${String(i % 28 + 1).padStart(2, '0')}`,
      subsidize,
      weight,
      tare,
      netWeight,
      drc,
      dryRubber,
      unitPrice,
      totalAmount,
      paid,
      bookSaved
    })
  }
  return data
}

const allHouseholdData = ref(generateHouseholdData())
const allPurchasingData = ref(generatePurchasingData())

// --- Stats ---
const householdStats = computed(() => {
  const data = allHouseholdData.value
  return {
    totalDebt: data.reduce((sum, r) => sum + r.debtAmount, 0),
    totalAdvance: data.reduce((sum, r) => sum + r.advanceAmount, 0),
    totalBalance: data.reduce((sum, r) => sum + r.totalDebt, 0),
  }
})

const purchasingStats = computed(() => {
  const data = allPurchasingData.value
  return {
    totalWeight: data.reduce((sum, r) => sum + r.weight, 0),
    totalNetWeight: data.reduce((sum, r) => sum + r.netWeight, 0),
    totalDryRubber: data.reduce((sum, r) => sum + r.dryRubber, 0),
    totalAmount: data.reduce((sum, r) => sum + r.totalAmount, 0),
    totalPaid: data.reduce((sum, r) => sum + r.paid, 0),
    totalBookSaved: data.reduce((sum, r) => sum + r.bookSaved, 0),
  }
})

// --- Pagination ---
const total = computed(() => {
  if (selectedCategory.value === 'household') return allHouseholdData.value.length
  return allPurchasingData.value.length
})

const householdTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allHouseholdData.value.slice(start, end)
})

const purchasingTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allPurchasingData.value.slice(start, end)
})
</script>

<style scoped>
.lookup-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* Summary stat cards */
.stat-card {
  padding: 16px 20px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}

.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Card accent borders */
.stat-card--red { border-left: 4px solid #ef4444; }
.stat-card--orange { border-left: 4px solid #f97316; }
.stat-card--blue { border-left: 4px solid #3b82f6; }
.stat-card--cyan { border-left: 4px solid #06b6d4; }
.stat-card--indigo { border-left: 4px solid #6366f1; }
.stat-card--green { border-left: 4px solid #22c55e; }
.stat-card--emerald { border-left: 4px solid #10b981; }
.stat-card--amber { border-left: 4px solid #f59e0b; }

/* Dark Mode: Table */
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

/* Dark Mode: Stat cards */
html.dark .stat-card {
  background-color: #1f2937;
  border-color: #374151;
}

html.dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

html.dark .stat-card__label {
  color: #9ca3af;
}

/* Dark Mode: Select & Input */
html.dark .custom-dark-select :deep(.el-input__wrapper),
html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #1f2937;
  box-shadow: 0 0 0 1px #374151 inset;
}

html.dark .custom-dark-select :deep(.el-input__inner),
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}
</style>

<style>
/* Select dropdown popper dark mode (unscoped) */
html.dark .custom-dark-select-popper.el-popper {
  background-color: #1f2937;
  border-color: #374151;
}

html.dark .custom-dark-select-popper .el-select-dropdown__item {
  color: #d1d5db;
}

html.dark .custom-dark-select-popper .el-select-dropdown__item.hover,
html.dark .custom-dark-select-popper .el-select-dropdown__item:hover {
  background-color: #374151;
  color: #ffffff;
}

html.dark .custom-dark-select-popper .el-select-dropdown__item.selected {
  color: #60a5fa;
  background-color: #111827;
  font-weight: bold;
}

/* Highlight selects dark mode */
html.dark .highlight-select .el-input__wrapper,
html.dark .highlight-select .el-select__wrapper {
  background-color: #111827 !important;
  border-color: #111827 !important;
}

/* Date picker range dark mode */
html.dark .highlight-select.el-date-editor.el-range-editor {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #111827 inset !important;
}

html.dark .highlight-select.el-date-editor .el-range-input {
  background-color: transparent !important;
  color: #f3f4f6 !important;
}

html.dark .highlight-select.el-date-editor .el-range-separator {
  color: #9ca3af !important;
}

html.dark .highlight-select.el-date-editor .el-range-input::placeholder {
  color: #6b7280 !important;
}
</style>
