<template>
  <div class="h-full flex flex-col p-4 md:p-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-y-auto space-y-6">
    <!-- Header Top Row -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Quản lý Task</span>
          <el-tag type="primary" effect="plain" class="!rounded-full font-bold">Jira Workspace</el-tag>
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Theo dõi tổng quan công việc, các bảng dự án và chi tiết nhiệm vụ
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <el-button type="primary" :icon="Plus" @click="handleCreateTask">
          Tạo Task mới
        </el-button>
        <el-button plain :icon="FolderAdd" @click="handleCreateBoard">
          Tạo Board
        </el-button>
      </div>
    </div>

    <!-- MAIN 3 CARDS ROW (1/3 frame width each on desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- CARD 1: THỐNG KÊ TẤT CẢ TASK & SUBTAB TRẠNG THÁI (1/3 khung hình) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <el-icon class="text-blue-500"><DataAnalysis /></el-icon>
              <span>Thống kê Tất cả Task</span>
            </h3>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              Tổng: {{ allTasks.length }} task
            </span>
          </div>

          <!-- Thống kê Trạng thái dạng Thẻ Card Con (Thu gọn trên 1 dòng + Animation khi Hover) -->
          <div class="grid grid-cols-2 gap-2 mt-3">
            <div
              v-for="st in statusStats"
              :key="st.key"
              @click="selectStatsFilter(st.key)"
              class="relative overflow-hidden px-2.5 py-2 rounded-lg border transition-all duration-300 transform cursor-pointer select-none group hover:scale-[1.02] hover:shadow-sm hover:-translate-y-0.5 flex items-center justify-between"
              :class="selectedStatsTab === st.key
                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 shadow-sm ring-1 ring-blue-500/30'
                : 'border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/60 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800'"
            >
              <!-- Hiệu ứng Glow nền khi hover -->
              <div
                class="absolute -right-4 -bottom-4 w-10 h-10 rounded-full opacity-10 group-hover:opacity-25 group-hover:scale-125 transition-all duration-500"
                :style="{ backgroundColor: st.color }"
              ></div>

              <!-- Trạng thái (Dot + Name) trên 1 dòng -->
              <div class="flex items-center space-x-1.5 min-w-0 relative z-10 truncate">
                <span class="w-2 h-2 rounded-full shrink-0 animate-pulse" :style="{ backgroundColor: st.color }"></span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                  {{ st.label }}
                </span>
              </div>

              <!-- Số lượng trên cùng 1 dòng -->
              <div class="flex items-center space-x-1 relative z-10 shrink-0 ml-1">
                <span class="text-xs font-extrabold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                  {{ st.count }}
                </span>
                <span class="text-[10px] text-gray-400 font-normal">task</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Tỷ lệ hoàn thành</span>
            <span class="font-bold text-green-600">{{ completionRate }}%</span>
          </div>
          <el-progress :percentage="completionRate" :color="'#10B981'" :show-text="false" />
        </div>
      </div>

      <!-- CARD 2: DANH SÁCH BOARD (Active / Archived) (1/3 khung hình) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <el-icon class="text-purple-500"><Files /></el-icon>
            <span>Danh sách Board</span>
          </h3>
        </div>

        <!-- 2 Tab để chọn qua lại: Active (Mặc định) và Archived -->
        <div class="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg mb-4">
          <button
            @click="switchBoardTab('ACTIVE')"
            class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all"
            :class="boardTab === 'ACTIVE'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'"
          >
            Active ({{ activeBoardsCount }})
          </button>
          <button
            @click="switchBoardTab('ARCHIVED')"
            class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all"
            :class="boardTab === 'ARCHIVED'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'"
          >
            Archived ({{ archivedBoardsCount }})
          </button>
        </div>

        <!-- Board List Buttons (Mặc định chọn cái đầu tiên) -->
        <div class="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
          <template v-if="displayBoards.length > 0">
            <button
              v-for="(b, idx) in displayBoards"
              :key="b.id"
              @click="selectedBoard = b"
              class="w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group"
              :class="selectedBoard?.id === b.id
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold shadow-sm'
                : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200'"
            >
              <div class="flex items-center space-x-3 truncate">
                <span class="text-xs font-bold px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                  {{ idx + 1 }}
                </span>
                <div class="truncate">
                  <div class="text-xs font-bold truncate">{{ b.board_name }}</div>
                  <div class="text-[10px] text-gray-400 font-normal truncate">{{ b.description || 'Chưa có mô tả' }}</div>
                </div>
              </div>

              <div class="flex items-center space-x-1.5 shrink-0">
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
                  {{ b.board_key }}
                </span>
                
                <!-- Menu Thao Tác Board (Sửa, Lưu trữ / Khôi phục, Xóa) -->
                <el-dropdown trigger="click" @command="(cmd: string) => handleBoardCommand(cmd, b)">
                  <button
                    type="button"
                    @click.stop
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                    title="Thao tác Board"
                  >
                    <el-icon :size="14"><MoreFilled /></el-icon>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit" :icon="Edit">Chỉnh sửa Board</el-dropdown-item>
                      <el-dropdown-item command="archive" :icon="Box">
                        {{ b.status === 'ARCHIVED' ? 'Khôi phục Board' : 'Lưu trữ Board' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" :icon="Delete" class="!text-red-500">
                        Xoá Board
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <el-icon v-if="selectedBoard?.id === b.id" class="text-blue-500"><Right /></el-icon>
              </div>
            </button>
          </template>
          <div v-else class="text-center py-8 text-xs text-gray-400 italic">
            Không có board nào trong danh sách {{ boardTab.toLowerCase() }}.
          </div>
        </div>
      </div>

      <!-- CARD 3: DANH SÁCH TASK THUỘC BOARD (1/3 khung hình) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <el-icon class="text-emerald-500"><List /></el-icon>
              <span>Task thuộc Board:</span>
            </h3>
            <div class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate max-w-[240px]">
              {{ selectedBoard?.board_name || 'Chưa chọn Board' }}
            </div>
          </div>

          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
            {{ currentBoardTasks.length }} task
          </span>
        </div>

        <!-- Tab trạng thái của Task (Mặc định là InProgress) -->
        <div class="flex overflow-x-auto bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg mb-3 space-x-1 no-scrollbar shrink-0">
          <button
            v-for="tab in taskStatusTabs"
            :key="tab.key"
            @click="selectedTaskTab = tab.key"
            class="flex-1 py-1.5 px-2 text-xs font-semibold rounded-md whitespace-nowrap transition-all"
            :class="selectedTaskTab === tab.key
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'"
          >
            {{ tab.label }} ({{ getTaskCountByStatus(tab.key) }})
          </button>
        </div>

        <!-- Task & SubTask List (Dạng Link tiết kiệm diện tích + Scroll kéo lên xuống) -->
        <div class="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
          <template v-if="filteredBoardTasks.length > 0">
            <div
              v-for="(t, idx) in filteredBoardTasks"
              :key="t.id"
              @click="openTaskDetail(t)"
              class="pt-1.5 pb-1.5 px-2 rounded hover:bg-blue-50/70 dark:hover:bg-gray-700/60 transition cursor-pointer group flex items-center justify-between gap-2"
            >
              <!-- STT + Tên task (dạng Link) -->
              <div class="flex items-center space-x-2 flex-1 min-w-0">
                <span class="text-xs font-bold text-gray-400 shrink-0">
                  {{ idx + 1 }}.
                </span>
                <span class="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline group-hover:font-semibold transition truncate">
                  {{ t.title }}
                </span>
              </div>

              <!-- Icon Priority ở cuối dòng (Critical: 2 chevron up, High: 1 chevron up, Medium: =, Low: 1 chevron down) -->
              <div class="shrink-0 flex items-center justify-center p-0.5" :title="`Priority: ${t.priority}`">
                <!-- Critical: 2 chữ V (chevron) chồng lên nhau hướng lên -->
                <svg v-if="t.priority === 'CRITICAL'" class="w-3.5 h-3.5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="18 17 12 11 6 17"></polyline>
                  <polyline points="18 11 12 5 6 11"></polyline>
                </svg>

                <!-- High: 1 chữ V (chevron) hướng lên -->
                <svg v-else-if="t.priority === 'HIGH'" class="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>

                <!-- Medium: Dấu = -->
                <span v-else-if="t.priority === 'MEDIUM'" class="text-blue-500 dark:text-blue-400 font-extrabold text-xs leading-none font-mono px-0.5">=</span>

                <!-- Low: 1 chữ V (chevron) hướng xuống -->
                <svg v-else class="w-3.5 h-3.5 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </template>

          <div v-else class="text-center py-8 text-xs text-gray-400 italic">
            Không có task nào thuộc trạng thái {{ selectedTaskTab }} trong board này.
          </div>
        </div>
      </div>

    </div>

    <!-- NỘI DUNG CHI TIẾT TASK HIỂN THỊ TRỰC TIẾP PHÍA DƯỚI 3 THẺ CARD (Chỉ hiển thị khi nhấn vào 1 task) -->
    <div v-if="selectedTaskDetail" class="mt-6">

      <!-- Task Detail Inline View -->
      <TaskDetailInline
        :task-data="selectedTaskDetail"
        @updated="loadAllData"
      />
    </div>

    <!-- Modal Tạo Task Mới (Popup Modal đầy đủ) -->
    <CreateTaskModal
      v-model="isCreateTaskModalOpen"
      :selected-board-id="selectedBoard?.id"
      :all-boards="allBoards"
      @created="onTaskCreated"
    />

    <!-- Modal Tạo / Sửa Board Mới -->
    <CreateBoardModal
      v-model="isCreateBoardModalOpen"
      :board-data="selectedBoardForEdit"
      @created="onBoardCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  FolderAdd,
  DataAnalysis,
  Files,
  List,
  Check,
  Right,
  Connection,
  ChatDotRound,
  Document,
  MoreFilled,
  Edit,
  Delete,
  Box
} from '@element-plus/icons-vue'
import { projectManagementService, type Board, type TaskItem } from '@/api/projectManagementService'
import TaskDetailInline from './TaskDetailInline.vue'
import CreateTaskModal from './CreateTaskModal.vue'
import CreateBoardModal from './CreateBoardModal.vue'

// State
const allBoards = ref<Board[]>([])
const allTasks = ref<TaskItem[]>([])
const selectedBoard = ref<Board | null>(null)
const isCreateBoardModalOpen = ref(false)
const selectedBoardForEdit = ref<Board | null>(null)

// Card 2 State
const boardTab = ref<'ACTIVE' | 'ARCHIVED'>('ACTIVE')

// Card 3 State (mặc định tab InProgress)
const selectedTaskTab = ref<string>('IN_PROGRESS')

// Card 1 State
const selectedStatsTab = ref<string>('ALL')

// Modal detail & Create Task Modal
const isDetailModalOpen = ref(false)
const selectedTaskDetail = ref<TaskItem | null>(null)
const isCreateTaskModalOpen = ref(false)

const taskStatusTabs = [
  { key: 'IN_PROGRESS', label: 'InProgress' },
  { key: 'OPEN', label: 'ToDo' },
  { key: 'DONE', label: 'Done' },
  { key: 'BLOCKED', label: 'Blocked' },
]

const statusStats = computed(() => {
  const tasks = allTasks.value
  return [
    { key: 'OPEN', label: 'ToDo', count: tasks.filter(t => t.status === 'OPEN').length, color: '#6B7280', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    { key: 'IN_PROGRESS', label: 'InProgress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#3B82F6', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' },
    { key: 'DONE', label: 'Done', count: tasks.filter(t => t.status === 'DONE').length, color: '#10B981', badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300' },
    { key: 'BLOCKED', label: 'Blocked', count: tasks.filter(t => t.status === 'BLOCKED').length, color: '#F59E0B', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' },
    { key: 'CANCELLED', label: 'Cancelled', count: tasks.filter(t => t.status === 'CANCELLED').length, color: '#EF4444', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300' },
  ]
})

const completionRate = computed(() => {
  if (!allTasks.value.length) return 0
  const done = allTasks.value.filter(t => t.status === 'DONE').length
  return Math.round((done / allTasks.value.length) * 100)
})

const activeBoards = computed(() => allBoards.value.filter(b => b.status === 'ACTIVE'))
const archivedBoards = computed(() => allBoards.value.filter(b => b.status === 'ARCHIVED'))
const activeBoardsCount = computed(() => activeBoards.value.length)
const archivedBoardsCount = computed(() => archivedBoards.value.length)

const displayBoards = computed(() => {
  return boardTab.value === 'ACTIVE' ? activeBoards.value : archivedBoards.value
})

const currentBoardTasks = computed(() => {
  if (!selectedBoard.value) return []
  return allTasks.value.filter(t => t.board_id === selectedBoard.value?.id)
})

const priorityWeight: Record<string, number> = {
  'CRITICAL': 4,
  'HIGH': 3,
  'MEDIUM': 2,
  'LOW': 1,
}

const filteredBoardTasks = computed(() => {
  const list = currentBoardTasks.value.filter(t => t.status === selectedTaskTab.value)
  return [...list].sort((a, b) => {
    const wA = priorityWeight[a.priority] || 0
    const wB = priorityWeight[b.priority] || 0
    return wB - wA
  })
})

const getTaskCountByStatus = (st: string) => {
  return currentBoardTasks.value.filter(t => t.status === st).length
}

const switchBoardTab = async (status: 'ACTIVE' | 'ARCHIVED') => {
  boardTab.value = status
  const list = status === 'ACTIVE' ? activeBoards.value : archivedBoards.value
  selectedBoard.value = list.length > 0 && list[0] ? list[0] : null
}

const selectStatsFilter = (stKey: string) => {
  selectedStatsTab.value = stKey
}

const getPriorityBadgeClass = (pr?: string) => {
  switch (pr) {
    case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
    case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
    case 'MEDIUM': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

const getPrioritySymbol = (pr?: string) => {
  switch (pr) {
    case 'CRITICAL': return '^^'
    case 'HIGH': return '^'
    case 'MEDIUM': return '='
    case 'LOW': return 'v'
    default: return '='
  }
}

const getPrioritySymbolClass = (pr?: string) => {
  switch (pr) {
    case 'CRITICAL': return 'text-red-600 dark:text-red-400 font-extrabold text-sm tracking-tighter'
    case 'HIGH': return 'text-orange-500 dark:text-orange-400 font-extrabold text-sm'
    case 'MEDIUM': return 'text-blue-500 dark:text-blue-400 font-extrabold text-sm'
    case 'LOW': return 'text-green-500 dark:text-green-400 font-extrabold text-sm'
    default: return 'text-gray-400 font-bold text-sm'
  }
}

const openTaskDetail = (taskItem: TaskItem) => {
  selectedTaskDetail.value = taskItem
}

const loadAllData = async () => {
  try {
    const [actives, archiveds, tasks] = await Promise.all([
      projectManagementService.getBoards('ACTIVE'),
      projectManagementService.getBoards('ARCHIVED'),
      projectManagementService.getTasks({}),
    ])
    allBoards.value = [...actives, ...archiveds]
    allTasks.value = tasks

    // Set default selected board (1st active board)
    if (actives.length > 0 && actives[0]) {
      selectedBoard.value = actives[0]
    } else if (allBoards.value.length > 0 && allBoards.value[0]) {
      selectedBoard.value = allBoards.value[0]
    } else {
      selectedBoard.value = null
    }
  } catch (e) {
    console.error('Lỗi khi tải danh sách board & task:', e)
  }
}

const handleCreateBoard = () => {
  selectedBoardForEdit.value = null
  isCreateBoardModalOpen.value = true
}

const handleBoardCommand = async (cmd: string, board: Board) => {
  if (cmd === 'edit') {
    selectedBoardForEdit.value = board
    isCreateBoardModalOpen.value = true
  } else if (cmd === 'archive') {
    try {
      const updated = await projectManagementService.archiveBoard(board.id)
      const actionText = updated.status === 'ARCHIVED' ? 'Lưu trữ' : 'Khôi phục'
      ElMessage.success(`Đã ${actionText.toLowerCase()} board "${board.board_name}" thành công`)
      await loadAllData()
    } catch (e) {
      ElMessage.error('Không thể cập nhật trạng thái Board')
    }
  } else if (cmd === 'delete') {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xoá Board "${board.board_name}" (${board.board_key})? Tất cả công việc thuộc board này sẽ bị xoá vĩnh viễn!`,
      'Cảnh Báo Xoá Board',
      {
        confirmButtonText: 'Xoá vĩnh viễn',
        cancelButtonText: 'Hủy',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    ).then(async () => {
      await projectManagementService.deleteBoard(board.id)
      ElMessage.success(`Đã xoá Board "${board.board_name}"`)
      if (selectedBoard.value?.id === board.id) {
        selectedBoard.value = null
      }
      await loadAllData()
    }).catch(() => {})
  }
}

const onBoardCreated = async (newBoard: Board) => {
  isCreateBoardModalOpen.value = false
  await loadAllData()
  if (newBoard) {
    selectedBoard.value = newBoard
  }
}

const handleCreateTask = () => {
  if (!selectedBoard.value && activeBoards.value.length === 0) {
    ElMessage.warning('Vui lòng chọn hoặc tạo 1 Board trước khi thêm task')
    return
  }
  isCreateTaskModalOpen.value = true
}

const onTaskCreated = async () => {
  isCreateTaskModalOpen.value = false
  await loadAllData()
}

onMounted(() => {
  loadAllData()
})
</script>
