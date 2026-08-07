<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="740px"
    align-center
    destroy-on-close
    class="custom-dark-dialog create-board-modal-dialog !rounded-2xl overflow-hidden relative"
    :show-close="false"
  >
    <!-- Modal Flex Container -->
    <div class="flex flex-col max-h-[85vh] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden rounded-2xl">
      
      <!-- 1. MODAL HEADER BAR -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/90 flex items-center justify-between shrink-0 z-20">
        <div class="flex items-center space-x-2.5">
          <span class="w-2.5 h-6 bg-blue-600 rounded-full"></span>
          <div>
            <h3 class="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <span>{{ boardData ? 'CHỈNH SỬA BOARD DỰ ÁN' : 'TẠO BOARD DỰ ÁN MỚI' }}</span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Khởi tạo bảng quản lý công việc và quy trình Kanban</p>
          </div>
        </div>

        <!-- Nút đóng (X) tích hợp góc phải thanh tiêu đề -->
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 dark:bg-gray-700/80 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Đóng (Esc)"
        >
          <el-icon :size="16"><Close /></el-icon>
        </button>
      </div>

      <!-- 2. FORM BODY -->
      <div class="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
        
        <!-- SECTION 1: THÔNG TIN CƠ BẢN -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <el-icon class="text-blue-600 dark:text-blue-400"><FolderAdd /></el-icon>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">1. Thông tin chung</h4>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Tên Board (Chiếm 2 cột) -->
            <div class="sm:col-span-2 space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Tên Board Dự Án <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="form.board_name"
                placeholder="Ví dụ: Dự Án Tiến Nga 2026, Hệ Thống Ggomoosin..."
                size="large"
                @input="onNameInput"
                autofocus
              />
            </div>

            <!-- Mã viết tắt Board Key (Chiếm 1 cột) -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Mã Board Key <span class="text-red-500">*</span>
                </label>
                <el-tooltip content="Mã 2-4 ký tự dùng để tự động sinh mã Task Code (VD: 'TN' -> mã task TN-001)" placement="top">
                  <el-icon class="text-gray-400 cursor-pointer"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-input
                v-model="form.board_key"
                placeholder="VD: TN"
                size="large"
                maxlength="6"
                class="font-mono uppercase !font-bold"
                @input="(val: string) => form.board_key = val.toUpperCase().trim()"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Dự Án / Khối Liên Kết -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Dự Án / Khối Phòng Ban Liên Kết
              </label>
              <el-select
                v-model="form.project_id"
                placeholder="Chọn Dự Án liên kết..."
                size="default"
                class="w-full"
                clearable
              >
                <el-option
                  v-for="p in projectOptions"
                  :key="p.id"
                  :label="p.name"
                  :value="p.id"
                />
              </el-select>
            </div>

            <!-- Mã Màu Nhận Diện Board (Color Chip Badge) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Màu sắc nhận diện (Badge Tag)
              </label>
              <div class="flex items-center space-x-2 pt-1">
                <button
                  v-for="color in colorPalette"
                  :key="color.hex"
                  type="button"
                  @click="form.board_color = color.hex"
                  class="w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer border-2"
                  :style="{ backgroundColor: color.hex }"
                  :class="form.board_color === color.hex ? 'border-gray-900 dark:border-white scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'"
                  :title="color.name"
                >
                  <el-icon v-if="form.board_color === color.hex" class="text-white text-xs"><Check /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: PHÂN QUYỀN & NHÂN SỰ -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <el-icon class="text-blue-600 dark:text-blue-400"><User /></el-icon>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">2. Phân công & Quản lý</h4>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Người sở hữu Board -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Chủ sở hữu Board (Owner) <span class="text-red-500">*</span>
              </label>
              <el-select
                v-model="form.owner_id"
                placeholder="Chọn Trưởng dự án..."
                size="default"
                class="w-full"
                filterable
              >
                <el-option
                  v-for="user in memberOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                >
                  <div class="flex items-center space-x-2">
                    <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                    <span>{{ user.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- Người gán mặc định -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Người thực hiện mặc định (Default Assignee)
              </label>
              <el-select
                v-model="form.default_assignee_id"
                placeholder="Unassigned (Chưa phân công)"
                size="default"
                class="w-full"
                clearable
                filterable
              >
                <el-option
                  v-for="user in memberOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                >
                  <div class="flex items-center space-x-2">
                    <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                    <span>{{ user.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
        </div>

        <!-- SECTION 3: MẪU QUY TRÌNH & CỘT KANBAN -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
            <div class="flex items-center space-x-2">
              <el-icon class="text-blue-600 dark:text-blue-400"><DataAnalysis /></el-icon>
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">3. Quy trình & Cột Kanban</h4>
            </div>
            <span class="text-[11px] text-gray-400">Khởi tạo tự động</span>
          </div>

          <!-- Template Selection Chips -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="tpl in templateOptions"
              :key="tpl.id"
              @click="form.template_id = tpl.id"
              class="p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between"
              :class="form.template_id === tpl.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-gray-50/50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400'"
            >
              <div class="flex items-center justify-between font-bold text-xs mb-1">
                <span>{{ tpl.name }}</span>
                <el-icon v-if="form.template_id === tpl.id" class="text-blue-600 dark:text-blue-400"><Check /></el-icon>
              </div>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{{ tpl.desc }}</p>
            </div>
          </div>

          <!-- Preview Cột Trạng Thái -->
          <div class="p-3 rounded-xl bg-gray-100/70 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
            <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2">Xem trước các cột trạng thái sẽ tạo:</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="col in selectedTemplateColumns"
                :key="col.name"
                class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                :style="{ backgroundColor: col.bgColor, color: col.textColor }"
              >
                <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: col.textColor }"></span>
                <span>{{ col.name }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- SECTION 4: MÔ TẢ CHI TIẾT -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <el-icon class="text-blue-600 dark:text-blue-400"><Document /></el-icon>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">4. Mô tả chi tiết & Ghi chú</h4>
          </div>

          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Nhập chi tiết phạm vi quản lý, định hướng chiến lược hoặc ghi chú vận hành cho Board này..."
          />
        </div>

      </div>

      <!-- 3. FOOTER BAR -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/90 flex items-center justify-between shrink-0 z-20">
        <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sẵn sàng khởi tạo Kanban Board</span>
        </div>

        <div class="flex items-center space-x-3">
          <el-button @click="$emit('update:modelValue', false)">Hủy</el-button>
          <el-button
            type="primary"
            :loading="isSubmitting"
            :disabled="!form.board_name.trim() || !form.board_key.trim()"
            @click="submitCreateBoard"
            class="!font-bold px-6"
          >
            {{ boardData ? 'Lưu Cập Nhật' : 'Tạo Board Dự Án' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  Close,
  QuestionFilled,
  FolderAdd,
  User,
  DataAnalysis,
  Document,
  Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { projectManagementService, type Board } from '@/api/projectManagementService'

const props = defineProps<{
  modelValue: boolean
  boardData?: Board | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', board: Board): void
}>()

const isSubmitting = ref(false)

const colorPalette = [
  { hex: '#3B82F6', name: 'Blue Sky' },
  { hex: '#10B981', name: 'Emerald Green' },
  { hex: '#8B5CF6', name: 'Purple Royal' },
  { hex: '#F59E0B', name: 'Amber Gold' },
  { hex: '#EF4444', name: 'Rose Red' },
  { hex: '#06B6D4', name: 'Cyan Ocean' }
]

const projectOptions = [
  { id: 'p1', name: 'Dự Án Thu Mua Mủ Tiến Nga' },
  { id: 'p2', name: 'Dự Án Chuỗi Nhà Máy Ggomoosin' },
  { id: 'p3', name: 'Dự Án Bất Động Sản Cho Thuê HDG' },
  { id: 'p4', name: 'Khối Công Nghệ & Vận Hành HDG Group' }
]

const memberOptions = [
  { id: 'TN001', name: 'TN001 - Nguyễn Văn Tiến' },
  { id: 'TN002', name: 'TN002 - Trần Tiến Nga' },
  { id: 'TN003', name: 'TN003 - Lê Minh Đức' },
  { id: 'TN004', name: 'TN004 - Phạm Hoàng Nam' },
  { id: 'u5', name: 'Jason Howie' }
]

const templateOptions = [
  { id: 'kanban', name: 'Kanban Tiêu Chuẩn', desc: '4 cột quy trình tiêu chuẩn (Cần Làm, Đang Làm, Hoàn Thành, Huỷ)' },
  { id: 'scrum', name: 'Scrum Sprint', desc: '5 cột linh hoạt (Backlog, Ready, In Progress, Review, Done)' },
  { id: 'simple', name: 'Đơn Giản (3 Cột)', desc: '3 cột tối giản (Cần Làm, Đang Làm, Hoàn Thành)' }
]

const form = reactive({
  board_name: '',
  board_key: '',
  project_id: '',
  board_color: '#3B82F6',
  owner_id: 'TN001',
  default_assignee_id: '',
  template_id: 'kanban',
  description: ''
})

const selectedTemplateColumns = computed(() => {
  if (form.template_id === 'scrum') {
    return [
      { name: 'Backlog', bgColor: '#E5E7EB', textColor: '#374151' },
      { name: 'Sẵn Sàng', bgColor: '#DBEAFE', textColor: '#1E40AF' },
      { name: 'Đang Làm', bgColor: '#FEF3C7', textColor: '#92400E' },
      { name: 'Review', bgColor: '#F3E8FF', textColor: '#6B21A8' },
      { name: 'Hoàn Thành', bgColor: '#D1FAE5', textColor: '#065F46' }
    ]
  } else if (form.template_id === 'simple') {
    return [
      { name: 'Cần Làm', bgColor: '#DBEAFE', textColor: '#1E40AF' },
      { name: 'Đang Làm', bgColor: '#FEF3C7', textColor: '#92400E' },
      { name: 'Hoàn Thành', bgColor: '#D1FAE5', textColor: '#065F46' }
    ]
  }
  return [
    { name: 'Cần Làm', bgColor: '#DBEAFE', textColor: '#1E40AF' },
    { name: 'Đang Làm', bgColor: '#FEF3C7', textColor: '#92400E' },
    { name: 'Hoàn Thành', bgColor: '#D1FAE5', textColor: '#065F46' },
    { name: 'Huỷ', bgColor: '#FEE2E2', textColor: '#991B1B' }
  ]
})

const onNameInput = (val: string) => {
  if (!props.boardData && (!form.board_key || form.board_key.length <= 3)) {
    const words = val.trim().split(/\s+/)
    if (words.length >= 2) {
      form.board_key = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    } else if (val.trim().length >= 2) {
      form.board_key = val.trim().substring(0, 3).toUpperCase()
    }
  }
}

watch(
  () => [props.modelValue, props.boardData],
  ([isOpen]) => {
    if (isOpen) {
      if (props.boardData) {
        form.board_name = props.boardData.board_name || ''
        form.board_key = props.boardData.board_key || ''
        form.description = props.boardData.description || ''
        form.owner_id = props.boardData.owner_id || 'TN001'
        form.default_assignee_id = props.boardData.default_assignee_id || ''
        form.project_id = props.boardData.project_id || ''
      } else {
        form.board_name = ''
        form.board_key = ''
        form.project_id = ''
        form.board_color = '#3B82F6'
        form.owner_id = 'TN001'
        form.default_assignee_id = ''
        form.template_id = 'kanban'
        form.description = ''
      }
    }
  },
  { immediate: true }
)

const submitCreateBoard = async () => {
  if (!form.board_name.trim()) {
    ElMessage.warning('Vui lòng nhập tên Board dự án')
    return
  }
  if (!form.board_key.trim()) {
    ElMessage.warning('Vui lòng nhập Mã Board Key')
    return
  }

  try {
    isSubmitting.value = true
    if (props.boardData) {
      const updatedBoard = await projectManagementService.updateBoard(props.boardData.id, {
        board_name: form.board_name.trim(),
        board_key: form.board_key.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        owner_id: form.owner_id,
        default_assignee_id: form.default_assignee_id || undefined
      })
      ElMessage.success(`Đã cập nhật Board "${updatedBoard.board_name}"`)
      emit('created', updatedBoard)
    } else {
      const newBoard = await projectManagementService.createBoard({
        board_name: form.board_name.trim(),
        board_key: form.board_key.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        owner_id: form.owner_id,
        default_assignee_id: form.default_assignee_id || undefined
      })
      ElMessage.success(`Đã tạo thành công Board "${newBoard.board_name}" (${newBoard.board_key})`)
      emit('created', newBoard)
    }
    emit('update:modelValue', false)
  } catch (e) {
    ElMessage.error(props.boardData ? 'Không thể cập nhật Board' : 'Không thể tạo Board mới')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style>
.create-board-modal-dialog {
  --el-dialog-padding-primary: 0px !important;
  padding: 0 !important;
  border-radius: 1rem !important;
  overflow: hidden !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  height: auto !important;
  max-height: 85vh !important;
}

html.dark .create-board-modal-dialog,
.dark .create-board-modal-dialog {
  border-color: #374151 !important;
}

.create-board-modal-dialog.el-dialog,
.create-board-modal-dialog .el-dialog {
  padding: 0 !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
  height: auto !important;
  max-height: 85vh !important;
}

.create-board-modal-dialog .el-dialog__header {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.create-board-modal-dialog .el-dialog__body {
  padding: 0 !important;
  margin: 0 !important;
  background-color: transparent !important;
  height: auto !important;
  max-height: 85vh !important;
}

.create-board-modal-dialog .el-dialog__footer {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Custom scrollbar gọn đẹp */
.create-board-modal-dialog ::-webkit-scrollbar {
  width: 6px;
}
.create-board-modal-dialog ::-webkit-scrollbar-track {
  background: transparent;
}
.create-board-modal-dialog ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
html.dark .create-board-modal-dialog ::-webkit-scrollbar-thumb,
.dark .create-board-modal-dialog ::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
