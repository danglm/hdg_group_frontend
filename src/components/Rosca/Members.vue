<template>
  <div class="rosca-members-container h-full">
    <div class="members-content h-full flex flex-col text-left">
          <!-- Filters & Actions -->
          <div class="flex flex-wrap justify-between items-center gap-4 mb-4 shrink-0">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Bộ lọc Dây Hụi (Rosca Select) -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-770 dark:text-gray-300">Dây hụi:</span>
                <el-select 
                  v-model="filters.rosca_id" 
                  placeholder="Tất cả" 
                  clearable 
                  class="custom-dark-input"
                  style="width: 180px"
                  @change="handleFilterChange"
                >
                  <el-option label="Tất cả" value="" />
                  <el-option 
                    v-for="r in roscasList" 
                    :key="r.id" 
                    :label="r.code + ' (' + (r.owner_name || 'N/A') + ')'" 
                    :value="r.id || ''" 
                  />
                </el-select>
              </div>

              <!-- Trạng thái (Status filter) -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-770 dark:text-gray-300">Trạng thái:</span>
                <el-select 
                  v-model="filters.status" 
                  placeholder="Tất cả" 
                  clearable 
                  class="custom-dark-input"
                  style="width: 140px"
                  @change="handleFilterChange"
                >
                  <el-option label="Tất cả" value="" />
                  <el-option label="Đang chơi" value="Playing" />
                  <el-option label="Bể hụi" value="Defaulted" />
                </el-select>
              </div>

              <!-- Tìm kiếm (Search query) -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-770 dark:text-gray-300">Tìm kiếm:</span>
                <el-input 
                  v-model="filters.search" 
                  placeholder="Nhập tên, mã, nhóm..." 
                  clearable 
                  class="custom-dark-input"
                  style="width: 200px"
                  @input="handleSearchInput"
                  @clear="handleFilterChange"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- Actions buttons -->
            <div class="flex items-center gap-2">
              <el-button :icon="Refresh" circle @click="fetchMembers" :loading="loading" />
              <el-button 
                type="primary" 
                class="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none rounded-xl font-semibold shadow-sm text-white flex items-center"
                @click="handleOpenCreateDialog"
              >
                <el-icon class="mr-1"><Plus /></el-icon>
                Thêm chân hụi
              </el-button>
            </div>
          </div>

          <!-- Members Card Grid -->
          <div v-loading="loading" class="flex-1 min-h-0 overflow-y-auto p-1">
            <div v-if="filteredMembers.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div 
                v-for="member in filteredMembers" 
                :key="member.id"
                class="group relative rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/40 flex flex-col"
              >
                <!-- Card Header -->
                <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60 mb-4 shrink-0">
                  <div class="flex items-center gap-2">
                    <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-lg">
                      <el-icon :size="18"><User /></el-icon>
                    </div>
                    <span class="font-bold text-gray-800 dark:text-gray-100 text-base select-all">{{ member.player_name || 'N/A' }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <el-tag :type="getStatusTagType(member.status)" size="small" effect="plain" class="font-semibold">
                      {{ getStatusLabel(member.status) }}
                    </el-tag>
                    <!-- 3-dots actions menu -->
                    <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, member)">
                      <el-button link type="info" class="p-1 !text-gray-400 hover:!text-gray-600 dark:hover:!text-gray-200">
                        <el-icon :size="18"><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="detail">Chi tiết</el-dropdown-item>
                          <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                          <el-dropdown-item command="delete" divided class="!text-red-500">Xóa</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="space-y-3 flex-1 text-sm text-left">
                  <!-- Row 1: Dây Hụi -->
                  <div class="flex justify-between">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Mã dây hụi:</span>
                    <span class="text-blue-600 dark:text-blue-400 font-bold font-mono select-all">{{ member.rosca_code }}</span>
                  </div>
                  <!-- Row 2: Player ID -->
                  <div class="flex justify-between">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Mã người chơi:</span>
                    <span class="text-gray-850 dark:text-gray-200 font-bold font-mono select-all">{{ member.user_id }}</span>
                  </div>
                  <!-- Row 3: Chân chơi -->
                  <div class="flex justify-between">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Số chân sở hữu:</span>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold font-mono">{{ member.parts_count || 1 }} chân</span>
                  </div>
                  <!-- Row 4: Đã đóng -->
                  <div class="flex justify-between">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Tổng đã đóng:</span>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold font-mono">{{ formatCurrency(member.total_contributed) }}</span>
                  </div>
                  <!-- Row 5: Đã nhận -->
                  <div class="flex justify-between">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Tổng đã nhận:</span>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold font-mono">{{ formatCurrency(member.total_received) }}</span>
                  </div>
                  <!-- Row 6: Lợi nhuận -->
                  <div class="flex justify-between">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Tổng lợi nhuận:</span>
                    <span 
                      class="font-bold font-mono" 
                      :class="(member.total_profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'"
                    >
                      {{ formatCurrency(member.total_profit) }} ({{ member.profit_rate || 0 }}%)
                    </span>
                  </div>
                </div>

                <!-- Card Footer -->
                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex justify-between items-center text-xs text-gray-400 shrink-0">
                  <span class="truncate max-w-[140px]" :title="member.telegram_group || ''">Tele: {{ member.telegram_group || '—' }}</span>
                  <span class="truncate max-w-[140px]" :title="member.note || ''">Note: {{ member.note || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <el-icon class="text-6xl mb-4"><User /></el-icon>
              <p class="text-lg font-medium">Chưa tìm thấy chân hụi nào phù hợp</p>
              <el-button type="primary" link class="mt-2 font-bold" @click="handleOpenCreateDialog">Thêm chân chơi đầu tiên</el-button>
            </div>
          </div>
        </div>


    <!-- Dialog: Add / Edit Member -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'CHỈNH SỬA THÔNG TIN CHÂN HỤI' : 'THÊM MỚI CHÂN HỤI'"
      width="850px"
      destroy-on-close
      align-center
      class="custom-dark-dialog"
    >
      <div class="max-h-[65vh] overflow-y-auto overflow-x-hidden px-2">
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="formRef" 
          label-width="180px"
          class="mt-2 compact-form"
          @submit.prevent="submitForm"
        >
          <!-- PHẦN 1: THÔNG TIN CHÂN HỤI -->
          <div class="mb-6">
            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Thông tin chân hụi
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Dây hụi" prop="rosca_id" required>
                  <el-select 
                    v-model="form.rosca_id" 
                    placeholder="Chọn dây hụi..." 
                    class="w-full highlight-select" 
                    style="width: 100%"
                    :disabled="isEdit"
                  >
                    <el-option 
                      v-for="r in roscasList" 
                      :key="r.id" 
                      :label="r.code + ' (' + (r.owner_name || 'N/A') + ')'" 
                      :value="r.id || ''" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Người chơi" prop="user_id" required>
                  <el-select 
                    v-model="form.user_id" 
                    placeholder="Chọn người chơi..." 
                    class="w-full highlight-select" 
                    style="width: 100%"
                    :disabled="isEdit"
                  >
                    <el-option 
                      v-for="player in players" 
                      :key="player.id" 
                      :label="player.full_name + ' (' + player.id + ')'" 
                      :value="player.id" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Số chân chơi" prop="parts_count" required>
                  <el-input-number v-model="form.parts_count" :min="1" :max="10" class="w-full" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Trạng thái chơi" prop="status" required>
                  <el-select v-model="form.status" placeholder="Chọn trạng thái..." class="w-full highlight-select" style="width: 100%">
                    <el-option label="Đang chơi (Playing)" value="Playing" />
                    <el-option label="Bể hụi (Defaulted)" value="Defaulted" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PHẦN 2: THÔNG TIN ĐÓNG HỐT & LỢI NHUẬN -->
          <div class="mb-6">
            <h4 class="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
              Thông tin Đóng hốt &amp; Lợi nhuận
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tổng đã đóng" prop="total_contributed">
                  <el-input 
                    v-model="form.total_contributed" 
                    placeholder="Nhập số tiền..."
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tổng đã nhận (Hốt)" prop="total_received">
                  <el-input 
                    v-model="form.total_received" 
                    placeholder="Nhập số tiền..."
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tổng lợi nhuận" prop="total_profit">
                  <el-input 
                    v-model="form.total_profit" 
                    placeholder="Nhập số tiền..."
                    :formatter="(value) => !value ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                    :parser="(value) => value.replace(/\./g, '')"
                  >
                    <template #suffix>
                      <span class="text-xs text-gray-400">VNĐ</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tỷ suất lợi nhuận (%)" prop="profit_rate">
                  <el-input-number v-model="form.profit_rate" :precision="2" :step="0.1" class="w-full" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PHẦN 3: THÔNG TIN LIÊN KẾT -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              Thông tin liên kết &amp; Ghi chú
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Nhóm Telegram" prop="telegram_group">
                  <el-input v-model="form.telegram_group" placeholder="Ví dụ: @nhomhui_dh01" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="Ghi chú" prop="note">
                  <el-input type="textarea" v-model="form.note" :rows="3" placeholder="Nhập ghi chú riêng cho chân hụi này..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pr-2">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button 
            type="primary" 
            @click="submitForm" 
            :loading="submitting"
            class="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none font-semibold text-white"
          >
            Xác nhận
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog: Detail Member -->
    <el-dialog
      v-model="detailDialogVisible"
      title="CHI TIẾT CHÂN HỤI"
      width="850px"
      destroy-on-close
      align-center
      class="custom-dark-dialog"
    >
      <div v-if="selectedMember" class="px-2 space-y-6 max-h-[60vh] overflow-y-auto text-left">
        <!-- Visual Profile Header -->
        <div class="flex items-center gap-5 pb-4 border-b border-gray-150 dark:border-gray-700">
          <div class="p-3.5 rounded-2xl bg-blue-500 dark:bg-blue-600 text-white shadow-md flex items-center justify-center">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hồ sơ chân hụi</div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
              {{ selectedMember.player_name }}
            </h3>
            <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
              <span class="text-gray-500 dark:text-gray-400">Dây hụi: <strong class="text-gray-750 dark:text-gray-250 font-mono">{{ selectedMember.rosca_code }}</strong></span>
              <span class="text-gray-300 dark:text-gray-650">|</span>
              <span class="text-gray-500 dark:text-gray-400">Trạng thái: 
                <el-tag :type="getStatusTagType(selectedMember.status)" size="small" effect="plain" class="font-semibold ml-1">
                  {{ getStatusLabel(selectedMember.status) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- Section 1: Thông tin cơ bản -->
        <div>
          <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
            Thông tin chân hụi
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Mã Dây Hụi</div>
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono">{{ selectedMember.rosca_code }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Mã Người Chơi</div>
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono">{{ selectedMember.user_id }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Họ tên người chơi</div>
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ selectedMember.player_name || '—' }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Số chân sở hữu</div>
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ selectedMember.parts_count || 1 }} chân</div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-700/60"></div>

        <!-- Section 2: Tài chính -->
        <div>
          <h4 class="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
            Tài chính
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Tổng tiền đã đóng</div>
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono">{{ formatCurrency(selectedMember.total_contributed) }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Tổng tiền đã nhận (Hốt)</div>
              <div class="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">{{ formatCurrency(selectedMember.total_received) }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Tổng lợi nhuận</div>
              <div 
                class="text-sm font-bold font-mono"
                :class="(selectedMember.total_profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'"
              >
                {{ formatCurrency(selectedMember.total_profit) }} ({{ selectedMember.profit_rate || 0 }}%)
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-700/60"></div>

        <!-- Section 3: Liên kết & Ghi chú -->
        <div>
          <h4 class="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
            Liên kết &amp; Ghi chú
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
            <div>
              <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Nhóm chat Telegram</div>
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono">{{ selectedMember.telegram_group || '—' }}</div>
            </div>
          </div>
          <div class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            {{ selectedMember.note || 'Không có ghi chú nào cho chân hụi này.' }}
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">Đóng</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { User, Search, Refresh, Plus, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roscaService, type RoscaMember, type UserRosca, type Rosca } from '@/api/roscaService'

// State
const activeTab = ref('members-grid')
const members = ref<RoscaMember[]>([])
const players = ref<UserRosca[]>([])
const roscasList = ref<Rosca[]>([])
const loading = ref(false)
const submitting = ref(false)

// Filters State
const filters = reactive({
  rosca_id: '',
  status: '',
  search: ''
})

// Dialog States
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const detailDialogVisible = ref(false)
const selectedMember = ref<RoscaMember | null>(null)

const form = reactive<RoscaMember>({
  id: '',
  rosca_id: '',
  user_id: '',
  parts_count: 1,
  total_contributed: 0,
  total_received: 0,
  total_profit: 0,
  profit_rate: 0,
  status: 'Playing',
  note: '',
  telegram_group: ''
})

// Rules
const rules = {
  rosca_id: [
    { required: true, message: 'Vui lòng chọn dây hụi', trigger: 'change' }
  ],
  user_id: [
    { required: true, message: 'Vui lòng chọn người chơi', trigger: 'change' }
  ],
  parts_count: [
    { required: true, message: 'Vui lòng chọn số lượng chân chơi', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }
  ]
}

// Helpers
const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'Playing': return 'Đang chơi'
    case 'Defaulted': return 'Bể hụi'
    default: return status || '—'
  }
}

const getStatusTagType = (status?: string) => {
  switch (status) {
    case 'Playing': return 'success'
    case 'Defaulted': return 'danger'
    default: return 'info'
  }
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '—'
  return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ'
}

// Fetch Active Players
const fetchPlayers = async () => {
  try {
    const data = await roscaService.getUserRoscas({ role: 'Player', status: 'Active' })
    players.value = data
  } catch (error) {
    console.error('Failed to load players:', error)
  }
}

// Fetch Roscas config list
const fetchRoscasList = async () => {
  try {
    const data = await roscaService.getRoscas()
    roscasList.value = data
  } catch (error) {
    console.error('Failed to load roscas:', error)
  }
}

// Fetch Members List
const fetchMembers = async () => {
  loading.value = true
  try {
    const data = await roscaService.getRoscaMembers({
      rosca_id: filters.rosca_id || undefined,
      status: filters.status || undefined
    })
    members.value = data
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Lỗi khi tải danh sách chân hụi')
  } finally {
    loading.value = false
  }
}

// Handle change in filters
const handleFilterChange = () => {
  fetchMembers()
}

// Search input handling
let searchTimeout: any = null
const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // client search computed handles it dynamically
  }, 200)
}

// Client-side filtration for search input
const filteredMembers = computed(() => {
  if (!filters.search) return members.value

  const searchLower = filters.search.toLowerCase().trim()
  return members.value.filter(member => {
    const idMatch = member.user_id.toLowerCase().includes(searchLower)
    const nameMatch = member.player_name?.toLowerCase().includes(searchLower)
    const codeMatch = member.rosca_code?.toLowerCase().includes(searchLower)
    const noteMatch = member.note?.toLowerCase().includes(searchLower)
    const groupMatch = member.telegram_group?.toLowerCase().includes(searchLower)
    return idMatch || nameMatch || codeMatch || noteMatch || groupMatch
  })
})

// Add new member form initialization
const handleOpenCreateDialog = () => {
  isEdit.value = false
  form.id = ''
  form.rosca_id = filters.rosca_id || (roscasList.value[0]?.id || '')
  form.user_id = players.value[0]?.id || ''
  form.parts_count = 1
  form.total_contributed = 0
  form.total_received = 0
  form.total_profit = 0
  form.profit_rate = 0
  form.status = 'Playing'
  form.note = ''
  form.telegram_group = ''
  dialogVisible.value = true
}

// Edit member dialog open
const handleOpenEditDialog = (row: RoscaMember) => {
  isEdit.value = true
  form.id = row.id
  form.rosca_id = row.rosca_id
  form.user_id = row.user_id
  form.parts_count = row.parts_count || 1
  form.total_contributed = row.total_contributed || 0
  form.total_received = row.total_received || 0
  form.total_profit = row.total_profit || 0
  form.profit_rate = row.profit_rate || 0
  form.status = row.status || 'Playing'
  form.note = row.note || ''
  form.telegram_group = row.telegram_group || ''
  dialogVisible.value = true
}

// Detail dialog open
const handleOpenDetailDialog = (row: RoscaMember) => {
  selectedMember.value = row
  detailDialogVisible.value = true
}

// Action dropdown command router
const handleCommand = (cmd: string, row: RoscaMember) => {
  if (cmd === 'detail') {
    handleOpenDetailDialog(row)
  } else if (cmd === 'edit') {
    handleOpenEditDialog(row)
  } else if (cmd === 'delete') {
    handleDelete(members.value.find(m => m.id === row.id) || row)
  }
}

// Submit Create/Update Form
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const payload: RoscaMember = {
          id: form.id || undefined,
          rosca_id: form.rosca_id,
          user_id: form.user_id,
          parts_count: parseInt(`${form.parts_count || 1}`),
          total_contributed: parseFloat(`${form.total_contributed || 0}`),
          total_received: parseFloat(`${form.total_received || 0}`),
          total_profit: parseFloat(`${form.total_profit || 0}`),
          profit_rate: parseFloat(`${form.profit_rate || 0}`),
          status: form.status,
          note: form.note?.trim() || null,
          telegram_group: form.telegram_group?.trim() || null
        }

        if (isEdit.value) {
          await roscaService.updateRoscaMembers([payload])
          ElMessage.success('Cập nhật thông tin chân hụi thành công!')
        } else {
          await roscaService.addRoscaMembers([payload])
          ElMessage.success('Thêm chân hụi mới thành công!')
        }
        dialogVisible.value = false
        await fetchMembers()
      } catch (error: any) {
        ElMessage.error(error.message || 'Không thể lưu thông tin chân hụi')
      } finally {
        submitting.value = false
      }
    }
  })
}

// Delete member confirmation and API execution
const handleDelete = (row: RoscaMember) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa chân hụi của "${row.player_name || row.user_id}" khỏi dây hụi "${row.rosca_code}" không?`,
    'Xác nhận xóa chân hụi',
    {
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      if (row.id) {
        await roscaService.deleteRoscaMembers([row.id])
        ElMessage.success('Xóa chân hụi thành công!')
        await fetchMembers()
      }
    } catch (error: any) {
      ElMessage.error(error.message || 'Lỗi khi xóa chân hụi')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

onMounted(async () => {
  await fetchPlayers()
  await fetchRoscasList()
  await fetchMembers()
})
</script>

<style scoped>
.rosca-members-container {
  height: 100%;
}
.harvest-tabs {
  border-radius: 8px;
  overflow: hidden;
}
.harvest-tabs :deep(.el-tabs__content) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.harvest-tabs :deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}
.harvest-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}
.harvest-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}

html.dark .harvest-tabs {
  background-color: #1f2937;
  border-color: #374151;
}
html.dark .harvest-tabs :deep(.el-tabs__header) {
  background-color: #111827;
  border-bottom-color: #374151;
}
html.dark .harvest-tabs :deep(.el-tabs__item) {
  color: #9ca3af;
  border-color: transparent;
  transition: all 0.3s;
}
html.dark .harvest-tabs :deep(.el-tabs__item:hover) {
  color: #d1d5db;
}
html.dark .harvest-tabs :deep(.el-tabs__item.is-active) {
  background-color: #1f2937;
  border-right-color: #374151;
  border-left-color: #374151;
  border-bottom-color: #1f2937;
  color: #60a5fa;
}

.members-content {
  height: 100%;
}

html.dark .custom-dark-input {
  --el-input-text-color: #f3f4f6 !important;
  --el-text-color-regular: #f3f4f6 !important;
  --el-text-color-placeholder: #9ca3af !important;
}

html.dark .custom-dark-input :deep(.el-input__wrapper),
html.dark .custom-dark-input :deep(.el-select__wrapper) {
  background-color: #1f2937 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
}

html.dark .custom-dark-input :deep(.el-input__inner),
html.dark .custom-dark-input :deep(.el-select__placeholder) {
  color: #f3f4f6 !important;
  -webkit-text-fill-color: #f3f4f6 !important;
  opacity: 1 !important;
}
</style>
