<template>
  <div class="warehouse-container h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <transition name="fade-slide" mode="out-in">
      <WarehouseList 
        v-if="currentView === 'list'" 
        :warehouses="warehouses" 
        @select-warehouse="handleSelectWarehouse" 
      />
      <WarehouseDetail 
        v-else-if="currentView === 'detail' && selectedWarehouse" 
        :warehouse="selectedWarehouse!" 
        :purchases="getPurchasesForSelected"
        :exports="getExportsForSelected"
        @back="handleBack" 
        @add-purchase="handleAddPurchase"
        @add-export="handleAddExport"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WarehouseList from './WarehouseList.vue'
import WarehouseDetail from './WarehouseDetail.vue'

// Types
export interface Warehouse {
  id: string
  name: string
  material: string
  address: string
  capacity: string
  currentQty: number
  icon: string
  color: string
}

export interface PurchaseTransaction {
  id: string
  warehouseId: string
  date: string
  customerName: string
  material: string
  warehouseName: string
  trips: number
  weight: number
  unitPrice: number
  totalAmount: number
  advanceAmount: number
  debt: number
}

export interface ExportTransaction {
  id: string
  warehouseId: string
  date: string
  executor: string
  material: string
  warehouseName: string
  exportWeight: number
  remainingWeight: number
}

// Mock Warehouses
const warehouses = ref<Warehouse[]>([
  {
    id: 'wh-acid',
    name: 'Kho Acid Tiến Nga',
    material: 'Acid',
    address: 'Khu vực A - Xưởng sản xuất Tiến Nga',
    capacity: '50.000 kg',
    currentQty: 32500,
    icon: 'Box',
    color: '#ef4444'
  },
  {
    id: 'wh-amoniac',
    name: 'Kho Amoniac Tiến Nga',
    material: 'Amoniac',
    address: 'Khu vực B - Xưởng sản xuất Tiến Nga',
    capacity: '40.000 kg',
    currentQty: 18700,
    icon: 'Box',
    color: '#3b82f6'
  },
  {
    id: 'wh-cui',
    name: 'Kho Củi Tiến Nga',
    material: 'Củi',
    address: 'Khu vực C - Bãi chứa Tiến Nga',
    capacity: '100.000 kg',
    currentQty: 65000,
    icon: 'Box',
    color: '#f59e0b'
  },
  {
    id: 'wh-daucan',
    name: 'Kho Dầu ăn Tiến Nga',
    material: 'Dầu ăn',
    address: 'Khu vực D - Xưởng sản xuất Tiến Nga',
    capacity: '20.000 lít',
    currentQty: 8500,
    icon: 'Box',
    color: '#10b981'
  }
])

// Mock Purchases
const purchases = ref<PurchaseTransaction[]>([
  { id: 'p-1', warehouseId: 'wh-acid', date: '2026-06-01', customerName: 'Nguyễn Văn An', material: 'Acid', warehouseName: 'Kho Acid Tiến Nga', trips: 2, weight: 3200, unitPrice: 12000, totalAmount: 38400000, advanceAmount: 20000000, debt: 18400000 },
  { id: 'p-2', warehouseId: 'wh-acid', date: '2026-06-03', customerName: 'Trần Thị Bình', material: 'Acid', warehouseName: 'Kho Acid Tiến Nga', trips: 1, weight: 1500, unitPrice: 12000, totalAmount: 18000000, advanceAmount: 18000000, debt: 0 },
  { id: 'p-3', warehouseId: 'wh-amoniac', date: '2026-06-02', customerName: 'Lê Hữu Cường', material: 'Amoniac', warehouseName: 'Kho Amoniac Tiến Nga', trips: 3, weight: 4500, unitPrice: 8000, totalAmount: 36000000, advanceAmount: 15000000, debt: 21000000 },
  { id: 'p-4', warehouseId: 'wh-amoniac', date: '2026-06-04', customerName: 'Phạm Minh Dũng', material: 'Amoniac', warehouseName: 'Kho Amoniac Tiến Nga', trips: 1, weight: 2000, unitPrice: 8000, totalAmount: 16000000, advanceAmount: 10000000, debt: 6000000 },
  { id: 'p-5', warehouseId: 'wh-cui', date: '2026-06-01', customerName: 'Hoàng Đức Em', material: 'Củi', warehouseName: 'Kho Củi Tiến Nga', trips: 5, weight: 15000, unitPrice: 1500, totalAmount: 22500000, advanceAmount: 10000000, debt: 12500000 },
  { id: 'p-6', warehouseId: 'wh-cui', date: '2026-06-03', customerName: 'Huỳnh Ngọc Phong', material: 'Củi', warehouseName: 'Kho Củi Tiến Nga', trips: 3, weight: 8000, unitPrice: 1500, totalAmount: 12000000, advanceAmount: 12000000, debt: 0 },
  { id: 'p-7', warehouseId: 'wh-cui', date: '2026-06-05', customerName: 'Vũ Hải Hải', material: 'Củi', warehouseName: 'Kho Củi Tiến Nga', trips: 2, weight: 6000, unitPrice: 1500, totalAmount: 9000000, advanceAmount: 5000000, debt: 4000000 },
  { id: 'p-8', warehouseId: 'wh-daucan', date: '2026-06-02', customerName: 'Đặng Tuấn Khánh', material: 'Dầu ăn', warehouseName: 'Kho Dầu ăn Tiến Nga', trips: 1, weight: 2000, unitPrice: 25000, totalAmount: 50000000, advanceAmount: 30000000, debt: 20000000 },
  { id: 'p-9', warehouseId: 'wh-daucan', date: '2026-06-04', customerName: 'Phan Quang Giang', material: 'Dầu ăn', warehouseName: 'Kho Dầu ăn Tiến Nga', trips: 2, weight: 3500, unitPrice: 25000, totalAmount: 87500000, advanceAmount: 50000000, debt: 37500000 },
])

// Mock Exports
const exports = ref<ExportTransaction[]>([
  { id: 'e-1', warehouseId: 'wh-acid', date: '2026-06-02', executor: 'Lê Văn C', material: 'Acid', warehouseName: 'Kho Acid Tiến Nga', exportWeight: 500, remainingWeight: 32000 },
  { id: 'e-2', warehouseId: 'wh-acid', date: '2026-06-04', executor: 'Nguyễn Văn A', material: 'Acid', warehouseName: 'Kho Acid Tiến Nga', exportWeight: 800, remainingWeight: 31200 },
  { id: 'e-3', warehouseId: 'wh-amoniac', date: '2026-06-03', executor: 'Phạm Văn D', material: 'Amoniac', warehouseName: 'Kho Amoniac Tiến Nga', exportWeight: 1200, remainingWeight: 17500 },
  { id: 'e-4', warehouseId: 'wh-cui', date: '2026-06-02', executor: 'Trần Thị B', material: 'Củi', warehouseName: 'Kho Củi Tiến Nga', exportWeight: 5000, remainingWeight: 60000 },
  { id: 'e-5', warehouseId: 'wh-cui', date: '2026-06-05', executor: 'Hoàng Đức Em', material: 'Củi', warehouseName: 'Kho Củi Tiến Nga', exportWeight: 3000, remainingWeight: 57000 },
  { id: 'e-6', warehouseId: 'wh-daucan', date: '2026-06-03', executor: 'Đặng Tuấn Khánh', material: 'Dầu ăn', warehouseName: 'Kho Dầu ăn Tiến Nga', exportWeight: 1000, remainingWeight: 7500 },
])

// Navigation State
const currentView = ref<'list' | 'detail'>('list')
const selectedWarehouseId = ref<string | null>(null)

const selectedWarehouse = computed(() => {
  return warehouses.value.find(w => w.id === selectedWarehouseId.value) || null
})

const getPurchasesForSelected = computed(() => {
  if (!selectedWarehouseId.value) return []
  return purchases.value.filter(p => p.warehouseId === selectedWarehouseId.value)
})

const getExportsForSelected = computed(() => {
  if (!selectedWarehouseId.value) return []
  return exports.value.filter(e => e.warehouseId === selectedWarehouseId.value)
})

// Handlers
const handleSelectWarehouse = (id: string) => {
  selectedWarehouseId.value = id
  currentView.value = 'detail'
}

const handleBack = () => {
  currentView.value = 'list'
  selectedWarehouseId.value = null
}

const handleAddPurchase = (newTx: Omit<PurchaseTransaction, 'id' | 'warehouseId'>) => {
  if (!selectedWarehouseId.value) return
  const tx: PurchaseTransaction = {
    ...newTx,
    id: `p-${Date.now()}`,
    warehouseId: selectedWarehouseId.value
  }
  purchases.value.unshift(tx)
}

const handleAddExport = (newTx: Omit<ExportTransaction, 'id' | 'warehouseId'>) => {
  if (!selectedWarehouseId.value) return
  const tx: ExportTransaction = {
    ...newTx,
    id: `e-${Date.now()}`,
    warehouseId: selectedWarehouseId.value
  }
  exports.value.unshift(tx)
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
