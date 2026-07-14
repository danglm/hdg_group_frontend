<template>
  <div class="telegram-module-container h-full p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <el-tabs v-model="activeTab" type="border-card" class="harvest-tabs h-full flex flex-col">
      
      <!-- Tab 1: Cấu hình thông báo -->
      <el-tab-pane name="config">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon><Setting /></el-icon>
            <span>Cấu hình thông báo</span>
          </span>
        </template>

        <div class="telegram-groups-container h-full flex flex-col">
          <!-- Filter Bar -->
          <div class="flex flex-wrap justify-between items-center gap-4 mb-4 shrink-0">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Project Name -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Dự án:</span>
                <el-select 
                  v-model="filtersConfig.project_name" 
                  placeholder="Tất cả dự án" 
                  clearable 
                  filterable
                  class="custom-dark-input"
                  style="width: 200px"
                  @change="handleConfigFilterChange"
                >
                  <el-option 
                    v-for="proj in projects" 
                    :key="proj.id" 
                    :label="proj.project_name" 
                    :value="proj.project_name" 
                  />
                </el-select>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <el-button :icon="Refresh" circle @click="fetchConfigs" :loading="loadingConfigs" />
              <el-button type="primary" :icon="Plus" @click="handleOpenAddDialog">Thêm cấu hình</el-button>
            </div>
          </div>

          <!-- Table Container -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
            <el-table 
              v-loading="loadingConfigs"
              :data="paginatedConfigs" 
              style="width: 100%" 
              height="100%" 
              class="flex-1"
            >
              <!-- STT -->
              <el-table-column label="STT" width="60" align="center" fixed>
                <template #default="{ $index }">
                  <span class="font-mono text-xs text-gray-500">{{ (currentConfigPage - 1) * configPageSize + $index + 1 }}</span>
                </template>
              </el-table-column>

              <!-- Module Key -->
              <el-table-column label="Mã Module" min-width="130" show-overflow-tooltip fixed>
                <template #default="{ row }">
                  <span class="font-mono text-xs font-bold text-gray-800 dark:text-gray-200">{{ row.module_key }}</span>
                </template>
              </el-table-column>

              <!-- Module Name -->
              <el-table-column prop="module_name" label="Tên Module" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ row.module_name }}</span>
                </template>
              </el-table-column>

              <!-- Project Name -->
              <el-table-column prop="project_name" label="Dự án" min-width="130" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-tag v-if="row.project_name" size="small" type="success" effect="light" class="font-semibold">{{ row.project_name }}</el-tag>
                  <span v-else class="text-gray-400">—</span>
                </template>
              </el-table-column>

              <!-- Chat ID -->
              <el-table-column label="Chat ID" width="130" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold select-all">{{ row.chat_id }}</span>
                </template>
              </el-table-column>

              <!-- Group Name -->
              <el-table-column prop="group_name" label="Tên nhóm Telegram" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="font-bold text-gray-800 dark:text-gray-100">{{ row.group_name || '—' }}</span>
                </template>
              </el-table-column>

              <!-- Actions -->
              <el-table-column label="Hành vi" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="flex flex-wrap gap-1">
                    <el-tag 
                      v-for="act in splitActions(row.actions)" 
                      :key="act"
                      size="small" 
                      :type="getActionTagType(act)"
                      effect="plain"
                      class="font-bold"
                    >
                      {{ act }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>

              <!-- Enable -->
              <el-table-column label="Trạng thái gửi" width="140" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.enable_send_notify ? 'success' : 'danger'" effect="light" size="small" round>
                    {{ row.enable_send_notify ? 'Hoạt động' : 'Ngừng hoạt động' }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- Thao tác -->
              <el-table-column fixed="right" label="Thao tác" width="90" align="center">
                <template #default="{ row }">
                  <el-dropdown trigger="click" @command="(cmd) => handleConfigCommand(cmd, row)">
                    <el-button link type="info" class="p-1">
                      <el-icon class="text-xl"><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="detail">Chi tiết</el-dropdown-item>
                        <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                        <el-dropdown-item command="delete" divided class="!text-red-500">Xóa</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <el-pagination
                v-model:current-page="currentConfigPage"
                v-model:page-size="configPageSize"
                :page-sizes="[10, 20, 50]"
                :background="true"
                layout="total, sizes, prev, pager, next, jumper"
                :total="configs.length"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Lịch sử Log -->
      <el-tab-pane name="logs">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon><Bell /></el-icon>
            <span>Log thông báo</span>
          </span>
        </template>

        <div class="telegram-groups-container h-full flex flex-col">
          <!-- Filter Bar -->
          <div class="flex flex-wrap justify-between items-center gap-4 mb-4 shrink-0">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Project Name -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Dự án:</span>
                <el-select 
                  v-model="filtersLog.project_name" 
                  placeholder="Tất cả dự án" 
                  clearable 
                  filterable
                  class="custom-dark-input"
                  style="width: 180px"
                  @change="handleLogFilterChange"
                >
                  <el-option 
                    v-for="proj in projects" 
                    :key="proj.id" 
                    :label="proj.project_name" 
                    :value="proj.project_name" 
                  />
                </el-select>
              </div>

              <!-- Status -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>
                <el-select 
                  v-model="filtersLog.status" 
                  placeholder="Tất cả" 
                  clearable 
                  class="custom-dark-input"
                  style="width: 120px"
                  @change="handleLogFilterChange"
                >
                  <el-option label="Tất cả" value="" />
                  <el-option label="Thành công" value="SUCCESS" />
                  <el-option label="Thất bại" value="FAILED" />
                </el-select>
              </div>

              <!-- Date Range (Thời gian) -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                <el-date-picker
                  v-model="dateRangeLog"
                  type="daterange"
                  range-separator="đến"
                  start-placeholder="Từ ngày"
                  end-placeholder="Đến ngày"
                  format="DD/MM/YYYY"
                  value-format="YYYY-MM-DD"
                  class="custom-dark-date-picker highlight-select"
                  style="width: 240px"
                  @change="handleLogFilterChange"
                />
              </div>

              <!-- Search Query (performer/details/etc.) -->
              <div class="flex items-center gap-2">
                <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
                <el-input 
                  v-model="filtersLog.search_query" 
                  placeholder="Người thực hiện, nội dung..." 
                  clearable 
                  class="custom-dark-input"
                  style="width: 220px"
                  @input="handleLogFilterInput"
                  @clear="handleLogFilterChange"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <el-button :icon="Refresh" circle @click="fetchLogs" :loading="loadingLogs" />
            </div>
          </div>

          <!-- Table Container -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
            <el-table 
              v-loading="loadingLogs"
              :data="logs" 
              style="width: 100%" 
              height="100%" 
              class="flex-1"
            >
              <!-- STT -->
              <el-table-column label="STT" width="60" align="center" fixed>
                <template #default="{ $index }">
                  <span class="font-mono text-xs text-gray-500">{{ logSkip + $index + 1 }}</span>
                </template>
              </el-table-column>

              <!-- Thời gian -->
              <el-table-column label="Thời gian" width="150" align="center">
                <template #default="{ row }">
                  <span class="font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold">{{ formatDate(row.created_at) }}</span>
                </template>
              </el-table-column>

              <!-- Module Name -->
              <el-table-column prop="module_name" label="Module" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ row.module_name }}</span>
                </template>
              </el-table-column>

              <!-- Dự án -->
              <el-table-column prop="project_name" label="Dự án" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">{{ row.project_name || '—' }}</span>
                </template>
              </el-table-column>

              <!-- Performer -->
              <el-table-column prop="performer" label="Người thực hiện" width="130" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-xs font-bold text-gray-750 dark:text-gray-250">{{ row.performer }}</span>
                </template>
              </el-table-column>

              <!-- Action -->
              <el-table-column prop="action" label="Hành động" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getActionTagType(row.action)" effect="light" size="small" class="font-bold">
                    {{ row.action }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- Details -->
              <el-table-column prop="details" label="Chi tiết thông báo" min-width="250" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-xs text-gray-700 dark:text-gray-300 select-all">{{ row.details }}</span>
                </template>
              </el-table-column>

              <!-- Chat ID / Group -->
              <el-table-column prop="group_name" label="Nhóm gửi" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">{{ row.group_name || row.chat_id }}</span>
                </template>
              </el-table-column>

              <!-- Status -->
              <el-table-column label="Kết quả" width="110" align="center">
                <template #default="{ row }">
                  <el-tag 
                    :type="(row.status || '').toUpperCase() === 'SUCCESS' ? 'success' : 'danger'" 
                    effect="dark" 
                    size="small"
                    class="font-semibold"
                  >
                    {{ (row.status || '').toUpperCase() === 'SUCCESS' ? 'Thành công' : 'Thất bại' }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- Error Message -->
              <el-table-column prop="error_message" label="Thông báo lỗi" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-xs text-red-500 font-mono">{{ row.error_message || '—' }}</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <el-pagination
                v-model:current-page="currentLogPage"
                v-model:page-size="logPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :background="true"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalLogs"
                @size-change="handleLogSizeChange"
                @current-change="handleLogCurrentChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

    </el-tabs>    <!-- Dialog: Add/Edit Config -->
    <el-dialog
      v-model="configDialogVisible"
      :title="configForm.id ? 'CẬP NHẬT CẤU HÌNH THÔNG BÁO' : 'THÊM MỚI CẤU HÌNH THÔNG BÁO'"
      width="900px"
      destroy-on-close
      align-center
      class="custom-dark-dialog"
    >
      <div class="max-h-[65vh] overflow-y-auto overflow-x-hidden px-2">
        <el-form 
          ref="configFormRef" 
          :model="configForm" 
          :rules="configRules" 
          label-width="170px"
          class="mt-2 compact-form"
        >
          <!-- PHẦN 1: THÔNG TIN MODULE & DỰ ÁN -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Thông tin module &amp; dự án
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Module (Mã)" prop="module_key">
                  <el-select 
                    v-model="configForm.module_key" 
                    placeholder="Chọn module hoặc tự nhập" 
                    allow-create 
                    filterable
                    class="w-full custom-dark-input"
                    @change="handleFormModuleChange"
                  >
                    <el-option 
                      v-for="mod in moduleOptions" 
                      :key="mod.value" 
                      :label="`${mod.label} (${mod.value})`" 
                      :value="mod.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tên Module" prop="module_name">
                  <el-input 
                    v-model="configForm.module_name" 
                    placeholder="Nhập tên hiển thị của module..." 
                    class="custom-dark-input" 
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Dự án" prop="project_name">
                  <el-select 
                    v-model="configForm.project_name" 
                    placeholder="Chọn dự án" 
                    clearable
                    filterable
                    class="w-full custom-dark-input"
                  >
                    <el-option 
                      v-for="proj in projects" 
                      :key="proj.id" 
                      :label="proj.project_name" 
                      :value="proj.project_name" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Kích hoạt gửi" prop="enable_send_notify">
                  <el-switch 
                    v-model="configForm.enable_send_notify" 
                    active-text="Bật"
                    inactive-text="Tắt"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PHẦN 2: THÔNG TIN NHÓM NHẬN TIN -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              Thông tin nhóm nhận tin
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Chat ID Telegram" prop="chat_id">
                  <el-input 
                    v-model="configForm.chat_id" 
                    placeholder="Nhập Chat ID nhóm (e.g. -100...)" 
                    class="custom-dark-input" 
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tên nhóm (Ghi chú)" prop="group_name">
                  <el-input 
                    v-model="configForm.group_name" 
                    placeholder="Nhập tên nhóm Telegram..." 
                    class="custom-dark-input" 
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- PHẦN 3: HÀNH VI KÍCH HOẠT -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-violet-650 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              Hành vi &amp; Kích hoạt
            </h4>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="Hành động" prop="actionsList">
                  <el-checkbox-group v-model="configForm.actionsList">
                    <el-checkbox value="CREATE" label="CREATE">CREATE (Thêm mới)</el-checkbox>
                    <el-checkbox value="UPDATE" label="UPDATE">UPDATE (Cập nhật)</el-checkbox>
                    <el-checkbox value="DELETE" label="DELETE">DELETE (Xóa)</el-checkbox>
                    <el-checkbox value="PROCESS" label="PROCESS">PROCESS (Xử lý)</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer flex justify-end gap-2">
          <el-button @click="configDialogVisible = false">Hủy</el-button>
          <el-button type="primary" :loading="savingConfig" @click="saveConfig">
            Xác nhận
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog: Detail Config -->
    <el-dialog
      v-model="detailDialogVisible"
      title="CHI TIẾT CẤU HÌNH THÔNG BÁO"
      width="600px"
      destroy-on-close
      align-center
      class="custom-dark-dialog"
    >
      <div v-if="selectedConfig" class="px-2 space-y-6 max-h-[60vh] overflow-y-auto text-left">
        <!-- Visual Profile Header -->
        <div class="flex items-center gap-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="p-3.5 rounded-2xl bg-blue-500 dark:bg-blue-600 text-white shadow-md flex items-center justify-center">
            <el-icon :size="32"><Setting /></el-icon>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cấu hình gửi thông báo</div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
              {{ selectedConfig.module_name }}
              <span class="text-blue-500 dark:text-blue-400 font-mono font-medium">({{ selectedConfig.module_key }})</span>
            </h3>
            <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
              <span class="text-gray-500 dark:text-gray-400">Dự án: <strong class="text-gray-750 dark:text-gray-250">{{ selectedConfig.project_name || 'N/A' }}</strong></span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Mã Module</div>
            <div class="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono select-all">{{ selectedConfig.module_key }}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Tên hiển thị</div>
            <div class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ selectedConfig.module_name }}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Dự án</div>
            <div class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ selectedConfig.project_name || '—' }}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Trạng thái gửi</div>
            <div>
              <el-tag :type="selectedConfig.enable_send_notify ? 'success' : 'danger'" effect="light" size="small" round>
                {{ selectedConfig.enable_send_notify ? 'Hoạt động' : 'Ngừng hoạt động' }}
              </el-tag>
            </div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Chat ID Telegram</div>
            <div class="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono select-all">{{ selectedConfig.chat_id }}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Tên nhóm (Ghi chú)</div>
            <div class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ selectedConfig.group_name || '—' }}</div>
          </div>
        </div>

        <div class="border-t border-gray-150 dark:border-gray-700 pt-4">
          <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Hành động kích hoạt</div>
          <div class="flex flex-wrap gap-1.5">
            <el-tag 
              v-for="act in splitActions(selectedConfig.actions)" 
              :key="act"
              size="small" 
              :type="getActionTagType(act)"
              effect="plain"
              class="font-bold"
            >
              {{ act }}
            </el-tag>
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
import { Setting, Bell, Refresh, Plus, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { telegramService } from '@/api/telegramService'
import { tienNgaService } from '@/api/tienNgaService'

interface Project {
  id: string;
  project_name: string;
}

interface NotifyConfig {
  id?: string;
  module_key: string;
  module_name: string;
  project_name: string | null;
  chat_id: string;
  group_name: string | null;
  actions: string;
  enable_send_notify: boolean;
  created_at?: string;
  updated_at?: string;
}

interface NotifyLog {
  id: string;
  config_id?: string;
  action: string;
  module_key: string;
  module_name: string;
  project_name?: string;
  chat_id: string;
  group_name?: string;
  performer: string;
  details: string;
  message_id?: number;
  status: string;
  error_message?: string;
  created_at?: string;
}

// Tabs state
const activeTab = ref('config')

// Module options mapping
const moduleOptions = [
  { value: 'customers', label: 'Hộ dân (Cao su)' },
  { value: 'daily_purchases', label: 'Thu mua mủ' },
  { value: 'firewood_purchases', label: 'Thu mua củi' },
  { value: 'materials_purchases', label: 'Thu mua nguyên liệu' },
  { value: 'products_purchases', label: 'Thu mua thành phẩm' },
  { value: 'inventories', label: 'Kho bãi / Tồn kho' },
  { value: 'product_transactions', label: 'Giao dịch thành phẩm' },
  { value: 'inventory_exports', label: 'Xuất kho thành phẩm' },
  { value: 'salaries', label: 'Tính lương nhân viên' },
]

// ── Tab 1: Cấu hình thông báo ──
const configs = ref<NotifyConfig[]>([])
const loadingConfigs = ref(false)
const currentConfigPage = ref(1)
const configPageSize = ref(10)

const filtersConfig = reactive({
  project_name: ''
})

// ── Tab 2: Logs ──
const logs = ref<NotifyLog[]>([])
const loadingLogs = ref(false)
const currentLogPage = ref(1)
const logPageSize = ref(10)
const totalLogs = ref(0)

const filtersLog = reactive({
  project_name: '',
  status: '',
  search_query: ''
})

const getTodayStr = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayStr = getTodayStr()
const dateRangeLog = ref<[string, string] | null>([todayStr, todayStr])

// Projects for dropdown selection
const projects = ref<Project[]>([])

// Dialog States
const configDialogVisible = ref(false)
const savingConfig = ref(false)
const configFormRef = ref()

const detailDialogVisible = ref(false)
const selectedConfig = ref<NotifyConfig | null>(null)

const configForm = ref({
  id: '',
  module_key: '',
  module_name: '',
  project_name: '',
  chat_id: '',
  group_name: '',
  actionsList: [] as string[],
  enable_send_notify: true
})

const configRules = {
  module_key: [
    { required: true, message: 'Vui lòng chọn hoặc nhập mã module', trigger: 'change' }
  ],
  module_name: [
    { required: true, message: 'Vui lòng nhập tên module', trigger: 'blur' }
  ],
  chat_id: [
    { required: true, message: 'Vui lòng nhập Chat ID nhóm Telegram', trigger: 'blur' }
  ],
  actionsList: [
    { type: 'array', required: true, message: 'Vui lòng chọn ít nhất một hành động kích hoạt', trigger: 'change' }
  ]
}

// Computed for configs filtering on frontend
const filteredConfigs = computed(() => {
  return configs.value.filter(cfg => {
    if (filtersConfig.project_name) {
      const pName = cfg.project_name || ''
      if (!pName.toLowerCase().includes(filtersConfig.project_name.toLowerCase())) return false
    }
    return true
  })
})

const paginatedConfigs = computed(() => {
  const start = (currentConfigPage.value - 1) * configPageSize.value
  const end = start + configPageSize.value
  return filteredConfigs.value.slice(start, end)
})

// Log skip calculation
const logSkip = computed(() => {
  return (currentLogPage.value - 1) * logPageSize.value
})

// Actions split helper
const splitActions = (actionsStr: string) => {
  if (!actionsStr) return []
  return actionsStr.split(',').map(s => s.trim()).filter(Boolean)
}

const getActionTagType = (action: string) => {
  switch (action.toUpperCase()) {
    case 'CREATE': return 'success'
    case 'UPDATE': return 'warning'
    case 'DELETE': return 'danger'
    case 'PROCESS': return 'primary'
    default: return 'info'
  }
}

// Helpers
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${d}/${m}/${y} ${h}:${min}`
  } catch (e) {
    return dateStr
  }
}

// Change Form Module Selection automatically updates Name if matches built-in options
const handleFormModuleChange = (val: string) => {
  const matched = moduleOptions.find(opt => opt.value === val)
  if (matched) {
    const parts = matched.label.split(' (')
    configForm.value.module_name = parts[0] || matched.label
  }
}

// Debounced inputs
const handleConfigFilterChange = () => {
  currentConfigPage.value = 1
}

let logFilterTimeout: any = null
const handleLogFilterInput = () => {
  if (logFilterTimeout) clearTimeout(logFilterTimeout)
  logFilterTimeout = setTimeout(() => {
    currentLogPage.value = 1
    fetchLogs()
  }, 500)
}

const handleLogFilterChange = () => {
  currentLogPage.value = 1
  fetchLogs()
}

// ── CRUD Methods ──

// Fetch Configs
const fetchConfigs = async () => {
  loadingConfigs.value = true
  try {
    const data = await telegramService.getNotifyConfigs()
    configs.value = data
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Lỗi khi tải danh sách cấu hình')
  } finally {
    loadingConfigs.value = false
  }
}

// Fetch Logs
const fetchLogs = async () => {
  loadingLogs.value = true
  try {
    const start_date = dateRangeLog.value && dateRangeLog.value[0] ? dateRangeLog.value[0] : undefined
    const end_date = dateRangeLog.value && dateRangeLog.value[1] ? dateRangeLog.value[1] : undefined

    const logsData = await telegramService.getNotifyLogs({
      project_name: filtersLog.project_name || undefined,
      status: filtersLog.status || undefined,
      search_query: filtersLog.search_query || undefined,
      start_date,
      end_date,
      skip: logSkip.value,
      limit: logPageSize.value
    })
    
    logs.value = logsData
    
    // Note: get-notify-logs API returns an array. Since we don't have total logs count inside response header directly,
    // we can approximate total count for pagination, or fetch larger pages.
    // If logsData has size equal to limit, we assume there could be more pages.
    if (currentLogPage.value === 1 && logsData.length < logPageSize.value) {
      totalLogs.value = logsData.length
    } else if (logsData.length === logPageSize.value) {
      // Just keep incrementing the virtual total size so user can page forward
      totalLogs.value = logSkip.value + logsData.length + 10
    } else {
      totalLogs.value = logSkip.value + logsData.length
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Lỗi khi tải danh sách Log')
  } finally {
    loadingLogs.value = false
  }
}

// Fetch Projects
const fetchProjects = async () => {
  try {
    const data = await tienNgaService.getProjects()
    projects.value = data
  } catch (error: any) {
    console.error('Lỗi khi tải danh sách dự án:', error)
  }
}

// Log pagination handlers
const handleLogSizeChange = (size: number) => {
  logPageSize.value = size
  currentLogPage.value = 1
  fetchLogs()
}

const handleLogCurrentChange = (page: number) => {
  currentLogPage.value = page
  fetchLogs()
}

// Dialog Open Add
const handleConfigCommand = (cmd: string, row: NotifyConfig) => {
  if (cmd === 'detail') {
    selectedConfig.value = row
    detailDialogVisible.value = true
  } else if (cmd === 'edit') {
    handleOpenEditDialog(row)
  } else if (cmd === 'delete') {
    handleDelete(row)
  }
}

// Dialog Open Add
const handleOpenAddDialog = () => {
  configForm.value = {
    id: '',
    module_key: '',
    module_name: '',
    project_name: '',
    chat_id: '',
    group_name: '',
    actionsList: ['CREATE', 'UPDATE', 'DELETE'],
    enable_send_notify: true
  }
  configDialogVisible.value = true
}

// Dialog Open Edit
const handleOpenEditDialog = (row: NotifyConfig) => {
  configForm.value = {
    id: row.id || '',
    module_key: row.module_key,
    module_name: row.module_name,
    project_name: row.project_name || '',
    chat_id: row.chat_id,
    group_name: row.group_name || '',
    actionsList: splitActions(row.actions),
    enable_send_notify: row.enable_send_notify
  }
  configDialogVisible.value = true
}

// Save Config (Add / Update)
const saveConfig = async () => {
  if (!configFormRef.value) return
  await configFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    savingConfig.value = true
    try {
      const payloadItem = {
        id: configForm.value.id || undefined,
        module_key: configForm.value.module_key,
        module_name: configForm.value.module_name,
        project_name: configForm.value.project_name || null,
        chat_id: configForm.value.chat_id,
        group_name: configForm.value.group_name || null,
        actions: configForm.value.actionsList.join(','),
        enable_send_notify: configForm.value.enable_send_notify
      }

      if (configForm.value.id) {
        // Update endpoint expects List[NotifyConfigUpdate]
        await telegramService.updateNotifyConfigs([payloadItem])
        ElMessage.success('Cập nhật cấu hình thành công!')
      } else {
        // Add endpoint expects List[NotifyConfigCreate]
        await telegramService.addNotifyConfigs([payloadItem])
        ElMessage.success('Thêm cấu hình mới thành công!')
      }

      configDialogVisible.value = false
      fetchConfigs()
    } catch (error: any) {
      console.error(error)
      ElMessage.error(error.message || 'Lỗi hệ thống khi lưu cấu hình')
    } finally {
      savingConfig.value = false
    }
  })
}

// Delete Config
const handleDelete = (row: NotifyConfig) => {
  if (!row.id) return
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa cấu hình gửi thông báo của module "${row.module_name}" gửi đến nhóm "${row.group_name || row.chat_id}" không?`,
    'CẢNH BÁO XÓA CẤU HÌNH',
    {
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      // delete endpoint expects List[UUID]
      await telegramService.deleteNotifyConfigs([row.id!])
      ElMessage.success('Xóa cấu hình thành công!')
      fetchConfigs()
    } catch (error: any) {
      console.error(error)
      ElMessage.error(error.message || 'Không thể xóa cấu hình này')
    }
  }).catch(() => {})
}

onMounted(async () => {
  await fetchProjects()
  await fetchConfigs()
  await fetchLogs()
})
</script>

<style scoped>
.telegram-module-container {
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

.telegram-groups-container {
  height: 100%;
}

/* Custom dark mode styles for table to match Device Management */
html.dark .telegram-groups-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .telegram-groups-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .telegram-groups-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

html.dark .telegram-groups-container :deep(.el-table .el-table-fixed-column--left),
html.dark .telegram-groups-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
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

<style>
/* Unscoped date picker dark mode overrides matching Rental & Tien Nga */
html.dark .highlight-select.el-date-editor .el-input__wrapper {
  background-color: #1f2937 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
}
html.dark .highlight-select.el-date-editor .el-range-input {
  color: #f3f4f6 !important;
  background-color: transparent !important;
}
html.dark .highlight-select.el-date-editor .el-range-separator {
  color: #9ca3af !important;
}
</style>
