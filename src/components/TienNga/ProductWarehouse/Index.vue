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
        @refresh-transactions="handleRefreshTransactions"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import ProductWarehouseList from './ProductWarehouseList.vue'
import ProductWarehouseDetail from './ProductWarehouseDetail.vue'
import { tienNgaService } from '@/api/tienNgaService'

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
  material: 'Cao su RSS3' | 'Phế phẩm Cao su'
  warehouseName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  debt: number
  productCode: string
  note?: string
}

// Color palette for product warehouse cards
const warehouseColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6']

// Warehouses - loaded from API
const warehouses = ref<ProductWarehouse[]>([])

// Transactions
const transactions = ref<ProductTransaction[]>([])

// Inject setLoading from parent
const setLoading = inject<(val: boolean) => void>('setLoading', () => {})

// Fetch inventories from API on mount
const fetchInventories = async () => {
  try {
    setLoading(true)
    const data = await tienNgaService.getInventories('Cao su')
    warehouses.value = data.map((item: any, index: number) => ({
      id: String(item.id || `pwh-${index}`),
      name: item.storage_name || `Kho Thành phẩm ${index + 1}`,
      address: item.storage_location || '',
      capacity: item.capacity ? `${new Intl.NumberFormat('vi-VN').format(item.capacity)} kg` : '0 kg',
      currentQty: item.quantity || 0,
      icon: 'Box',
      color: warehouseColors[index % warehouseColors.length] || '#8b5cf6'
    }))
  } catch (error) {
    console.error('Failed to fetch product warehouse inventories:', error)
  } finally {
    setLoading(false)
  }
}

// Fetch product transactions from API
const fetchProductTransactions = async (storageName: string, warehouseId: string) => {
  try {
    const data = await tienNgaService.getProductTransactions({ storage_name: storageName })
    transactions.value = data.map((item: any) => ({
      id: String(item.id),
      warehouseId: warehouseId,
      date: item.transaction_date || '',
      customerCode: item.customer_id || '',
      customerName: item.fullname || item.customer_id || 'Chưa rõ',
      transactionType: item.transaction_type || 'export',
      material: item.material_type || 'Cao su RSS3',
      warehouseName: item.storage_name || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || 0,
      totalAmount: item.total_amount || 0,
      debt: item.debt || 0,
      productCode: item.product_code || '',
      note: item.note || ''
    }))
  } catch (error) {
    console.error('Failed to fetch product transactions:', error)
  }
}

onMounted(() => {
  fetchInventories()
})

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

const handleSelectWarehouse = async (id: string) => {
  selectedWarehouseId.value = id
  const wh = warehouses.value.find(w => w.id === id)
  if (wh) {
    try {
      setLoading(true)
      await fetchProductTransactions(wh.name, id)
    } finally {
      setLoading(false)
    }
  }
  currentView.value = 'detail'
}

const handleBack = () => {
  currentView.value = 'list'
  selectedWarehouseId.value = null
  transactions.value = []
}

const handleRefreshTransactions = async () => {
  if (!selectedWarehouseId.value) return
  const wh = warehouses.value.find(w => w.id === selectedWarehouseId.value)
  if (wh) {
    try {
      setLoading(true)
      await Promise.all([
        fetchProductTransactions(wh.name, selectedWarehouseId.value),
        fetchInventories()
      ])
    } catch (error) {
      console.error('Failed to refresh product warehouse data:', error)
    } finally {
      setLoading(false)
    }
  }
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
