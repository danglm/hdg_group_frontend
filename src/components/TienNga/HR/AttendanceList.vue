<template>
  <div class="attendance-container h-full flex flex-col">
    <!-- Filter Bar -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Nhân viên:</span>
          <el-input
            v-model="filters.search"
            placeholder="Mã NV hoặc Họ tên..."
            :prefix-icon="Search"
            clearable
            class="w-60 custom-dark-input"
          />
        </div>
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
      <el-button type="success" :icon="Plus" @click="openAddDialog">Cập nhật công</el-button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="paginatedData" :empty-text="tableEmptyText" style="width: 100%" class="flex-1" height="100%">
        <el-table-column prop="employeeCode" label="Mã NV" width="100" fixed />
        <el-table-column prop="employeeName" label="Tên nhân viên" width="180" fixed show-overflow-tooltip />
        <el-table-column prop="year" label="Năm" width="80" align="center" />
        <el-table-column prop="month" label="Tháng" width="80" align="center" />
        <el-table-column prop="day" label="Ngày" width="80" align="center" />
        <el-table-column prop="dayOfWeek" label="Thứ" width="100" align="center">
          <template #default="scope">
            <span :class="scope.row.dayOfWeek === 'Chủ Nhật' ? 'text-red-500 font-bold' : ''">{{ scope.row.dayOfWeek }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="weekOfYear" label="Tuần" width="80" align="center" />
        <el-table-column prop="breakTime" label="Thời gian nghỉ" width="130" align="center" />
        <el-table-column prop="checkIn" label="Vào ca" width="110" align="center">
          <template #default="scope">
            <span :class="scope.row.isLate ? 'text-red-500 font-bold' : ''">{{ scope.row.checkIn || '--:--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="checkOut" label="Ra ca" width="110" align="center">
          <template #default="scope">
            <span :class="scope.row.isEarlyLeave ? 'text-orange-500 font-bold' : ''">{{ scope.row.checkOut || '--:--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="otStart" label="Bắt đầu OT" width="120" align="center" />
        <el-table-column prop="otEnd" label="Kết thúc OT" width="120" align="center" />
        <el-table-column label="Giờ làm việc" width="130" align="center">
          <template #default="scope">
            <span class="font-semibold text-gray-700 dark:text-gray-200">{{ scope.row.workHours }}h</span>
          </template>
        </el-table-column>
        <el-table-column label="Đi trễ" width="110" align="center">
          <template #default="scope">
            <span v-if="scope.row.lateMinutes > 0" class="text-red-500 font-medium">{{ scope.row.lateMinutes }} phút</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Giờ OT" width="110" align="center">
          <template #default="scope">
            <span v-if="scope.row.otHours > 0" class="text-green-500 font-bold">{{ scope.row.otHours }}h</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="errors" label="Lỗi" width="160" align="center" fixed="right">
          <template #default="scope">
            <div class="flex flex-wrap gap-1 justify-center">
              <el-tag
                v-for="err in scope.row.errors"
                :key="err"
                :type="getTagType(err)"
                size="small"
                effect="dark"
                round
              >
                {{ err }}
              </el-tag>
              <span v-if="!scope.row.errors || scope.row.errors.length === 0" class="text-green-500 text-xs">Không có lỗi</span>
            </div>
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

    <!-- MODAL CẬP NHẬT CÔNG (BỔ SUNG CÔNG THIẾU) -->
    <el-dialog
      v-model="dialogVisible"
      title="CẬP NHẬT CÔNG CÒN THIẾU"
      width="650px"
      destroy-on-close
      class="custom-dark-dialog"
    >
      <div class="px-2">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="160px" class="mt-2 compact-form">
          <el-form-item label="Mã nhân viên" prop="employeeCode">
            <el-input v-model="form.employeeCode" placeholder="Nhập mã nhân viên (ví dụ: NV001)..." />
          </el-form-item>

          <el-form-item label="Ngày bổ sung" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="Chọn ngày bổ sung công"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Thời gian vào ca" prop="checkIn">
                <el-time-picker
                  v-model="form.checkIn"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="Giờ vào"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Thời gian ra ca" prop="checkOut">
                <el-time-picker
                  v-model="form.checkOut"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="Giờ ra"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Bắt đầu tăng ca" prop="otStart">
                <el-time-picker
                  v-model="form.otStart"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="Bắt đầu"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Kết thúc tăng ca" prop="otEnd">
                <el-time-picker
                  v-model="form.otEnd"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="Kết thúc"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Lý do cập nhật" prop="reason">
            <el-input v-model="form.reason" placeholder="Ví dụ: Quên quét thẻ, Đi công tác..." />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button type="primary" @click="submitForm">Xác nhận</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

// Filters (bound to inputs)
const filters = reactive({
  search: '',
  month: '2026-06'
})

// Active Filters (used for actual table filtering on search click)
const activeFilters = reactive({
  search: '',
  month: '2026-06'
})

const hasSearched = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const formRef = ref()

// Rules for Supplement Form
const rules = {
  employeeCode: [{ required: true, message: 'Vui lòng chọn nhân viên', trigger: 'change' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày bổ sung', trigger: 'change' }],
  checkIn: [{ required: true, message: 'Vui lòng chọn giờ vào ca', trigger: 'change' }],
  checkOut: [{ required: true, message: 'Vui lòng chọn giờ ra ca', trigger: 'change' }]
}

// Dialog Supplement Form state
const form = reactive({
  employeeCode: '',
  date: '',
  checkIn: '07:00',
  checkOut: '16:00',
  otStart: '',
  otEnd: '',
  breakMinutes: 60,
  reason: ''
})

// Mock Employee List (derived/correlated from EmployeeList mock generation logic)
const employees = [
  { code: 'NV001', firstName: 'An', lastName: 'Nguyễn' },
  { code: 'NV002', firstName: 'Bình', lastName: 'Trần' },
  { code: 'NV003', firstName: 'Cường', lastName: 'Lê' },
  { code: 'NV004', firstName: 'Dũng', lastName: 'Phạm' },
  { code: 'NV005', firstName: 'Hương', lastName: 'Hoàng' },
  { code: 'NV006', firstName: 'Phong', lastName: 'Huỳnh' },
  { code: 'NV007', firstName: 'Giang', lastName: 'Phan' },
  { code: 'NV008', firstName: 'Hải', lastName: 'Vũ' },
  { code: 'NV009', firstName: 'Linh', lastName: 'Võ' },
  { code: 'NV010', firstName: 'Khánh', lastName: 'Đặng' },
  { code: 'NV011', firstName: 'Mai', lastName: 'Nguyễn' },
  { code: 'NV012', firstName: 'Thảo', lastName: 'Trần' },
  { code: 'NV013', firstName: 'Đạt', lastName: 'Lê' },
  { code: 'NV014', firstName: 'Huy', lastName: 'Phạm' },
  { code: 'NV015', firstName: 'Vân', lastName: 'Hoàng' },
  { code: 'NV016', firstName: 'Sơn', lastName: 'Huỳnh' },
  { code: 'NV017', firstName: 'Tuấn', lastName: 'Phan' },
  { code: 'NV018', firstName: 'Nam', lastName: 'Vũ' },
  { code: 'NV019', firstName: 'Hạnh', lastName: 'Võ' },
  { code: 'NV020', firstName: 'Tâm', lastName: 'Đặng' }
]

// Day Names map
const dayNamesVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

// Helper: Get Week of Year
const getWeekNumber = (d: Date): number => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Helper: Calculate late minutes, OT hours, exceptions
const calculateAttendanceMetrics = (record: {
  checkIn: string
  checkOut: string
  otStart?: string
  otEnd?: string
  breakMinutes: number
}) => {
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0
    const parts = timeStr.split(':')
    const h = Number(parts[0]) || 0
    const m = Number(parts[1]) || 0
    return h * 60 + m
  }

  const inMin = parseTimeToMinutes(record.checkIn)
  const outMin = parseTimeToMinutes(record.checkOut)
  const standardStartMin = 7 * 60 // 07:00
  const standardEndMin = 16 * 60 // 16:00
  const breakMin = record.breakMinutes

  // Work Hours: checkOut - checkIn - break, converted to hours
  let workHours = 0
  if (outMin > inMin) {
    workHours = Math.max(0, parseFloat(((outMin - inMin - breakMin) / 60).toFixed(1)))
  }

  // Late minutes
  let lateMinutes = 0
  if (inMin > standardStartMin) {
    lateMinutes = inMin - standardStartMin
  }

  // Early leave minutes
  let earlyLeaveMinutes = 0
  if (outMin < standardEndMin) {
    earlyLeaveMinutes = standardEndMin - outMin
  }

  // OT Hours
  let otHours = 0
  if (record.otStart && record.otEnd) {
    const otSMin = parseTimeToMinutes(record.otStart)
    const otEMin = parseTimeToMinutes(record.otEnd)
    if (otEMin > otSMin) {
      otHours = parseFloat(((otEMin - otSMin) / 60).toFixed(1))
    }
  }

  // Errors list
  const errors: string[] = []
  if (!record.checkIn) {
    errors.push('Thiếu Check-In')
  } else if (lateMinutes > 15) {
    errors.push('Đi trễ')
  }

  if (!record.checkOut) {
    errors.push('Thiếu Check-Out')
  } else if (earlyLeaveMinutes > 15) {
    errors.push('Về sớm')
  }

  return {
    workHours,
    lateMinutes,
    otHours,
    isLate: lateMinutes > 15,
    isEarlyLeave: earlyLeaveMinutes > 15,
    errors
  }
}

// Mock Data Generator
const generateMockAttendance = () => {
  const data: any[] = []
  const year = 2026
  const monthIdx = 5 // June (0-indexed 5)
  const daysInMonth = 30

  // We generate 5 days of attendance for June 2026 (June 1st to June 5th) for all 20 employees
  for (let day = 1; day <= 15; day++) {
    const dateStr = `${year}-06-${String(day).padStart(2, '0')}`
    const dateObj = new Date(year, monthIdx, day)
    const dayOfWeek = dayNamesVi[dateObj.getDay()]
    const weekOfYear = getWeekNumber(dateObj)

    // Skip Sundays for mock normal data (or mark as Sunday)
    const isSunday = dateObj.getDay() === 0

    employees.forEach((emp) => {
      // 10% chance of an error (e.g. late, missing check-in, etc.)
      const rand = Math.random()
      let checkIn = '07:00'
      let checkOut = '16:00'
      let otStart = ''
      let otEnd = ''
      let breakMinutes = 60

      if (isSunday) {
        checkIn = ''
        checkOut = ''
        breakMinutes = 0
      } else {
        if (rand < 0.05) {
          // Late
          checkIn = '07:45'
        } else if (rand < 0.08) {
          // Missing checkout
          checkOut = ''
        } else if (rand < 0.12) {
          // Worked OT
          otStart = '16:30'
          otEnd = '18:30'
        } else if (rand < 0.14) {
          // Early leave
          checkOut = '15:15'
        }
      }

      const metrics = calculateAttendanceMetrics({
        checkIn,
        checkOut,
        otStart,
        otEnd,
        breakMinutes
      })

      // Add special exception for Sunday
      if (isSunday) {
        metrics.errors = ['Nghỉ Chủ Nhật']
      }

      data.push({
        id: `${emp.code}-${dateStr}`,
        employeeCode: emp.code,
        employeeName: `${emp.lastName} ${emp.firstName}`,
        year,
        month: 6,
        day,
        dayOfWeek,
        weekOfYear,
        breakTime: isSunday ? '0 phút' : '60 phút',
        breakMinutes,
        checkIn: checkIn,
        checkOut: checkOut,
        otStart: otStart || '',
        otEnd: otEnd || '',
        workHours: metrics.workHours,
        lateMinutes: metrics.lateMinutes,
        otHours: metrics.otHours,
        isLate: metrics.isLate,
        isEarlyLeave: metrics.isEarlyLeave,
        errors: metrics.errors,
        reason: ''
      })
    })
  }

  // Prepend some missing rows for demo supplement
  return data
}

const allData = ref(generateMockAttendance())

// Search and Filter computation
const handleSearch = () => {
  activeFilters.search = filters.search
  activeFilters.month = filters.month
  hasSearched.value = true
  currentPage.value = 1
}

const filteredData = computed(() => {
  if (!hasSearched.value) return []
  
  return allData.value.filter(e => {
    // Month filter
    if (activeFilters.month) {
      const [y, m] = activeFilters.month.split('-').map(Number)
      if (e.year !== y || e.month !== m) return false
    }

    // Search query (code or name)
    if (activeFilters.search) {
      const q = activeFilters.search.trim().toLowerCase()
      const matchesCode = e.employeeCode.toLowerCase().includes(q)
      const matchesName = e.employeeName.toLowerCase().includes(q)
      if (!matchesCode && !matchesName) return false
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
    ? 'Không có dữ liệu chấm công phù hợp'
    : 'Vui lòng nhập thông tin bộ lọc và nhấn nút "Tìm kiếm" để hiển thị dữ liệu'
})

// Dialog actions
const openAddDialog = () => {
  form.employeeCode = ''
  form.date = ''
  form.checkIn = '07:00'
  form.checkOut = '16:00'
  form.otStart = ''
  form.otEnd = ''
  form.breakMinutes = 60
  form.reason = ''
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      const enteredCode = form.employeeCode.trim().toUpperCase()
      const emp = employees.find(e => e.code === enteredCode)
      if (!emp) {
        ElNotification({
          title: 'Lỗi',
          message: `Không tìm thấy nhân viên với mã ${enteredCode}!`,
          type: 'error'
        })
        return
      }

      const dateObj = new Date(form.date)
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      const dayOfWeek = dayNamesVi[dateObj.getDay()]
      const weekOfYear = getWeekNumber(dateObj)

      const metrics = calculateAttendanceMetrics({
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        otStart: form.otStart,
        otEnd: form.otEnd,
        breakMinutes: form.breakMinutes
      })

      // Add reason note in errors if exists
      const finalErrors = [...metrics.errors]
      if (form.reason) {
        // Just keep standard errors but log the reason in the record
      }

      const newRecord = {
        id: `${enteredCode}-${form.date}-${Date.now()}`,
        employeeCode: enteredCode,
        employeeName: `${emp.lastName} ${emp.firstName}`,
        year,
        month,
        day,
        dayOfWeek,
        weekOfYear,
        breakTime: `${form.breakMinutes} phút`,
        breakMinutes: form.breakMinutes,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        otStart: form.otStart || '',
        otEnd: form.otEnd || '',
        workHours: metrics.workHours,
        lateMinutes: metrics.lateMinutes,
        otHours: metrics.otHours,
        isLate: metrics.isLate,
        isEarlyLeave: metrics.isEarlyLeave,
        errors: finalErrors,
        reason: form.reason
      }

      // Prepend to display immediately
      allData.value.unshift(newRecord)

      // Auto update active filters so user sees their new entry
      filters.search = newRecord.employeeCode
      activeFilters.search = newRecord.employeeCode
      const newMonth = `${year}-${String(month).padStart(2, '0')}`
      filters.month = newMonth
      activeFilters.month = newMonth
      hasSearched.value = true

      dialogVisible.value = false

      ElNotification({
        title: 'Thành công',
        message: `Đã bổ sung công ngày ${day}/${month}/${year} cho nhân viên ${newRecord.employeeName}!`,
        type: 'success'
      })
    }
  })
}

// Get tag styling based on error message
const getTagType = (err: string) => {
  if (err.includes('Đi trễ')) return 'danger'
  if (err.includes('Về sớm')) return 'warning'
  if (err.includes('Thiếu')) return 'danger'
  if (err.includes('Nghỉ')) return 'info'
  return 'primary'
}
</script>

<style scoped>
.attendance-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

html.dark .attendance-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}
html.dark .attendance-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}
html.dark .attendance-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}
html.dark .attendance-container :deep(.el-table .el-table-fixed-column--left),
html.dark .attendance-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
}

html.dark .custom-dark-select :deep(.el-input__wrapper),
html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #4b5563 inset !important;
}
html.dark .custom-dark-select :deep(.el-input__inner),
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
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
