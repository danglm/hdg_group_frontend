<template>
  <div class="transaction-container h-full flex flex-col">
    <!-- Filter bar -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại sản phẩm:</span>
          <el-select 
            v-model="selectedProduct" 
            placeholder="Chọn loại sản phẩm" 
            style="width: 180px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="all" />
            <el-option label="Mủ nước" value="Mủ nước" />
            <el-option label="Mủ thành phẩm" value="Mủ thành phẩm" />
          </el-select>
        </div>

        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại giao dịch:</span>
          <el-select 
            v-model="selectedType" 
            placeholder="Chọn loại giao dịch" 
            style="width: 150px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="all" />
            <el-option label="Xuất" value="Xuất" />
            <el-option label="Nhập" value="Nhập" />
          </el-select>
        </div>

        <div class="flex items-center gap-2 ml-4">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
          <el-input
            v-model="searchQuery"
            placeholder="Nhập từ khóa..."
            :prefix-icon="Search"
            clearable
            class="w-64 custom-dark-input"
          />
        </div>
      </div>
      <el-button type="primary" @click="dialogVisible = true">Thêm Giao dịch</el-button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="tableData" style="width: 100%" class="flex-1" height="100%">
        <!-- Fixed Columns -->
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="date" label="Ngày giao dịch" width="130" fixed />

        <!-- Scrollable Columns -->
        <el-table-column prop="partnerCode" label="Mã Đối tác" width="120" />
        <el-table-column prop="partnerName" label="Tên Đối tác" min-width="200" />
        <el-table-column prop="importQty" label="SL Nhập" width="110" align="right">
          <template #default="scope">
            <span :class="scope.row.importQty > 0 ? 'font-medium text-blue-500' : 'text-gray-400'">
              {{ scope.row.importQty > 0 ? formatNumber(scope.row.importQty) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="exportQty" label="SL Xuất" width="110" align="right">
          <template #default="scope">
            <span :class="scope.row.exportQty > 0 ? 'font-medium text-orange-500' : 'text-gray-400'">
              {{ scope.row.exportQty > 0 ? formatNumber(scope.row.exportQty) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="Mã hàng" width="120" />
        <el-table-column prop="unitPrice" label="Đơn giá" width="130" align="right">
          <template #default="scope">
            <span>{{ formatCurrency(scope.row.unitPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="Thành tiền" width="150" align="right">
          <template #default="scope">
            <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productType" label="Loại hàng" width="140">
          <template #default="scope">
            <el-tag :type="scope.row.productType === 'Mủ nước' ? '' : 'success'" effect="light" round>
              {{ scope.row.productType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualWeight" label="KL thực tế" width="130" align="right">
          <template #default="scope">
            <span class="font-medium text-blue-500">{{ formatNumber(scope.row.actualWeight) }} kg</span>
          </template>
        </el-table-column>
        <el-table-column prop="dryRubber" label="KL mủ khô" width="130" align="right">
          <template #default="scope">
            <span class="font-medium">{{ formatNumber(scope.row.dryRubber, 2) }} kg</span>
          </template>
        </el-table-column>
        <el-table-column prop="drc" label="Số độ" width="100" align="right">
          <template #default="scope">
            <span>{{ scope.row.drc }}</span>
          </template>
        </el-table-column>

        <!-- Fixed Right Operations -->
        <el-table-column fixed="right" label="Thao tác" width="90" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, scope.row)">
              <el-button link type="info" class="p-1">
                <el-icon class="text-xl"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="detail">Chi tiết</el-dropdown-item>
                  <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                  <el-dropdown-item command="delete" divided class="!text-red-500">Xóa</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- Modal Thêm Giao dịch -->
    <el-dialog
      v-model="dialogVisible"
      title="THÊM GIAO DỊCH"
      class="custom-dark-dialog"
    >
      <el-form :model="transactionForm" label-width="140px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngày giao dịch">
              <el-date-picker
                v-model="transactionForm.date"
                type="date"
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mã Đối tác">
              <el-input v-model="transactionForm.partnerCode" placeholder="Nhập mã đối tác..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tên Đối tác">
              <el-input v-model="transactionForm.partnerName" placeholder="Nhập tên đối tác..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Loại giao dịch">
              <el-select v-model="transactionForm.transactionType" placeholder="Chọn loại" class="w-full highlight-select" style="width: 100%">
                <el-option label="Nhập" value="Nhập" />
                <el-option label="Xuất" value="Xuất" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số lượng">
              <el-input v-model="transactionForm.quantity" placeholder="Nhập số lượng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mã hàng">
              <el-input v-model="transactionForm.productCode" placeholder="Nhập mã hàng..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Loại hàng">
              <el-select v-model="transactionForm.productType" placeholder="Chọn loại hàng" class="w-full highlight-select" style="width: 100%">
                <el-option label="Mủ nước" value="Mủ nước" />
                <el-option label="Mủ thành phẩm" value="Mủ thành phẩm" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Đơn giá">
              <el-input v-model="transactionForm.unitPrice" placeholder="Nhập đơn giá..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Thành tiền">
              <el-input v-model="transactionForm.totalAmount" placeholder="Nhập thành tiền..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="KL thực tế">
              <el-input v-model="transactionForm.actualWeight" placeholder="Nhập KL thực tế (kg)..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="KL mủ khô">
              <el-input v-model="transactionForm.dryRubber" placeholder="Nhập KL mủ khô (kg)..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số độ">
              <el-input v-model="transactionForm.drc" placeholder="Nhập số độ..." />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button type="primary" @click="submitForm">
            Xác nhận
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Modal Chỉnh sửa Giao dịch -->
    <el-dialog
      v-model="editDialogVisible"
      title="CHỈNH SỬA GIAO DỊCH"
      class="custom-dark-dialog"
    >
      <el-form :model="editForm" label-width="140px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngày giao dịch">
              <el-date-picker
                v-model="editForm.date"
                type="date"
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mã Đối tác">
              <el-input v-model="editForm.partnerCode" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tên Đối tác">
              <el-input v-model="editForm.partnerName" placeholder="Nhập tên đối tác..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Loại giao dịch">
              <el-select v-model="editForm.transactionType" placeholder="Chọn loại" class="w-full highlight-select" style="width: 100%">
                <el-option label="Nhập" value="Nhập" />
                <el-option label="Xuất" value="Xuất" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số lượng">
              <el-input v-model="editForm.quantity" placeholder="Nhập số lượng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mã hàng">
              <el-input v-model="editForm.productCode" placeholder="Nhập mã hàng..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Loại hàng">
              <el-select v-model="editForm.productType" placeholder="Chọn loại hàng" class="w-full highlight-select" style="width: 100%">
                <el-option label="Mủ nước" value="Mủ nước" />
                <el-option label="Mủ thành phẩm" value="Mủ thành phẩm" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Đơn giá">
              <el-input v-model="editForm.unitPrice" placeholder="Nhập đơn giá..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Thành tiền">
              <el-input v-model="editForm.totalAmount" placeholder="Nhập thành tiền..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="KL thực tế">
              <el-input v-model="editForm.actualWeight" placeholder="Nhập KL thực tế (kg)..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="KL mủ khô">
              <el-input v-model="editForm.dryRubber" placeholder="Nhập KL mủ khô (kg)..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số độ">
              <el-input v-model="editForm.drc" placeholder="Nhập số độ..." />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">Hủy</el-button>
          <el-button type="primary" @click="submitEditForm">
            Cập nhật
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { MoreFilled, Search } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

const selectedProduct = ref('all')
const selectedType = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const transactionForm = reactive({
  date: '',
  partnerCode: '',
  partnerName: '',
  transactionType: '',
  quantity: '',
  productCode: '',
  productType: '',
  unitPrice: '',
  totalAmount: '',
  actualWeight: '',
  dryRubber: '',
  drc: ''
})

const submitForm = () => {
  console.log('Form data:', transactionForm)
  dialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã thêm Giao dịch mới thành công!',
    type: 'success',
  })
}

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}

const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

const editDialogVisible = ref(false)
const editingRow = ref<any>(null)
const editForm = reactive({
  date: '',
  partnerCode: '',
  partnerName: '',
  transactionType: '',
  quantity: '',
  productCode: '',
  productType: '',
  unitPrice: '',
  totalAmount: '',
  actualWeight: '',
  dryRubber: '',
  drc: ''
})

const handleCommand = (command: string, row: any) => {
  if (command === 'edit') {
    editingRow.value = row
    editForm.date = row.date
    editForm.partnerCode = row.partnerCode
    editForm.partnerName = row.partnerName
    editForm.transactionType = row.importQty > 0 ? 'Nhập' : 'Xuất'
    editForm.quantity = String(row.importQty > 0 ? row.importQty : row.exportQty)
    editForm.productCode = row.productCode
    editForm.productType = row.productType
    editForm.unitPrice = String(row.unitPrice)
    editForm.totalAmount = String(row.totalAmount)
    editForm.actualWeight = String(row.actualWeight)
    editForm.dryRubber = String(row.dryRubber)
    editForm.drc = String(row.drc)
    editDialogVisible.value = true
  } else {
    console.log(`Action: ${command} on row:`, row)
  }
}

const submitEditForm = () => {
  if (editingRow.value) {
    const row = editingRow.value
    row.date = editForm.date
    row.partnerName = editForm.partnerName
    const qty = parseFloat(editForm.quantity) || 0
    if (editForm.transactionType === 'Nhập') {
      row.importQty = qty
      row.exportQty = 0
    } else {
      row.importQty = 0
      row.exportQty = qty
    }
    row.productCode = editForm.productCode
    row.productType = editForm.productType
    row.unitPrice = parseFloat(editForm.unitPrice) || 0
    row.totalAmount = parseFloat(editForm.totalAmount) || 0
    row.actualWeight = parseFloat(editForm.actualWeight) || 0
    row.dryRubber = parseFloat(editForm.dryRubber) || 0
    row.drc = parseFloat(editForm.drc) || 0
  }
  editDialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã cập nhật thông tin Giao dịch thành công!',
    type: 'success',
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatNumber = (value: number, decimals: number = 0) => {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

const generateMockData = () => {
  const data = []
  const partners = [
    { code: 'DT001', name: 'Công ty TNHH Hòa Phát' },
    { code: 'DT002', name: 'Công ty CP Đại Việt' },
    { code: 'DT003', name: 'DNTN Minh Tâm' },
    { code: 'DT004', name: 'Công ty TNHH Thành Đạt' },
    { code: 'DT005', name: 'Công ty CP Phú Thịnh' },
    { code: 'DT006', name: 'DNTN Quang Huy' },
    { code: 'DT007', name: 'Công ty TNHH An Khang' },
    { code: 'DT008', name: 'Công ty CP Việt Tiến' },
  ]
  const productTypes = ['Mủ nước', 'Mủ thành phẩm']
  const productCodes = ['MN-001', 'MN-002', 'MTP-001', 'MTP-002', 'MN-003', 'MTP-003']

  for (let i = 1; i <= 25; i++) {
    const partner = partners[i % partners.length]
    const isImport = i % 3 !== 0
    const qty = Math.floor(Math.random() * 50) + 5
    const actualWeight = Math.floor(Math.random() * 3000) + 500
    const drc = Math.floor(Math.random() * 15) + 25
    const dryRubber = actualWeight * drc / 100
    const unitPrice = [28000, 30000, 32000, 35000][i % 4]
    const totalAmount = dryRubber * unitPrice

    data.push({
      id: i,
      date: `2026-05-${String(i % 28 + 1).padStart(2, '0')}`,
      partnerCode: partner.code,
      partnerName: partner.name,
      importQty: isImport ? qty : 0,
      exportQty: isImport ? 0 : qty,
      productCode: productCodes[i % productCodes.length],
      unitPrice,
      totalAmount,
      productType: productTypes[i % 2],
      actualWeight,
      dryRubber,
      drc
    })
  }
  return data
}

const allData = ref(generateMockData())
const total = computed(() => allData.value.length)

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allData.value.slice(start, end)
})
</script>

<style scoped>
.transaction-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

html.dark .transaction-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .transaction-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .transaction-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

html.dark .transaction-container :deep(.el-table .el-table-fixed-column--left),
html.dark .transaction-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
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
</style>

<style>
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

html.dark .highlight-select .el-input__wrapper,
html.dark .highlight-select .el-select__wrapper {
  background-color: #111827 !important;
  border-color: #111827 !important;
}

.custom-dark-dialog .el-form-item__label {
  white-space: nowrap;
  color: #2563eb;
  font-weight: 500;
}

.custom-dark-dialog .el-dialog__title {
  color: #2563eb;
  font-weight: bold;
}

.custom-dark-dialog .el-dialog__header {
  text-align: center;
}

html.dark .custom-dark-dialog {
  background-color: #1f2937;
}

html.dark .custom-dark-dialog .el-dialog__title {
  color: #3b82f6;
}

html.dark .custom-dark-dialog .el-form-item__label {
  color: #60a5fa;
}

html.dark .custom-dark-dialog .el-input__wrapper,
html.dark .custom-dark-dialog .el-select__wrapper {
  background-color: #374151;
  box-shadow: 0 0 0 1px #4b5563 inset;
}

html.dark .custom-dark-dialog .el-input__inner {
  color: #f3f4f6;
}
</style>
