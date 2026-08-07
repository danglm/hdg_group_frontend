<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="1100px"
    align-center
    destroy-on-close
    class="custom-dark-dialog create-task-modal-dialog !rounded-2xl overflow-hidden relative"
    :show-close="false"
  >
    <!-- Modal Flex Container -->
    <div class="flex flex-col max-h-[85vh] h-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden rounded-2xl">
      
      <!-- 1. MODAL HEADER BAR -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/90 flex items-center justify-between shrink-0 z-20">
        <div class="flex items-center space-x-2.5">
          <span class="w-2 h-5 bg-blue-600 rounded-full"></span>
          <h3 class="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            {{ getModalTitle }}
          </h3>
        </div>

        <!-- Nút đóng (X) tích hợp góc phải thanh tiêu đề -->
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 dark:bg-gray-700/80 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Đóng (Esc)"
        >
          <el-icon :size="14"><Close /></el-icon>
        </button>
      </div>

      <!-- 2. SCROLLABLE FORM BODY -->
      <div class="overflow-y-auto overflow-x-hidden p-0 max-h-[calc(85vh-115px)]">
        <TaskDetailInline
          ref="taskDetailRef"
          :is-create-mode="!taskData"
          :task-data="taskData"
          :is-subtask-mode="isSubtaskMode"
          :parent-task="parentTask"
          :hide-footer="!taskData"
          :selected-board-id="selectedBoardId"
          :all-boards="allBoards"
          @created="onCreated"
          @updated="onUpdated"
          @cancel="$emit('update:modelValue', false)"
        />
      </div>

      <!-- 3. FOOTER BAR -->
      <div class="px-6 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/90 flex items-center justify-end space-x-3 shrink-0 z-20">
        <template v-if="!taskData">
          <el-button @click="$emit('update:modelValue', false)">Hủy</el-button>
          <el-button
            type="primary"
            :disabled="!taskDetailRef?.task?.title?.trim()"
            :loading="taskDetailRef?.isSubmitting"
            @click="submitCreateTask"
            class="!font-bold px-6"
          >
            {{ isSubtaskMode ? 'Tạo Subtask' : 'Tạo Task' }}
          </el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="$emit('update:modelValue', false)" class="!font-bold px-6">
            Đóng
          </el-button>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { type Board, type TaskItem } from '@/api/projectManagementService'
import TaskDetailInline from './TaskDetailInline.vue'

const props = defineProps<{
  modelValue: boolean
  selectedBoardId?: string
  allBoards?: Board[]
  parentTask?: TaskItem | null
  isSubtaskMode?: boolean
  taskData?: TaskItem | null
  modalTitle?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', task: TaskItem): void
  (e: 'updated'): void
}>()

const taskDetailRef = ref<any>(null)

const getModalTitle = computed(() => {
  if (props.modalTitle) return props.modalTitle
  if (props.isSubtaskMode) {
    return props.taskData ? `CHI TIẾT SUBTASK ${props.taskData.task_code ? `: ${props.taskData.task_code}` : ''}` : 'TẠO SUBTASK MỚI'
  }
  return props.taskData ? `CHI TIẾT CÔNG VIỆC ${props.taskData.task_code ? `: ${props.taskData.task_code}` : ''}` : 'TẠO CÔNG VIỆC MỚI'
})

const submitCreateTask = () => {
  taskDetailRef.value?.handleCreateTaskSubmit()
}

const onCreated = (task: TaskItem) => {
  emit('created', task)
  emit('update:modelValue', false)
}

const onUpdated = () => {
  emit('updated')
}
</script>

<style>
/* Style cho modal dialog không bị trùng viền */
.create-task-modal-dialog {
  --el-dialog-padding-primary: 0px !important;
  padding: 0 !important;
  border-radius: 1rem !important;
  overflow: hidden !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  height: auto !important;
  max-height: 85vh !important;
}

html.dark .create-task-modal-dialog,
.dark .create-task-modal-dialog {
  border-color: #374151 !important;
}

.create-task-modal-dialog.el-dialog,
.create-task-modal-dialog .el-dialog {
  padding: 0 !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
  height: auto !important;
  max-height: 85vh !important;
}

.create-task-modal-dialog .el-dialog__header {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 0 !important;
}

.create-task-modal-dialog .el-dialog__body {
  padding: 0 !important;
  margin: 0 !important;
  background-color: transparent !important;
  height: auto !important;
  max-height: 85vh !important;
}

.create-task-modal-dialog .el-dialog__footer {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 0 !important;
}

/* Custom scrollbar gọn đẹp */
.create-task-modal-dialog ::-webkit-scrollbar {
  width: 6px;
}
.create-task-modal-dialog ::-webkit-scrollbar-track {
  background: transparent;
}
.create-task-modal-dialog ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
html.dark .create-task-modal-dialog ::-webkit-scrollbar-thumb,
.dark .create-task-modal-dialog ::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
