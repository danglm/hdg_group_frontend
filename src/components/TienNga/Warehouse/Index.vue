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
        @refresh-purchases="handleRefreshPurchases"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import WarehouseList from './WarehouseList.vue'
import WarehouseDetail from './WarehouseDetail.vue'
import { tienNgaService } from '@/api/tienNgaService'

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
  customerCode?: string
  customerName: string
  material: string
  warehouseName: string
  trips: number
  weight: number
  unitPrice: number
  totalAmount: number
  advanceAmount: number
  debt: number
  notes?: string
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
  notes?: string
}


// Color palette for warehouse cards
const warehouseColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

// Warehouses - loaded from API
const warehouses = ref<Warehouse[]>([])

// Purchases - loaded from API when selecting a warehouse
const purchases = ref<PurchaseTransaction[]>([])

// Exports - loaded from API when selecting a warehouse
const exports = ref<ExportTransaction[]>([])

// Inject setLoading from parent
const setLoading = inject<(val: boolean) => void>('setLoading', () => {})

// Fetch inventories from API on mount
const fetchInventories = async () => {
  try {
    setLoading(true)
    const data = await tienNgaService.getInventories('!=Cao su')
    warehouses.value = data.map((item: any, index: number) => ({
      id: String(item.id || `wh-${index}`),
      name: item.storage_name || `Kho ${index + 1}`,
      material: item.material_name || '',
      address: item.storage_location || '',
      capacity: item.capacity ? `${new Intl.NumberFormat('vi-VN').format(item.capacity)} kg` : '0 kg',
      currentQty: item.quantity || 0,
      icon: 'Box',
      color: warehouseColors[index % warehouseColors.length] || '#ef4444'
    }))
  } catch (error) {
    console.error('Failed to fetch warehouse inventories:', error)
  } finally {
    setLoading(false)
  }
}

// Fetch material purchases from API by storage_name
const fetchMaterialPurchases = async (storageName: string, warehouseId: string) => {
  try {
    const data = await tienNgaService.getMaterialPurchases({ storage_name: storageName })
    purchases.value = data.map((item: any) => ({
      id: String(item.id),
      warehouseId: warehouseId,
      date: item.transaction_date || '',
      customerCode: item.customer_id || '',
      customerName: item.fullname || '',
      material: item.material_type || '',
      warehouseName: item.storage_name || '',
      trips: item.trip_count || 0,
      weight: item.weight || 0,
      unitPrice: item.unit_price || 0,
      totalAmount: item.total_amount || 0,
      advanceAmount: item.advance_payment || 0,
      debt: item.debt || 0,
      notes: item.notes || ''
    }))
  } catch (error) {
    console.error('Failed to fetch material purchases:', error)
  }
}

// Fetch inventory exports from API by storage_name
const fetchInventoryExports = async (storageName: string, warehouseId: string) => {
  try {
    const data = await tienNgaService.getInventoryExports({ storage_name: storageName })
    exports.value = data.map((item: any) => ({
      id: String(item.id),
      warehouseId: warehouseId,
      date: item.export_date || '',
      executor: item.performer_name || '',
      material: item.material_type || '',
      warehouseName: item.storage_name || '',
      exportWeight: item.export_weight || 0,
      remainingWeight: item.remaining_weight || 0,
      notes: item.notes || ''
    }))
  } catch (error) {
    console.error('Failed to fetch inventory exports:', error)
  }
}

onMounted(() => {
  fetchInventories()
})

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
const handleSelectWarehouse = async (id: string) => {
  selectedWarehouseId.value = id
  const wh = warehouses.value.find(w => w.id === id)
  if (wh) {
    setLoading(true)
    try {
      await Promise.all([
        fetchMaterialPurchases(wh.name, id),
        fetchInventoryExports(wh.name, id)
      ])
    } finally {
      setLoading(false)
    }
  }
  currentView.value = 'detail'
}

const handleBack = () => {
  currentView.value = 'list'
  selectedWarehouseId.value = null
  purchases.value = []
  exports.value = []
}

const handleRefreshPurchases = async () => {
  if (!selectedWarehouseId.value) return
  const wh = warehouses.value.find(w => w.id === selectedWarehouseId.value)
  if (wh) {
    await Promise.all([
      fetchMaterialPurchases(wh.name, selectedWarehouseId.value),
      fetchInventoryExports(wh.name, selectedWarehouseId.value),
      fetchInventories()
    ])
  }
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
