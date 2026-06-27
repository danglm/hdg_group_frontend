<template>
  <div class="payment-container h-full flex flex-col">
    <!-- Filter bar -->
    <div class="flex flex-wrap justify-between items-center gap-x-4 gap-y-4 mb-4 shrink-0">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-4">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Điểm thu mua:</span>
          <el-select 
            v-model="selectedFactory" 
            placeholder="Chọn xưởng/đại lý" 
            style="width: 200px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="all" />
            <el-option 
              v-for="point in collectionPoints" 
              :key="point.id" 
              :label="point.collection_name" 
              :value="point.collection_name" 
            />
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

        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Mã hộ dân:</span>
          <el-input
            v-model="householdId"
            placeholder="Nhập mã hộ..."
            clearable
            class="w-48 custom-dark-input"
          />
        </div>

        <el-button type="primary" :icon="Search" @click="fetchDailyPurchases">Tìm kiếm</el-button>
        <el-button 
          type="success" 
          :disabled="selectedRows.length === 0" 
          @click="handlePayment"
        >
          Thanh toán
        </el-button>
      </div>
    </div>

    <!-- Summary Statistics Cards -->
    <div v-if="hasSearched" class="summary-cards mb-4 shrink-0">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat-card stat-card--green">
          <div class="stat-card__label">Tổng thành tiền</div>
          <div class="stat-card__value text-green-600 dark:text-green-400">{{ formatCurrency(paymentStats.totalAmount) }} VNĐ</div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-card__label">Tổng đã thanh toán</div>
          <div class="stat-card__value text-orange-500 dark:text-orange-400">{{ formatCurrency(paymentStats.totalPaid) }} VNĐ</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__label">Tổng lưu sổ</div>
          <div class="stat-card__value text-blue-600 dark:text-blue-400">{{ formatCurrency(paymentStats.totalBookSaved) }} VNĐ</div>
        </div>
      </div>
    </div>

    <!-- Table Results -->
    <div v-if="hasSearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        class="flex-1" 
        height="100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <!-- Fixed Columns -->
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />

        <!-- Scrollable Columns -->
        <el-table-column prop="name" label="Họ và tên" min-width="180" />
        <el-table-column prop="purchasingPoint" label="Điểm thu mua" min-width="150" />
        <el-table-column prop="date" label="Ngày" min-width="120" />
        <el-table-column prop="productCode" label="Mã hàng" min-width="140" align="center" />
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
        <el-table-column prop="supportPrice" label="Giá hỗ trợ" min-width="120" align="right">
          <template #default="scope">
            <span>{{ formatCurrency(scope.row.supportPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="Thành tiền" min-width="150" align="right">
          <template #default="scope">
            <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="Đã thanh toán" min-width="150" align="right">
          <template #default="scope">
            <span class="font-medium text-orange-500">{{ formatCurrency(scope.row.paidAmount || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="savedAmount" label="Lưu sổ" min-width="150" align="right">
          <template #default="scope">
            <span class="font-medium text-gray-600 dark:text-gray-400">{{ formatCurrency(scope.row.savedAmount || 0) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- Phân trang -->
      <div class="mt-auto shrink-0 p-4 flex flex-wrap justify-end gap-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
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
        <p class="text-lg">Vui lòng chọn các tiêu chí và nhấn <strong>Tìm kiếm</strong> để xem thông tin thanh toán chi phí</p>
      </div>
    </div>

    <!-- Modal Thanh toán -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="XÁC NHẬN THANH TOÁN"
      class="custom-dark-dialog"
      width="500px"
    >
      <el-form :model="paymentForm" label-width="140px" class="mt-4 px-2">
        <template v-if="isSingleHouseholdSelected">
          <el-form-item label="Mã hộ dân">
            <el-input v-model="paymentForm.code" disabled />
          </el-form-item>
          <el-form-item label="Tên hộ dân">
            <el-input v-model="paymentForm.name" disabled />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="Số hộ dân đã chọn">
            <el-input :model-value="uniqueHouseholdCount + ' hộ dân'" disabled />
          </el-form-item>
        </template>
        
        <el-form-item label="Tổng công nợ">
          <el-input :model-value="formatCurrency(paymentForm.totalDebt) + ' VNĐ'" disabled />
        </el-form-item>
        <el-form-item label="Tổng tiền lưu sổ">
          <el-input :model-value="formatCurrency(paymentForm.savedAmount) + ' VNĐ'" disabled />
        </el-form-item>
        <el-form-item label="Hình thức">
          <el-radio-group v-model="paymentForm.type">
            <el-radio-button label="chi">Chi tiền</el-radio-button>
            <el-radio-button label="thu">Thu tiền</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Số tiền" required>
          <el-input 
            v-model="paymentForm.payAmountText" 
            placeholder="Nhập số tiền..." 
            @input="handlePayAmountInput"
          >
            <template #suffix>
              <span class="text-xs text-gray-400">VNĐ</span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">Hủy</el-button>
          <el-button type="primary" :loading="loading" @click="submitPayment">
            Xác nhận
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tienNgaService } from '@/api/tienNgaService'

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const getInitialDateRange = (): [string, string] => {
  const today = new Date()
  const lastWeek = new Date()
  lastWeek.setDate(today.getDate() - 6)
  return [formatDate(lastWeek), formatDate(today)]
}

const currentPage = ref(1)
const pageSize = ref(10)
const selectedFactory = ref('all')
const dateRange = ref<[string, string] | null>(null)
const householdId = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const collectionPoints = ref<any[]>([])
const allData = ref<any[]>([])
const selectedRows = ref<any[]>([])

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const paymentDialogVisible = ref(false)
const paymentForm = ref({
  id: '',
  code: '',
  name: '',
  savedAmount: 0,
  paidAmount: 0,
  totalAmount: 0,
  payAmount: '',
  payAmountText: '',
  totalDebt: 0,
  type: 'chi'
})

const parseNumberString = (val: string) => {
  if (!val) return 0
  const cleaned = val.replace(/\./g, '').replace(/,/g, '')
  return parseFloat(cleaned) || 0
}

const handlePayAmountInput = (val: string) => {
  const numericVal = val.replace(/[^0-9]/g, '')
  const num = parseInt(numericVal, 10)
  if (!isNaN(num)) {
    paymentForm.value.payAmount = String(num)
    paymentForm.value.payAmountText = new Intl.NumberFormat('vi-VN').format(num)
  } else {
    paymentForm.value.payAmount = ''
    paymentForm.value.payAmountText = ''
  }
}

const uniqueHouseholdCount = computed(() => {
  const codes = new Set(selectedRows.value.map(r => r.code).filter(Boolean))
  return codes.size
})

const isSingleHouseholdSelected = computed(() => {
  return uniqueHouseholdCount.value === 1
})

const handlePayment = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một hộ dân để thanh toán.')
    return
  }

  const uniqueHouseholdIds = Array.from(new Set(selectedRows.value.map(r => r.code).filter(Boolean)))
  if (uniqueHouseholdIds.length === 0) {
    ElMessage.warning('Không tìm thấy mã hộ dân từ các dòng đã chọn.')
    return
  }
  if (uniqueHouseholdIds.length > 1) {
    ElMessage.warning('Chỉ có thể thanh toán cho một hộ dân tại một thời điểm. Vui lòng chọn các dòng của cùng một hộ dân.')
    return
  }

  loading.value = true
  try {
    let totalDebt = 0

    const customerPromises = uniqueHouseholdIds.map(hId => 
      tienNgaService.getCustomers('cao su', undefined, hId)
    )
    const results = await Promise.all(customerPromises)
    
    results.forEach(customers => {
      if (customers && customers.length > 0) {
        totalDebt += customers[0].total_debt || 0
      }
    })

    const totalSavedAmount = selectedRows.value.reduce((sum, r) => sum + (r.savedAmount || 0), 0)

    const firstRow = selectedRows.value[0]
    paymentForm.value = {
      id: firstRow.id,
      code: firstRow.code,
      name: firstRow.name,
      savedAmount: totalSavedAmount,
      paidAmount: selectedRows.value.reduce((sum, r) => sum + (r.paidAmount || 0), 0),
      totalAmount: selectedRows.value.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      payAmount: String(totalSavedAmount),
      payAmountText: formatCurrency(totalSavedAmount),
      totalDebt: totalDebt,
      type: 'chi'
    }

    paymentDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || 'Lỗi khi lấy thông tin công nợ hộ dân')
  } finally {
    loading.value = false
  }
}

const submitPayment = async () => {
  const payAmt = parseNumberString(paymentForm.value.payAmountText)
  if (payAmt <= 0) {
    ElMessage.warning('Vui lòng nhập số tiền thanh toán hợp lệ.')
    return
  }

  loading.value = true
  try {
    const response = await tienNgaService.processDebt({
      hoursehold_id: paymentForm.value.code || null,
      employee_id: null,
      partner_id: null,
      amount: payAmt,
      type_transaction: paymentForm.value.type,
      start_date: dateRange.value ? dateRange.value[0] : null,
      end_date: dateRange.value ? dateRange.value[1] : null
    })

    if (response && response.success) {
      ElMessage.success(response.message || 'Thanh toán thành công!')
    } else {
      ElMessage.success('Thanh toán thành công!')
    }
    
    paymentDialogVisible.value = false
    selectedRows.value = [] // Clear selected rows
    fetchDailyPurchases() // Refresh table data
  } catch (error: any) {
    ElMessage.error(error.message || 'Lỗi khi thực hiện thanh toán')
  } finally {
    loading.value = false
  }
}

const fetchCollectionPoints = async () => {
  try {
    const data = await tienNgaService.getCollectionPoints('Cao su')
    collectionPoints.value = data
  } catch (error: any) {
    console.error('Failed to fetch collection points:', error)
  }
}

const fetchDailyPurchases = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    const params: any = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    if (selectedFactory.value !== 'all') {
      const matchedPoint = collectionPoints.value.find(p => p.collection_name === selectedFactory.value)
      if (matchedPoint) {
        params.collection_point_id = matchedPoint.id
      }
    }
    if (householdId.value.trim()) {
      params.hoursehold_id = householdId.value.trim()
    }

    const data = await tienNgaService.getDailyPurchases(params)
    allData.value = data.map(item => ({
      id: item.id || Math.random().toString(36).substring(2, 9),
      code: item.hoursehold_id || '',
      name: item.fullname || 'Chưa rõ',
      purchasingPoint: item.collection_name || 'Không rõ',
      date: item.day || '',
      subsidize: item.is_subsidized || 0,
      weight: item.weight || 0,
      tare: item.tare_weight || 0,
      netWeight: item.actual_weight || 0,
      drc: item.degree || 0,
      dryRubber: item.dry_rubber || 0,
      unitPrice: item.unit_price || 0,
      supportPrice: item.subsidy_price || 0,
      totalAmount: item.total_amount || 0,
      paidAmount: item.paid_amount || 0,
      savedAmount: item.saved_amount || 0,
      productCode: item.product_code || ''
    }))
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể tải danh sách thu mua')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCollectionPoints()
})

const handleSizeChange = (val: number) => {
  currentPage.value = 1
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatNumber = (value: number, decimals?: number) => {
  const minDec = decimals !== undefined ? decimals : 0
  const maxDec = decimals !== undefined ? decimals : 2
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec
  }).format(value)
}

const total = computed(() => allData.value.length)

const paymentStats = computed(() => {
  const data = allData.value
  return {
    totalAmount: data.reduce((sum, r) => sum + r.totalAmount, 0),
    totalPaid: data.reduce((sum, r) => sum + r.paidAmount, 0),
    totalBookSaved: data.reduce((sum, r) => sum + r.savedAmount, 0),
  }
})

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allData.value.slice(start, end)
})
</script>

<style scoped>
.payment-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* Cho phân trang tự xuống dòng khi có nhiều trang */
.payment-container :deep(.el-pagination) {
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
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
.stat-card--orange { border-left: 4px solid #f97316; }
.stat-card--blue { border-left: 4px solid #3b82f6; }
.stat-card--green { border-left: 4px solid #22c55e; }

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

/* Tùy chỉnh toàn diện bảng cho Dark Mode */
html.dark .payment-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827; /* bg-gray-900 */
  --el-table-row-hover-bg-color: #374151; /* bg-gray-700 */
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .payment-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .payment-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

/* Fix nền cột cố định (fixed columns) trong Dark mode */
html.dark .payment-container :deep(.el-table .el-table-fixed-column--left),
html.dark .payment-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important; /* bg-gray-800 */
}

/* Tùy chỉnh select và input trong Dark Mode */
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
