<template>
  <div class="households-container h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4">
        <!-- <h2 class="text-xl font-bold dark:text-white">Quản lý Hộ dân</h2> -->
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
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>
          <el-select 
            v-model="selectedStatus" 
            placeholder="Trạng thái" 
            style="width: 180px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="all" />
            <el-option label="Hoạt động" value="Hoạt động" />
            <el-option label="Ngừng hoạt động" value="Ngừng hoạt động" />
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
      <el-button type="primary" @click="dialogVisible = true">Thêm Hộ dân</el-button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="tableData" style="width: 100%" class="flex-1" height="100%">
        <!-- Fixed Columns -->
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />

        <!-- Scrollable Columns -->
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

    <!-- Modal Thêm Hộ dân -->
    <el-dialog
      v-model="dialogVisible"
      title="THÊM HỘ DÂN"
      class="custom-dark-dialog"
    >
      <el-form :model="householdForm" label-width="120px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Hộ dân">
              <el-input v-model="householdForm.code" placeholder="Nhập mã hộ dân..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Họ và tên">
              <el-input v-model="householdForm.name" placeholder="Nhập họ và tên..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Điểm thu mua">
              <el-select v-model="householdForm.purchasingPoint" placeholder="Chọn điểm thu mua" class="w-full highlight-select" style="width: 100%">
                <el-option label="Tổ 1 - Lộc Ninh" value="Tổ 1 - Lộc Ninh" />
                <el-option label="Tổ 2 - Bù Đốp" value="Tổ 2 - Bù Đốp" />
                <el-option label="Tổ 3 - Đồng Phú" value="Tổ 3 - Đồng Phú" />
                <el-option label="Tổ 4 - Chơn Thành" value="Tổ 4 - Chơn Thành" />
                <el-option label="Tổ 5 - Phước Long" value="Tổ 5 - Phước Long" />
                <el-option label="Xưởng Gia An" value="Xưởng Gia An" />
                <el-option label="Xưởng Phê" value="Xưởng Phê" />
                <el-option label="Xưởng Lạc Tánh" value="Xưởng Lạc Tánh" />
                <el-option label="Đại lý Vui" value="Đại lý Vui" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số điện thoại">
              <el-input v-model="householdForm.phone" placeholder="Nhập số điện thoại..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Địa chỉ">
              <el-input v-model="householdForm.address" placeholder="Nhập địa chỉ..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-select v-model="householdForm.status" placeholder="Chọn trạng thái" class="w-full highlight-select" style="width: 100%">
                <el-option label="Hoạt động" value="Hoạt động" />
                <el-option label="Ngừng hoạt động" value="Ngừng hoạt động" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="STK Ngân hàng">
              <el-input v-model="householdForm.bankAccount" placeholder="Nhập số tài khoản..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ngân hàng">
              <el-input v-model="householdForm.bankName" placeholder="Nhập tên ngân hàng..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Username">
              <el-input v-model="householdForm.username" placeholder="Nhập username Telegram..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên nhóm Telegram">
              <el-input v-model="householdForm.telegramGroup" placeholder="Nhập tên nhóm Telegram..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số tiền nợ">
              <el-input v-model="householdForm.debtAmount" placeholder="Nhập số tiền nợ" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ứng tiền">
              <el-input v-model="householdForm.advanceAmount" placeholder="Nhập số tiền ứng" />
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

    <!-- Modal Chỉnh sửa Hộ dân -->
    <el-dialog
      v-model="editDialogVisible"
      title="CHỈNH SỬA HỘ DÂN"
      class="custom-dark-dialog"
    >
      <el-form :model="editForm" label-width="120px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Hộ dân">
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
                <el-option label="Tổ 1 - Lộc Ninh" value="Tổ 1 - Lộc Ninh" />
                <el-option label="Tổ 2 - Bù Đốp" value="Tổ 2 - Bù Đốp" />
                <el-option label="Tổ 3 - Đồng Phú" value="Tổ 3 - Đồng Phú" />
                <el-option label="Tổ 4 - Chơn Thành" value="Tổ 4 - Chơn Thành" />
                <el-option label="Tổ 5 - Phước Long" value="Tổ 5 - Phước Long" />
                <el-option label="Xưởng Gia An" value="Xưởng Gia An" />
                <el-option label="Xưởng Phê" value="Xưởng Phê" />
                <el-option label="Xưởng Lạc Tánh" value="Xưởng Lạc Tánh" />
                <el-option label="Đại lý Vui" value="Đại lý Vui" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số điện thoại">
              <el-input v-model="editForm.phone" placeholder="Nhập số điện thoại..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Địa chỉ">
              <el-input v-model="editForm.address" placeholder="Nhập địa chỉ..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-select v-model="editForm.status" placeholder="Chọn trạng thái" class="w-full highlight-select" style="width: 100%">
                <el-option label="Hoạt động" value="Hoạt động" />
                <el-option label="Ngừng hoạt động" value="Ngừng hoạt động" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="STK Ngân hàng">
              <el-input v-model="editForm.bankAccount" placeholder="Nhập số tài khoản..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ngân hàng">
              <el-input v-model="editForm.bankName" placeholder="Nhập tên ngân hàng..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Username">
              <el-input v-model="editForm.username" placeholder="Nhập username Telegram..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên nhóm Telegram">
              <el-input v-model="editForm.telegramGroup" placeholder="Nhập tên nhóm Telegram..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số tiền nợ">
              <el-input v-model="editForm.debtAmount" placeholder="Nhập số tiền nợ" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ứng tiền">
              <el-input v-model="editForm.advanceAmount" placeholder="Nhập số tiền ứng" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Nguyên liệu">
              <el-select v-model="editForm.material" placeholder="Chọn nguyên liệu" class="w-full highlight-select" style="width: 100%">
                <el-option label="Mủ nước" value="Mủ nước" />
                <el-option label="Mủ tạp" value="Mủ tạp" />
                <el-option label="Mủ kem" value="Mủ kem" />
                <el-option label="Mủ dây" value="Mủ dây" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Công nợ">
              <el-input v-model="editForm.totalDebt" placeholder="Nhập công nợ..." />
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

const selectedFactory = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const householdForm = reactive({
  code: '',
  name: '',
  purchasingPoint: '',
  phone: '',
  address: '',
  bankAccount: '',
  bankName: '',
  status: 'Hoạt động',
  username: '',
  telegramGroup: '',
  debtAmount: '',
  advanceAmount: ''
})

const submitForm = () => {
  console.log('Form data:', householdForm)
  dialogVisible.value = false
  
  ElNotification({
    title: 'Thành công',
    message: 'Đã thêm Hộ dân mới thành công!',
    type: 'success',
  })
  
  // Here you can add the logic to save the data
}

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
  phone: '',
  address: '',
  bankAccount: '',
  bankName: '',
  status: '',
  username: '',
  telegramGroup: '',
  debtAmount: '',
  advanceAmount: '',
  material: '',
  totalDebt: ''
})

const submitEditForm = () => {
  if (editingRow.value) {
    const row = editingRow.value
    row.name = editForm.name
    row.purchasingPoint = editForm.purchasingPoint
    row.phone = editForm.phone
    row.address = editForm.address
    row.bankAccount = editForm.bankAccount
    row.bankName = editForm.bankName
    row.status = editForm.status
    row.username = editForm.username
    row.telegramGroup = editForm.telegramGroup
    row.debtAmount = parseFloat(editForm.debtAmount) || 0
    row.advanceAmount = parseFloat(editForm.advanceAmount) || 0
    row.material = editForm.material
    row.totalDebt = parseFloat(editForm.totalDebt) || (row.debtAmount - row.advanceAmount)
  }
  editDialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã cập nhật thông tin Hộ dân thành công!',
    type: 'success',
  })
}

const handleCommand = (command: string, row: any) => {
  if (command === 'edit') {
    editingRow.value = row
    editForm.code = row.code
    editForm.name = row.name
    editForm.purchasingPoint = row.purchasingPoint
    editForm.phone = row.phone
    editForm.address = row.address
    editForm.bankAccount = row.bankAccount
    editForm.bankName = row.bankName
    editForm.status = row.status
    editForm.username = row.username
    editForm.telegramGroup = row.telegramGroup
    editForm.debtAmount = String(row.debtAmount)
    editForm.advanceAmount = String(row.advanceAmount)
    editForm.material = row.material || ''
    editForm.totalDebt = String(row.totalDebt || '')
    editDialogVisible.value = true
  } else {
    console.log(`Action: ${command} on Code: ${row.code}`)
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const generateMockData = () => {
  const data = []
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const middleNames = ['Văn', 'Thị', 'Hữu', 'Minh', 'Đức', 'Ngọc', 'Quang', 'Hải', 'Thanh', 'Tuấn']
  const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phong', 'Giang', 'Hải', 'Linh', 'Khánh']
  const points = ['Tổ 1 - Lộc Ninh', 'Tổ 2 - Bù Đốp', 'Tổ 3 - Đồng Phú', 'Tổ 4 - Chơn Thành', 'Tổ 5 - Phước Long']
  const banks = ['Techcombank', 'Vietcombank', 'VietinBank', 'MB Bank', 'ACB', 'BIDV', 'Agribank']

  for (let i = 1; i <= 25; i++) {
    const debtAmount = Math.floor(Math.random() * 30) * 1000000
    const advanceAmount = Math.floor(Math.random() * 15) * 1000000
    const fullName = `${firstNames[i % 10]} ${middleNames[(i * 3) % 10]} ${lastNames[(i * 7) % 10]}`
    
    data.push({
      id: i,
      code: `HD${String(i).padStart(3, '0')}`,
      name: fullName,
      purchasingPoint: points[i % 5],
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      address: `Thôn ${i % 9 + 1}, Khu vực ${i % 5 + 1}, Tỉnh Bình Phước`,
      bankAccount: `1903${Math.floor(Math.random() * 900000000 + 100000000)}`,
      bankName: banks[i % 7],
      status: i % 8 === 0 ? 'Ngừng hoạt động' : 'Hoạt động',
      username: `@${fullName.split(' ').pop()?.toLowerCase()}${i}`,
      telegramGroup: `Nhóm Hộ dân ${points[i % 5]?.split(' - ').pop() ?? ''}`,
      debtAmount: debtAmount,
      advanceAmount: advanceAmount,
      totalDebt: debtAmount - advanceAmount
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
.households-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* Tùy chỉnh toàn diện bảng cho Dark Mode */
html.dark .households-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827; /* bg-gray-900 */
  --el-table-row-hover-bg-color: #374151; /* bg-gray-700 */
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .households-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .households-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

/* Fix nền cột cố định (fixed columns) trong Dark mode */
html.dark .households-container :deep(.el-table .el-table-fixed-column--left),
html.dark .households-container :deep(.el-table .el-table-fixed-column--right) {
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

/* Tùy chỉnh dialog (không scoped) */
.custom-dark-dialog .el-form-item__label {
  white-space: nowrap;
  color: #2563eb; /* text-blue-600 */
  font-weight: 500;
}

.custom-dark-dialog .el-dialog__title {
  color: #2563eb; /* text-blue-600 */
  font-weight: bold;
}

.custom-dark-dialog .el-dialog__header {
  text-align: center;
}

/* Tùy chỉnh dialog trong Dark Mode (không scoped) */
html.dark .custom-dark-dialog {
  background-color: #1f2937;
}

html.dark .custom-dark-dialog .el-dialog__title {
  color: #3b82f6; /* text-blue-500 */
}

html.dark .custom-dark-dialog .el-form-item__label {
  color: #60a5fa; /* text-blue-400 */
}

html.dark .custom-dark-dialog .el-input__wrapper,
html.dark .custom-dark-dialog .el-select__wrapper {
  background-color: #374151;
  box-shadow: 0 0 0 1px #4b5563 inset;
}

html.dark .custom-dark-dialog .el-input__inner {
  color: #f3f4f6;
}

html.dark .custom-dark-dialog .el-input-number__increase,
html.dark .custom-dark-dialog .el-input-number__decrease {
  background-color: #4b5563;
  color: #f3f4f6;
  border-color: #6b7280;
}

/* Tùy chỉnh Notification trong Dark Mode (không scoped) */
html.dark .el-notification {
  background-color: #1f2937;
  border-color: #374151;
}

html.dark .el-notification .el-notification__title {
  color: #f3f4f6;
}

html.dark .el-notification .el-notification__content {
  color: #d1d5db;
}

html.dark .el-notification .el-notification__closeBtn {
  color: #9ca3af;
}

html.dark .el-notification .el-notification__closeBtn:hover {
  color: #f3f4f6;
}

/* Đổi màu background các ô select nổi bật (Điểm thu mua, Trạng thái) trong Dark Mode */
html.dark .highlight-select .el-input__wrapper,
html.dark .highlight-select .el-select__wrapper,
html.dark .custom-dark-dialog .highlight-select .el-input__wrapper,
html.dark .custom-dark-dialog .highlight-select .el-select__wrapper {
  background-color: #111827 !important;
  border-color: #111827 !important;
}
</style>
