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
            <el-option 
              v-for="point in collectionPoints" 
              :key="point.id" 
              :label="point.collection_name" 
              :value="point.collection_name" 
            />
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
      <div class="flex items-center gap-2">
        <el-button :icon="Refresh" circle @click="fetchCustomers" :loading="loading" />
        <el-button type="primary" @click="dialogVisible = true">Thêm Hộ dân</el-button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="tableData" style="width: 100%" class="flex-1" height="100%" v-loading="loading">
        <!-- Fixed Columns -->
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="code" label="Mã Hộ dân" width="120" fixed />

        <!-- Scrollable Columns -->
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
            <el-form-item label="Mã Hộ dân" required>
              <el-input v-model="householdForm.code" placeholder="Nhập mã hộ dân..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Họ và tên" required>
              <el-input v-model="householdForm.name" placeholder="Nhập họ và tên..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Điểm thu mua" required>
              <el-select v-model="householdForm.purchasingPoint" placeholder="Chọn điểm thu mua" class="w-full highlight-select" style="width: 100%">
                <el-option 
                  v-for="point in collectionPoints" 
                  :key="point.id" 
                  :label="point.collection_name" 
                  :value="point.collection_name" 
                />
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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Nguyên liệu">
              <el-select v-model="householdForm.material" placeholder="Chọn nguyên liệu" class="w-full highlight-select" style="width: 100%">
                <el-option label="Cao su" value="Cao su" />
                <el-option label="Củi" value="Củi" />
                <el-option label="Acid" value="Acid" />
                <el-option label="Amoniac" value="Amoniac" />
                <el-option label="Dầu ăn" value="Dầu ăn" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Công nợ">
              <el-input v-model="householdForm.totalDebt" placeholder="Nhập công nợ..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Trợ giá">
              <el-input v-model="householdForm.is_subsidized" placeholder="Nhập số tiền trợ giá..." />
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
                <el-option 
                  v-for="point in collectionPoints" 
                  :key="point.id" 
                  :label="point.collection_name" 
                  :value="point.collection_name" 
                />
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
                <el-option label="Cao su" value="Cao su" />
                <el-option label="Củi" value="Củi" />
                <el-option label="Acid" value="Acid" />
                <el-option label="Amoniac" value="Amoniac" />
                <el-option label="Dầu ăn" value="Dầu ăn" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Công nợ">
              <el-input v-model="editForm.totalDebt" placeholder="Nhập công nợ..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Trợ giá">
              <el-input v-model="editForm.is_subsidized" placeholder="Nhập số tiền trợ giá..." />
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

    <!-- Modal Chi tiết Hộ dân -->
    <el-dialog
      v-model="detailDialogVisible"
      title="CHI TIẾT HỘ DÂN"
      class="custom-dark-dialog"
      width="60%"
    >
      <div v-if="detailData" class="detail-container px-2 py-4">
        <el-descriptions :column="2" border class="custom-descriptions">
          <el-descriptions-item label="Mã Hộ dân">
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{ detailData.code }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Họ và tên">
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{ detailData.name }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Điểm thu mua">
            {{ detailData.purchasingPoint }}
          </el-descriptions-item>
          <el-descriptions-item label="Nguyên liệu">
            <el-tag type="info" effect="light" round>
              {{ detailData.material || 'Cao su' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Số điện thoại">
            {{ detailData.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="Địa chỉ">
            {{ detailData.address }}
          </el-descriptions-item>
          <el-descriptions-item label="STK Ngân hàng">
            {{ detailData.bankAccount }}
          </el-descriptions-item>
          <el-descriptions-item label="Ngân hàng">
            {{ detailData.bankName }}
          </el-descriptions-item>
          <el-descriptions-item label="Trạng thái">
            <el-tag :type="detailData.status === 'Hoạt động' ? 'success' : 'danger'" effect="light" round>
              {{ detailData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Trợ giá">
            <span class="font-medium text-green-600">{{ formatCurrency(detailData.is_subsidized || 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Username">
            <span class="text-blue-500">{{ detailData.username }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Tên nhóm Telegram">
            {{ detailData.telegramGroup }}
          </el-descriptions-item>
          <el-descriptions-item label="Số tiền nợ">
            <span class="font-medium text-red-500">{{ formatCurrency(detailData.debtAmount || 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Ứng tiền">
            <span class="font-medium text-orange-500">{{ formatCurrency(detailData.advanceAmount || 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Công nợ" :span="2">
            <span class="font-bold text-gray-900 dark:text-white">{{ formatCurrency(detailData.totalDebt || 0) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">Đóng</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { MoreFilled, Search, Refresh } from '@element-plus/icons-vue'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { tienNgaService } from '@/api/tienNgaService'

const selectedFactory = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

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
  advanceAmount: '',
  material: 'Cao su',
  totalDebt: '',
  is_subsidized: ''
})

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const resetForm = () => {
  householdForm.code = ''
  householdForm.name = ''
  householdForm.purchasingPoint = ''
  householdForm.phone = ''
  householdForm.address = ''
  householdForm.bankAccount = ''
  householdForm.bankName = ''
  householdForm.status = 'Hoạt động'
  householdForm.username = ''
  householdForm.telegramGroup = ''
  householdForm.debtAmount = ''
  householdForm.advanceAmount = ''
  householdForm.material = 'Cao su'
  householdForm.totalDebt = ''
  householdForm.is_subsidized = ''
}

const submitForm = async () => {
  if (!householdForm.code) {
    ElMessage.warning('Vui lòng nhập Mã Hộ dân')
    return
  }
  if (!householdForm.name) {
    ElMessage.warning('Vui lòng nhập Họ và tên Hộ dân')
    return
  }
  if (!householdForm.purchasingPoint) {
    ElMessage.warning('Vui lòng chọn Điểm thu mua')
    return
  }

  loading.value = true
  try {
    const matchedPoint = collectionPoints.value.find(p => p.collection_name === householdForm.purchasingPoint)
    
    const customerId = generateUUID()
    const customerPayload = {
      id: customerId,
      fullname: householdForm.name,
      hoursehold_id: householdForm.code || `HD${String(allData.value.length + 1).padStart(3, '0')}`,
      collection_point_id: matchedPoint ? matchedPoint.id : null,
      number_phone: householdForm.phone || null,
      address: householdForm.address || null,
      ingredient: householdForm.material || 'Cao su',
      amount_of_debt: parseFloat(parseFloat(householdForm.debtAmount || '0').toFixed(2)),
      cash_advance: parseFloat(parseFloat(householdForm.advanceAmount || '0').toFixed(2)),
      total_debt: householdForm.totalDebt ? parseFloat(parseFloat(householdForm.totalDebt).toFixed(2)) : parseFloat((parseFloat(parseFloat(householdForm.debtAmount || '0').toFixed(2)) - parseFloat(parseFloat(householdForm.advanceAmount || '0').toFixed(2))).toFixed(2)),
      status: householdForm.status === 'Hoạt động' ? 'ACTIVE' : 'INACTIVE',
      username: householdForm.username || null,
      telegram_group: householdForm.telegramGroup || null,
      number_bank: householdForm.bankAccount || null,
      bank_name: householdForm.bankName || null,
      is_subsidized: parseFloat(parseFloat(householdForm.is_subsidized || '0').toFixed(2))
    }

    const response = await tienNgaService.addCustomers([customerPayload])
    
    if (response && response.length > 0) {
      const newCust = response[0]
      allData.value.unshift({
        id: newCust.id,
        code: newCust.hoursehold_id || newCust.id,
        name: newCust.fullname || 'Chưa rõ',
        purchasingPoint: newCust.collection_name || householdForm.purchasingPoint || 'Không rõ',
        phone: newCust.number_phone || 'Chưa có',
        address: newCust.address || 'Chưa có',
        bankAccount: newCust.number_bank || 'Chưa có',
        bankName: newCust.bank_name || 'Chưa có',
        status: newCust.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động',
        username: newCust.username ? (newCust.username.startsWith('@') ? newCust.username : `@${newCust.username}`) : 'Chưa có',
        telegramGroup: newCust.telegram_group || 'Chưa có',
        debtAmount: newCust.amount_of_debt || 0,
        advanceAmount: newCust.cash_advance || 0,
        totalDebt: newCust.total_debt || 0,
        material: newCust.ingredient || 'Cao su',
        is_subsidized: newCust.is_subsidized || 0
      })

      ElNotification({
        title: 'Thành công',
        message: 'Đã thêm Hộ dân mới thành công!',
        type: 'success',
      })
      
      resetForm()
      dialogVisible.value = false
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể thêm Hộ dân mới')
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

const editDialogVisible = ref(false)
const editingRow = ref<any>(null)
const detailDialogVisible = ref(false)
const detailData = ref<any>(null)
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
  totalDebt: '',
  is_subsidized: ''
})

const submitEditForm = async () => {
  if (!editForm.name) {
    ElMessage.warning('Vui lòng nhập Họ và tên Hộ dân')
    return
  }
  if (!editForm.purchasingPoint) {
    ElMessage.warning('Vui lòng chọn Điểm thu mua')
    return
  }

  loading.value = true
  try {
    const matchedPoint = collectionPoints.value.find(p => p.collection_name === editForm.purchasingPoint)
    
    const customerPayload = {
      id: editingRow.value?.id,
      fullname: editForm.name,
      hoursehold_id: editForm.code,
      collection_point_id: matchedPoint ? matchedPoint.id : null,
      number_phone: editForm.phone || null,
      address: editForm.address || null,
      ingredient: editForm.material || 'Cao su',
      amount_of_debt: parseFloat(parseFloat(editForm.debtAmount || '0').toFixed(2)),
      cash_advance: parseFloat(parseFloat(editForm.advanceAmount || '0').toFixed(2)),
      total_debt: editForm.totalDebt ? parseFloat(parseFloat(editForm.totalDebt).toFixed(2)) : parseFloat((parseFloat(parseFloat(editForm.debtAmount || '0').toFixed(2)) - parseFloat(parseFloat(editForm.advanceAmount || '0').toFixed(2))).toFixed(2)),
      status: editForm.status === 'Hoạt động' ? 'ACTIVE' : 'INACTIVE',
      username: editForm.username || null,
      telegram_group: editForm.telegramGroup || null,
      number_bank: editForm.bankAccount || null,
      bank_name: editForm.bankName || null,
      is_subsidized: parseFloat(parseFloat(editForm.is_subsidized || '0').toFixed(2))
    }

    const response = await tienNgaService.updateCustomers([customerPayload])
    
    if (response && response.length > 0 && editingRow.value) {
      const updatedCust = response[0]
      const row = editingRow.value
      row.name = updatedCust.fullname || editForm.name
      row.purchasingPoint = updatedCust.collection_name || editForm.purchasingPoint
      row.phone = updatedCust.number_phone || 'Chưa có'
      row.address = updatedCust.address || 'Chưa có'
      row.bankAccount = updatedCust.number_bank || 'Chưa có'
      row.bankName = updatedCust.bank_name || 'Chưa có'
      row.status = updatedCust.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'
      row.username = updatedCust.username ? (updatedCust.username.startsWith('@') ? updatedCust.username : `@${updatedCust.username}`) : 'Chưa có'
      row.telegramGroup = updatedCust.telegram_group || 'Chưa có'
      row.debtAmount = updatedCust.amount_of_debt || 0
      row.advanceAmount = updatedCust.cash_advance || 0
      row.totalDebt = updatedCust.total_debt || 0
      row.material = updatedCust.ingredient || 'Cao su'
      row.is_subsidized = updatedCust.is_subsidized || 0

      // Sync changes back to allData array for reactivity
      const index = allData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        allData.value[index] = { ...row }
      }

      ElNotification({
        title: 'Thành công',
        message: 'Đã cập nhật thông tin Hộ dân thành công!',
        type: 'success',
      })
      
      editDialogVisible.value = false
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể cập nhật thông tin Hộ dân')
  } finally {
    loading.value = false
  }
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
    editForm.is_subsidized = String(row.is_subsidized || 0)
    editDialogVisible.value = true
  } else if (command === 'delete') {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa Hộ dân "${row.name}" không?`,
      'Cảnh báo',
      {
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    )
      .then(async () => {
        loading.value = true
        try {
          await tienNgaService.deleteCustomers([row.id])
          const index = allData.value.findIndex(item => item.id === row.id)
          if (index !== -1) {
            allData.value.splice(index, 1)
            ElNotification({
              title: 'Thành công',
              message: 'Đã xóa Hộ dân thành công!',
              type: 'success',
            })
          }
        } catch (error: any) {
          ElMessage.error(error.message || 'Không thể xóa Hộ dân')
        } finally {
          loading.value = false
        }
      })
      .catch(() => {})
  } else if (command === 'detail') {
    detailData.value = row
    detailDialogVisible.value = true
  } else {
    console.log(`Action: ${command} on Code: ${row.code}`)
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const allData = ref<any[]>([])

const fetchCustomers = async () => {
  loading.value = true
  try {
    const customers = await tienNgaService.getCustomers('cao su')
    allData.value = customers.map(item => ({
      id: item.id,
      code: item.hoursehold_id || item.id,
      name: item.fullname || 'Chưa rõ',
      purchasingPoint: item.collection_name || 'Không rõ',
      phone: item.number_phone || 'Chưa có',
      address: item.address || 'Chưa có',
      bankAccount: item.number_bank || 'Chưa có',
      bankName: item.bank_name || 'Chưa có',
      status: item.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động',
      username: item.username ? (item.username.startsWith('@') ? item.username : `@${item.username}`) : 'Chưa có',
      telegramGroup: item.telegram_group || 'Chưa có',
      debtAmount: item.amount_of_debt || 0,
      advanceAmount: item.cash_advance || 0,
      totalDebt: item.total_debt || 0,
      material: item.ingredient || 'Cao su',
      is_subsidized: item.is_subsidized || 0
    }))
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể tải danh sách Hộ dân')
  } finally {
    loading.value = false
  }
}

const collectionPoints = ref<any[]>([])

const fetchCollectionPoints = async () => {
  try {
    const data = await tienNgaService.getCollectionPoints('Cao su')
    collectionPoints.value = data
  } catch (error: any) {
    console.error('Failed to fetch collection points:', error)
  }
}

onMounted(() => {
  fetchCustomers()
  fetchCollectionPoints()
})

const filteredData = computed(() => {
  return allData.value.filter(item => {
    // Filter by factory
    if (selectedFactory.value !== 'all' && item.purchasingPoint !== selectedFactory.value) {
      return false
    }
    // Filter by status
    if (selectedStatus.value !== 'all' && item.status !== selectedStatus.value) {
      return false
    }
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const codeMatch = item.code?.toLowerCase().includes(query)
      const nameMatch = item.name?.toLowerCase().includes(query)
      const phoneMatch = item.phone?.toLowerCase().includes(query)
      const addressMatch = item.address?.toLowerCase().includes(query)
      return codeMatch || nameMatch || phoneMatch || addressMatch
    }
    return true
  })
})

const total = computed(() => filteredData.value.length)

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
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

/* Descriptions styles for Detail Modal */
.custom-descriptions {
  margin-top: 10px;
}
.custom-descriptions .el-descriptions__label {
  font-weight: 600;
  color: #1e3a8a;
  background-color: #f8fafc;
}
html.dark .custom-descriptions .el-descriptions__label {
  background-color: #111827 !important;
  color: #60a5fa !important;
  border-color: #374151 !important;
}
html.dark .custom-descriptions .el-descriptions__content {
  background-color: #1f2937 !important;
  color: #f3f4f6 !important;
  border-color: #374151 !important;
}
html.dark .custom-descriptions .el-descriptions__table {
  border-color: #374151 !important;
}
</style>
