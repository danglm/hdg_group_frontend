<template>
  <div class="partner-container h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4">
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
      <el-button type="primary" @click="dialogVisible = true">Thêm Đối tác</el-button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="tableData" style="width: 100%" class="flex-1" height="100%">
        <!-- Fixed Columns -->
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="code" label="Mã Đối tác" width="130" fixed />

        <!-- Scrollable Columns -->
        <el-table-column prop="name" label="Tên Đối tác" width="200" />
        <el-table-column prop="debt" label="Công nợ" width="160" align="right">
          <template #default="scope">
            <span class="font-bold">{{ formatCurrency(scope.row.debt) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="Username" width="150">
          <template #default="scope">
            <span class="text-blue-500">{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="telegramGroup" label="Nhóm Telegram" min-width="230" />
        <el-table-column prop="bankName" label="Ngân hàng" width="160" />
        <el-table-column prop="bankAccount" label="Số tài khoản" width="160" />
        <el-table-column prop="status" label="Trạng thái" width="140" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Hoạt động' ? 'success' : 'danger'" effect="light" round>
              {{ scope.row.status }}
            </el-tag>
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

    <!-- Modal Thêm Đối tác -->
    <el-dialog
      v-model="dialogVisible"
      title="THÊM ĐỐI TÁC"
      class="custom-dark-dialog"
    >
      <el-form :model="partnerForm" label-width="140px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Đối tác">
              <el-input v-model="partnerForm.code" placeholder="Nhập mã đối tác..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên Đối tác">
              <el-input v-model="partnerForm.name" placeholder="Nhập tên đối tác..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Công nợ">
              <el-input v-model="partnerForm.debt" placeholder="Nhập công nợ..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-select v-model="partnerForm.status" placeholder="Chọn trạng thái" class="w-full highlight-select" style="width: 100%">
                <el-option label="Hoạt động" value="Hoạt động" />
                <el-option label="Ngừng hoạt động" value="Ngừng hoạt động" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Username">
              <el-input v-model="partnerForm.username" placeholder="Nhập username Telegram..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhóm Telegram">
              <el-input v-model="partnerForm.telegramGroup" placeholder="Nhập tên nhóm Telegram..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngân hàng">
              <el-input v-model="partnerForm.bankName" placeholder="Nhập tên ngân hàng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số tài khoản">
              <el-input v-model="partnerForm.bankAccount" placeholder="Nhập số tài khoản..." />
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

    <!-- Modal Chỉnh sửa Đối tác -->
    <el-dialog
      v-model="editDialogVisible"
      title="CHỈNH SỬA ĐỐI TÁC"
      class="custom-dark-dialog"
    >
      <el-form :model="editForm" label-width="140px" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã Đối tác">
              <el-input v-model="editForm.code" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên Đối tác">
              <el-input v-model="editForm.name" placeholder="Nhập tên đối tác..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Công nợ">
              <el-input v-model="editForm.debt" placeholder="Nhập công nợ..." />
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
            <el-form-item label="Username">
              <el-input v-model="editForm.username" placeholder="Nhập username Telegram..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhóm Telegram">
              <el-input v-model="editForm.telegramGroup" placeholder="Nhập tên nhóm Telegram..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngân hàng">
              <el-input v-model="editForm.bankName" placeholder="Nhập tên ngân hàng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số tài khoản">
              <el-input v-model="editForm.bankAccount" placeholder="Nhập số tài khoản..." />
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

const selectedStatus = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const partnerForm = reactive({
  code: '',
  name: '',
  debt: '',
  username: '',
  telegramGroup: '',
  bankName: '',
  bankAccount: '',
  status: 'Hoạt động'
})

const submitForm = () => {
  console.log('Form data:', partnerForm)
  dialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã thêm Đối tác mới thành công!',
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
  code: '',
  name: '',
  debt: '',
  username: '',
  telegramGroup: '',
  bankName: '',
  bankAccount: '',
  status: ''
})

const handleCommand = (command: string, row: any) => {
  if (command === 'edit') {
    editingRow.value = row
    editForm.code = row.code
    editForm.name = row.name
    editForm.debt = String(row.debt)
    editForm.username = row.username
    editForm.telegramGroup = row.telegramGroup
    editForm.bankName = row.bankName
    editForm.bankAccount = row.bankAccount
    editForm.status = row.status
    editDialogVisible.value = true
  } else {
    console.log(`Action: ${command} on Code: ${row.code}`)
  }
}

const submitEditForm = () => {
  if (editingRow.value) {
    const row = editingRow.value
    row.name = editForm.name
    row.debt = parseFloat(editForm.debt) || 0
    row.username = editForm.username
    row.telegramGroup = editForm.telegramGroup
    row.bankName = editForm.bankName
    row.bankAccount = editForm.bankAccount
    row.status = editForm.status
  }
  editDialogVisible.value = false

  ElNotification({
    title: 'Thành công',
    message: 'Đã cập nhật thông tin Đối tác thành công!',
    type: 'success',
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const generateMockData = () => {
  const data = []
  const companyNames = [
    'Công ty TNHH Hòa Phát', 'Công ty CP Đại Việt', 'DNTN Minh Tâm', 'Công ty TNHH Thành Đạt',
    'Công ty CP Phú Thịnh', 'DNTN Quang Huy', 'Công ty TNHH An Khang', 'Công ty CP Việt Tiến',
    'DNTN Thanh Bình', 'Công ty TNHH Hoàng Long', 'Công ty CP Nam Á', 'DNTN Phước Lộc',
    'Công ty TNHH Tân Phát', 'Công ty CP Bình Minh', 'DNTN Hải Đăng'
  ]
  const banks = ['Techcombank', 'Vietcombank', 'VietinBank', 'MB Bank', 'ACB', 'BIDV', 'Agribank']

  for (let i = 1; i <= 15; i++) {
    const debt = Math.floor(Math.random() * 100) * 1000000

    data.push({
      id: i,
      code: `DT${String(i).padStart(3, '0')}`,
      name: companyNames[(i - 1) % companyNames.length],
      debt,
      username: `@doitac${i}`,
      telegramGroup: `Nhóm ĐT ${companyNames[(i - 1) % companyNames.length].split(' ').pop()}`,
      bankName: banks[i % 7],
      bankAccount: `1903${Math.floor(Math.random() * 900000000 + 100000000)}`,
      status: i % 6 === 0 ? 'Ngừng hoạt động' : 'Hoạt động'
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
.partner-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

html.dark .partner-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .partner-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .partner-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

html.dark .partner-container :deep(.el-table .el-table-fixed-column--left),
html.dark .partner-container :deep(.el-table .el-table-fixed-column--right) {
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
