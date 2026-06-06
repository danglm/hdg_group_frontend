<template>
  <div class="purchasing-container h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4">
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
            <el-option label="Xưởng Gia An" value="Xưởng Gia An" />
            <el-option label="Xưởng Phê" value="Xưởng Phê" />
            <el-option label="Xưởng Lạc Tánh" value="Xưởng Lạc Tánh" />
            <el-option label="Đại lý Vui" value="Đại lý Vui" />
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
      <el-button type="primary" @click="dialogVisible = true">Thêm Thu mua</el-button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="tableData" style="width: 100%" class="flex-1" height="100%">
        <!-- Fixed Columns -->
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />

        <!-- Scrollable Columns -->
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

    <!-- Modal Thêm Thu mua -->
    <el-dialog
      v-model="dialogVisible"
      title="THÊM THU MUA"
      class="custom-dark-dialog"
    >
      <el-form :model="purchaseForm" label-width="120px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Hộ">
              <el-input v-model="purchaseForm.householdCode" placeholder="Nhập mã hộ..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên Hộ Dân">
              <el-input :model-value="computedHouseholdName" disabled placeholder="Tự động hiển thị..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Điểm thu mua">
              <el-select v-model="purchaseForm.purchasingPoint" placeholder="Chọn điểm thu mua" class="w-full highlight-select" style="width: 100%">
                <el-option label="Xưởng Gia An" value="Xưởng Gia An" />
                <el-option label="Xưởng Phê" value="Xưởng Phê" />
                <el-option label="Xưởng Lạc Tánh" value="Xưởng Lạc Tánh" />
                <el-option label="Đại lý Vui" value="Đại lý Vui" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trợ giá">
              <el-input v-model="purchaseForm.subsidize" placeholder="Nhập trợ giá..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Khối lượng">
              <el-input v-model="purchaseForm.weight" placeholder="Nhập khối lượng (kg)..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trừ bì">
              <el-input v-model="purchaseForm.tare" placeholder="Nhập trừ bì (kg)..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="KL Thực tế">
              <el-input :model-value="computedNetWeight" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số độ">
              <el-input v-model="purchaseForm.drc" placeholder="Nhập số độ..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mủ khô">
              <el-input :model-value="computedDryRubber" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Đơn giá">
              <el-input v-model="purchaseForm.unitPrice" placeholder="Nhập đơn giá..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Thành tiền">
              <el-input :model-value="computedTotalAmount" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Lưu sổ">
              <el-switch v-model="purchaseForm.saveToBook" active-text="Có" inactive-text="Không" />
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

    <!-- Modal Chỉnh sửa Thu mua -->
    <el-dialog
      v-model="editDialogVisible"
      title="CHỈNH SỬA THU MUA"
      class="custom-dark-dialog"
    >
      <el-form :model="editForm" label-width="120px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Hộ">
              <el-input v-model="editForm.code" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Họ và tên">
              <el-input v-model="editForm.name" placeholder="Nhập họ và tên..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Điểm thu mua">
              <el-select v-model="editForm.purchasingPoint" placeholder="Chọn điểm thu mua" class="w-full highlight-select" style="width: 100%">
                <el-option label="Xưởng Gia An" value="Xưởng Gia An" />
                <el-option label="Xưởng Phê" value="Xưởng Phê" />
                <el-option label="Xưởng Lạc Tánh" value="Xưởng Lạc Tánh" />
                <el-option label="Đại lý Vui" value="Đại lý Vui" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ngày">
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
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Trợ giá">
              <el-input v-model="editForm.subsidize" placeholder="Nhập trợ giá..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Khối lượng">
              <el-input v-model="editForm.weight" placeholder="Nhập khối lượng (kg)..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Trừ bì">
              <el-input v-model="editForm.tare" placeholder="Nhập trừ bì (kg)..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="KL Thực tế">
              <el-input :model-value="editComputedNetWeight" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số độ">
              <el-input v-model="editForm.drc" placeholder="Nhập số độ..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mủ khô">
              <el-input :model-value="editComputedDryRubber" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Đơn giá">
              <el-input v-model="editForm.unitPrice" placeholder="Nhập đơn giá..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Giá hỗ trợ">
              <el-input v-model="editForm.supportPrice" placeholder="Nhập giá hỗ trợ..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Thành tiền">
              <el-input :model-value="editComputedTotalAmount" disabled />
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

const currentPage = ref(1)
const pageSize = ref(10)
const selectedFactory = ref('all')
const dateRange = ref<[string, string] | null>(null)
const searchQuery = ref('')

const dialogVisible = ref(false)
const purchaseForm = reactive({
  householdCode: '',
  purchasingPoint: '',
  subsidize: '',
  weight: '',
  tare: '',
  drc: '',
  unitPrice: '',
  saveToBook: true
})

const submitForm = () => {
  console.log('Form data:', purchaseForm)
  dialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã thêm Thu mua mới thành công!',
    type: 'success',
  })

  // Here you can add the logic to save the data
}

// Mock lookup: tìm tên Hộ Dân theo mã
const householdMap: Record<string, string> = {
  'HD001': 'Nguyễn Văn An',
  'HD002': 'Trần Thị Bình',
  'HD003': 'Lê Hữu Cường',
  'HD004': 'Phạm Minh Dũng',
  'HD005': 'Hoàng Đức Em',
}

const computedHouseholdName = computed(() => {
  const code = purchaseForm.householdCode.trim().toUpperCase()
  return householdMap[code] || ''
})

const computedNetWeight = computed(() => {
  const w = parseFloat(purchaseForm.weight) || 0
  const t = parseFloat(purchaseForm.tare) || 0
  const net = w - t
  return net > 0 ? `${formatNumber(net)} kg` : ''
})

const computedDryRubber = computed(() => {
  const w = parseFloat(purchaseForm.weight) || 0
  const t = parseFloat(purchaseForm.tare) || 0
  const drc = parseFloat(purchaseForm.drc) || 0
  const net = w - t
  const dry = net * drc / 100
  return dry > 0 ? `${formatNumber(dry, 2)} kg` : ''
})

const computedTotalAmount = computed(() => {
  const w = parseFloat(purchaseForm.weight) || 0
  const t = parseFloat(purchaseForm.tare) || 0
  const drc = parseFloat(purchaseForm.drc) || 0
  const price = parseFloat(purchaseForm.unitPrice) || 0
  const net = w - t
  const dry = net * drc / 100
  const total = dry * price
  return total > 0 ? `${formatCurrency(total)} đ` : ''
})

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
  // Call API to fetch new data here
}

const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
  // Call API to fetch new data here
}

const editDialogVisible = ref(false)
const editingRow = ref<any>(null)
const editForm = reactive({
  code: '',
  name: '',
  purchasingPoint: '',
  date: '',
  subsidize: '',
  weight: '',
  tare: '',
  drc: '',
  unitPrice: '',
  supportPrice: ''
})

const editComputedNetWeight = computed(() => {
  const w = parseFloat(editForm.weight) || 0
  const t = parseFloat(editForm.tare) || 0
  const net = w - t
  return net > 0 ? `${formatNumber(net)} kg` : ''
})

const editComputedDryRubber = computed(() => {
  const w = parseFloat(editForm.weight) || 0
  const t = parseFloat(editForm.tare) || 0
  const drc = parseFloat(editForm.drc) || 0
  const net = w - t
  const dry = net * drc / 100
  return dry > 0 ? `${formatNumber(dry, 2)} kg` : ''
})

const editComputedTotalAmount = computed(() => {
  const w = parseFloat(editForm.weight) || 0
  const t = parseFloat(editForm.tare) || 0
  const drc = parseFloat(editForm.drc) || 0
  const price = parseFloat(editForm.unitPrice) || 0
  const support = parseFloat(editForm.supportPrice) || 0
  const subsidize = parseFloat(editForm.subsidize) || 0
  const net = w - t
  const dry = net * drc / 100
  const total = dry * (price + support + subsidize)
  return total > 0 ? `${formatCurrency(total)} VNĐ` : ''
})

const submitEditForm = () => {
  if (editingRow.value) {
    const row = editingRow.value
    row.name = editForm.name
    row.purchasingPoint = editForm.purchasingPoint
    row.date = editForm.date
    row.subsidize = parseFloat(editForm.subsidize) || 0
    row.weight = parseFloat(editForm.weight) || 0
    row.tare = parseFloat(editForm.tare) || 0
    row.netWeight = row.weight - row.tare
    row.drc = parseFloat(editForm.drc) || 0
    row.dryRubber = row.netWeight * row.drc / 100
    row.unitPrice = parseFloat(editForm.unitPrice) || 0
    row.supportPrice = parseFloat(editForm.supportPrice) || 0
    row.totalAmount = row.dryRubber * (row.unitPrice + row.supportPrice + row.subsidize)
  }
  editDialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã cập nhật thông tin Thu mua thành công!',
    type: 'success',
  })
}

const handleCommand = (command: string, row: any) => {
  if (command === 'edit') {
    editingRow.value = row
    editForm.code = row.code
    editForm.name = row.name
    editForm.purchasingPoint = row.purchasingPoint
    editForm.date = row.date
    editForm.subsidize = String(row.subsidize)
    editForm.weight = String(row.weight)
    editForm.tare = String(row.tare)
    editForm.drc = String(row.drc)
    editForm.unitPrice = String(row.unitPrice)
    editForm.supportPrice = String(row.supportPrice)
    editDialogVisible.value = true
  } else {
    console.log(`Action: ${command} on Code: ${row.code}`)
  }
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
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const middleNames = ['Văn', 'Thị', 'Hữu', 'Minh', 'Đức', 'Ngọc', 'Quang', 'Hải', 'Thanh', 'Tuấn']
  const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phong', 'Giang', 'Hải', 'Linh', 'Khánh']
  const points = ['Tổ 1 - Lộc Ninh', 'Tổ 2 - Bù Đốp', 'Tổ 3 - Đồng Phú', 'Tổ 4 - Chơn Thành', 'Tổ 5 - Phước Long']

  for (let i = 1; i <= 25; i++) {
    const fullName = `${firstNames[i % 10]} ${middleNames[(i * 3) % 10]} ${lastNames[(i * 7) % 10]}`
    const weight = Math.floor(Math.random() * 500) + 100 // 100-600
    const tare = Math.floor(Math.random() * 20) + 5 // 5-25
    const netWeight = weight - tare
    const drc = Math.floor(Math.random() * 10) + 25 // 25-35
    const dryRubber = netWeight * drc / 100
    const unitPrice = 30000 // 30,000 VND
    const supportPrice = 1000 // 1,000 VND
    const subsidize = 500 // 500 VND
    
    data.push({
      id: i,
      code: `HD${String(i).padStart(3, '0')}`,
      name: fullName,
      purchasingPoint: points[i % 5],
      date: `2026-05-${String(i % 14 + 1).padStart(2, '0')}`,
      subsidize: subsidize,
      weight: weight,
      tare: tare,
      netWeight: netWeight,
      drc: drc,
      dryRubber: dryRubber,
      unitPrice: unitPrice,
      supportPrice: supportPrice,
      totalAmount: dryRubber * (unitPrice + supportPrice + subsidize)
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
.purchasing-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* Tùy chỉnh toàn diện bảng cho Dark Mode */
html.dark .purchasing-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827; /* bg-gray-900 */
  --el-table-row-hover-bg-color: #374151; /* bg-gray-700 */
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .purchasing-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .purchasing-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

/* Fix nền cột cố định (fixed columns) trong Dark mode */
html.dark .purchasing-container :deep(.el-table .el-table-fixed-column--left),
html.dark .purchasing-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important; /* bg-gray-800 (khớp với container) */
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

<style>
/* Tùy chỉnh select dropdown popper trong Dark Mode (không scoped) */
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

html.dark .custom-dark-select-popper .el-popper__arrow::before {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
}

/* Đổi màu background các ô select nổi bật trong Dark Mode */
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
