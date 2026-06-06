<template>
  <div class="finance-container h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <transition name="fade-slide" mode="out-in">
      <FundList 
        v-if="currentView === 'list'" 
        :funds="fundsWithStats" 
        @select-fund="handleSelectFund" 
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FundList from './FundList.vue'
import FundDetail from './FundDetail.vue'

// Định nghĩa types
interface SubFund {
  id: string
  name: string
  initialCapital: number
  startDate: string
  endDate: string
  status: 'active' | 'suspended' | 'settled'
  icon: string
  color: string
}

interface Fund {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'active' | 'suspended' | 'settled'
  icon: string
  color: string
  bgColor: string
  subFunds: SubFund[]
}

interface Transaction {
  id: string
  fundId: string
  subFundId: string
  type: 'income' | 'expense'
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

// 1. Danh sách Quỹ cha (Mock Data gốc)
const funds = ref<Fund[]>([
  {
    id: 'fund-2025',
    name: 'Quỹ tài chính vận hành Tiến Nga 2025',
    startDate: '01/01/2025',
    endDate: '31/12/2025',
    status: 'settled',
    icon: 'Briefcase',
    color: '#64748b',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    subFunds: [
      { id: 'sub-2025-kt', name: 'Quỹ tiền mặt Kế toán', initialCapital: 300000000, startDate: '01/01/2025', endDate: '31/12/2025', status: 'settled', icon: 'Wallet', color: '#64748b' },
      { id: 'sub-2025-x', name: 'Quỹ tiền mặt tại xưởng', initialCapital: 200000000, startDate: '01/01/2025', endDate: '31/12/2025', status: 'settled', icon: 'Wallet', color: '#64748b' },
      { id: 'sub-2025-vcb', name: 'Quỹ Vietcombank', initialCapital: 500000000, startDate: '01/01/2025', endDate: '31/12/2025', status: 'settled', icon: 'CreditCard', color: '#64748b' },
      { id: 'sub-2025-ab', name: 'Quỹ An Bình Bank', initialCapital: 500000000, startDate: '01/01/2025', endDate: '31/12/2025', status: 'settled', icon: 'CreditCard', color: '#64748b' }
    ]
  },
  {
    id: 'fund-2026',
    name: 'Quỹ tài chính vận hành Tiến Nga 2026',
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    status: 'active',
    icon: 'Briefcase',
    color: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    subFunds: [
      { id: 'sub-2026-kt', name: 'Quỹ tiền mặt Kế toán', initialCapital: 500000000, startDate: '01/01/2026', endDate: '31/12/2026', status: 'active', icon: 'Wallet', color: '#3b82f6' },
      { id: 'sub-2026-x', name: 'Quỹ tiền mặt tại xưởng', initialCapital: 500000000, startDate: '01/01/2026', endDate: '31/12/2026', status: 'active', icon: 'Wallet', color: '#10b981' },
      { id: 'sub-2026-vcb', name: 'Quỹ Vietcombank', initialCapital: 1000000000, startDate: '01/01/2026', endDate: '31/12/2026', status: 'active', icon: 'CreditCard', color: '#8b5cf6' },
      { id: 'sub-2026-ab', name: 'Quỹ An Bình Bank', initialCapital: 1000000000, startDate: '01/01/2026', endDate: '31/12/2026', status: 'active', icon: 'CreditCard', color: '#f59e0b' }
    ]
  }
])

// 2. Danh sách các giao dịch (Mock Data) với các trường thông tin đầy đủ
const transactions = ref<Transaction[]>([
  // Quỹ 2025 (Đã tất toán)
  { 
    id: 'tx-25-1', 
    fundId: 'fund-2025', 
    subFundId: 'sub-2025-vcb', 
    type: 'income', 
    requestingParty: 'Ban Giám Đốc',
    executingParty: 'Công ty Cao Su VN',
    receivingParty: 'Quỹ Vietcombank',
    purpose: 'Tất toán năm',
    reason: 'Tất toán tiền hàng mủ ly tâm năm 2025',
    amount: 800000000, 
    status: 'approved',
    note: 'Đã hoàn thành thủ tục tất toán',
    date: '2025-12-20' 
  },
  { 
    id: 'tx-25-2', 
    fundId: 'fund-2025', 
    subFundId: 'sub-2025-vcb', 
    type: 'expense', 
    requestingParty: 'Phòng Vật Tư',
    executingParty: 'Thủ quỹ Tiến Nga',
    receivingParty: 'Hộ dân thu mua',
    purpose: 'Chi mua nguyên liệu',
    reason: 'Chi trả tiền mủ nước cuối năm',
    amount: 500000000, 
    status: 'approved',
    note: 'Chứng từ đính kèm đầy đủ',
    date: '2025-12-25' 
  },
  
  // Quỹ 2026 (Đang hoạt động)
  // Quỹ Kế toán
  { 
    id: 'tx-1', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-kt', 
    type: 'income', 
    requestingParty: 'Phòng Kinh Doanh',
    executingParty: 'Nguyễn Văn A',
    receivingParty: 'Thủ quỹ Kế toán',
    purpose: 'Thu hồi công nợ',
    reason: 'Thu tiền bán mủ cao su thô từ đối tác Gia An',
    amount: 150000000, 
    status: 'approved',
    note: 'Biên nhận số 102',
    date: '2026-06-01' 
  },
  { 
    id: 'tx-2', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-kt', 
    type: 'expense', 
    requestingParty: 'Phòng Nhân Sự',
    executingParty: 'Trần Thị B',
    receivingParty: 'Công nhân xưởng',
    purpose: 'Chi trả lương',
    reason: 'Thanh toán lương tuần cho công nhân xưởng',
    amount: 85000000, 
    status: 'approved',
    note: 'Bảng ký nhận lương tuần 1 tháng 6',
    date: '2026-06-02' 
  },
  
  // Quỹ Tại xưởng
  { 
    id: 'tx-3', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-x', 
    type: 'expense', 
    requestingParty: 'Đội Vận Tải',
    executingParty: 'Lê Văn C',
    receivingParty: 'Cửa hàng xăng dầu Số 5',
    purpose: 'Chi mua xăng dầu',
    reason: 'Chi tiền mua dầu chạy máy phát điện',
    amount: 20000000, 
    status: 'approved',
    note: 'Hóa đơn đỏ số 00234',
    date: '2026-06-03' 
  },
  { 
    id: 'tx-4', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-x', 
    type: 'income', 
    requestingParty: 'Quản lý xưởng',
    executingParty: 'Phạm Văn D',
    receivingParty: 'Thủ quỹ xưởng',
    purpose: 'Thanh lý phế liệu',
    reason: 'Bán phế liệu xưởng sản xuất',
    amount: 50000000, 
    status: 'approved',
    note: 'Đã nộp quỹ xưởng',
    date: '2026-06-04' 
  },

  // Quỹ Vietcombank
  { 
    id: 'tx-5', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-vcb', 
    type: 'income', 
    requestingParty: 'Phòng Kế Hoạch',
    executingParty: 'Công ty Rubber VN',
    receivingParty: 'Vietcombank Tiến Nga',
    purpose: 'Thanh toán mủ ly tâm',
    reason: 'Thanh toán tiền hàng mủ ly tâm xuất khẩu',
    amount: 450000000, 
    status: 'approved',
    note: 'Đã đối soát báo có',
    date: '2026-06-01' 
  },
  { 
    id: 'tx-6', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-vcb', 
    type: 'expense', 
    requestingParty: 'Phòng Vật Tư',
    executingParty: 'Kế toán ngân hàng',
    receivingParty: 'Hộ dân thu mua',
    purpose: 'Chi mua nguyên liệu',
    reason: 'Chuyển khoản thanh toán tiền mủ nước đợt 1 tháng 6',
    amount: 200000000, 
    status: 'approved',
    note: 'Ủy nhiệm chi số 889',
    date: '2026-06-03' 
  },
  { 
    id: 'tx-7', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-vcb', 
    type: 'expense', 
    requestingParty: 'Phòng Hành Chính',
    executingParty: 'Kế toán thanh toán',
    receivingParty: 'Điện lực Đức Linh',
    purpose: 'Thanh toán tiền điện',
    reason: 'Thanh toán tiền điện sản xuất tháng 5',
    amount: 15000000, 
    status: 'unapproved',
    note: 'Chờ duyệt phê duyệt số ngân hàng',
    date: '2026-06-04' 
  },

  // Quỹ An Bình Bank
  { 
    id: 'tx-8', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-ab', 
    type: 'income', 
    requestingParty: 'Ban Giám Đốc',
    executingParty: 'Cổ đông Tiến',
    receivingParty: 'An Bình Bank Tiến Nga',
    purpose: 'Góp vốn đợt bổ sung',
    reason: 'Góp vốn đợt bổ sung mua thiết bị máy băm mủ',
    amount: 200000000, 
    status: 'approved',
    note: 'Đã hoàn tất thủ tục góp vốn',
    date: '2026-06-02' 
  },
  { 
    id: 'tx-9', 
    fundId: 'fund-2026', 
    subFundId: 'sub-2026-ab', 
    type: 'expense', 
    requestingParty: 'Phòng Kỹ Thuật',
    executingParty: 'Thủ quỹ ngân hàng',
    receivingParty: 'Nhà cung cấp cơ khí',
    purpose: 'Mua sắm tài sản cố định',
    reason: 'Đặt cọc mua máy băm cao su mới',
    amount: 120000000, 
    status: 'approved',
    note: 'Hợp đồng mua bán số 02-TC',
    date: '2026-06-04' 
  }
])

// Trạng thái điều hướng
const currentView = ref<'list' | 'detail'>('list')
const selectedFundId = ref<string | null>(null)

// Computed để lấy thông tin quỹ chi tiết kèm số liệu thu chi tính toán trực tiếp
const fundsWithStats = computed(() => {
  return funds.value.map(fund => {
    // 1. Tính toán số liệu cho từng quỹ con
    const subFundsWithStats = fund.subFunds.map(sub => {
      const subTxs = transactions.value.filter(t => t.fundId === fund.id && t.subFundId === sub.id)
      const totalRevenue = subTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpense = subTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const profit = totalRevenue - totalExpense

      return {
        ...sub,
        totalRevenue,
        totalExpense,
        profit
      }
    })

    // 2. Tính toán tổng của Quỹ cha dựa trên các quỹ con
    const initialCapital = subFundsWithStats.reduce((sum, sub) => sum + sub.initialCapital, 0)
    const totalRevenue = subFundsWithStats.reduce((sum, sub) => sum + sub.totalRevenue, 0)
    const totalExpense = subFundsWithStats.reduce((sum, sub) => sum + sub.totalExpense, 0)
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
const handleSelectFund = (fundId: string) => {
  selectedFundId.value = fundId
  currentView.value = 'detail'
}

const handleBack = () => {
  currentView.value = 'list'
  selectedFundId.value = null
}

// Thêm giao dịch mới
const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'fundId'>) => {
  if (!selectedFundId.value) return

  const tx: Transaction = {
    ...newTx,
    id: `tx-${Date.now()}`,
    fundId: selectedFundId.value
  }

  transactions.value.unshift(tx)
}

// Xóa giao dịch
const handleDeleteTransaction = (txId: string) => {
  const txIndex = transactions.value.findIndex(t => t.id === txId)
  if (txIndex !== -1) {
    transactions.value.splice(txIndex, 1)
  }
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
