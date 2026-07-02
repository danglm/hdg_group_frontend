<template>
  <div class="lookup-container h-full flex flex-col">
    <!-- Filter bar -->
    <div class="flex flex-wrap justify-between items-center gap-x-4 gap-y-4 mb-4 shrink-0">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-4">
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
            <el-option 
              v-for="point in collectionPoints" 
              :key="point.id" 
              :label="point.collection_name" 
              :value="point.collection_name" 
            />
          </el-select>
        </div>

        <div v-if="selectedCategory === 'purchasing'" class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Mã hộ:</span>
          <el-input
            v-model="householdId"
            placeholder="Nhập mã hộ..."
            clearable
            class="w-40 custom-dark-input"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
          <el-date-picker
            v-model="dateRange"
            :disabled="selectedCategory === 'household'"
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

        <!-- Export Invoices buttons -->
        <template v-if="hasSearched && selectedCategory === 'purchasing'">
          <el-button 
            type="success" 
            :disabled="selectedPurchases.length === 0"
            @click="exportBookSavedInvoice"
          >
            Xuất Hóa đơn Lưu sổ
          </el-button>
          <el-button 
            type="warning" 
            :disabled="selectedPurchases.length === 0"
            @click="exportPaidInvoice"
          >
            Xuất Hóa đơn đã Thanh toán
          </el-button>
        </template>
      </div>
    </div>

    <!-- Summary Statistics Cards -->
    <div v-if="hasSearched" class="summary-cards mb-4 shrink-0">
      <el-collapse v-model="activeCollapseNames" class="custom-collapse border-0">
        <el-collapse-item name="statistics" title="Thống kê tổng quan">
          <!-- Hộ dân stats -->
          <div v-if="selectedCategory === 'household'" class="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
            <div class="stat-card stat-card--red">
              <div class="stat-card__label">Tổng số tiền nợ</div>
              <div class="stat-card__value text-red-500 dark:text-red-400">{{ formatCurrency(householdStats.totalDebt) }} VNĐ</div>
            </div>
            <div class="stat-card stat-card--orange">
              <div class="stat-card__label">Tổng số tiền ứng</div>
              <div class="stat-card__value text-orange-500 dark:text-orange-400">{{ formatCurrency(householdStats.totalAdvance) }} VNĐ</div>
            </div>
            <div class="stat-card stat-card--blue">
              <div class="stat-card__label">Tổng Công nợ</div>
              <div class="stat-card__value text-blue-600 dark:text-blue-400">{{ formatCurrency(householdStats.totalBalance) }} VNĐ</div>
            </div>
          </div>

          <!-- Thu mua stats -->
          <div v-if="selectedCategory === 'purchasing'" class="space-y-4 px-1">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="stat-card stat-card--green">
                <div class="stat-card__label">Tổng thành tiền</div>
                <div class="stat-card__value text-green-600 dark:text-green-400">{{ formatCurrency(purchasingStats.totalAmount) }} VNĐ</div>
              </div>
              <div class="stat-card stat-card--emerald">
                <div class="stat-card__label">Tổng đã thanh toán</div>
                <div class="stat-card__value text-emerald-600 dark:text-emerald-400">{{ formatCurrency(purchasingStats.totalPaid) }} VNĐ</div>
              </div>
              <div class="stat-card stat-card--amber">
                <div class="stat-card__label">Tổng lưu sổ</div>
                <div class="stat-card__value text-amber-600 dark:text-amber-400">{{ formatCurrency(purchasingStats.totalBookSaved) }} VNĐ</div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- Table Results -->
    <div v-if="hasSearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <!-- Hộ dân table -->
      <template v-if="selectedCategory === 'household'">
        <el-table :data="householdTableData" style="width: 100%" class="flex-1" height="100%" v-loading="loading">
          <el-table-column type="selection" width="55" fixed />
          <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />
          <el-table-column prop="name" label="Họ và tên" width="180" />
          <el-table-column prop="purchasingPoint" label="Điểm thu mua" width="150" />
          <el-table-column prop="material" label="Nguyên liệu" width="130" align="center">
            <template #default="scope">
              <el-tag type="info" effect="light" round>
                {{ scope.row.material || 'Cao su' }}
              </el-tag>
            </template>
          </el-table-column>
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
          <el-table-column prop="is_subsidized" label="Trợ giá" width="120" align="right">
            <template #default="scope">
              <span class="font-medium text-green-600">{{ formatCurrency(scope.row.is_subsidized || 0) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="Username" width="150">
            <template #default="scope">
              <span class="text-blue-500">{{ scope.row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="telegramGroup" label="Tên nhóm Telegram" width="230" />
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
        <el-table 
          :data="purchasingTableData" 
          style="width: 100%" 
          class="flex-1" 
          height="100%" 
          v-loading="loading"
          @selection-change="handlePurchasingSelectionChange"
        >
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
        <p class="text-lg">Vui lòng chọn các tiêu chí và nhấn <strong>Tìm kiếm</strong> để truy xuất thông tin</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { tienNgaService } from '@/api/tienNgaService'
import { ElMessage, ElNotification } from 'element-plus'

const selectedCategory = ref('household')
const selectedPoint = ref('all')
const dateRange = ref<[string, string] | null>(null)
const householdId = ref('')
const hasSearched = ref(false)
const loading = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const activeCollapseNames = ref(['statistics'])

const selectedPurchases = ref<any[]>([])
const handlePurchasingSelectionChange = (val: any[]) => {
  selectedPurchases.value = val
}

const exportBookSavedInvoice = async () => {
  if (selectedPurchases.value.length === 0) return
  
  // Filter records that have saved amount > 0
  const validRecords = selectedPurchases.value.filter(r => (r.bookSaved || 0) > 0)
  if (validRecords.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một bản ghi có số tiền Lưu sổ > 0')
    return
  }

  loading.value = true
  try {
    // Group records by household code
    const groups = new Map<string, any[]>()
    for (const rec of validRecords) {
      const code = rec.code || 'unknown'
      if (!groups.has(code)) {
        groups.set(code, [])
      }
      groups.get(code)!.push(rec)
    }

    ElNotification({
      title: 'Đang xuất hóa đơn',
      message: `Đang kết nối server để tải ${groups.size} hóa đơn lưu sổ...`,
      type: 'info'
    })

    for (const [code, records] of groups.entries()) {
      // Fetch customer to get cash_advance (tien_da_ung)
      const customers = await tienNgaService.getCustomers('cao su', undefined, code)
      const customer = customers.find(c => c.hoursehold_id === code) || { fullname: records[0].name, cash_advance: 0 }

      // Sort records by date ascending
      records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Helper date formatters
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '—'
        const parts = dateStr.split('-')
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
      }
      const formatDayMonth = (dateStr: string) => {
        if (!dateStr) return '—'
        const parts = dateStr.split('-')
        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr
      }

      let timeframe = ''
      if (dateRange.value && dateRange.value.length === 2) {
        timeframe = `Từ ${formatDate(dateRange.value[0])} Đến ${formatDate(dateRange.value[1])}`
      } else {
        const dates = records.map(r => r.date).filter(Boolean)
        if (dates.length > 0) {
          dates.sort()
          timeframe = `Từ ${formatDate(dates[0])} Đến ${formatDate(dates[dates.length - 1])}`
        } else {
          timeframe = `Mùa vụ ${new Date().getFullYear()}`
        }
      }

      // Calculate totals
      const tong_kl = records.reduce((sum, r) => sum + (r.weight || 0), 0)
      const tong_kl_tt = records.reduce((sum, r) => sum + (r.netWeight || 0), 0)
      const tong_thanh_tien = records.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
      const tong_thanh_tien_kht = records.reduce((sum, r) => sum + ((r.dryRubber || 0) * (r.unitPrice || 0)), 0)
      const tong_luu_so = records.reduce((sum, r) => sum + (r.bookSaved || 0), 0)
      const tong_thanh_toan = records.reduce((sum, r) => sum + (r.paid || 0), 0)

      const payload = {
        ten_kh: customer.fullname || records[0].name || 'Chưa rõ',
        ma_ho: code,
        diem_thu_mua: records[0].purchasingPoint || 'Không rõ',
        timeframe: timeframe,
        records: records.map(r => ({
          ngay: formatDayMonth(r.date),
          tuan: '—',
          tro_gia: r.subsidize || 0,
          kl: r.weight || 0,
          bi: r.tare || 0,
          kl_tt: r.netWeight || 0,
          so_do: r.drc || 0,
          mu_kho: r.dryRubber || 0,
          don_gia: r.unitPrice || 0,
          gia_ht: r.subsidize || 0, // gia hỗ trợ / trợ giá
          thanh_tien: r.totalAmount || 0,
          thanh_tien_kht: (r.dryRubber || 0) * (r.unitPrice || 0),
          luu_so: r.bookSaved || 0,
          thanh_toan: r.paid || 0
        })),
        tong_kl,
        tong_kl_tt,
        tong_thanh_tien,
        tong_thanh_toan,
        tong_thanh_tien_kht,
        tong_luu_so,
        tien_da_ung: customer.cash_advance || 0
      }

      // Call API
      const blob = await tienNgaService.exportSavedBill(payload)
      
      // Download PNG
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hoa_don_luu_so_${code}_${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElNotification({
        title: 'Thành công',
        message: `Đã xuất Hóa đơn Lưu sổ cho Hộ dân ${customer.fullname || code} thành công!`,
        type: 'success'
      })
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Không thể xuất hóa đơn lưu sổ')
  } finally {
    loading.value = false
  }
}

const exportPaidInvoice = async () => {
  if (selectedPurchases.value.length === 0) return
  
  // Filter records that have paid amount > 0
  const validRecords = selectedPurchases.value.filter(r => (r.paid || 0) > 0)
  if (validRecords.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một bản ghi có số tiền Đã thanh toán > 0')
    return
  }

  loading.value = true
  try {
    // Group records by household code
    const groups = new Map<string, any[]>()
    for (const rec of validRecords) {
      const code = rec.code || 'unknown'
      if (!groups.has(code)) {
        groups.set(code, [])
      }
      groups.get(code)!.push(rec)
    }

    ElNotification({
      title: 'Đang xuất hóa đơn',
      message: `Đang kết nối server để tải ${groups.size} hóa đơn đã thanh toán...`,
      type: 'info'
    })

    for (const [code, records] of groups.entries()) {
      // Fetch customer to get cash_advance (tien_da_ung)
      const customers = await tienNgaService.getCustomers('cao su', undefined, code)
      const customer = customers.find(c => c.hoursehold_id === code) || { fullname: records[0].name, cash_advance: 0 }

      // Sort records by date ascending
      records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Helper date formatters
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '—'
        const parts = dateStr.split('-')
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
      }
      const formatDayMonth = (dateStr: string) => {
        if (!dateStr) return '—'
        const parts = dateStr.split('-')
        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr
      }

      let timeframe = ''
      if (dateRange.value && dateRange.value.length === 2) {
        timeframe = `Từ ${formatDate(dateRange.value[0])} Đến ${formatDate(dateRange.value[1])}`
      } else {
        const dates = records.map(r => r.date).filter(Boolean)
        if (dates.length > 0) {
          dates.sort()
          timeframe = `Từ ${formatDate(dates[0])} Đến ${formatDate(dates[dates.length - 1])}`
        } else {
          timeframe = `Mùa vụ ${new Date().getFullYear()}`
        }
      }

      // Calculate totals
      const tong_kl = records.reduce((sum, r) => sum + (r.weight || 0), 0)
      const tong_kl_tt = records.reduce((sum, r) => sum + (r.netWeight || 0), 0)
      const tong_thanh_tien = records.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
      const tong_thanh_toan = records.reduce((sum, r) => sum + (r.paid || 0), 0)

      const payload = {
        ten_kh: customer.fullname || records[0].name || 'Chưa rõ',
        ma_ho: code,
        diem_thu_mua: records[0].purchasingPoint || 'Không rõ',
        timeframe: timeframe,
        records: records.map(r => ({
          ngay: formatDayMonth(r.date),
          tuan: '—',
          tro_gia: r.subsidize || 0,
          kl: r.weight || 0,
          bi: r.tare || 0,
          kl_tt: r.netWeight || 0,
          so_do: r.drc || 0,
          mu_kho: r.dryRubber || 0,
          don_gia: r.unitPrice || 0,
          gia_ht: r.subsidize || 0, // gia hỗ trợ / trợ giá
          thanh_tien: r.totalAmount || 0,
          thanh_toan: r.paid || 0
        })),
        tong_kl,
        tong_kl_tt,
        tong_thanh_tien,
        tong_thanh_toan,
        tien_da_ung: customer.cash_advance || 0
      }

      // Call API
      const blob = await tienNgaService.exportPaidBill(payload)
      
      // Download PNG
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hoa_don_da_thanh_toan_${code}_${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElNotification({
        title: 'Thành công',
        message: `Đã xuất Hóa đơn đã Thanh toán cho Hộ dân ${customer.fullname || code} thành công!`,
        type: 'success'
      })
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Không thể xuất hóa đơn đã thanh toán')
  } finally {
    loading.value = false
  }
}

const collectionPoints = ref<any[]>([])
const allHouseholdData = ref<any[]>([])
const allPurchasingData = ref<any[]>([])

const fetchCollectionPoints = async () => {
  try {
    const data = await tienNgaService.getCollectionPoints('Cao su')
    collectionPoints.value = data
  } catch (error: any) {
    console.error('Failed to fetch collection points:', error)
  }
}

onMounted(() => {
  fetchCollectionPoints()
})

watch(selectedCategory, (newCategory) => {
  if (newCategory === 'household') {
    dateRange.value = null
    householdId.value = ''
  }
  selectedPurchases.value = []
})

// --- Handlers ---
const handleSearch = async () => {
  loading.value = true
  hasSearched.value = true
  currentPage.value = 1
  selectedPurchases.value = []

  try {
    if (selectedCategory.value === 'household') {
      // Fetch customers without date filters
      let collectionPointId: string | undefined = undefined
      if (selectedPoint.value !== 'all') {
        const matchedPoint = collectionPoints.value.find(p => p.collection_name === selectedPoint.value)
        if (matchedPoint) {
          collectionPointId = matchedPoint.id
        }
      }
      
      const rawCustomers = await tienNgaService.getCustomers('cao su', collectionPointId)
      
      allHouseholdData.value = rawCustomers.map(item => ({
        id: item.id,
        code: item.hoursehold_id || item.id,
        name: item.fullname || 'Chưa rõ',
        purchasingPoint: item.collection_name || 'Không rõ',
        phone: item.number_phone || 'Chưa có',
        address: item.address || 'Chưa có',
        bankAccount: item.number_bank || 'Chưa có',
        bankName: item.bank_name || 'Chưa có',
        status: item.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động',
        debtAmount: item.amount_of_debt || 0,
        advanceAmount: item.cash_advance || 0,
        totalDebt: item.total_debt || 0,
        material: item.ingredient || 'Cao su',
        is_subsidized: item.is_subsidized || 0,
        username: item.username ? (item.username.startsWith('@') ? item.username : `@${item.username}`) : 'Chưa có',
        telegramGroup: item.telegram_group || 'Chưa có'
      }))
    } else {
      // Fetch daily purchases with date range and collection point filters
      const params: any = {}
      if (dateRange.value && dateRange.value.length === 2) {
        params.start_date = dateRange.value[0]
        params.end_date = dateRange.value[1]
      }
      if (selectedPoint.value !== 'all') {
        const matchedPoint = collectionPoints.value.find(p => p.collection_name === selectedPoint.value)
        if (matchedPoint) {
          params.collection_point_id = matchedPoint.id
        }
      }
      if (householdId.value) {
        params.hoursehold_id = householdId.value.trim()
      }
      
      const rawPurchases = await tienNgaService.getDailyPurchases(params)
      allPurchasingData.value = rawPurchases.map(item => ({
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
        totalAmount: item.total_amount || 0,
        paid: item.paid_amount || 0,
        bookSaved: item.saved_amount || 0
      }))
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Lỗi khi truy xuất thông tin')
  } finally {
    loading.value = false
  }
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

const formatNumber = (value: number, decimals?: number) => {
  const minDec = decimals !== undefined ? decimals : 0
  const maxDec = decimals !== undefined ? decimals : 2
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec
  }).format(value)
}

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

/* Cho phân trang tự xuống dòng khi có nhiều trang */
.lookup-container :deep(.el-pagination) {
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

/* Custom Collapse styling */
.custom-collapse {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
.custom-collapse :deep(.el-collapse-item__header) {
  padding: 0 16px;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
.custom-collapse :deep(.el-collapse-item__wrap) {
  padding: 16px 8px 8px;
  border-bottom: none;
  background-color: transparent;
}
.custom-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 8px;
}

/* Dark mode Collapse */
html.dark .custom-collapse {
  border-color: #374151;
}
html.dark .custom-collapse :deep(.el-collapse-item__header) {
  background-color: #1f2937;
  color: #f3f4f6;
  border-bottom-color: #374151;
}
html.dark .custom-collapse :deep(.el-collapse-item__wrap) {
  border-bottom-color: #374151;
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
