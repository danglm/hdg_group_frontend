<template>
  <div class="h-full bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto overflow-x-auto">
    <!-- Header của Panel 2 -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Thông tin tổng thể</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng hợp số liệu tiến độ của Tiến Nga</p>
      </div>
    </div>

    <!-- Khung lưới chứa 4 thẻ Card -->
    <div class="grid grid-cols-4 gap-4 min-w-[1000px]">
      <!-- 1. Thu mua cao su -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Thu mua cao su</span>
            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <el-icon class="text-blue-500" :size="20"><Van /></el-icon>
            </div>
          </div>
        </template>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Mủ nước</div>
              <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">12,500 <span class="text-sm font-normal text-gray-400">Kg</span></div>
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Mủ khô</div>
              <div class="text-2xl font-bold text-gray-700 dark:text-gray-200 leading-tight">4,200 <span class="text-sm font-normal text-gray-400">Kg</span></div>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
            <div class="text-xs text-gray-500 dark:text-gray-400">Tổng thành tiền</div>
            <div class="text-lg font-bold text-blue-600 dark:text-blue-400 leading-tight">125,000,000 <span class="text-sm font-normal text-blue-400/70">VNĐ</span></div>
          </div>
        </div>
      </el-card>

      <!-- 2. Mủ thành phẩm -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Mủ thành phẩm</span>
            <div class="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <el-icon class="text-green-500" :size="20"><Goods /></el-icon>
            </div>
          </div>
        </template>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Tổng nhập kho</div>
              <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">8,500 <span class="text-sm font-normal text-gray-400">Kg</span></div>
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Tổng xuất kho</div>
              <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">6,100 <span class="text-sm font-normal text-gray-400">Kg</span></div>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 mt-1 space-y-1">
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Tổng tự sản xuất</span>
              <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">5,000 Kg</span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Tổng nhập từ đối tác</span>
              <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">3,500 Kg</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 3. Tài chính -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Tài chính</span>
            <div class="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <el-icon class="text-orange-500" :size="20"><Wallet /></el-icon>
            </div>
          </div>
        </template>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Tổng thu</div>
              <div class="text-xl font-bold text-green-500 leading-tight">850,000,000 <span class="text-sm font-normal text-green-500/70">VNĐ</span></div>
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Tổng chi</div>
              <div class="text-xl font-bold text-red-500 leading-tight">420,000,000 <span class="text-sm font-normal text-red-500/70">VNĐ</span></div>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 mt-1 space-y-1">
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Vốn ban đầu</span>
              <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">2,500,000,000 VNĐ</span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Chênh lệch</span>
              <span class="font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">+430,000,000 VNĐ</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 4. Thu hoạch cao su -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Thu hoạch cao su</span>
            <div class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <el-icon class="text-purple-500" :size="20"><Odometer /></el-icon>
            </div>
          </div>
        </template>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Mủ nước</div>
              <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">18,300 <span class="text-sm font-normal text-gray-400">Kg</span></div>
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Mủ khô</div>
              <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">6,500 <span class="text-sm font-normal text-gray-400">Kg</span></div>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 mt-1 space-y-1">
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Đang thu hoạch</span>
              <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">150 Ha</span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Đang trồng mới</span>
              <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">50 Ha</span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Diện tích trống</span>
              <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">20 Ha</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Biểu đồ thu mua cao su -->
    <div class="mt-6">
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Biểu đồ thu mua cao su hằng ngày</span>
            <div class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg overflow-x-auto">
              <button 
                v-for="tab in ['Tất cả', 'Xưởng Gia An', 'Xưởng Lạc Tánh', 'Xưởng Phê']" 
                :key="tab"
                @click="chartFilter = tab"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  chartFilter === tab 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                ]"
              >
                {{ tab }}
              </button>
            </div>
          </div>
        </template>
        <div class="h-[350px]">
          <VueApexCharts type="line" height="350" :options="chartOptions" :series="series" />
        </div>
      </el-card>
    </div>

    <!-- Biểu đồ hao hụt sản xuất -->
    <div class="mt-6">
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Biểu đồ hao hụt sản xuất cao su</span>
            <div class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg overflow-x-auto">
              <button 
                v-for="tab in ['Tất cả', 'Xưởng Gia An', 'Xưởng Lạc Tánh', 'Xưởng Phê']" 
                :key="tab"
                @click="lossChartFilter = tab"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  lossChartFilter === tab 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                ]"
              >
                {{ tab }}
              </button>
            </div>
          </div>
        </template>
        <div class="h-[350px]">
          <VueApexCharts type="bar" height="350" :options="lossChartOptions" :series="lossSeries" />
        </div>
      </el-card>
    </div>
    
    <!-- Biểu đồ thu hoạch cao su -->
    <div class="mt-6">
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Biểu đồ thu hoạch cao su hằng ngày</span>
            <div class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg overflow-x-auto">
              <button 
                v-for="tab in ['Tất cả', 'Vĩnh Hà', 'Tiến Nga']" 
                :key="tab"
                @click="chartFilter = tab"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  chartFilter === tab 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                ]"
              >
                {{ tab }}
              </button>
            </div>
          </div>
        </template>
        <div class="h-[350px]">
          <VueApexCharts type="line" height="350" :options="chartOptions" :series="series" />
        </div>
      </el-card>
    </div>

    <!-- Khu vực Biểu đồ Tài chính -->
    <div class="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Biểu đồ RadialBar Tài chính -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Lượng chi / Lượng thu (Vốn ban đầu + thu)</span>
          </div>
        </template>
        <div class="h-[350px] flex justify-center items-center">
          <VueApexCharts type="radialBar" height="350" :options="financeRadialOptions" :series="financeRadialSeries" />
        </div>
      </el-card>

      <!-- Biểu đồ Phân bổ Quỹ (Donut) -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Phân bổ các Quỹ</span>
          </div>
        </template>
        <div class="h-[350px] flex justify-center items-center">
          <VueApexCharts type="donut" height="350" :options="fundOptions" :series="fundSeries" />
        </div>
      </el-card>

      <!-- Biểu đồ Tỷ trọng Thu của Quỹ (Donut) -->
      <el-card shadow="hover" class="border-none rounded-xl bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Tỷ trọng Thu theo Quỹ</span>
          </div>
        </template>
        <div class="h-[350px] flex justify-center items-center">
          <VueApexCharts type="donut" height="350" :options="revenueFundOptions" :series="revenueFundSeries" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useDark } from '@vueuse/core'
import {
  Odometer,
  Van,
  Wallet,
  Goods
} from '@element-plus/icons-vue'

const chartFilter = ref('Tất cả')
const lossChartFilter = ref('Tất cả')

// === Cấu hình Biểu đồ ===
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const series = ref([
  {
    name: 'Mủ nước',
    data: [2500, 2100, 3100, 2800, 3500, 3000, 4200]
  },
  {
    name: 'Mủ khô',
    data: [1200, 900, 1500, 1300, 1800, 1600, 2100]
  }
])

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'line' as const,
      fontFamily: 'inherit',
      toolbar: { show: true },
      zoom: { enabled: false },
      background: 'transparent',
      accessibility: { enabled: false }
    },
    colors: ['#3b82f6', '#10b981'], // Xanh dương cho mủ nước, Xanh lá cho mủ khô
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    grid: {
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    markers: {
      size: 4,
      hover: { sizeOffset: 2 }
    },
    xaxis: {
      categories: ['06/05', '07/05', '08/05', '09/05', '10/05', '11/05', '12/05'],
      title: {
        text: 'Thời gian (Ngày)',
        style: { color: isDark.value ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDark.value ? '#9ca3af' : '#6b7280' }
      }
    },
    yaxis: {
      title: {
        text: 'Khối lượng (Kg)',
        style: { color: isDark.value ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDark.value ? '#9ca3af' : '#6b7280' },
        formatter: (val: number) => {
          return val.toLocaleString() + ' Kg'
        }
      }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      itemMargin: {
        horizontal: 10,
        vertical: 0
      },
      labels: { colors: isDark.value ? '#f3f4f6' : '#374151' }
    },
    theme: {
      mode: (isDark.value ? 'dark' : 'light') as 'dark' | 'light'
    },
    tooltip: {
      theme: isDark.value ? 'dark' as const : 'light' as const,
      y: {
        formatter: function (val: number) {
          return val.toLocaleString() + " Kg"
        }
      }
    }
  }
})

// === Cấu hình Biểu đồ Hao hụt ===
const lossSeries = ref([
  {
    name: 'Hao hụt (%)',
    data: [2.5, -1.2, 3.8, -0.5, -2.1, 1.5, 4.2]
  }
])

const lossChartOptions = computed(() => {
  return {
    chart: {
      type: 'bar' as const,
      fontFamily: 'inherit',
      toolbar: { show: true },
      background: 'transparent',
      accessibility: { enabled: false }
    },
    plotOptions: {
      bar: {
        colors: {
          ranges: [
            {
              from: -100,
              to: 0,
              color: '#ef4444' // đỏ cho giá trị < 0
            },
            {
              from: 0.01,
              to: 100,
              color: '#3b82f6' // xanh dương cho giá trị > 0
            }
          ]
        },
        columnWidth: '60%',
        borderRadius: 4,
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0
    },
    grid: {
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ['06/05', '07/05', '08/05', '09/05', '10/05', '11/05', '12/05'],
      title: {
        text: 'Thời gian (Ngày)',
        style: { color: isDark.value ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDark.value ? '#9ca3af' : '#6b7280' }
      }
    },
    yaxis: {
      title: {
        text: 'Mức độ hao hụt (%)',
        style: { color: isDark.value ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDark.value ? '#9ca3af' : '#6b7280' },
        formatter: (val: number) => {
          return val + '%'
        }
      }
    },
    theme: {
      mode: (isDark.value ? 'dark' : 'light') as 'dark' | 'light'
    },
    tooltip: {
      theme: isDark.value ? 'dark' as const : 'light' as const,
      y: {
        formatter: function (val: number) {
          return val + "%"
        }
      }
    }
  }
})

// === Cấu hình Biểu đồ RadialBar Tài chính ===
const financeRadialSeries = ref([45, 60, 25, 80, 50]) // Tỷ lệ Chi/Thu (%) của 5 quỹ

const financeRadialOptions = computed(() => {
  return {
    chart: {
      type: 'radialBar' as const,
      fontFamily: 'inherit',
      background: 'transparent',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%', // Thu nhỏ phần rỗng ở giữa để vòng có thể dày hơn
        },
        track: {
          margin: 1, // Thêm khoảng cách giữa các vòng
        },
        dataLabels: {
          name: {
            fontSize: '14px',
          },
          value: {
            fontSize: '14px',
            color: isDark.value ? '#9ca3af' : '#6b7280',
            formatter: function (val: number) {
              return val + '%'
            }
          },
          total: {
            show: true,
            label: 'Trung bình',
            color: isDark.value ? '#f3f4f6' : '#374151',
            formatter: function (w: any) {
              return '69%'
            }
          }
        }
      }
    },
    labels: [
      'Quỹ TM tại xưởng', 
      'Quỹ An Bình Bank', 
      'Quỹ TM kế toán', 
      'Quỹ Vietcombank', 
      'Quỹ Agribank'
    ],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    legend: {
      show: true,
      position: 'bottom' as const,
      labels: {
        colors: isDark.value ? '#9ca3af' : '#4b5563'
      }
    },
    theme: {
      mode: (isDark.value ? 'dark' : 'light') as 'dark' | 'light'
    }
  }
})

// === Cấu hình Biểu đồ Phân bổ Quỹ ===
const fundSeries = ref([500, 1200, 300, 800, 550]) // đơn vị triệu VNĐ

const fundOptions = computed(() => {
  return {
    chart: {
      type: 'donut' as const,
      fontFamily: 'inherit',
      background: 'transparent',
    },
    labels: [
      'Quỹ TM tại xưởng', 
      'Quỹ An Bình Bank', 
      'Quỹ TM kế toán', 
      'Quỹ Vietcombank', 
      'Quỹ Agribank'
    ],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              fontSize: '14px',
              color: isDark.value ? '#9ca3af' : '#6b7280'
            },
            value: {
              fontSize: '18px',
              fontWeight: 'bold',
              color: isDark.value ? '#f3f4f6' : '#111827',
              formatter: function (val: number) {
                return val + ' Tr'
              }
            },
            total: {
              show: true,
              label: 'Tổng Quỹ',
              color: isDark.value ? '#9ca3af' : '#6b7280',
              formatter: function (w: any) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return total + ' Tr'
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: isDark.value ? 0 : 2,
      colors: isDark.value ? [] : ['#ffffff']
    },
    legend: {
      position: 'bottom' as const,
      labels: {
        colors: isDark.value ? '#9ca3af' : '#4b5563'
      }
    },
    theme: {
      mode: (isDark.value ? 'dark' : 'light') as 'dark' | 'light'
    },
    tooltip: {
      theme: isDark.value ? 'dark' as const : 'light' as const,
      y: {
        formatter: function (val: number) {
          return val.toLocaleString() + " Triệu VNĐ"
        }
      }
    }
  }
})

// === Cấu hình Biểu đồ Tỷ trọng Thu theo Quỹ ===
const revenueFundSeries = ref([150, 400, 50, 200, 100]) // Lượng thu của từng quỹ (triệu VNĐ)

const revenueFundOptions = computed(() => {
  return {
    chart: {
      type: 'donut' as const,
      fontFamily: 'inherit',
      background: 'transparent',
    },
    labels: [
      'Quỹ TM tại xưởng', 
      'Quỹ An Bình Bank', 
      'Quỹ TM kế toán', 
      'Quỹ Vietcombank', 
      'Quỹ Agribank'
    ],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              fontSize: '14px',
              color: isDark.value ? '#9ca3af' : '#6b7280'
            },
            value: {
              fontSize: '18px',
              fontWeight: 'bold',
              color: isDark.value ? '#f3f4f6' : '#111827',
              formatter: function (val: number) {
                return val + ' Tr'
              }
            },
            total: {
              show: true,
              label: 'Tổng Thu',
              color: isDark.value ? '#9ca3af' : '#6b7280',
              formatter: function (w: any) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return total + ' Tr'
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%"
      }
    },
    stroke: {
      width: isDark.value ? 0 : 2,
      colors: isDark.value ? [] : ['#ffffff']
    },
    legend: {
      position: 'bottom' as const,
      labels: {
        colors: isDark.value ? '#9ca3af' : '#4b5563'
      }
    },
    theme: {
      mode: (isDark.value ? 'dark' : 'light') as 'dark' | 'light'
    },
    tooltip: {
      theme: isDark.value ? 'dark' as const : 'light' as const,
      y: {
        formatter: function (val: number) {
          return val.toLocaleString() + " Triệu VNĐ"
        }
      }
    }
  }
})
</script>
