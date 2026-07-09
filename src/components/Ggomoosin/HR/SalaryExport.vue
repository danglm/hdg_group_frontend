<template>
  <div class="salary-export-container h-full flex flex-col">
    <!-- Filter Bar -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
          <el-date-picker
            v-model="filters.month"
            type="month"
            placeholder="Chọn tháng"
            format="MM/YYYY"
            value-format="YYYY-MM"
            class="custom-dark-input highlight-select"
            style="width: 150px"
          />
        </div>
        <el-button type="primary" :icon="Search" @click="handleSearch">Tìm kiếm</el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-button
          type="primary"
          :icon="Check"
          :disabled="selectedRows.length === 0"
          @click="saveSalary"
        >
          Xuất lương ({{ selectedRows.length }})
        </el-button>
        <el-button
          type="success"
          :icon="Download"
          :disabled="selectedRows.length === 0"
          @click="exportSelected"
        >
          Xuất Excel ({{ selectedRows.length }})
        </el-button>
        <el-button
          type="warning"
          :icon="Download"
          :disabled="filteredData.length === 0"
          @click="exportAll"
        >
          Xuất tất cả
        </el-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="hasSearched" class="grid grid-cols-4 gap-4 mb-4 shrink-0">
      <div class="summary-card bg-white dark:bg-gray-900 rounded-lg shadow p-4 border-l-4 border-indigo-500">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tổng nhân viên</div>
        <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ filteredData.length }}</div>
      </div>
      <div class="summary-card bg-white dark:bg-gray-900 rounded-lg shadow p-4 border-l-4 border-blue-500">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tổng lương cơ bản</div>
        <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(totalBaseSalary) }}</div>
      </div>
      <div class="summary-card bg-white dark:bg-gray-900 rounded-lg shadow p-4 border-l-4 border-amber-500">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tổng phụ cấp</div>
        <div class="text-lg font-bold text-amber-500">{{ formatCurrency(totalAllowance) }}</div>
      </div>
      <div class="summary-card bg-white dark:bg-gray-900 rounded-lg shadow p-4 border-l-4 border-emerald-500">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tổng chi lương</div>
        <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(totalNetSalary) }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="paginatedData"
        :empty-text="tableEmptyText"
        style="width: 100%"
        class="flex-1"
        height="100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="employeeCode" label="Mã NV" width="100" fixed />
        <el-table-column prop="employeeName" label="Tên nhân viên" width="180" fixed show-overflow-tooltip />
        <el-table-column prop="standardWorkdays" label="Công chuẩn" width="110" align="center">
          <template #default="scope">
            <span class="font-medium text-gray-500 dark:text-gray-400">{{ scope.row.standardWorkdays }} ngày</span>
          </template>
        </el-table-column>
        <el-table-column prop="workDays" label="Công thực tế" width="120" align="center">
          <template #default="scope">
            <span class="font-medium">{{ scope.row.workDays }} ngày</span>
          </template>
        </el-table-column>
        <el-table-column label="Lương cơ bản" width="150" align="right">
          <template #default="scope">
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ formatCurrency(scope.row.baseSalary) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Lương theo ngày công" width="180" align="right">
          <template #default="scope">
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ formatCurrency(scope.row.receivedSalary) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Lương tăng ca" width="150" align="right">
          <template #default="scope">
            <span :class="scope.row.overtimeSalary > 0 ? 'text-green-500 font-medium' : 'text-gray-400'">
              {{ formatCurrency(scope.row.overtimeSalary) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Phụ cấp ăn trưa" width="160" align="right">
          <template #default="scope">
            <span :class="scope.row.lunchAllowance > 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400'">
              {{ formatCurrency(scope.row.lunchAllowance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Phụ cấp khác" width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.allowance > 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400'">
              {{ formatCurrency(scope.row.allowance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Thưởng năng suất" width="170" align="right">
          <template #default="scope">
            <span :class="scope.row.productivityBonus > 0 ? 'text-amber-500 font-bold' : 'text-gray-400'">
              {{ formatCurrency(scope.row.productivityBonus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Thưởng khác" width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.bonus > 0 ? 'text-amber-500 font-bold' : 'text-gray-400'">
              {{ formatCurrency(scope.row.bonus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="BHXH" width="140" align="right">
          <template #default="scope">
            <span class="text-orange-500 font-medium">-{{ formatCurrency(scope.row.socialInsurance) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Phạt" width="130" align="right">
          <template #default="scope">
            <span :class="scope.row.penalty > 0 ? 'text-red-500 font-semibold' : 'text-gray-400'">
              {{ scope.row.penalty > 0 ? '-' + formatCurrency(scope.row.penalty) : formatCurrency(0) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Thực nhận" width="170" align="right" fixed="right">
          <template #default="scope">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold text-base">
              {{ formatCurrency(scope.row.netSalary) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="130" align="center" fixed="right">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="dark"
              size="small"
              round
            >
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
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
          :total="filteredData.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search, Download, Check } from '@element-plus/icons-vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx-js-style'
import { employeeService } from '@/api/employeeService'

// Filters
const filters = reactive({
  month: '2026-06'
})
const activeFilters = reactive({
  month: '2026-06'
})

const hasSearched = ref(false)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const tableRef = ref()
const selectedRows = ref<any[]>([])

// Format currency
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'
}

// Format status label
const getStatusLabel = (status: string) => {
  if (!status) return 'Chưa xuất'
  switch (status.toLowerCase()) {
    case 'paid': return 'Đã thanh toán'
    case 'exported': return 'Đã xuất'
    case 'approved': return 'Đã duyệt'
    case 'draft': return 'Nháp'
    default: return status
  }
}

// Format status type for ElTag
const getStatusType = (status: string) => {
  if (!status) return 'info'
  switch (status.toLowerCase()) {
    case 'paid':
    case 'exported':
      return 'success'
    case 'approved':
      return 'warning'
    case 'draft':
      return 'info'
    default:
      return 'primary'
  }
}

const allData = ref<any[]>([])

// Search
const handleSearch = async () => {
  if (!filters.month) {
    ElNotification({
      title: 'Thông báo',
      message: 'Vui lòng chọn thời gian tìm kiếm.',
      type: 'warning'
    })
    return
  }

  loading.value = true
  hasSearched.value = true
  currentPage.value = 1
  selectedRows.value = []

  try {
    const parts = (filters.month || '').split('-')
    const year = parts[0] || '2026'
    const month = parts[1] || '06'
    const apiDateFormat = `${month}/${year}`

    const res = await employeeService.getSalaries('G', apiDateFormat)
    
    allData.value = res.map((item: any) => {
      const lunchAllowance = item.lunch_allowance || 0;
      const otherAllowance = item.other_allowance || 0;
      const productivityBonus = item.productivity_bonus || 0;
      const bonus = item.bonus || 0;
      const baseSalary = item.base_salary || 0;
      const receivedSalary = item.received_salary || 0;
      const overtimeSalary = item.overtime_salary || 0;
      const socialInsurance = item.bhxh || 0;
      const penalty = item.penalty || 0;
      
      const calculatedNetSalary = item.total_received || 0;

      return {
        id: `${item.employee_id}-${year}-${month}`,
        employeeCode: item.employee_id,
        employeeName: item.employee_name || item.employee_id,
        year: parseInt(year),
        month: parseInt(month),
        standardWorkdays: item.standard_workdays || 0,
        workDays: item.actual_workdays || 0,
        baseSalary,
        receivedSalary,
        overtimeSalary,
        lunchAllowance,
        allowance: otherAllowance,
        productivityBonus,
        bonus,
        socialInsurance,
        penalty,
        netSalary: calculatedNetSalary,
        status: item.status || '',
        exported: item.status === 'paid' || item.status === 'exported'
      };
    })

    activeFilters.month = filters.month
  } catch (error: any) {
    console.error('Failed to search salaries:', error)
    ElNotification({
      title: 'Lỗi',
      message: error.message || 'Không thể lấy dữ liệu lương.',
      type: 'error'
    })
    allData.value = []
  } finally {
    loading.value = false
  }
}

// Filtered Data
const filteredData = computed(() => {
  if (!hasSearched.value) return []
  return allData.value.filter(e => {
    if (activeFilters.month) {
      const parts = activeFilters.month.split('-')
      const y = parseInt(parts[0] || '0')
      const m = parseInt(parts[1] || '0')
      if (e.year !== y || e.month !== m) return false
    }
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const tableEmptyText = computed(() => {
  return hasSearched.value
    ? 'Không có dữ liệu lương phù hợp'
    : 'Vui lòng chọn tháng và nhấn nút "Tìm kiếm" để hiển thị dữ liệu'
})

// Summary totals
const totalBaseSalary = computed(() => filteredData.value.reduce((sum, e) => sum + e.baseSalary, 0))
const totalAllowance = computed(() => filteredData.value.reduce((sum, e) => sum + (e.lunchAllowance || 0) + (e.allowance || 0), 0))
const totalNetSalary = computed(() => filteredData.value.reduce((sum, e) => sum + e.netSalary, 0))

// Selection
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// Excel Export with styling
const generateExcel = (data: any[], fileName: string) => {
  const parts = (activeFilters.month || '').split('-')
  const y = parts[0] || '2026'
  const m = parts[1] || '06'
  const monthLabel = `Tháng ${m}/${y}`

  // Style definitions
  const companyStyle = {
    font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1F4E79' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  }
  const titleStyle = {
    font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '2E75B6' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  }
  const headerStyle = {
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '2F5496' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '1F4E79' } },
      bottom: { style: 'thin', color: { rgb: '1F4E79' } },
      left: { style: 'thin', color: { rgb: '1F4E79' } },
      right: { style: 'thin', color: { rgb: '1F4E79' } }
    }
  }
  const cellBorder = {
    top: { style: 'thin', color: { rgb: 'D6DCE4' } },
    bottom: { style: 'thin', color: { rgb: 'D6DCE4' } },
    left: { style: 'thin', color: { rgb: 'D6DCE4' } },
    right: { style: 'thin', color: { rgb: 'D6DCE4' } }
  }
  const dataStyleEven = {
    fill: { fgColor: { rgb: 'F2F7FB' } },
    border: cellBorder,
    alignment: { vertical: 'center' }
  }
  const dataStyleOdd = {
    fill: { fgColor: { rgb: 'FFFFFF' } },
    border: cellBorder,
    alignment: { vertical: 'center' }
  }
  const numberFormat = '#,##0'
  const totalStyle = {
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1B7A43' } },
    border: {
      top: { style: 'medium', color: { rgb: '145A32' } },
      bottom: { style: 'medium', color: { rgb: '145A32' } },
      left: { style: 'thin', color: { rgb: '145A32' } },
      right: { style: 'thin', color: { rgb: '145A32' } }
    },
    alignment: { vertical: 'center' }
  }

  // Build sheet data
  const headerRows = [
    ['CÔNG TY TNHH HDG GROUP'],
    [`BẢNG LƯƠNG ${monthLabel.toUpperCase()}`],
    [],
    ['STT', 'Mã NV', 'Tên nhân viên', 'Công chuẩn', 'Công thực tế', 'Lương cơ bản', 'Lương theo ngày công', 'Lương tăng ca', 'Phụ cấp ăn trưa', 'Phụ cấp khác', 'Thưởng năng suất', 'Thưởng khác', 'BHXH', 'Phạt', 'Thực nhận']
  ]

  const dataRows = data.map((row, index) => [
    index + 1, row.employeeCode, row.employeeName, row.standardWorkdays, row.workDays,
    row.baseSalary, row.receivedSalary, row.overtimeSalary, row.lunchAllowance, row.allowance,
    row.productivityBonus, row.bonus, row.socialInsurance, row.penalty, row.netSalary
  ])

  const totalRow = [
    '', '', 'TỔNG CỘNG', '', '',
    data.reduce((s, r) => s + r.baseSalary, 0),
    data.reduce((s, r) => s + r.receivedSalary, 0),
    data.reduce((s, r) => s + r.overtimeSalary, 0),
    data.reduce((s, r) => s + r.lunchAllowance, 0),
    data.reduce((s, r) => s + r.allowance, 0),
    data.reduce((s, r) => s + r.productivityBonus, 0),
    data.reduce((s, r) => s + r.bonus, 0),
    data.reduce((s, r) => s + r.socialInsurance, 0),
    data.reduce((s, r) => s + r.penalty, 0),
    data.reduce((s, r) => s + r.netSalary, 0)
  ]

  const wsData = [...headerRows, ...dataRows, totalRow]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 10 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
    { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
    { wch: 17 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }
  ]

  // Row heights
  ws['!rows'] = [
    { hpt: 30 }, // Company
    { hpt: 25 }, // Title
    { hpt: 15 }, // Empty
    { hpt: 28 }, // Header
  ]

  // Merge header cells
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }
  ]

  // Apply styles - Company name row
  for (let c = 0; c <= 14; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c })
    if (!ws[ref]) ws[ref] = { v: '', t: 's' }
    ws[ref].s = companyStyle
  }

  // Title row
  for (let c = 0; c <= 14; c++) {
    const ref = XLSX.utils.encode_cell({ r: 1, c })
    if (!ws[ref]) ws[ref] = { v: '', t: 's' }
    ws[ref].s = titleStyle
  }

  // Header row (row index 3)
  for (let c = 0; c <= 14; c++) {
    const ref = XLSX.utils.encode_cell({ r: 3, c })
    if (ws[ref]) ws[ref].s = headerStyle
  }

  // Data rows
  const numberCols = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  for (let i = 0; i < dataRows.length; i++) {
    const rowIdx = 4 + i
    const baseStyle = i % 2 === 0 ? dataStyleEven : dataStyleOdd
    for (let c = 0; c <= 14; c++) {
      const ref = XLSX.utils.encode_cell({ r: rowIdx, c })
      if (!ws[ref]) ws[ref] = { v: '', t: 's' }
      if (numberCols.includes(c)) {
        ws[ref].s = { ...baseStyle, alignment: { ...baseStyle.alignment, horizontal: 'right' }, numFmt: numberFormat }
        ws[ref].z = numberFormat
      } else if (c === 0 || c === 3 || c === 4) {
        ws[ref].s = { ...baseStyle, alignment: { ...baseStyle.alignment, horizontal: 'center' } }
      } else {
        ws[ref].s = baseStyle
      }
    }
  }

  // Total row
  const totalRowIdx = 4 + dataRows.length
  for (let c = 0; c <= 14; c++) {
    const ref = XLSX.utils.encode_cell({ r: totalRowIdx, c })
    if (!ws[ref]) ws[ref] = { v: '', t: 's' }
    if (numberCols.includes(c)) {
      ws[ref].s = { ...totalStyle, alignment: { ...totalStyle.alignment, horizontal: 'right' }, numFmt: numberFormat }
      ws[ref].z = numberFormat
    } else {
      ws[ref].s = totalStyle
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Lương T${m}-${y}`)
  XLSX.writeFile(wb, fileName)
}

const exportSelected = () => {
  if (selectedRows.value.length === 0) return
  const [y, m] = activeFilters.month.split('-')
  const fileName = `Bang_luong_${m}_${y}_${selectedRows.value.length}NV.xlsx`
  generateExcel(selectedRows.value, fileName)
  ElNotification({
    title: 'Xuất Excel thành công',
    message: `Đã xuất bảng lương ${selectedRows.value.length} nhân viên — ${fileName}`,
    type: 'success'
  })
}

const exportAll = () => {
  if (filteredData.value.length === 0) return
  const [y, m] = activeFilters.month.split('-')
  const fileName = `Bang_luong_${m}_${y}.xlsx`
  generateExcel(filteredData.value, fileName)
  ElNotification({
    title: 'Xuất Excel thành công',
    message: `Đã xuất bảng lương tất cả ${filteredData.value.length} nhân viên — ${fileName}`,
    type: 'success'
  })
}

// Save to DB
const saveSalary = () => {
  if (selectedRows.value.length === 0) return
  const names = selectedRows.value.map(r => r.employeeName).join(', ')
  const count = selectedRows.value.length

  ElMessageBox.confirm(
    `Xác nhận xuất lương cho ${count} nhân viên?\n${names}`,
    'Xác nhận xuất lương',
    {
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      const payload = selectedRows.value.map(row => ({
        employee_id: row.employeeCode,
        year: row.year,
        month: row.month,
        unapproved_leave: Math.max(0, row.standardWorkdays - row.workDays),
        base_salary_amount: row.receivedSalary,
        overtime_salary_amount: row.overtimeSalary,
        total_salary: row.netSalary
      }))

      await employeeService.addPayrolls(payload)

      // Mark as exported in allData
      selectedRows.value.forEach(row => {
        const item = allData.value.find(d => d.id === row.id)
        if (item) {
          item.status = 'exported'
          item.exported = true
        }
      })
      selectedRows.value = []
      ElNotification({
        title: 'Xuất lương thành công',
        message: `Đã lưu xuất lương cho ${count} nhân viên vào hệ thống!`,
        type: 'success'
      })
    } catch (error: any) {
      console.error('Failed to export salaries:', error)
      ElNotification({
        title: 'Lỗi',
        message: error.message || 'Không thể xuất lương vào hệ thống.',
        type: 'error'
      })
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}
</script>

<style scoped>
.salary-export-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

html.dark .salary-export-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}
html.dark .salary-export-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}
html.dark .salary-export-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}
html.dark .salary-export-container :deep(.el-table .el-table-fixed-column--left),
html.dark .salary-export-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
}

html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #4b5563 inset !important;
}
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}
</style>

<style>
/* Date picker dark mode (unscoped to properly override Element Plus) */
html.dark .highlight-select .el-input__wrapper,
html.dark .highlight-select .el-select__wrapper {
  background-color: #111827 !important;
  border-color: #111827 !important;
}
html.dark .highlight-select.el-date-editor .el-input__wrapper {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #111827 inset !important;
}
html.dark .highlight-select.el-date-editor .el-input__inner {
  color: #f3f4f6 !important;
}
html.dark .highlight-select.el-date-editor .el-input__inner::placeholder {
  color: #6b7280 !important;
}
</style>
