<template>
  <div class="product-wh-container h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <transition name="fade-slide" mode="out-in">
      <ProductWarehouseList 
        v-if="currentView === 'list'" 
        :warehouses="warehouses" 
        @select-warehouse="handleSelectWarehouse" 
      />
      <ProductWarehouseDetail 
        v-else-if="currentView === 'detail' && selectedWarehouse" 
        :warehouse="selectedWarehouse!" 
        :transactions="getTransactionsForSelected"
        @back="handleBack" 
        @add-transaction="handleAddTransaction"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProductWarehouseList from './ProductWarehouseList.vue'
import ProductWarehouseDetail from './ProductWarehouseDetail.vue'

// Types
export interface ProductWarehouse {
  id: string
  name: string
  address: string
  capacity: string
  currentQty: number
  icon: string
  color: string
}

export interface ProductTransaction {
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

// Mock Warehouses
const warehouses = ref<ProductWarehouse[]>([
  {
    id: 'pwh-lactanh',
    name: 'Kho Thành phẩm Lạc Tánh',
    address: 'Khu công nghiệp Lạc Tánh, Bình Thuận',
    capacity: '200.000 kg',
    currentQty: 125000,
    icon: 'Box',
    color: '#8b5cf6'
  },
  {
    id: 'pwh-phe',
    name: 'Kho Thành phẩm Phê',
    address: 'Khu vực Phê, Đức Linh, Bình Thuận',
    capacity: '150.000 kg',
    currentQty: 87000,
    icon: 'Box',
    color: '#06b6d4'
  },
  {
    id: 'pwh-duclinh',
    name: 'Kho Thành phẩm Đức Linh',
    address: 'Thị trấn Đức Linh, Bình Thuận',
    capacity: '180.000 kg',
    currentQty: 142000,
    icon: 'Box',
    color: '#f59e0b'
  },
  {
    id: 'pwh-tanhlinh',
    name: 'Kho Thành phẩm Tánh Linh',
    address: 'Huyện Tánh Linh, Bình Thuận',
    capacity: '120.000 kg',
    currentQty: 56000,
    icon: 'Box',
    color: '#10b981'
  }
])

// Mock Transactions
const transactions = ref<ProductTransaction[]>([
  // Kho Lạc Tánh
  { id: 'pt-1', warehouseId: 'pwh-lactanh', date: '2026-06-01', customerCode: 'KH001', customerName: 'Công ty TNHH Hòa Phát', transactionType: 'export', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Lạc Tánh', quantity: 5000, unitPrice: 35000, totalAmount: 175000000, debt: 50000000, productCode: 'TP-LT-001' },
  { id: 'pt-2', warehouseId: 'pwh-lactanh', date: '2026-06-02', customerCode: 'KH002', customerName: 'Công ty CP Đại Việt', transactionType: 'import', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Lạc Tánh', quantity: 8000, unitPrice: 32000, totalAmount: 256000000, debt: 0, productCode: 'TP-LT-002' },
  { id: 'pt-3', warehouseId: 'pwh-lactanh', date: '2026-06-03', customerCode: 'KH003', customerName: 'DNTN Minh Tâm', transactionType: 'export', material: 'Phế phẩm Mủ', warehouseName: 'Kho Thành phẩm Lạc Tánh', quantity: 2000, unitPrice: 15000, totalAmount: 30000000, debt: 10000000, productCode: 'PP-LT-001' },
  { id: 'pt-4', warehouseId: 'pwh-lactanh', date: '2026-06-04', customerCode: 'KH004', customerName: 'Công ty TNHH Thành Đạt', transactionType: 'export', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Lạc Tánh', quantity: 3500, unitPrice: 35000, totalAmount: 122500000, debt: 30000000, productCode: 'TP-LT-003' },

  // Kho Phê
  { id: 'pt-5', warehouseId: 'pwh-phe', date: '2026-06-01', customerCode: 'KH005', customerName: 'Công ty CP Phú Thịnh', transactionType: 'import', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Phê', quantity: 10000, unitPrice: 32000, totalAmount: 320000000, debt: 0, productCode: 'TP-PH-001' },
  { id: 'pt-6', warehouseId: 'pwh-phe', date: '2026-06-02', customerCode: 'KH006', customerName: 'DNTN Quang Huy', transactionType: 'export', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Phê', quantity: 4500, unitPrice: 35000, totalAmount: 157500000, debt: 40000000, productCode: 'TP-PH-002' },
  { id: 'pt-7', warehouseId: 'pwh-phe', date: '2026-06-04', customerCode: 'KH007', customerName: 'Công ty TNHH An Khang', transactionType: 'export', material: 'Phế phẩm Mủ', warehouseName: 'Kho Thành phẩm Phê', quantity: 1500, unitPrice: 15000, totalAmount: 22500000, debt: 5000000, productCode: 'PP-PH-001' },

  // Kho Đức Linh
  { id: 'pt-8', warehouseId: 'pwh-duclinh', date: '2026-06-01', customerCode: 'KH008', customerName: 'Công ty CP Việt Tiến', transactionType: 'import', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Đức Linh', quantity: 12000, unitPrice: 32000, totalAmount: 384000000, debt: 0, productCode: 'TP-DL-001' },
  { id: 'pt-9', warehouseId: 'pwh-duclinh', date: '2026-06-03', customerCode: 'KH009', customerName: 'DNTN Thanh Bình', transactionType: 'export', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Đức Linh', quantity: 6000, unitPrice: 35000, totalAmount: 210000000, debt: 60000000, productCode: 'TP-DL-002' },
  { id: 'pt-10', warehouseId: 'pwh-duclinh', date: '2026-06-05', customerCode: 'KH010', customerName: 'Công ty TNHH Hoàng Long', transactionType: 'export', material: 'Phế phẩm Mủ', warehouseName: 'Kho Thành phẩm Đức Linh', quantity: 3000, unitPrice: 15000, totalAmount: 45000000, debt: 15000000, productCode: 'PP-DL-001' },

  // Kho Tánh Linh
  { id: 'pt-11', warehouseId: 'pwh-tanhlinh', date: '2026-06-02', customerCode: 'KH011', customerName: 'Công ty CP Nam Á', transactionType: 'import', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Tánh Linh', quantity: 7000, unitPrice: 32000, totalAmount: 224000000, debt: 0, productCode: 'TP-TL-001' },
  { id: 'pt-12', warehouseId: 'pwh-tanhlinh', date: '2026-06-04', customerCode: 'KH012', customerName: 'DNTN Phước Lộc', transactionType: 'export', material: 'Thành phẩm mủ', warehouseName: 'Kho Thành phẩm Tánh Linh', quantity: 3000, unitPrice: 35000, totalAmount: 105000000, debt: 25000000, productCode: 'TP-TL-002' },
])

// Navigation
const currentView = ref<'list' | 'detail'>('list')
const selectedWarehouseId = ref<string | null>(null)

const selectedWarehouse = computed(() => {
  return warehouses.value.find(w => w.id === selectedWarehouseId.value) || null
})

const getTransactionsForSelected = computed(() => {
  if (!selectedWarehouseId.value) return []
  return transactions.value.filter(t => t.warehouseId === selectedWarehouseId.value)
})

const handleSelectWarehouse = (id: string) => {
  selectedWarehouseId.value = id
  currentView.value = 'detail'
}

const handleBack = () => {
  currentView.value = 'list'
  selectedWarehouseId.value = null
}

const handleAddTransaction = (newTx: Omit<ProductTransaction, 'id' | 'warehouseId'>) => {
  if (!selectedWarehouseId.value) return
  const tx: ProductTransaction = {
    ...newTx,
    id: `pt-${Date.now()}`,
    warehouseId: selectedWarehouseId.value
  }
  transactions.value.unshift(tx)
}
</script>

<style scoped>
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
