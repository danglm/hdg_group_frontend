<template>
  <div class="rental-container h-full flex flex-col">
    <!-- Filter Bar -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>
          <el-select
            v-model="filterStatus"
            placeholder="Tất cả"
            style="width: 150px"
            clearable
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="" />
            <el-option label="Đang thuê" value="active" />
            <el-option label="Hết hạn" value="expired" />
            <el-option label="Đã hủy" value="cancelled" />
            <el-option label="Nợ xấu" value="bad_debt" />
            <el-option label="Bản nháp" value="draft" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
          <el-input
            v-model="searchQuery"
            placeholder="Tìm tên khách thuê, mã HĐ..."
            :prefix-icon="Search"
            clearable
            class="w-64 custom-dark-input"
          />
        </div>
      </div>
      <el-button type="primary" @click="openAddDialog">Tạo hợp đồng mới</el-button>
    </div>

    <!-- Table Container -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table v-loading="loading" :data="paginatedData" style="width: 100%" class="flex-1" height="100%">
        <el-table-column prop="contract_id" label="Mã HĐ" width="140" fixed>
          <template #default="{ row }">
            <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ row.contract_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customer_name" label="Khách thuê" min-width="280" fixed>
          <template #default="{ row }">
            <span class="font-bold text-gray-800 dark:text-gray-100">{{ row.customer_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customer_code" label="Mã khách" width="130" />
        <el-table-column prop="group_name" label="Tên nhóm" width="180" />
        <el-table-column prop="contact_info" label="Liên hệ" width="160" />
        <el-table-column prop="number_phone" label="Số điện thoại" width="140" />
        <el-table-column prop="type_contract" label="Loại HĐ" width="120" />
        <el-table-column prop="real_estate_id" label="Mã BĐS" width="130" />
        <el-table-column label="Giá thuê (Tháng)" width="160" align="right">
          <template #default="{ row }">
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{ formatCurrency(row.monthly_rental) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Tiền cọc" width="150" align="right">
          <template #default="{ row }">
            <span class="text-gray-600 dark:text-gray-400">{{ formatCurrency(row.deposit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Nợ tiền thuê" width="150" align="right">
          <template #default="{ row }">
            <span :class="row.rental_debt > 0 ? 'text-red-500 font-semibold' : 'text-gray-600 dark:text-gray-400'">
              {{ formatCurrency(row.rental_debt) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày bắt đầu" width="125" align="center">
          <template #default="{ row }">
            <span class="text-xs">{{ row.start_rental }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày kết thúc" width="125" align="center">
          <template #default="{ row }">
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ row.end_rental }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" effect="light" size="small" round>
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column fixed="right" label="Thao tác" width="90" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
              <el-button link type="info" class="p-1">
                <el-icon class="text-xl"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                  <el-dropdown-item command="delete" divided class="!text-red-500">Xóa</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredContracts.length"
        />
      </div>
    </div>

    <!-- Add/Edit Contract Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'CHỈNH SỬA HỢP ĐỒNG CHO THUÊ' : 'TẠO HỢP ĐỒNG MỚI'"
      width="900px"
      destroy-on-close
      align-center
      class="custom-dark-dialog"
    >
      <div class="max-h-[65vh] overflow-y-auto overflow-x-hidden px-2">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="160px" class="mt-2 compact-form">
          <!-- THÔNG TIN HỢP ĐỒNG -->
          <div class="mb-6">
            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Thông tin hợp đồng
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mã Hợp đồng" prop="contract_id">
                  <el-input v-model="form.contract_id" placeholder="VD: HĐ-2026-001..." :disabled="isEdit" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Bất động sản thuê" prop="real_estate_id">
                  <el-input v-model="form.real_estate_id" placeholder="Mã/Tên BĐS thuê..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Loại hợp đồng" prop="type_contract">
                  <el-input v-model="form.type_contract" placeholder="VD: Dài hạn, Ngắn hạn..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Trạng thái" prop="status">
                  <el-select v-model="form.status" style="width: 100%" class="highlight-select">
                    <el-option label="Đang thuê" value="active" />
                    <el-option label="Hết hạn" value="expired" />
                    <el-option label="Đã hủy" value="cancelled" />
                    <el-option label="Nợ xấu" value="bad_debt" />
                    <el-option label="Bản nháp" value="draft" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- THÔNG TIN KHÁCH THUÊ -->
          <div class="mb-6">
            <h4 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              Thông tin khách thuê
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mã khách hàng" prop="customer_code">
                  <el-input v-model="form.customer_code" placeholder="VD: KH-001..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tên khách thuê" prop="customer_name">
                  <el-input v-model="form.customer_name" placeholder="Tên cá nhân/tổ chức thuê..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tên nhóm" prop="group_name">
                  <el-input v-model="form.group_name" placeholder="Tên nhóm..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Số điện thoại" prop="number_phone">
                  <el-input v-model="form.number_phone" placeholder="SĐT liên hệ..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Liên hệ" prop="contact_info">
                  <el-input v-model="form.contact_info" placeholder="Telegram @username..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- GIÁ TRỊ & THỜI HẠN -->
          <div class="mb-2">
            <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-rose-500 rounded-full"></span>
              Giá trị & Thời hạn
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Giá thuê / Tháng" prop="monthly_rental">
                  <el-input v-model="form.monthly_rentalText" placeholder="Nhập giá thuê..." @input="handleMonthlyRentalInput">
                    <template #suffix><span class="text-xs text-gray-400">VNĐ</span></template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tiền đặt cọc" prop="deposit">
                  <el-input v-model="form.depositText" placeholder="Nhập tiền đặt cọc..." @input="handleDepositInput">
                    <template #suffix><span class="text-xs text-gray-400">VNĐ</span></template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Nợ tiền thuê" prop="rental_debt">
                  <el-input v-model="form.rental_debtText" placeholder="Nhập công nợ nếu có..." @input="handleRentalDebtInput">
                    <template #suffix><span class="text-xs text-gray-400">VNĐ</span></template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Ngày bắt đầu" prop="start_rental">
                  <el-date-picker
                    v-model="form.start_rental"
                    type="date"
                    placeholder="Chọn ngày"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Ngày kết thúc" prop="end_rental">
                  <el-date-picker
                    v-model="form.end_rental"
                    type="date"
                    placeholder="Chọn ngày"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button type="primary" @click="submitForm">Xác nhận</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Search, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { rentalService } from '@/api/rentalService'

interface Contract {
  id: string
  customer_id: string
  customer_code: string
  customer_name: string
  group_name: string
  contact_info: string
  number_phone: string
  contract_id: string
  real_estate_id: string
  type_contract: string
  start_rental: string
  end_rental: string
  deposit: number
  monthly_rental: number
  rental_debt: number
  status: string
}

const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Active reactive contracts list state
const contracts = ref<Contract[]>([])

// Filters & Search logic
const filteredContracts = computed(() => {
  return contracts.value.filter(c => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return true

    return (
      c.customer_name.toLowerCase().includes(query) ||
      c.contract_id.toLowerCase().includes(query) ||
      c.real_estate_id.toLowerCase().includes(query) ||
      c.customer_code.toLowerCase().includes(query) ||
      c.group_name.toLowerCase().includes(query)
    )
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredContracts.value.slice(start, end)
})

// Dialog Add/Edit State
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<any>(null)

const form = reactive({
  id: '',
  customer_id: '',
  customer_code: '',
  customer_name: '',
  group_name: '',
  contact_info: '',
  number_phone: '',
  contract_id: '',
  real_estate_id: '',
  type_contract: '',
  monthly_rental: 0,
  monthly_rentalText: '',
  deposit: 0,
  depositText: '',
  rental_debt: 0,
  rental_debtText: '',
  start_rental: '',
  end_rental: '',
  status: 'active'
})

const rules = reactive({
  contract_id: [{ required: true, message: 'Vui lòng nhập mã hợp đồng', trigger: 'blur' }],
  customer_name: [{ required: true, message: 'Vui lòng nhập tên khách thuê', trigger: 'blur' }],
  real_estate_id: [{ required: true, message: 'Vui lòng nhập mã BĐS thuê', trigger: 'blur' }],
  monthly_rental: [{ required: true, message: 'Vui lòng nhập giá thuê', trigger: 'blur' }],
  deposit: [{ required: true, message: 'Vui lòng nhập tiền cọc', trigger: 'blur' }],
  start_rental: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'change' }],
  end_rental: [{ required: true, message: 'Vui lòng chọn ngày kết thúc', trigger: 'change' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }]
})

const handleCommand = (cmd: string, row: Contract) => {
  if (cmd === 'edit') {
    openEditDialog(row)
  } else if (cmd === 'delete') {
    handleDelete(row)
  }
}

const getStatusTag = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'danger'
  if (status === 'cancelled') return 'info'
  if (status === 'bad_debt') return 'warning'
  return 'info'
}

const getStatusText = (status: string) => {
  if (status === 'active') return 'Đang thuê'
  if (status === 'expired') return 'Hết hạn'
  if (status === 'cancelled') return 'Đã hủy'
  if (status === 'bad_debt') return 'Nợ xấu'
  if (status === 'draft') return 'Bản nháp'
  return status || 'Chưa rõ'
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ'
}

const handleMonthlyRentalInput = (val: string) => {
  const numericVal = val.replace(/[^0-9]/g, '')
  const num = parseInt(numericVal, 10)
  if (!isNaN(num)) {
    form.monthly_rental = num
    form.monthly_rentalText = new Intl.NumberFormat('vi-VN').format(num)
  } else {
    form.monthly_rental = 0
    form.monthly_rentalText = ''
  }
}

const handleDepositInput = (val: string) => {
  const numericVal = val.replace(/[^0-9]/g, '')
  const num = parseInt(numericVal, 10)
  if (!isNaN(num)) {
    form.deposit = num
    form.depositText = new Intl.NumberFormat('vi-VN').format(num)
  } else {
    form.deposit = 0
    form.depositText = ''
  }
}

const handleRentalDebtInput = (val: string) => {
  const numericVal = val.replace(/[^0-9]/g, '')
  const num = parseInt(numericVal, 10)
  if (!isNaN(num)) {
    form.rental_debt = num
    form.rental_debtText = new Intl.NumberFormat('vi-VN').format(num)
  } else {
    form.rental_debt = 0
    form.rental_debtText = ''
  }
}

const allCustomers = ref<any[]>([])

const fetchAllCustomers = async () => {
  try {
    allCustomers.value = await rentalService.getRentalCustomers()
  } catch (error) {
    console.error('Failed to fetch customers list:', error)
  }
}

// Watch customer code to auto-populate fields
watch(() => form.customer_code, (newCode) => {
  if (!newCode) return
  const code = newCode.trim().toLowerCase()
  if (!code) return

  const found = allCustomers.value.find(cust =>
    cust.customer_id && cust.customer_id.toLowerCase().trim() === code
  )
  if (found) {
    form.customer_id = found.id // Database UUID
    form.customer_name = found.customer_name || ''
    form.group_name = found.group_name || ''
    form.number_phone = found.number_phone || ''
    form.contact_info = found.contact_info || ''
  }
})

const cleanDate = (d?: string) => {
  if (!d || d.trim() === '') return null
  return d
}

const openAddDialog = () => {
  fetchAllCustomers()
  isEdit.value = false
  form.id = ''
  form.customer_id = ''
  form.customer_code = ''
  form.customer_name = ''
  form.group_name = ''
  form.contact_info = ''
  form.number_phone = ''
  form.contract_id = ''
  form.real_estate_id = ''
  form.type_contract = ''
  form.monthly_rental = 0
  form.monthly_rentalText = ''
  form.deposit = 0
  form.depositText = ''
  form.rental_debt = 0
  form.rental_debtText = ''
  form.start_rental = new Date().toISOString().substring(0, 10)
  form.end_rental = ''
  form.status = 'active'
  dialogVisible.value = true
}

const openEditDialog = (row: Contract) => {
  fetchAllCustomers()
  isEdit.value = true
  form.id = row.id
  form.customer_id = row.customer_id
  form.customer_code = row.customer_code
  form.customer_name = row.customer_name
  form.group_name = row.group_name
  form.contact_info = row.contact_info
  form.number_phone = row.number_phone
  form.contract_id = row.contract_id
  form.real_estate_id = row.real_estate_id
  form.type_contract = row.type_contract
  form.monthly_rental = row.monthly_rental
  form.monthly_rentalText = new Intl.NumberFormat('vi-VN').format(row.monthly_rental)
  form.deposit = row.deposit
  form.depositText = new Intl.NumberFormat('vi-VN').format(row.deposit)
  form.rental_debt = row.rental_debt
  form.rental_debtText = new Intl.NumberFormat('vi-VN').format(row.rental_debt)
  form.start_rental = row.start_rental
  form.end_rental = row.end_rental
  form.status = row.status
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        const index = contracts.value.findIndex(c => c.id === form.id)
        if (index !== -1) {
          contracts.value[index] = {
            id: form.id,
            customer_id: form.customer_id,
            customer_code: form.customer_code,
            customer_name: form.customer_name,
            group_name: form.group_name,
            contact_info: form.contact_info,
            number_phone: form.number_phone,
            contract_id: form.contract_id,
            real_estate_id: form.real_estate_id,
            type_contract: form.type_contract,
            monthly_rental: form.monthly_rental,
            deposit: form.deposit,
            rental_debt: form.rental_debt,
            start_rental: form.start_rental,
            end_rental: form.end_rental,
            status: form.status
          }
          ElMessage.success('Cập nhật thông tin hợp đồng thành công (lưu cục bộ)!')
          dialogVisible.value = false
        }
      } else {
        loading.value = true
        try {
          const payload = {
            customer_id: form.customer_id || null,
            contract_id: form.contract_id || null,
            real_estate_id: form.real_estate_id || null,
            type_contract: form.type_contract || null,
            start_rental: cleanDate(form.start_rental),
            end_rental: cleanDate(form.end_rental),
            deposit: Number(form.deposit) || 0,
            monthly_rental: Number(form.monthly_rental) || 0,
            rental_debt: Number(form.rental_debt) || 0,
            status: form.status || 'active'
          }
          await rentalService.addRentals([payload])
          ElMessage.success('Tạo hợp đồng mới thành công!')
          dialogVisible.value = false
          await fetchContracts()
        } catch (error: any) {
          ElMessage.error(error.message || 'Lỗi khi tạo hợp đồng mới')
        } finally {
          loading.value = false
        }
      }
    }
  })
}

const handleDelete = async (row: Contract) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa hợp đồng "${row.contract_id}"? Hành động này không thể hoàn tác.`,
      'Xác nhận xóa hợp đồng',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy bỏ',
        type: 'warning'
      }
    )
    contracts.value = contracts.value.filter(c => c.id !== row.id)
    ElMessage.success('Xóa hợp đồng thành công (lưu cục bộ)!')
  } catch (err) {
    // cancelled
  }
}

const mapToContract = (item: any): Contract => {
  return {
    id: item.id,
    customer_id: item.customer_id || '',
    customer_code: item.customer_code || '',
    customer_name: item.customer_name || 'Chưa rõ',
    group_name: item.group_name || '',
    contact_info: item.contact_info || '',
    number_phone: item.number_phone || '',
    contract_id: item.contract_id || '',
    real_estate_id: item.real_estate_id || '',
    type_contract: item.type_contract || '',
    start_rental: item.start_rental || '',
    end_rental: item.end_rental || '',
    deposit: item.deposit || 0,
    monthly_rental: item.monthly_rental || 0,
    rental_debt: item.rental_debt || 0,
    status: item.status || 'draft'
  }
}

const fetchContracts = async () => {
  loading.value = true
  try {
    const data = await rentalService.getRentals(filterStatus.value)
    contracts.value = data.map(mapToContract)
  } catch (error: any) {
    ElMessage.error(error.message || 'Lỗi khi tải danh sách hợp đồng')
  } finally {
    loading.value = false
  }
}

watch(filterStatus, () => {
  fetchContracts()
})

onMounted(() => {
  fetchContracts()
  fetchAllCustomers()
})
</script>

<style scoped>
.rental-container {
  height: 100%;
}

.rental-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

html.dark .rental-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}
html.dark .rental-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}
html.dark .rental-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}
html.dark .rental-container :deep(.el-table .el-table-fixed-column--left),
html.dark .rental-container :deep(.el-table .el-table-fixed-column--right) {
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
