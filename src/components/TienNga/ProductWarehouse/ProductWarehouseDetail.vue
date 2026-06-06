<template>
  <div class="h-full p-6 overflow-y-auto flex flex-col product-detail-wrapper">
    <!-- Header Navigation -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3">
        <el-button @click="emit('back')" circle class="shadow-sm hover:scale-105 transition-transform duration-200">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div>
          <div class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Chi Tiết Kho Thành Phẩm</div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2 mt-0.5">
            {{ warehouse.name }}
          </h2>
        </div>
      </div>
      <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-medium">
        {{ warehouse.address }}
      </span>
    </div>

    <!-- Quick Stats -->
    <div v-show="activeTab !== 'lookup'" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 shrink-0">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-violet-600 dark:text-violet-400">Tồn kho hiện tại</div>
        <div class="text-xl font-bold mt-1 text-violet-600 dark:text-violet-400">{{ formatNumber(warehouse.currentQty) }} kg</div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sức chứa</div>
        <div class="text-xl font-bold mt-1 text-gray-800 dark:text-gray-100">{{ warehouse.capacity }}</div>
      </div>
    </div>

    <!-- Main Tabs -->
    <div class="flex-1 min-height-0 flex flex-col">
      <el-tabs v-model="activeTab" type="border-card" class="detail-tabs h-full flex flex-col flex-1">

        <!-- 1. TAB GIAO DỊCH -->
        <el-tab-pane name="transaction" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><List /></el-icon>
              <span>Giao dịch</span>
            </span>
          </template>

          <div class="flex-1 flex flex-col min-height-0">
            <!-- Filter Bar -->
            <div class="flex flex-wrap justify-between items-center mb-4 gap-4 shrink-0">
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại GD:</span>
                  <el-select
                    v-model="txFilters.transactionType"
                    placeholder="Tất cả"
                    style="width: 130px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option label="Nhập" value="import" />
                    <el-option label="Xuất" value="export" />
                  </el-select>
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Nguyên liệu:</span>
                  <el-select
                    v-model="txFilters.material"
                    placeholder="Tất cả"
                    style="width: 170px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option label="Thành phẩm mủ" value="Thành phẩm mủ" />
                    <el-option label="Phế phẩm Mủ" value="Phế phẩm Mủ" />
                  </el-select>
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="txFilters.dateRange"
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
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
                  <el-input
                    v-model="txFilters.search"
                    placeholder="Tên khách hàng, mã hàng..."
                    :prefix-icon="Search"
                    clearable
                    class="w-60 custom-dark-input"
                  />
                </div>
              </div>
              <el-button type="primary" @click="openTxDialog">Thêm giao dịch</el-button>
            </div>

            <!-- Table & Pagination -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <el-table :data="paginatedTx" style="width: 100%" class="flex-1 custom-table" height="100%">
                <el-table-column label="Ngày giao dịch" width="130" fixed>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Mã KH" prop="customerCode" width="100" fixed />
                <el-table-column label="Tên Khách hàng" prop="customerName" min-width="180" show-overflow-tooltip />
                <el-table-column label="Loại giao dịch" width="140" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.transactionType === 'import' ? 'success' : 'danger'" effect="light" size="small" round>
                      {{ scope.row.transactionType === 'import' ? 'Nhập' : 'Xuất' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Nguyên liệu" width="150">
                  <template #default="scope">
                    <el-tag :type="scope.row.material === 'Thành phẩm mủ' ? 'info' : 'warning'" effect="light" size="small" round>
                      {{ scope.row.material }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Tên Kho" prop="warehouseName" width="200" show-overflow-tooltip />
                <el-table-column label="Số lượng" width="130" align="right">
                  <template #default="scope">
                    <span class="font-medium">{{ formatNumber(scope.row.quantity) }} kg</span>
                  </template>
                </el-table-column>
                <el-table-column label="Đơn giá" width="130" align="right">
                  <template #default="scope">{{ formatCurrency(scope.row.unitPrice) }}</template>
                </el-table-column>
                <el-table-column label="Thành tiền" width="160" align="right">
                  <template #default="scope">
                    <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Công nợ" width="150" align="right">
                  <template #default="scope">
                    <span class="font-bold" :class="scope.row.debt > 0 ? 'text-rose-500' : 'text-gray-400'">{{ formatCurrency(scope.row.debt) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Mã hàng" prop="productCode" width="130" />
                <!-- Thao tác -->
                <el-table-column fixed="right" label="Thao tác" width="90" align="center">
                  <template #default>
                    <el-dropdown trigger="click">
                      <el-button link type="info" class="p-1">
                        <el-icon class="text-xl"><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item>Chi tiết</el-dropdown-item>
                          <el-dropdown-item class="!text-red-500">Xóa</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>

              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="txPage"
                  v-model:page-size="txPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredTx.length"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 2. TAB TRUY XUẤT THÔNG TIN -->
        <el-tab-pane name="lookup" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><Search /></el-icon>
              <span>Truy xuất thông tin</span>
            </span>
          </template>

          <div class="lookup-container flex-1 flex flex-col min-height-0">
            <!-- Filter bar -->
            <div class="flex justify-between items-center mb-4 shrink-0">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại GD:</span>
                  <el-select
                    v-model="lookupFilters.transactionType"
                    placeholder="Tất cả"
                    style="width: 130px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option label="Nhập" value="import" />
                    <el-option label="Xuất" value="export" />
                  </el-select>
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Nguyên liệu:</span>
                  <el-select
                    v-model="lookupFilters.material"
                    placeholder="Tất cả"
                    style="width: 170px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option label="Thành phẩm mủ" value="Thành phẩm mủ" />
                    <el-option label="Phế phẩm Mủ" value="Phế phẩm Mủ" />
                  </el-select>
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="lookupFilters.dateRange"
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
              </div>
              <el-button type="primary" :icon="Search" @click="handleLookupSearch">Tìm kiếm</el-button>
            </div>

            <!-- Stat Cards (after search) -->
            <div v-if="lookupSearched" class="summary-cards mb-4 shrink-0">
              <div class="grid grid-cols-3 gap-4">
                <div class="stat-card stat-card--cyan">
                  <div class="stat-card__label">Tổng Số lượng</div>
                  <div class="stat-card__value text-cyan-600 dark:text-cyan-400">{{ formatNumber(lookupStats.totalQty) }} kg</div>
                </div>
                <div class="stat-card stat-card--green">
                  <div class="stat-card__label">Tổng Thành tiền</div>
                  <div class="stat-card__value text-green-600 dark:text-green-400">{{ formatCurrency(lookupStats.totalAmount) }} VNĐ</div>
                </div>
                <div class="stat-card stat-card--blue">
                  <div class="stat-card__label">Tổng Công nợ</div>
                  <div class="stat-card__value text-blue-600 dark:text-blue-400">{{ formatCurrency(lookupStats.totalDebt) }} VNĐ</div>
                </div>
              </div>
            </div>

            <!-- Table (after search) -->
            <div v-if="lookupSearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <el-table :data="paginatedLookup" style="width: 100%" class="flex-1 custom-table" height="100%">
                <el-table-column label="Ngày giao dịch" width="130" fixed>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Mã KH" prop="customerCode" width="100" />
                <el-table-column label="Tên Khách hàng" prop="customerName" min-width="180" show-overflow-tooltip />
                <el-table-column label="Loại giao dịch" width="140" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.transactionType === 'import' ? 'success' : 'danger'" effect="light" size="small" round>
                      {{ scope.row.transactionType === 'import' ? 'Nhập' : 'Xuất' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Nguyên liệu" width="150">
                  <template #default="scope">
                    <el-tag :type="scope.row.material === 'Thành phẩm mủ' ? 'info' : 'warning'" effect="light" size="small" round>
                      {{ scope.row.material }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Tên Kho" prop="warehouseName" width="200" show-overflow-tooltip />
                <el-table-column label="Số lượng" width="130" align="right">
                  <template #default="scope">
                    <span class="font-medium">{{ formatNumber(scope.row.quantity) }} kg</span>
                  </template>
                </el-table-column>
                <el-table-column label="Đơn giá" width="130" align="right">
                  <template #default="scope">{{ formatCurrency(scope.row.unitPrice) }}</template>
                </el-table-column>
                <el-table-column label="Thành tiền" width="160" align="right">
                  <template #default="scope">
                    <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Công nợ" width="150" align="right">
                  <template #default="scope">
                    <span class="font-bold" :class="scope.row.debt > 0 ? 'text-rose-500' : 'text-gray-400'">{{ formatCurrency(scope.row.debt) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Mã hàng" prop="productCode" width="130" />
              </el-table>

              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="lookupPage"
                  v-model:page-size="lookupPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredLookup.length"
                />
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="!lookupSearched" class="flex-1 flex items-center justify-center">
              <div class="text-center text-gray-400 dark:text-gray-500">
                <el-icon class="text-6xl mb-4"><Search /></el-icon>
                <p class="text-lg">Vui lòng chọn các tiêu chí và nhấn <strong>Tìm kiếm</strong> để truy xuất thông tin</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ADD TRANSACTION DIALOG -->
    <el-dialog v-model="txDialogVisible" title="THÊM GIAO DỊCH THÀNH PHẨM" width="700px" destroy-on-close class="custom-dark-dialog">
      <el-form :model="txForm" :rules="txRules" ref="txFormRef" label-position="top" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã khách hàng" prop="customerCode">
              <el-input v-model="txForm.customerCode" placeholder="Nhập mã khách hàng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên khách hàng" prop="customerName">
              <el-input v-model="txForm.customerName" placeholder="Nhập tên khách hàng..." />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngày giao dịch" prop="date">
              <el-date-picker v-model="txForm.date" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Loại giao dịch" prop="transactionType">
              <el-radio-group v-model="txForm.transactionType">
                <el-radio value="import">Nhập</el-radio>
                <el-radio value="export">Xuất</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Nguyên liệu" prop="material">
              <el-select v-model="txForm.material" placeholder="Chọn loại" style="width: 100%">
                <el-option label="Thành phẩm mủ" value="Thành phẩm mủ" />
                <el-option label="Phế phẩm Mủ" value="Phế phẩm Mủ" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên Kho">
              <el-input :model-value="warehouse.name" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Số lượng (kg)" prop="quantity">
              <el-input-number v-model="txForm.quantity" :min="1" :step="100" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Đơn giá (VNĐ)" prop="unitPrice">
              <el-input-number v-model="txForm.unitPrice" :min="100" :step="1000" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Thành tiền (VNĐ)">
              <el-input :model-value="formatCurrency(computedTotal)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Công nợ (VNĐ)" prop="debt">
              <el-input-number v-model="txForm.debt" :min="0" :step="100000" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mã hàng" prop="productCode">
              <el-input v-model="txForm.productCode" placeholder="VD: TP-LT-001" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2 pr-2">
          <el-button @click="txDialogVisible = false">Hủy bỏ</el-button>
          <el-button type="primary" @click="submitTx">Lưu giao dịch</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  Search,
  List,
  MoreFilled
} from '@element-plus/icons-vue'

interface ProductWarehouse {
  id: string
  name: string
  address: string
  capacity: string
  currentQty: number
  icon: string
  color: string
}

interface ProductTransaction {
  id: string
  warehouseId: string
  date: string
  customerCode: string
  customerName: string
  transactionType: 'import' | 'export'
  material: 'Thành phẩm mủ' | 'Phế phẩm Mủ'
  warehouseName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  debt: number
  productCode: string
}

const props = defineProps<{
  warehouse: ProductWarehouse
  transactions: ProductTransaction[]
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'add-transaction', tx: Omit<ProductTransaction, 'id' | 'warehouseId'>): void
}>()

const activeTab = ref('transaction')

// ========== 1. GIAO DỊCH ==========
const txFilters = reactive({
  transactionType: 'all',
  material: 'all',
  dateRange: null as null | [string, string],
  search: ''
})
const txPage = ref(1)
const txPageSize = ref(10)

watch(() => txFilters, () => { txPage.value = 1 }, { deep: true })

const filteredTx = computed(() => {
  return props.transactions.filter(t => {
    if (txFilters.transactionType !== 'all' && t.transactionType !== txFilters.transactionType) return false
    if (txFilters.material !== 'all' && t.material !== txFilters.material) return false
    if (txFilters.dateRange) {
      const [s, e] = txFilters.dateRange
      if (t.date < s || t.date > e) return false
    }
    if (txFilters.search) {
      const q = txFilters.search.toLowerCase()
      if (!t.customerName.toLowerCase().includes(q) && !t.productCode.toLowerCase().includes(q) && !t.customerCode.toLowerCase().includes(q)) return false
    }
    return true
  })
})

const paginatedTx = computed(() => {
  const s = (txPage.value - 1) * txPageSize.value
  return filteredTx.value.slice(s, s + txPageSize.value)
})

// TX Dialog
const txDialogVisible = ref(false)
const txFormRef = ref<FormInstance>()
const txForm = reactive({
  customerCode: '',
  customerName: '',
  date: new Date().toISOString().substring(0, 10),
  transactionType: 'export' as 'import' | 'export',
  material: 'Thành phẩm mủ' as 'Thành phẩm mủ' | 'Phế phẩm Mủ',
  quantity: 1000,
  unitPrice: 35000,
  debt: 0,
  productCode: ''
})
const txRules = reactive<FormRules>({
  customerCode: [{ required: true, message: 'Vui lòng nhập mã khách hàng', trigger: 'blur' }],
  customerName: [{ required: true, message: 'Vui lòng nhập tên khách hàng', trigger: 'blur' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày', trigger: 'change' }],
  transactionType: [{ required: true, message: 'Vui lòng chọn loại giao dịch', trigger: 'change' }],
  material: [{ required: true, message: 'Vui lòng chọn nguyên liệu', trigger: 'change' }],
  quantity: [{ required: true, message: 'Vui lòng nhập số lượng', trigger: 'blur' }],
  unitPrice: [{ required: true, message: 'Vui lòng nhập đơn giá', trigger: 'blur' }],
  productCode: [{ required: true, message: 'Vui lòng nhập mã hàng', trigger: 'blur' }],
})

const computedTotal = computed(() => txForm.quantity * txForm.unitPrice)

const openTxDialog = () => {
  txForm.customerCode = ''
  txForm.customerName = ''
  txForm.date = new Date().toISOString().substring(0, 10)
  txForm.transactionType = 'export'
  txForm.material = 'Thành phẩm mủ'
  txForm.quantity = 1000
  txForm.unitPrice = 35000
  txForm.debt = 0
  txForm.productCode = ''
  txDialogVisible.value = true
}

const submitTx = async () => {
  if (!txFormRef.value) return
  await txFormRef.value.validate((valid) => {
    if (valid) {
      emit('add-transaction', {
        date: txForm.date,
        customerCode: txForm.customerCode,
        customerName: txForm.customerName,
        transactionType: txForm.transactionType,
        material: txForm.material,
        warehouseName: props.warehouse.name,
        quantity: txForm.quantity,
        unitPrice: txForm.unitPrice,
        totalAmount: computedTotal.value,
        debt: txForm.debt,
        productCode: txForm.productCode
      })
      txDialogVisible.value = false
      ElMessage.success('Đã thêm giao dịch thành công!')
    }
  })
}

// ========== 2. TRUY XUẤT THÔNG TIN ==========
const lookupFilters = reactive({
  transactionType: 'all',
  material: 'all',
  dateRange: null as null | [string, string]
})
const lookupSearched = ref(false)
const lookupPage = ref(1)
const lookupPageSize = ref(10)

const handleLookupSearch = () => {
  lookupSearched.value = true
  lookupPage.value = 1
}

const filteredLookup = computed(() => {
  return props.transactions.filter(t => {
    if (lookupFilters.transactionType !== 'all' && t.transactionType !== lookupFilters.transactionType) return false
    if (lookupFilters.material !== 'all' && t.material !== lookupFilters.material) return false
    if (lookupFilters.dateRange) {
      const [s, e] = lookupFilters.dateRange
      if (t.date < s || t.date > e) return false
    }
    return true
  })
})

const paginatedLookup = computed(() => {
  const s = (lookupPage.value - 1) * lookupPageSize.value
  return filteredLookup.value.slice(s, s + lookupPageSize.value)
})

const lookupStats = computed(() => ({
  totalQty: filteredLookup.value.reduce((sum, t) => sum + t.quantity, 0),
  totalAmount: filteredLookup.value.reduce((sum, t) => sum + t.totalAmount, 0),
  totalDebt: filteredLookup.value.reduce((sum, t) => sum + t.debt, 0),
}))

// ========== HELPERS ==========
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}
</script>

<style scoped>
.detail-tabs {
  border-radius: 8px;
  overflow: hidden;
}
.detail-tabs :deep(.el-tabs__content) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 450px;
}
.detail-tabs :deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.custom-table :deep(.el-table__inner-wrapper::before) {
  display: none;
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
.stat-card--cyan { border-left: 4px solid #06b6d4; }
.stat-card--green { border-left: 4px solid #22c55e; }
.stat-card--blue { border-left: 4px solid #3b82f6; }

/* Dark Mode */
html.dark .detail-tabs {
  background-color: #1f2937;
  border-color: #374151;
}
html.dark .detail-tabs :deep(.el-tabs__header) {
  background-color: #111827;
  border-bottom-color: #374151;
}
html.dark .detail-tabs :deep(.el-tabs__item) {
  color: #9ca3af;
  border-color: transparent;
  transition: all 0.3s;
}
html.dark .detail-tabs :deep(.el-tabs__item:hover) {
  color: #d1d5db;
}
html.dark .detail-tabs :deep(.el-tabs__item.is-active) {
  background-color: #1f2937;
  border-right-color: #374151;
  border-left-color: #374151;
  border-bottom-color: #1f2937;
  color: #60a5fa;
}

html.dark .custom-dark-select :deep(.el-input__wrapper),
html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #1f2937;
  box-shadow: 0 0 0 1px #374151 inset;
}
html.dark .custom-dark-select :deep(.el-input__inner),
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}

html.dark .product-detail-wrapper :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}
html.dark .product-detail-wrapper :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}
html.dark .product-detail-wrapper :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}
html.dark .product-detail-wrapper :deep(.el-table .el-table-fixed-column--left),
html.dark .product-detail-wrapper :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
}

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

.highlight-select :deep(.el-select__wrapper) {
  background-color: transparent;
}
html.dark .highlight-select :deep(.el-select__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
  color: #f3f4f6;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
