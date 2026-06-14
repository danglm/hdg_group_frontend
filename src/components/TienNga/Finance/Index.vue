<template>
  <div class="finance-container h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300" v-loading="loading">
    <transition name="fade-slide" mode="out-in">
      <FundList 
        v-if="currentView === 'list'" 
        :funds="fundsWithStats" 
        @select-fund="handleSelectFund" 
        @add-fund="openAddFundDialog"
      />
      <FundDetail 
        v-else-if="currentView === 'detail' && selectedFundDetail" 
        :fund="selectedFundDetail!" 
        :transactions="getTransactionsForSelectedFund"
        @back="handleBack" 
        @add-transaction="handleAddTransaction"
        @delete-transaction="handleDeleteTransaction"
      />
    </transition>

    <!-- ADD FUND DIALOG -->
    <el-dialog 
      v-model="addFundDialogVisible" 
      title="THÊM MỚI QUỸ TÀI CHÍNH" 
      width="600px" 
      destroy-on-close
      class="custom-dark-dialog"
    >
      <el-form 
        :model="fundFormModel" 
        :rules="fundFormRules" 
        ref="fundFormRef" 
        label-position="top"
        class="mt-4 px-2"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Vai trò" prop="role">
              <el-select v-model="fundFormModel.role" class="w-full highlight-select" style="width: 100%">
                <el-option label="Quỹ cha (Main)" value="MAIN" />
                <el-option label="Quỹ con (Member)" value="MEMBER" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="fundFormModel.role === 'MEMBER'">
            <el-form-item label="Quỹ cha" prop="parentId">
              <el-select v-model="fundFormModel.parentId" placeholder="Chọn Quỹ cha..." class="w-full highlight-select" style="width: 100%">
                <el-option 
                  v-for="parentFund in activeMainFunds" 
                  :key="parentFund.id" 
                  :label="parentFund.name" 
                  :value="parentFund.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã quỹ" prop="investmentCode">
              <el-input v-model="fundFormModel.investmentCode" placeholder="Nhập mã quỹ (vd: Q-2026)..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên quỹ" prop="name">
              <el-input v-model="fundFormModel.name" placeholder="Nhập tên quỹ..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Vốn ban đầu (VNĐ)" prop="initialCapital">
              <el-input 
                v-model="fundFormModel.initialCapitalText" 
                placeholder="Nhập số tiền vốn ban đầu..."
                @input="handleInitialCapitalInput"
                class="w-full"
              >
                <template #suffix>
                  <span class="text-xs text-gray-400">VNĐ</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tổng thu (VNĐ)" prop="totalRevenue">
              <el-input 
                v-model="fundFormModel.initialCapitalText" 
                disabled
                placeholder="Tự động bằng Vốn ban đầu"
                class="w-full"
              >
                <template #suffix>
                  <span class="text-xs text-gray-400">VNĐ</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Ngày bắt đầu" prop="startDate">
              <el-date-picker 
                v-model="fundFormModel.startDate" 
                type="date" 
                placeholder="Chọn ngày" 
                value-format="YYYY-MM-DD"
                class="w-full"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Ngày kết thúc" prop="endDate">
              <el-date-picker 
                v-model="fundFormModel.endDate" 
                type="date" 
                placeholder="Chọn ngày (nếu có)" 
                value-format="YYYY-MM-DD"
                class="w-full"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Trạng thái" prop="status">
              <el-select v-model="fundFormModel.status" class="w-full highlight-select" style="width: 100%">
                <el-option label="Đang hoạt động" value="ACTIVE" />
                <el-option label="Tạm ngưng" value="SUSPENDED" />
                <el-option label="Đã tất toán" value="SETTLED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Ghi chú" prop="notes">
          <el-input 
            v-model="fundFormModel.notes" 
            type="textarea" 
            :rows="3" 
            placeholder="Nhập ghi chú thêm..." 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 pr-2">
          <el-button @click="addFundDialogVisible = false">Hủy bỏ</el-button>
          <el-button type="primary" @click="submitAddFund">Lưu Quỹ</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import FundList from './FundList.vue'
import FundDetail from './FundDetail.vue'
import { ElMessage } from 'element-plus'
import { tienNgaService } from '@/api/tienNgaService'

// Định nghĩa types
interface SubFund {
  id: string
  investmentCode?: string
  name: string
  initialCapital: number
  startDate: string
  endDate: string
  status: 'active' | 'suspended' | 'settled'
  icon: string
  color: string
  totalRevenue?: number
  totalExpense?: number
  profit?: number
  notes?: string
}

interface Fund {
  id: string
  investmentCode?: string
  name: string
  initialCapital?: number
  startDate: string
  endDate: string
  totalRevenue?: number
  totalExpense?: number
  profit?: number
  status: 'active' | 'suspended' | 'settled'
  icon: string
  color: string
  bgColor: string
  subFunds: SubFund[]
  notes?: string
}

interface Transaction {
  id: string
  fundId: string
  subFundId: string
  type: 'thu' | 'chi'
  requestingParty: string
  executingParty: string
  receivingParty: string
  purpose: string
  reason: string
  amount: number
  status: 'approved' | 'unapproved'
  note: string
  date: string
}

const funds = ref<Fund[]>([])
const loading = ref(false)

const fetchInvestments = async () => {
  loading.value = true
  try {
    const mains = await tienNgaService.getInvestments({ role: 'main' })
    const members = await tienNgaService.getInvestments({ role: 'member' })

    const membersByParent: Record<string, any[]> = {}
    members.forEach(m => {
      const pId = m.parent_id
      if (pId) {
        if (!membersByParent[pId]) {
          membersByParent[pId] = []
        }
        membersByParent[pId].push(m)
      }
    })

    const getColors = (index: number) => {
      const colors = [
        { color: '#3b82f6', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
        { color: '#8b5cf6', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { color: '#10b981', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { color: '#f59e0b', bgColor: 'bg-amber-50 dark:bg-amber-900/20' }
      ]
      return colors[index % colors.length] || colors[0]!
    }

    const defaultIcons = ['Briefcase', 'Wallet', 'CreditCard', 'Lock']

    funds.value = mains.map((m, idx) => {
      const parentColorConfig = getColors(idx)
      const childFunds = (membersByParent[m.id] || []).map((c, cIdx) => {
        const childColorConfig = getColors(cIdx + 1)
        return {
          id: c.id,
          investmentCode: c.investment_code || '',
          name: c.name,
          initialCapital: c.initial_capital || 0,
          startDate: c.start_date || '',
          endDate: c.end_date || '',
          status: (c.status?.toLowerCase() === 'active' || c.status?.toLowerCase() === 'settled' || c.status?.toLowerCase() === 'suspended') ? c.status.toLowerCase() : 'active',
          icon: defaultIcons[(cIdx + 1) % defaultIcons.length] || 'Wallet',
          color: childColorConfig.color,
          totalRevenue: c.total_income || 0,
          totalExpense: c.total_expense || 0,
          profit: c.profit || 0,
          notes: c.notes || ''
        }
      })

      return {
        id: m.id,
        investmentCode: m.investment_code || '',
        name: m.name,
        initialCapital: m.initial_capital || 0,
        startDate: m.start_date || '',
        endDate: m.end_date || '',
        status: (m.status?.toLowerCase() === 'active' || m.status?.toLowerCase() === 'settled' || m.status?.toLowerCase() === 'suspended') ? m.status.toLowerCase() : 'active',
        icon: 'Briefcase',
        color: parentColorConfig.color,
        bgColor: parentColorConfig.bgColor,
        subFunds: childFunds,
        notes: m.notes || ''
      }
    })
  } catch (error: any) {
    console.error('Không thể tải dữ liệu đầu tư:', error)
    ElMessage.error(error.message || 'Không thể tải danh sách quỹ đầu tư')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInvestments()
})

// 2. Danh sách các giao dịch (Được fetch động từ backend)
const transactions = ref<Transaction[]>([])

// Trạng thái điều hướng
const currentView = ref<'list' | 'detail'>('list')
const selectedFundId = ref<string | null>(null)

// Computed để lấy thông tin quỹ chi tiết kèm số liệu thu chi tính toán trực tiếp
const fundsWithStats = computed(() => {
  return funds.value.map(fund => {
    // 1. Các quỹ con: luôn lấy số liệu từ DB (totalRevenue, totalExpense, profit đã được backend tính toán tổng hợp)
    const subFundsWithStats = fund.subFunds.map(sub => ({
      ...sub,
      totalRevenue: sub.totalRevenue || 0,
      totalExpense: sub.totalExpense || 0,
      profit: sub.profit || 0
    }))

    // 2. Tính toán tổng của Quỹ cha
    const initialCapital = fund.initialCapital || subFundsWithStats.reduce((sum, sub) => sum + sub.initialCapital, 0) || 0

    let totalRevenue: number
    let totalExpense: number

    if (subFundsWithStats.length > 0) {
      // Nếu có quỹ con: tổng hợp từ các quỹ con
      totalRevenue = subFundsWithStats.reduce((sum, sub) => sum + sub.totalRevenue, 0)
      totalExpense = subFundsWithStats.reduce((sum, sub) => sum + sub.totalExpense, 0)
    } else {
      // Nếu không có quỹ con: lấy trực tiếp từ DB
      totalRevenue = fund.totalRevenue || 0
      totalExpense = fund.totalExpense || 0
    }

    const profit = totalRevenue - totalExpense

    return {
      ...fund,
      initialCapital,
      totalRevenue,
      totalExpense,
      profit,
      subFunds: subFundsWithStats
    }
  })
})

const selectedFundDetail = computed(() => {
  return fundsWithStats.value.find(f => f.id === selectedFundId.value) || null
})

const getTransactionsForSelectedFund = computed(() => {
  if (!selectedFundId.value) return []
  return transactions.value.filter(t => t.fundId === selectedFundId.value)
})

// Các handlers điều hướng
const fetchTransactionsForFund = async (parentFundId: string) => {
  loading.value = true
  try {
    const parentFund = funds.value.find(f => f.id === parentFundId)
    if (!parentFund) return

    // ID lists: parentFund itself + all of its subfunds
    const targetIds = [parentFundId, ...parentFund.subFunds.map(sf => sf.id)]

    // Fetch payments in parallel
    const fetchPromises = targetIds.map(id =>
      tienNgaService.getDailyPayments({ investment_id: id })
    )

    const results = await Promise.all(fetchPromises)
    const rawPayments = results.flat()

    // Deduplicate by ID
    const seen = new Set()
    const uniquePayments = rawPayments.filter(p => {
      if (!p.id) return true
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    // Map raw payments to the Transaction interface
    transactions.value = uniquePayments.map(p => {
      let fundId = parentFundId
      let subFundId = ''

      if (p.investment_id === parentFundId) {
        fundId = parentFundId
      } else {
        const sub = parentFund.subFunds.find(sf => sf.id === p.investment_id)
        if (sub) {
          subFundId = sub.id
        } else {
          subFundId = p.investment_id || ''
        }
      }

      return {
        id: p.id || `tx-${Date.now()}-${Math.random()}`,
        fundId: fundId,
        subFundId: subFundId,
        type: p.payment_type?.toLowerCase() === 'thu' ? 'thu' : 'chi',
        requestingParty: p.requester || '',
        executingParty: p.executor || '',
        receivingParty: p.receiver || '',
        purpose: p.purpose || '',
        reason: p.reason || '',
        amount: p.amount || 0,
        status: p.status?.toLowerCase() === 'approved' ? 'approved' : 'unapproved',
        note: p.notes || '',
        date: p.day || ''
      }
    })
  } catch (error: any) {
    console.error('Lỗi khi tải giao dịch thu chi:', error)
    ElMessage.error(error.message || 'Không thể tải danh sách giao dịch thu chi')
  } finally {
    loading.value = false
  }
}

const handleSelectFund = async (fundId: string) => {
  selectedFundId.value = fundId
  currentView.value = 'detail'
  await fetchTransactionsForFund(fundId)
}

const handleBack = () => {
  currentView.value = 'list'
  selectedFundId.value = null
  // Xóa transactions để tránh dữ liệu cũ ảnh hưởng đến tính toán card ở màn hình list
  transactions.value = []
}

// Thêm giao dịch mới - refresh dữ liệu từ backend sau khi API thêm thành công
const handleAddTransaction = async () => {
  if (!selectedFundId.value) return

  // Refresh lại danh sách giao dịch từ backend
  await fetchTransactionsForFund(selectedFundId.value)
  
  // Refresh lại danh sách quỹ để cập nhật số liệu tổng hợp (totalRevenue, totalExpense...)
  await fetchInvestments()
}

// Xóa giao dịch - refresh dữ liệu từ backend sau khi API xóa thành công
const handleDeleteTransaction = async () => {
  if (!selectedFundId.value) return

  // Refresh lại danh sách giao dịch từ backend
  await fetchTransactionsForFund(selectedFundId.value)
  
  // Refresh lại danh sách quỹ để cập nhật số liệu tổng hợp
  await fetchInvestments()
}

// Thêm quỹ mới (MAIN)
const addFundDialogVisible = ref(false)
const fundFormRef = ref<any>(null)

const activeMainFunds = computed(() => {
  return funds.value.filter(f => f.status === 'active')
})

const fundFormModel = reactive({
  investmentCode: '',
  name: '',
  initialCapital: 0,
  initialCapitalText: '',
  startDate: new Date().toISOString().substring(0, 10),
  endDate: '',
  status: 'ACTIVE',
  notes: '',
  role: 'MAIN',
  parentId: ''
})

const fundFormRules = reactive({
  investmentCode: [{ required: true, message: 'Vui lòng nhập mã quỹ', trigger: 'blur' }],
  name: [{ required: true, message: 'Vui lòng nhập tên quỹ', trigger: 'blur' }],
  initialCapital: [{ required: true, message: 'Vui lòng nhập vốn ban đầu', trigger: 'blur' }],
  startDate: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'change' }],
  role: [{ required: true, message: 'Vui lòng chọn vai trò', trigger: 'change' }],
  parentId: [{
    validator: (rule: any, value: any, callback: any) => {
      if (fundFormModel.role === 'MEMBER' && !value) {
        callback(new Error('Vui lòng chọn Quỹ cha'))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }]
})

const handleInitialCapitalInput = (val: string) => {
  const numericVal = val.replace(/[^0-9]/g, '')
  const num = parseInt(numericVal, 10)
  if (!isNaN(num)) {
    fundFormModel.initialCapital = num
    fundFormModel.initialCapitalText = new Intl.NumberFormat('vi-VN').format(num)
  } else {
    fundFormModel.initialCapital = 0
    fundFormModel.initialCapitalText = ''
  }
}

const openAddFundDialog = () => {
  fundFormModel.investmentCode = ''
  fundFormModel.name = ''
  fundFormModel.initialCapital = 0
  fundFormModel.initialCapitalText = ''
  fundFormModel.startDate = new Date().toISOString().substring(0, 10)
  fundFormModel.endDate = ''
  fundFormModel.status = 'ACTIVE'
  fundFormModel.notes = ''
  fundFormModel.role = 'MAIN'
  fundFormModel.parentId = ''
  addFundDialogVisible.value = true
}

const updateParentFundStats = async (parentId: string) => {
  try {
    const parentFund = funds.value.find(f => f.id === parentId)
    if (!parentFund) return

    // Fetch all latest child funds for this parent from backend
    const members = await tienNgaService.getInvestments({ role: 'member', parent_id: parentId })

    // Recalculate parent fund totals based on actual children in db
    const initialCapital = members.reduce((sum, c) => sum + (c.initial_capital || 0), 0)
    const totalRevenue = members.reduce((sum, c) => sum + (c.total_income || 0), 0)
    const totalExpense = members.reduce((sum, c) => sum + (c.total_expense || 0), 0)
    const profit = totalRevenue - totalExpense

    const parentPayload = [{
      id: parentFund.id,
      investment_code: parentFund.investmentCode || '',
      name: parentFund.name,
      initial_capital: initialCapital,
      start_date: parentFund.startDate,
      end_date: parentFund.endDate || null,
      total_income: totalRevenue,
      total_expense: totalExpense,
      profit: profit,
      notes: parentFund.notes || '',
      status: parentFund.status ? parentFund.status.toUpperCase() : 'ACTIVE',
      parent_id: null,
      role: 'MAIN'
    }]

    await tienNgaService.updateInvestments(parentPayload)
  } catch (error) {
    console.error('Không thể tự động cập nhật số liệu Quỹ cha:', error)
  }
}

const submitAddFund = async () => {
  if (!fundFormRef.value) return
  await fundFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const payload = [{
          id: crypto.randomUUID(),
          investment_code: fundFormModel.investmentCode,
          name: fundFormModel.name,
          initial_capital: fundFormModel.initialCapital,
          start_date: fundFormModel.startDate,
          end_date: fundFormModel.endDate || null,
          total_income: fundFormModel.initialCapital,
          total_expense: 0,
          profit: fundFormModel.initialCapital,
          notes: fundFormModel.notes || '',
          status: fundFormModel.status,
          parent_id: fundFormModel.role === 'MEMBER' ? fundFormModel.parentId : null,
          role: fundFormModel.role
        }]

        await tienNgaService.addInvestments(payload)

        // If the added fund is a MEMBER and has parentId, update parent fund
        if (fundFormModel.role === 'MEMBER' && fundFormModel.parentId) {
          await updateParentFundStats(fundFormModel.parentId)
        }

        addFundDialogVisible.value = false
        
        ElMessage.success('Thêm Quỹ tài chính mới thành công!')
        
        // Refresh funds list
        await fetchInvestments()
      } catch (error: any) {
        console.error('Không thể thêm quỹ mới:', error)
        ElMessage.error(error.message || 'Không thể thêm quỹ tài chính mới')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* Chuyển động fade-slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
