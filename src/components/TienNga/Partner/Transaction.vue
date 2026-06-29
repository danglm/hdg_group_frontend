<template>
  <div class="transaction-container h-full flex flex-col">
    <!-- Filter bar -->
    <div class="flex flex-wrap justify-between items-center gap-x-4 gap-y-4 mb-4 shrink-0">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-4">
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

        <div class="flex items-center gap-2">
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
      <el-table :data="tableData" style="width: 100%" class="flex-1" height="100%" v-loading="loading">
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
            <el-tag :type="scope.row.productType === 'Mủ nước' ? 'info' : 'success'" effect="light" round>
              {{ scope.row.productType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualWeight" label="KL thực tế" width="130" align="right">
          <template #default="scope">
            <span class="font-medium text-blue-500">{{ formatNumber(scope.row.actualWeight, 2) }} kg</span>
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

    <!-- Modal Thêm Giao dịch -->
    <el-dialog
      v-model="dialogVisible"
      title="THÊM GIAO DỊCH"
      class="custom-dark-dialog"
      width="900px"
      destroy-on-close
      align-center
    >
      <div class="max-h-[65vh] overflow-y-auto overflow-x-hidden px-2">
        <el-form :model="transactionForm" label-width="180px" class="mt-2 compact-form">
          <!-- PHẦN 1: THÔNG TIN CHUNG -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Thông tin chung
            </h4>
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
                <el-form-item label="Mã Đối tác" required>
                  <el-input v-model="transactionForm.partnerCode" placeholder="Nhập mã đối tác..." />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tên Đối tác">
                  <el-input v-model="transactionForm.partnerName" placeholder="Tên đối tác..." disabled />
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
          </div>

          <!-- PHẦN 2: CHI TIẾT MẶT HÀNG -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-green-500 rounded-full"></span>
              Chi tiết mặt hàng
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mã hàng">
                  <el-input v-model="transactionForm.productCode" placeholder="Nhập mã hàng..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Loại hàng">
                  <el-select v-model="transactionForm.productType" placeholder="Chọn loại hàng" class="w-full highlight-select" style="width: 100%">
                    <el-option label="Mủ nước" value="Mủ nước" />
                    <el-option label="Mủ thành phẩm" value="Mủ thành phẩm" />
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
            </el-row>
          </div>

          <!-- PHẦN 3: KHỐI LƯỢNG & CHẤT LƯỢNG -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-violet-655 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              Khối lượng &amp; Chất lượng
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="KL thực tế">
                  <el-input v-model="transactionForm.actualWeight" placeholder="Nhập KL thực tế (kg)..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Số độ">
                  <el-input v-model="transactionForm.drc" placeholder="Nhập số độ..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="KL mủ khô">
                  <el-input v-model="transactionForm.dryRubber" placeholder="KL mủ khô (kg)..." disabled />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PHẦN 4: ĐƠN GIÁ & THÀNH TIỀN -->
          <div class="mb-2">
            <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-rose-500 rounded-full"></span>
              Đơn giá &amp; Thành tiền
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Đơn giá">
                  <el-input 
                    v-model="transactionForm.unitPrice" 
                    placeholder="Nhập đơn giá..."
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Thành tiền">
                  <el-input 
                    v-model="transactionForm.totalAmount" 
                    placeholder="Thành tiền..." 
                    disabled 
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="Ghi chú">
                  <el-input v-model="transactionForm.notes" type="textarea" :rows="2" placeholder="Nhập ghi chú..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
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
      width="900px"
      destroy-on-close
      align-center
    >
      <div class="max-h-[65vh] overflow-y-auto overflow-x-hidden px-2">
        <el-form :model="editForm" label-width="180px" class="mt-2 compact-form">
          <!-- PHẦN 1: THÔNG TIN CHUNG -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Thông tin chung
            </h4>
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
                  <el-input v-model="editForm.partnerName" placeholder="Tên đối tác..." disabled />
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
          </div>

          <!-- PHẦN 2: CHI TIẾT MẶT HÀNG -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-green-500 rounded-full"></span>
              Chi tiết mặt hàng
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mã hàng">
                  <el-input v-model="editForm.productCode" placeholder="Nhập mã hàng..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Loại hàng">
                  <el-select v-model="editForm.productType" placeholder="Chọn loại hàng" class="w-full highlight-select" style="width: 100%">
                    <el-option label="Mủ nước" value="Mủ nước" />
                    <el-option label="Mủ thành phẩm" value="Mủ thành phẩm" />
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
            </el-row>
          </div>

          <!-- PHẦN 3: KHỐI LƯỢNG & CHẤT LƯỢNG -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-violet-655 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              Khối lượng &amp; Chất lượng
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="KL thực tế">
                  <el-input v-model="editForm.actualWeight" placeholder="Nhập KL thực tế (kg)..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Số độ">
                  <el-input v-model="editForm.drc" placeholder="Nhập số độ..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="KL mủ khô">
                  <el-input v-model="editForm.dryRubber" placeholder="KL mủ khô (kg)..." disabled />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PHẦN 4: ĐƠN GIÁ & THÀNH TIỀN -->
          <div class="mb-2">
            <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-rose-500 rounded-full"></span>
              Đơn giá &amp; Thành tiền
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Đơn giá">
                  <el-input 
                    v-model="editForm.unitPrice" 
                    placeholder="Nhập đơn giá..."
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Thành tiền">
                  <el-input 
                    v-model="editForm.totalAmount" 
                    placeholder="Thành tiền..." 
                    disabled 
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="Ghi chú">
                  <el-input v-model="editForm.notes" type="textarea" :rows="2" placeholder="Nhập ghi chú..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
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
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { MoreFilled, Search } from '@element-plus/icons-vue'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { tienNgaService } from '@/api/tienNgaService'

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
  drc: '',
  notes: ''
})

const partnersList = ref<any[]>([])

const fetchPartners = async () => {
  try {
    const data = await tienNgaService.getPartners()
    partnersList.value = data
  } catch (error: any) {
    console.error('Không thể tải danh sách đối tác:', error)
  }
}

watch(() => transactionForm.partnerCode, (newCode) => {
  if (!newCode) {
    transactionForm.partnerName = ''
    return
  }
  const matchedPartner = partnersList.value.find(
    p => p.partner_id?.toLowerCase() === newCode.trim().toLowerCase()
  )
  if (matchedPartner) {
    transactionForm.partnerName = matchedPartner.partner_name
  } else {
    transactionForm.partnerName = ''
  }
})

watch(
  () => [transactionForm.actualWeight, transactionForm.drc, transactionForm.unitPrice],
  ([weight, drc, price]) => {
    const w = parseFloatInput(weight)
    const d = parseFloatInput(drc)
    const p = parseFloatInput(price)
    
    const dry = parseFloat((w * d / 100).toFixed(2))
    transactionForm.dryRubber = dry > 0 ? String(dry) : ''
    
    const total = parseFloat((dry * p).toFixed(2))
    transactionForm.totalAmount = total > 0 ? String(total) : ''
  }
)

const loading = ref(false)

const fetchPartnerBusinesses = async () => {
  loading.value = true
  try {
    const data = await tienNgaService.getPartnerBusinesses()
    allData.value = data.map(item => ({
      id: item.id || Math.random().toString(36).substring(2, 9),
      date: item.day || '',
      partnerCode: item.partner_id || '',
      partnerName: item.partner_name || 'Chưa rõ',
      importQty: item.import_amount || 0,
      exportQty: item.export_amount || 0,
      productCode: item.order_code || '',
      unitPrice: item.unit_price || 0,
      totalAmount: item.total_amount || 0,
      productType: item.product_type || 'Mủ nước',
      actualWeight: item.actual_weight || 0,
      dryRubber: item.dry_rubber || 0,
      drc: item.degree || 0,
      notes: item.notes || ''
    }))
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể tải danh sách giao dịch đối tác')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPartnerBusinesses()
  fetchPartners()
})

const submitForm = async () => {
  if (!transactionForm.partnerCode) {
    ElMessage.warning('Vui lòng nhập Mã đối tác')
    return
  }
  
  loading.value = true
  try {
    const payload = [{
      day: transactionForm.date || new Date().toISOString().split('T')[0],
      partner_id: transactionForm.partnerCode,
      import_amount: transactionForm.transactionType === 'Nhập' ? parseFloat(parseFloatInput(transactionForm.quantity).toFixed(2)) : 0,
      export_amount: transactionForm.transactionType === 'Xuất' ? parseFloat(parseFloatInput(transactionForm.quantity).toFixed(2)) : 0,
      order_code: transactionForm.productCode || '',
      unit_price: parseFloat(parseFloatInput(transactionForm.unitPrice).toFixed(2)),
      total_amount: parseFloat(parseFloatInput(transactionForm.totalAmount).toFixed(2)),
      notes: transactionForm.notes || '',
      product_type: transactionForm.productType || 'Mủ nước',
      actual_weight: parseFloat(parseFloatInput(transactionForm.actualWeight).toFixed(2)),
      dry_rubber: parseFloat(parseFloatInput(transactionForm.dryRubber).toFixed(2)),
      degree: parseFloat(parseFloatInput(transactionForm.drc).toFixed(2))
    }]
    
    await tienNgaService.addPartnerBusinesses(payload)
    
    dialogVisible.value = false
    ElNotification({
      title: 'Thành công',
      message: 'Đã thêm Giao dịch mới thành công!',
      type: 'success',
    })
    
    // Reset form
    transactionForm.date = ''
    transactionForm.partnerCode = ''
    transactionForm.partnerName = ''
    transactionForm.transactionType = ''
    transactionForm.quantity = ''
    transactionForm.productCode = ''
    transactionForm.productType = ''
    transactionForm.unitPrice = ''
    transactionForm.totalAmount = ''
    transactionForm.actualWeight = ''
    transactionForm.dryRubber = ''
    transactionForm.drc = ''
    transactionForm.notes = ''
    
    // Refresh table
    await fetchPartnerBusinesses()
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể thêm giao dịch mới')
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
  drc: '',
  notes: ''
})

watch(
  () => [editForm.actualWeight, editForm.drc, editForm.unitPrice],
  ([weight, drc, price]) => {
    const w = parseFloatInput(weight)
    const d = parseFloatInput(drc)
    const p = parseFloatInput(price)
    
    const dry = parseFloat((w * d / 100).toFixed(2))
    editForm.dryRubber = dry > 0 ? String(dry) : ''
    
    const total = parseFloat((dry * p).toFixed(2))
    editForm.totalAmount = total > 0 ? String(total) : ''
  }
)

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
    editForm.notes = row.notes || ''
    editDialogVisible.value = true
  } else if (command === 'delete') {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa Giao dịch của đối tác "${row.partnerName}" vào ngày ${row.date} không?`,
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
          await tienNgaService.deletePartnerBusinesses([row.id])
          await fetchPartnerBusinesses()
          ElNotification({
            title: 'Thành công',
            message: 'Đã xóa Giao dịch thành công!',
            type: 'success',
          })
        } catch (error: any) {
          ElMessage.error(error.message || 'Không thể xóa Giao dịch')
        } finally {
          loading.value = false
        }
      })
      .catch(() => {})
  } else {
    console.log(`Action: ${command} on row:`, row)
  }
}

const submitEditForm = async () => {
  if (!editForm.partnerCode) {
    ElMessage.warning('Vui lòng nhập Mã đối tác')
    return
  }

  loading.value = true
  try {
    const payload = [{
      id: editingRow.value ? editingRow.value.id : undefined,
      day: editForm.date || new Date().toISOString().split('T')[0],
      partner_id: editForm.partnerCode,
      import_amount: editForm.transactionType === 'Nhập' ? parseFloat(parseFloatInput(editForm.quantity).toFixed(2)) : 0,
      export_amount: editForm.transactionType === 'Xuất' ? parseFloat(parseFloatInput(editForm.quantity).toFixed(2)) : 0,
      order_code: editForm.productCode || '',
      unit_price: parseFloat(parseFloatInput(editForm.unitPrice).toFixed(2)),
      total_amount: parseFloat(parseFloatInput(editForm.totalAmount).toFixed(2)),
      notes: editForm.notes || '',
      product_type: editForm.productType || 'Mủ nước',
      actual_weight: parseFloat(parseFloatInput(editForm.actualWeight).toFixed(2)),
      dry_rubber: parseFloat(parseFloatInput(editForm.dryRubber).toFixed(2)),
      degree: parseFloat(parseFloatInput(editForm.drc).toFixed(2))
    }]

    await tienNgaService.updatePartnerBusinesses(payload)

    editDialogVisible.value = false
    ElNotification({
      title: 'Thành công',
      message: 'Đã cập nhật thông tin Giao dịch thành công!',
      type: 'success',
    })

    await fetchPartnerBusinesses()
  } catch (error: any) {
    ElMessage.error(error.message || 'Không thể cập nhật giao dịch')
  } finally {
    loading.value = false
  }
}

const parseFloatInput = (val: string | number | null | undefined) => {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return val
  let str = String(val).trim()
  if (str.includes(',') && str.includes('.')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '')
    }
  }
  str = str.replace(/,/g, '.')
  return parseFloat(str) || 0
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
    const unitPrice = [28000, 30000, 32000, 35000][i % 4]!
    const totalAmount = dryRubber * unitPrice

    data.push({
      id: i,
      date: `2026-05-${String(i % 28 + 1).padStart(2, '0')}`,
      partnerCode: partner!.code,
      partnerName: partner!.name,
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

const allData = ref<any[]>([])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    // Filter by product type (Mủ nước / Mủ thành phẩm)
    if (selectedProduct.value !== 'all' && item.productType !== selectedProduct.value) {
      return false
    }
    // Filter by transaction type (Nhập / Xuất)
    if (selectedType.value !== 'all') {
      if (selectedType.value === 'Nhập' && item.importQty <= 0) {
        return false
      }
      if (selectedType.value === 'Xuất' && item.exportQty <= 0) {
        return false
      }
    }
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const partnerCodeMatch = item.partnerCode?.toLowerCase().includes(query)
      const partnerNameMatch = item.partnerName?.toLowerCase().includes(query)
      const productCodeMatch = item.productCode?.toLowerCase().includes(query)
      return partnerCodeMatch || partnerNameMatch || productCodeMatch
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
.transaction-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* Cho phân trang tự xuống dòng khi có nhiều trang */
.transaction-container :deep(.el-pagination) {
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
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
