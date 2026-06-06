<template>
  <div class="h-full p-6 overflow-y-auto flex flex-col finance-detail-wrapper">
    <!-- Header Navigation -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3">
        <el-button 
          @click="emit('back')" 
          circle 
          class="shadow-sm hover:scale-105 transition-transform duration-200"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div>
          <div class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Chi Tiết Quỹ Cha</div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2 mt-0.5">
            {{ fund.name }}
          </h2>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <el-tag :type="getStatusType(fund.status)" size="large" effect="plain" class="font-bold">
          {{ getStatusText(fund.status) }}
        </el-tag>
        <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-medium">
          {{ fund.startDate }} - {{ fund.endDate }}
        </span>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div v-show="activeTab !== 'query'" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 shrink-0">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vốn ban đầu</div>
        <div class="text-xl font-bold mt-1 text-gray-800 dark:text-gray-100">{{ formatCurrency(fund.initialCapital) }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Tổng thu phát sinh</div>
        <div class="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">+{{ formatCurrency(fund.totalRevenue) }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-rose-500 dark:text-rose-400">Tổng chi phát sinh</div>
        <div class="text-xl font-bold mt-1 text-rose-500 dark:text-rose-400">-{{ formatCurrency(fund.totalExpense) }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lợi nhuận lũy kế</div>
        <div class="text-xl font-bold mt-1" :class="fund.profit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'">
          {{ formatCurrency(fund.profit) }}
        </div>
      </div>
    </div>

    <!-- Main Tabs Layout -->
    <div class="flex-1 min-height-0 flex flex-col">
      <el-tabs v-model="activeTab" type="border-card" class="detail-tabs h-full flex flex-col flex-1">
        <!-- 1. TAB QUỸ CON -->
        <el-tab-pane name="fund-info" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><List /></el-icon>
              <span>Quỹ con</span>
            </span>
          </template>
          
          <div class="space-y-6 overflow-y-auto pr-1 flex-1">
            <div>
              <h3 class="text-base font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span class="w-1.5 h-3 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                Danh sách Quỹ thành viên trực thuộc (Quỹ con)
              </h3>
              <p class="text-sm text-gray-400 dark:text-gray-500">
                Các quỹ trực thuộc trực tiếp quản lý hạn mức và luồng giao dịch của {{ fund.name }}
              </p>
            </div>

            <!-- Sub Funds Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                v-for="sub in fund.subFunds" 
                :key="sub.id"
                class="border border-gray-100 dark:border-gray-700/80 rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <!-- Card Header -->
                <div class="flex items-start gap-3 mb-3">
                  <div class="p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center" :style="{ backgroundColor: sub.color }">
                    <el-icon :size="20">
                      <component :is="getIcon(sub.icon)" />
                    </el-icon>
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <h4 class="font-bold text-gray-800 dark:text-gray-100 text-[15px] line-clamp-1 leading-snug">{{ sub.name }}</h4>
                    <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-1 justify-start">
                      <el-icon :size="12"><Calendar /></el-icon>
                      <span>{{ sub.startDate }}</span>
                    </div>
                  </div>
                </div>

                <!-- Status Tag -->
                <div class="mb-5 flex justify-start text-left">
                  <el-tag :type="getStatusType(sub.status)" size="small" class="capitalize" effect="plain">
                    {{ getStatusText(sub.status) }}
                  </el-tag>
                </div>

                <!-- Card Body / Details -->
                <div class="space-y-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Vốn ban đầu</span>
                    <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatCurrency(sub.initialCapital) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Tổng thu (+)</span>
                    <span class="font-bold text-emerald-600 dark:text-emerald-400">+{{ formatCurrency(sub.totalRevenue) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-400 dark:text-gray-500 font-medium">Tổng chi (-)</span>
                    <span class="font-bold text-rose-500 dark:text-rose-400">-{{ formatCurrency(sub.totalExpense) }}</span>
                  </div>
                  
                  <!-- Profit / Balance Box -->
                  <div class="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex justify-between items-center border border-gray-100/50 dark:border-gray-800">
                    <div class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lợi nhuận</div>
                    <div class="text-[15px] font-extrabold" :class="sub.profit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'">
                      {{ formatCurrency(sub.profit) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fund Rules/Policies Mock -->
            <div class="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/10 dark:border-blue-500/20">
              <h4 class="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Quy chế dòng tiền</h4>
              <ul class="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-disc list-inside">
                <li>Mọi khoản giao dịch phát sinh trên Quỹ con đều phải được cập nhật ngay trong ngày làm việc.</li>
                <li>Số dư thực tế tại các Quỹ con sẽ tự động được tổng hợp lên kết quả tổng quát của Quỹ cha.</li>
                <li>Giao dịch vượt quá 100,000,000 VNĐ cần có phê duyệt số từ Ban Giám Đốc Tiến Nga.</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>

        <!-- 2. TAB THU CHI HẰNG NGÀY (CÓ PHÂN TRANG THEO LAYOUT BÊN HỘ DÂN) -->
        <el-tab-pane name="cashflow" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><Calendar /></el-icon>
              <span>Thu chi hằng ngày</span>
            </span>
          </template>

          <div class="flex-1 flex flex-col min-height-0">
            <!-- Filter Bar -->
            <div class="flex flex-wrap justify-between items-center mb-4 gap-4 shrink-0">
              <div class="flex flex-wrap items-center gap-4">
                <!-- Tên Quỹ Select -->
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tên Quỹ con:</span>
                  <el-select 
                    v-model="cashflowFilters.subFundId" 
                    placeholder="Chọn Quỹ con" 
                    style="width: 180px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option 
                      v-for="sub in fund.subFunds" 
                      :key="sub.id" 
                      :label="sub.name" 
                      :value="sub.id" 
                    />
                  </el-select>
                </div>
                
                <!-- Loại thanh toán Select (Thu, Chi) -->
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại:</span>
                  <el-select 
                    v-model="cashflowFilters.type" 
                    placeholder="Loại giao dịch" 
                    style="width: 140px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option label="Thu" value="income" />
                    <el-option label="Chi" value="expense" />
                  </el-select>
                </div>

                <!-- Thời gian Picker -->
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="cashflowFilters.dateRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="Từ ngày"
                    end-placeholder="Đến ngày"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="custom-dark-input highlight-select"
                    popper-class="custom-dark-select-popper"
                    style="width: 280px"
                  />
                </div>
                
                <!-- Tìm kiếm Input -->
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
                  <el-input
                    v-model="cashflowFilters.searchQuery"
                    placeholder="Bên yêu cầu, bên nhận, lý do..."
                    :prefix-icon="Search"
                    clearable
                    class="w-60 custom-dark-input"
                  />
                </div>
              </div>

              <!-- Thêm giao dịch Button -->
              <el-button type="primary" @click="openAddDialog">Thêm giao dịch</el-button>
            </div>

            <!-- Transaction Table & Pagination Wrapper -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <el-table 
                :data="paginatedCashflowTransactions" 
                style="width: 100%" 
                class="flex-1 custom-table" 
                height="100%"
              >
                <!-- Fixed columns -->
                <el-table-column label="Thời gian" width="115" fixed>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column label="Tên Quỹ" width="160" fixed show-overflow-tooltip>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">{{ getSubFundName(scope.row.subFundId) }}</span>
                  </template>
                </el-table-column>

                <!-- Scrollable columns -->
                <el-table-column label="Bên yêu cầu" prop="requestingParty" width="150" show-overflow-tooltip />
                <el-table-column label="Bên thực hiện" prop="executingParty" width="150" show-overflow-tooltip />
                <el-table-column label="Bên nhận" prop="receivingParty" width="150" show-overflow-tooltip />
                
                <el-table-column label="Loại thanh toán" width="140" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'" effect="light" size="small" round>
                      {{ scope.row.type === 'income' ? 'Thu' : 'Chi' }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column label="Mục đích" prop="purpose" width="150" show-overflow-tooltip />
                <el-table-column label="Lí do" prop="reason" min-width="220" show-overflow-tooltip />
                
                <el-table-column label="Số lượng" width="160" align="right">
                  <template #default="scope">
                    <span class="font-extrabold text-sm" :class="scope.row.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'">
                      {{ scope.row.type === 'income' ? '+' : '-' }}{{ formatCurrency(scope.row.amount) }}
                    </span>
                  </template>
                </el-table-column>

                <el-table-column label="Trạng thái" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getTransactionStatusType(scope.row.status)" effect="light" size="small" round>
                      {{ getTransactionStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="Ghi chú" prop="note" width="180" show-overflow-tooltip />

                <!-- Fixed Right Operations -->
                <el-table-column fixed="right" label="Thao tác" width="90" align="center">
                  <template #default="scope">
                    <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, scope.row.id)">
                      <el-button link type="info" class="p-1">
                        <el-icon class="text-xl"><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="detail">Chi tiết</el-dropdown-item>
                          <el-dropdown-item command="delete" class="!text-red-500">Xóa</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>

              <!-- Phân trang (Pagination) -->
              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="cashflowCurrentPage"
                  v-model:page-size="cashflowPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredCashflowTransactions.length"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 3. TAB TRUY VẤN DỮ LIỆU -->
        <el-tab-pane name="query" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><Search /></el-icon>
              <span>Truy vấn dữ liệu</span>
            </span>
          </template>

          <div class="query-container flex-1 flex flex-col min-height-0">
            <!-- Filter bar (inline, matching InformationLookup) -->
            <div class="flex justify-between items-center mb-4 shrink-0">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tên Quỹ con:</span>
                  <el-select 
                    v-model="queryFilters.subFundId" 
                    placeholder="Chọn Quỹ con" 
                    style="width: 180px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option 
                      v-for="sub in fund.subFunds" 
                      :key="sub.id" 
                      :label="sub.name" 
                      :value="sub.id" 
                    />
                  </el-select>
                </div>

                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại:</span>
                  <el-select 
                    v-model="queryFilters.type" 
                    placeholder="Loại giao dịch" 
                    style="width: 140px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Tất cả" value="all" />
                    <el-option label="Thu" value="income" />
                    <el-option label="Chi" value="expense" />
                  </el-select>
                </div>

                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="queryFilters.dateRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="Từ ngày"
                    end-placeholder="Đến ngày"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="custom-dark-input highlight-select"
                    popper-class="custom-dark-select-popper"
                    style="width: 280px"
                  />
                </div>
              </div>
              <el-button type="primary" :icon="Search" @click="handleQuerySearch">Tìm kiếm</el-button>
            </div>

            <!-- Summary Statistics Cards (after search) -->
            <div v-if="querySearched" class="summary-cards mb-4 shrink-0">
              <div class="grid grid-cols-3 gap-4">
                <div class="stat-card stat-card--green">
                  <div class="stat-card__label">Tổng Thu lọc</div>
                  <div class="stat-card__value text-emerald-600 dark:text-emerald-400">{{ formatCurrency(queryTotals.revenue) }}</div>
                </div>
                <div class="stat-card stat-card--rose">
                  <div class="stat-card__label">Tổng Chi lọc</div>
                  <div class="stat-card__value text-rose-500 dark:text-rose-400">{{ formatCurrency(queryTotals.expense) }}</div>
                </div>
                <div class="stat-card stat-card--indigo">
                  <div class="stat-card__label">Chênh lệch dòng tiền</div>
                  <div class="stat-card__value" :class="queryTotals.balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'">{{ formatCurrency(queryTotals.balance) }}</div>
                </div>
              </div>
            </div>

            <!-- Query Result Table (after search) -->
            <div v-if="querySearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <el-table 
                :data="paginatedQueryTransactions" 
                style="width: 100%"
                height="100%"
                class="flex-1 custom-table"
              >
                <el-table-column label="Thời gian" width="115" fixed>
                  <template #default="scope">
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column label="Tên Quỹ" width="160" fixed show-overflow-tooltip>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">{{ getSubFundName(scope.row.subFundId) }}</span>
                  </template>
                </el-table-column>

                <el-table-column label="Bên yêu cầu" prop="requestingParty" width="150" show-overflow-tooltip />
                <el-table-column label="Bên thực hiện" prop="executingParty" width="150" show-overflow-tooltip />
                <el-table-column label="Bên nhận" prop="receivingParty" width="150" show-overflow-tooltip />
                <el-table-column label="Loại thanh toán" width="140" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'" effect="light" size="small" round>
                      {{ scope.row.type === 'income' ? 'Thu' : 'Chi' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Mục đích" prop="purpose" width="150" show-overflow-tooltip />
                <el-table-column label="Lí do" prop="reason" min-width="220" show-overflow-tooltip />
                
                <el-table-column label="Số lượng" width="160" align="right">
                  <template #default="scope">
                    <span class="font-extrabold text-sm" :class="scope.row.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'">
                      {{ scope.row.type === 'income' ? '+' : '-' }}{{ formatCurrency(scope.row.amount) }}
                    </span>
                  </template>
                </el-table-column>

                <el-table-column label="Trạng thái" width="140" align="center">
                  <template #default="scope">
                    <el-tag :type="getTransactionStatusType(scope.row.status)" effect="light" size="small" round>
                      {{ getTransactionStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="Ghi chú" prop="note" width="180" show-overflow-tooltip />
              </el-table>

              <!-- Phân trang (Pagination) cho Truy vấn -->
              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="queryCurrentPage"
                  v-model:page-size="queryPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredQueryTransactions.length"
                />
              </div>
            </div>

            <!-- Empty state before search -->
            <div v-if="!querySearched" class="flex-1 flex items-center justify-center">
              <div class="text-center text-gray-400 dark:text-gray-500">
                <el-icon class="text-6xl mb-4"><Search /></el-icon>
                <p class="text-lg">Vui lòng chọn các tiêu chí và nhấn <strong>Tìm kiếm</strong> để truy vấn dữ liệu</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ADD TRANSACTION DIALOG -->
    <el-dialog 
      v-model="addDialogVisible" 
      title="THÊM MỚI GIAO DỊCH TÀI CHÍNH" 
      width="600px" 
      destroy-on-close
      class="custom-dark-dialog"
    >
      <el-form 
        :model="formModel" 
        :rules="formRules" 
        ref="formRef" 
        label-position="top"
        class="mt-4 px-2"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Quỹ tiền" prop="subFundId">
              <el-select v-model="formModel.subFundId" placeholder="Chọn Quỹ tiền" class="w-full highlight-select" style="width: 100%">
                <el-option 
                  v-for="sub in fund.subFunds" 
                  :key="sub.id" 
                  :label="sub.name" 
                  :value="sub.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Loại thanh toán" prop="type">
              <el-radio-group v-model="formModel.type" class="w-full flex">
                <el-radio-button label="income" class="flex-1">Thu</el-radio-button>
                <el-radio-button label="expense" class="flex-1">Chi</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số lượng (VNĐ)" prop="amount">
              <el-input 
                v-model="formModel.amountText" 
                placeholder="Nhập số tiền..."
                @input="handleAmountInput"
                class="w-full"
              >
                <template #suffix>
                  <span class="text-xs text-gray-400">VNĐ</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Thời gian" prop="date">
              <el-date-picker 
                v-model="formModel.date" 
                type="date" 
                placeholder="Chọn ngày giao dịch" 
                value-format="YYYY-MM-DD"
                class="w-full"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Bên yêu cầu" prop="requestingParty">
              <el-input v-model="formModel.requestingParty" placeholder="Nhập tên bên yêu cầu..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Bên thực hiện" prop="executingParty">
              <el-input v-model="formModel.executingParty" placeholder="Nhập tên bên thực hiện..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Bên nhận" prop="receivingParty">
              <el-input v-model="formModel.receivingParty" placeholder="Nhập tên bên nhận..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái" prop="status">
              <el-select v-model="formModel.status" placeholder="Chọn trạng thái" class="w-full highlight-select" style="width: 100%">
                <el-option label="Đã chấp thuận" value="approved" />
                <el-option label="Chưa chấp thuận" value="unapproved" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mục đích" prop="purpose">
              <el-input v-model="formModel.purpose" placeholder="Nhập mục đích giao dịch..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ghi chú" prop="note">
              <el-input v-model="formModel.note" placeholder="Nhập ghi chú thêm..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Lí do" prop="reason">
          <el-input 
            v-model="formModel.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="Mô tả lý do cho khoản thu/chi phát sinh này..." 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 pr-2">
          <el-button @click="addDialogVisible = false">Hủy bỏ</el-button>
          <el-button type="primary" @click="submitForm">Lưu giao dịch</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  ArrowLeft, 
  List, 
  Calendar, 
  Search, 
  CreditCard,
  Briefcase,
  Lock,
  Wallet,
  MoreFilled
} from '@element-plus/icons-vue'

// Định nghĩa types
interface SubFund {
  id: string
  name: string
  initialCapital: number
  startDate: string
  endDate: string
  status: 'active' | 'suspended' | 'settled'
  icon: string
  color: string
  totalRevenue: number
  totalExpense: number
  profit: number
}

interface Fund {
  id: string
  name: string
  initialCapital: number
  startDate: string
  endDate: string
  totalRevenue: number
  totalExpense: number
  profit: number
  status: 'active' | 'suspended' | 'settled'
  icon: string
  color: string
  bgColor: string
  subFunds: SubFund[]
}

interface Transaction {
  id: string
  fundId: string
  subFundId: string
  type: 'income' | 'expense'
  requestingParty: string
  executingParty: string
  receivingParty: string
  purpose: string
  reason: string
  amount: number
  status: 'approved' | 'unapproved'
  note: string
  date: string
}

const props = defineProps<{
  fund: Fund
  transactions: Transaction[]
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'add-transaction', tx: Omit<Transaction, 'id' | 'fundId'>): void
  (e: 'delete-transaction', id: string): void
}>()

// Helper: format số tiền nhập vào có dấu chấm
const formatAmountText = (value: number) => {
  if (!value || value === 0) return ''
  return new Intl.NumberFormat('vi-VN').format(value)
}

const handleAmountInput = (val: string) => {
  // Xóa tất cả ký tự không phải số
  const numericVal = val.replace(/[^0-9]/g, '')
  const num = parseInt(numericVal, 10)
  if (!isNaN(num)) {
    formModel.amount = num
    formModel.amountText = new Intl.NumberFormat('vi-VN').format(num)
  } else {
    formModel.amount = 0
    formModel.amountText = ''
  }
}

const activeTab = ref('fund-info')

// 1. Quản lý Bộ Lọc & Phân Trang Thu Chi Hằng Ngày (Tab 2)
const cashflowFilters = reactive({
  subFundId: 'all',
  type: 'all',
  dateRange: null as null | [string, string],
  searchQuery: ''
})

const cashflowCurrentPage = ref(1)
const cashflowPageSize = ref(10)

// Reset trang về 1 khi thay đổi bộ lọc
watch(() => cashflowFilters, () => {
  cashflowCurrentPage.value = 1
}, { deep: true })

const filteredCashflowTransactions = computed(() => {
  return props.transactions.filter(t => {
    if (cashflowFilters.subFundId !== 'all' && t.subFundId !== cashflowFilters.subFundId) return false
    if (cashflowFilters.type !== 'all' && t.type !== cashflowFilters.type) return false
    if (cashflowFilters.dateRange) {
      const [start, end] = cashflowFilters.dateRange
      if (t.date < start || t.date > end) return false
    }
    if (cashflowFilters.searchQuery) {
      const q = cashflowFilters.searchQuery.toLowerCase()
      const matchReq = t.requestingParty.toLowerCase().includes(q)
      const matchRec = t.receivingParty.toLowerCase().includes(q)
      const matchReason = t.reason.toLowerCase().includes(q)
      const matchPurpose = t.purpose.toLowerCase().includes(q)
      const matchNote = t.note.toLowerCase().includes(q)
      if (!matchReq && !matchRec && !matchReason && !matchPurpose && !matchNote) return false
    }
    return true
  })
})

const paginatedCashflowTransactions = computed(() => {
  const start = (cashflowCurrentPage.value - 1) * cashflowPageSize.value
  const end = start + cashflowPageSize.value
  return filteredCashflowTransactions.value.slice(start, end)
})

// 2. Quản lý trạng thái Dialog Thêm Giao Dịch
const addDialogVisible = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive({
  type: 'expense' as 'income' | 'expense',
  subFundId: '',
  amount: 0,
  amountText: '',
  date: new Date().toISOString().substring(0, 10),
  requestingParty: '',
  executingParty: '',
  receivingParty: '',
  status: 'approved' as 'approved' | 'unapproved',
  purpose: '',
  note: '',
  reason: ''
})

const formRules = reactive<FormRules>({
  type: [{ required: true, message: 'Vui lòng chọn loại thanh toán', trigger: 'change' }],
  subFundId: [{ required: true, message: 'Vui lòng chọn Quỹ tiền', trigger: 'change' }],
  amount: [{ required: true, message: 'Vui lòng nhập số lượng tiền', trigger: 'blur' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày giao dịch', trigger: 'change' }],
  requestingParty: [{ required: true, message: 'Vui lòng nhập bên yêu cầu', trigger: 'blur' }],
  executingParty: [{ required: true, message: 'Vui lòng nhập bên thực hiện', trigger: 'blur' }],
  receivingParty: [{ required: true, message: 'Vui lòng nhập bên nhận', trigger: 'blur' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
  purpose: [{ required: true, message: 'Vui lòng nhập mục đích giao dịch', trigger: 'blur' }],
  reason: [{ required: true, message: 'Vui lòng nhập lí do', trigger: 'blur' }]
})

const openAddDialog = () => {
  formModel.type = 'expense'
  formModel.subFundId = props.fund.subFunds[0]?.id || ''
  formModel.amount = 0
  formModel.amountText = ''
  formModel.date = new Date().toISOString().substring(0, 10)
  formModel.requestingParty = ''
  formModel.executingParty = ''
  formModel.receivingParty = ''
  formModel.status = 'approved'
  formModel.purpose = ''
  formModel.note = ''
  formModel.reason = ''
  addDialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('add-transaction', {
        type: formModel.type,
        subFundId: formModel.subFundId,
        amount: formModel.amount,
        date: formModel.date,
        requestingParty: formModel.requestingParty,
        executingParty: formModel.executingParty,
        receivingParty: formModel.receivingParty,
        status: formModel.status,
        purpose: formModel.purpose,
        note: formModel.note,
        reason: formModel.reason
      })
      addDialogVisible.value = false
      ElMessage.success('Đã thêm mới giao dịch thành công!')
    }
  })
}

const handleCommand = (command: string, id: string) => {
  if (command === 'delete') {
    confirmDelete(id)
  } else {
    ElMessage.info(`Xem chi tiết giao dịch ID: ${id}`)
  }
}

const confirmDelete = (id: string) => {
  ElMessageBox.confirm(
    'Bạn chắc chắn muốn xóa bỏ giao dịch này? Số dư các Quỹ tương ứng sẽ được cập nhật lại.',
    'Xác nhận xóa giao dịch',
    {
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ',
      type: 'warning',
    }
  ).then(() => {
    emit('delete-transaction', id)
    ElMessage.success('Đã xóa giao dịch thành công!')
  }).catch(() => {})
}

// 3. Quản lý Bộ Lọc & Phân Trang Truy Vấn (Tab 3)
const queryFilters = reactive({
  subFundId: 'all',
  dateRange: null as null | [string, string],
  type: 'all' as 'all' | 'income' | 'expense',
})

const querySearched = ref(false)
const queryCurrentPage = ref(1)
const queryPageSize = ref(10)

const handleQuerySearch = () => {
  querySearched.value = true
  queryCurrentPage.value = 1
}

const filteredQueryTransactions = computed(() => {
  return props.transactions.filter(t => {
    if (queryFilters.subFundId !== 'all' && t.subFundId !== queryFilters.subFundId) return false
    if (queryFilters.dateRange) {
      const [start, end] = queryFilters.dateRange
      if (t.date < start || t.date > end) return false
    }
    if (queryFilters.type !== 'all' && t.type !== queryFilters.type) return false
    return true
  })
})

const paginatedQueryTransactions = computed(() => {
  const start = (queryCurrentPage.value - 1) * queryPageSize.value
  const end = start + queryPageSize.value
  return filteredQueryTransactions.value.slice(start, end)
})

const queryTotals = computed(() => {
  const revenue = filteredQueryTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const expense = filteredQueryTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
    
  return {
    revenue,
    expense,
    balance: revenue - expense
  }
})

// 4. Helpers định dạng và icon
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Wallet': return Wallet
    case 'CreditCard': return CreditCard
    case 'Briefcase': return Briefcase
    case 'Lock': return Lock
    default: return Wallet
  }
}

const getSubFundName = (subFundId: string) => {
  const sub = props.fund.subFunds.find(s => s.id === subFundId)
  return sub ? sub.name : subFundId
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

const getStatusType = (status: string) => {
  return status === 'active' ? 'success' : 'danger'
}

const getStatusText = (status: string) => {
  return status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'
}

const getTransactionStatusType = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'unapproved': return 'warning'
    default: return 'info'
  }
}

const getTransactionStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Đã chấp thuận'
    case 'unapproved': return 'Chưa chấp thuận'
    default: return status
  }
}
</script>

<style scoped>
.detail-tabs {
  border-radius: 8px;
  overflow: hidden;
}
.detail-tabs :deep(.el-tabs__content) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 450px;
}
.detail-tabs :deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.custom-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* Tùy chỉnh Dark Mode */
html.dark .detail-tabs {
  background-color: #1f2937;
  border-color: #374151;
}
html.dark .detail-tabs :deep(.el-tabs__header) {
  background-color: #111827;
  border-bottom-color: #374151;
}
html.dark .detail-tabs :deep(.el-tabs__item) {
  color: #9ca3af;
  border-color: transparent;
  transition: all 0.3s;
}
html.dark .detail-tabs :deep(.el-tabs__item:hover) {
  color: #d1d5db;
}
html.dark .detail-tabs :deep(.el-tabs__item.is-active) {
  background-color: #1f2937;
  border-right-color: #374151;
  border-left-color: #374151;
  border-bottom-color: #1f2937;
  color: #60a5fa;
}

html.dark .custom-dark-select :deep(.el-input__wrapper),
html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #1f2937;
  box-shadow: 0 0 0 1px #374151 inset;
}

html.dark .custom-dark-select :deep(.el-input__inner),
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}

/* Custom Table in Dark Mode */
html.dark .finance-detail-wrapper :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}

html.dark .finance-detail-wrapper :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}

html.dark .finance-detail-wrapper :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}

html.dark .finance-detail-wrapper :deep(.el-table .el-table-fixed-column--left),
html.dark .finance-detail-wrapper :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
}

/* Custom Element UI input classes */
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

.highlight-select :deep(.el-select__wrapper) {
  background-color: transparent;
}

html.dark .highlight-select :deep(.el-select__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
  color: #f3f4f6;
}

/* Summary stat cards */
.stat-card {
  padding: 16px 20px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}

.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stat-card--green { border-left: 4px solid #22c55e; }
.stat-card--rose { border-left: 4px solid #f43f5e; }
.stat-card--indigo { border-left: 4px solid #6366f1; }

/* Dark Mode: Stat cards */
html.dark .stat-card {
  background-color: #1f2937;
  border-color: #374151;
}

html.dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

html.dark .stat-card__label {
  color: #9ca3af;
}

/* Dark Mode: Query container table */
.query-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}
</style>
