<template>
  <div
    v-if="task"
    class="flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
    :class="isCreateMode ? '' : 'rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden'"
  >
    <!-- Header Toolbar Top -->
    <div class="px-6 py-3.5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-gray-800/40">
      <!-- Title & Code -->
      <div class="flex items-center space-x-3 flex-1 min-w-[300px]">
        <span class="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
          {{ isCreateMode ? 'TẠO TASK' : task.task_code }}
        </span>
        
        <!-- Input điền Title ở Chế độ Tạo Mới -->
        <div v-if="isCreateMode" class="flex-1">
          <el-input
            v-model="task.title"
            placeholder="Nhập tiêu đề công việc mới..."
            size="large"
            class="!font-bold !text-base"
            autofocus
          />
        </div>
        <h2 v-else class="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[500px]">
          {{ task.title }}
        </h2>
      </div>

      <!-- Right Header Actions (Status Dropdown + Actions Button) -->
      <div v-if="!isCreateMode" class="flex items-center space-x-3">
        <!-- Status Dropdown -->
        <el-dropdown trigger="click" @command="handleStatusChange">
          <el-button
            :type="getStatusBadgeType(task.status)"
            class="!font-medium px-4 !rounded-md"
          >
            <span>{{ getStatusLabel(task.status) }}</span>
            <el-icon class="ml-1"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="OPEN">To Do</el-dropdown-item>
              <el-dropdown-item command="IN_PROGRESS">In Progress</el-dropdown-item>
              <el-dropdown-item command="DONE">Done</el-dropdown-item>
              <el-dropdown-item command="BLOCKED">Blocked</el-dropdown-item>
              <el-dropdown-item command="CANCELLED">Cancelled</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- Actions Dropdown -->
        <el-dropdown trigger="click">
          <el-button plain class="!font-medium !rounded-md">
            <span>Actions</span>
            <el-icon class="ml-1"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="Edit" @click="isEditingTitle = true">Sửa tiêu đề</el-dropdown-item>
              <el-dropdown-item :icon="Delete" class="!text-red-500" @click="handleDeleteTask">Xoá công việc</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Secondary Icon Toolbar -->
    <div class="px-6 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm">
      <el-tooltip content="Đính kèm file" placement="top">
        <button @click="triggerFileUpload" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
          <el-icon :size="18"><Paperclip /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip content="Tạo subtask" placement="top">
        <button @click="handleAddSubtask" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
          <el-icon :size="18"><Connection /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip content="Thêm web link" placement="top">
        <button @click="openAddWebLinkModal" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition cursor-pointer">
          <el-icon :size="18"><Link /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip content="Gắn nhãn" placement="top">
        <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
          <el-icon :size="18"><CollectionTag /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip content="Đánh dấu hoàn thành" placement="top">
        <button @click="handleStatusChange('DONE')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
          <el-icon :size="18"><CircleCheck /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip content="Hành động khác" placement="top">
        <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
          <el-icon :size="18"><MoreFilled /></el-icon>
        </button>
      </el-tooltip>

      <input type="file" ref="fileInputRef" class="hidden" multiple @change="handleFileSelected" />
    </div>

    <!-- Main Body Split (Content Left + Details Right) -->
    <div class="flex flex-col lg:flex-row">
      <!-- LEFT COLUMN: Description, Attachments, Links, Activity -->
      <div class="flex-1 p-6 space-y-6 lg:border-r border-gray-200 dark:border-gray-800">
        
        <!-- Priority Chip Tag Dropdown (Cho phép chọn/thay đổi Priority) -->
        <div class="flex items-center space-x-3">
          <el-tooltip
            content="Nhấn để thay đổi độ ưu tiên công việc (Priority)"
            placement="top-start"
            effect="dark"
          >
            <el-dropdown trigger="click" @command="handlePriorityChange">
              <div
                class="inline-flex items-center space-x-1.5 px-3 py-1 rounded border text-xs font-bold cursor-pointer transition select-none shadow-2xs"
                :class="getPriorityChipClass(task.priority)"
              >
                <span>Priority: {{ getPriorityLabel(task.priority) }}</span>
                <el-icon :size="12" class="ml-0.5"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="CRITICAL">
                    <div class="flex items-center space-x-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                      <span class="font-bold text-red-600 dark:text-red-400">Critical (Rất gấp)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="HIGH">
                    <div class="flex items-center space-x-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      <span class="font-bold text-orange-500 dark:text-orange-400">High (Cao)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="MEDIUM">
                    <div class="flex items-center space-x-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span class="font-bold text-blue-600 dark:text-blue-400">Medium (Vừa)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="LOW">
                    <div class="flex items-center space-x-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span class="font-bold text-green-600 dark:text-green-400">Low (Thấp)</span>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-tooltip>
        </div>

        <!-- Description Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Description</h3>
            <button
              v-if="!isEditingDesc"
              @click="isEditingDesc = true"
              class="text-xs text-blue-600 hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          <div v-if="isEditingDesc" class="space-y-2">
            <!-- Google Docs Style Formatting Toolbar -->
            <div class="flex items-center flex-wrap gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-2 select-none">
              <!-- In đậm -->
              <button
                type="button"
                @click="insertFormat('bold')"
                class="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="In đậm (Bold)"
              >
                B
              </button>
              <!-- In nghiêng -->
              <button
                type="button"
                @click="insertFormat('italic')"
                class="w-7 h-7 flex items-center justify-center text-xs italic font-serif text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="In nghiêng (Italic)"
              >
                I
              </button>

              <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              <!-- Numbered List Dropdown Button (Google Docs Style) -->
              <el-dropdown trigger="click" @command="(cmd: string) => applyListStyle('numbered', cmd)">
                <button
                  type="button"
                  @click="applyListStyle('numbered', '1')"
                  class="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded shadow-xs border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                  title="Danh sách đánh số (Google Docs style)"
                >
                  <span class="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">1.</span>
                  <span>Danh sách số</span>
                  <el-icon :size="10" class="ml-0.5"><ArrowDown /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="1">1. 2. 3. (Số tự nhiên)</el-dropdown-item>
                    <el-dropdown-item command="a">a. b. c. (Chữ cái thường)</el-dropdown-item>
                    <el-dropdown-item command="I">I. II. III. (Số La Mã)</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <!-- Bulleted List Dropdown Button (Google Docs Style) -->
              <el-dropdown trigger="click" @command="(cmd: string) => applyListStyle('bullet', cmd)">
                <button
                  type="button"
                  @click="applyListStyle('bullet', '•')"
                  class="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded shadow-xs border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                  title="Danh sách đầu dòng (Google Docs style)"
                >
                  <span class="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm leading-none">•</span>
                  <span>Danh sách đầu dòng</span>
                  <el-icon :size="10" class="ml-0.5"><ArrowDown /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="•">• Chấm tròn đặc</el-dropdown-item>
                    <el-dropdown-item command="o">o Chấm tròn rỗng</el-dropdown-item>
                    <el-dropdown-item command="▪">▪ Ô vuông nhỏ</el-dropdown-item>
                    <el-dropdown-item command="✓">✓ Dấu tích xanh</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              <!-- Indent / Outdent Buttons -->
              <button
                type="button"
                @click="adjustIndent('outdent')"
                class="px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Giảm lề (Shift+Tab)"
              >
                ⇥ Giảm lề
              </button>
              <button
                type="button"
                @click="adjustIndent('indent')"
                class="px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Tăng lề (Tab)"
              >
                ⇤ Tăng lề
              </button>
            </div>

            <el-input
              ref="descInputRef"
              v-model="editDescValue"
              type="textarea"
              :rows="6"
              placeholder="Nhập mô tả (Nhấn Enter để tự động tạo dòng tiếp theo như Google Docs, nhấn Tab để tăng lề)..."
              @keydown="handleDescKeydown"
            />
            <div class="flex space-x-2 pt-1">
              <el-button type="primary" size="small" @click="saveDesc">Lưu</el-button>
              <el-button size="small" @click="isEditingDesc = false">Hủy</el-button>
            </div>
          </div>

          <div v-else class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-800/30 p-3.5 rounded-lg min-h-[60px] space-y-1.5 border border-gray-100 dark:border-gray-800">
            <template v-if="task.description">
              <div
                v-for="(line, idx) in renderedDescriptionLines"
                :key="idx"
                class="text-xs sm:text-sm font-normal"
              >
                <!-- Numbered list line (1., 2., a., b., I., II.) -->
                <div v-if="/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\.\s/.test(line)" class="flex items-start space-x-2 pl-2 text-gray-800 dark:text-gray-200">
                  <span class="font-bold font-mono text-blue-600 dark:text-blue-400 shrink-0 min-w-[20px] text-right">{{ line.match(/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\./)?.[0] }}</span>
                  <span>{{ line.replace(/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\.\s*/, '') }}</span>
                </div>

                <!-- Bulleted list line (•, o, ▪, ✓) -->
                <div v-else-if="/^\s*[•o▪✓\-\*]\s/.test(line)" class="flex items-start space-x-2 pl-2 text-gray-800 dark:text-gray-200">
                  <span class="font-bold text-blue-600 dark:text-blue-400 shrink-0 text-sm leading-tight">{{ line.match(/^\s*[•o▪✓\-\*]/)?.[0] }}</span>
                  <span>{{ line.replace(/^\s*[•o▪✓\-\*]\s*/, '') }}</span>
                </div>

                <div v-else-if="line" class="text-gray-700 dark:text-gray-300">
                  {{ line }}
                </div>
                <div v-else class="h-2"></div>
              </div>
            </template>
            <div v-else class="text-xs text-gray-400 italic">
              Chưa có mô tả chi tiết cho công việc này.
            </div>
          </div>
        </div>

        <!-- Attachments Section (Hỗ trợ tải lên nhiều file & Chọn chọn nhiều file xoá hàng loạt) -->
        <div>
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex flex-wrap items-center gap-3">
              <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Attachments</h3>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                {{ (task.attachments || []).length }}
              </span>

              <!-- Chọn nhiều & Thao tác hàng loạt -->
              <template v-if="(task.attachments || []).length > 0">
                <button
                  type="button"
                  @click="toggleSelectAllAttachments"
                  class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  {{ isAllAttachmentsSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
                </button>

                <button
                  v-if="selectedAttachmentIds.length > 0"
                  type="button"
                  @click="handleBatchDeleteAttachments"
                  class="flex items-center space-x-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800 hover:bg-red-100 transition cursor-pointer"
                >
                  <el-icon :size="12"><Delete /></el-icon>
                  <span>Xoá {{ selectedAttachmentIds.length }} file đã chọn</span>
                </button>
              </template>
            </div>

            <!-- Nút Thêm File (+) -->
            <button @click="triggerFileUpload" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition cursor-pointer" title="Đính kèm file (Cho phép chọn nhiều file)">
              <el-icon :size="16"><Plus /></el-icon>
            </button>
          </div>

          <div v-if="(task.attachments || []).length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="att in task.attachments"
              :key="att.id"
              @click="handleAttachmentCardClick(att)"
              class="group relative border rounded-lg p-2 bg-white dark:bg-gray-800 hover:shadow-md transition cursor-pointer select-none"
              :class="selectedAttachmentIds.includes(att.id)
                ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20'
                : 'border-gray-200 dark:border-gray-700'"
            >
              <!-- Checkbox chọn nhiều file (Góc trên bên trái - Tích vào checkbox mới cho chọn) -->
              <div class="absolute top-2 left-2 z-20" @click.stop>
                <el-checkbox
                  :model-value="selectedAttachmentIds.includes(att.id)"
                  @change="toggleSelectAttachment(att.id)"
                />
              </div>

              <!-- Thao tác góc trên bên phải: Nút X và Nút 3 chấm (Dropdown có Download) -->
              <div class="absolute top-1.5 right-1.5 z-20 flex flex-col space-y-1">
                <!-- Nút X (Xoá file) -->
                <button
                  type="button"
                  @click.stop="handleDeleteAttachment(att.id)"
                  class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow transition transform hover:scale-110 cursor-pointer"
                  title="Xoá file này"
                >
                  <el-icon :size="12"><Close /></el-icon>
                </button>

                <!-- Nút 3 chấm (Dropdown chứa nút Download) -->
                <el-dropdown trigger="click" @command="(cmd: string) => handleAttachmentMenuCommand(cmd, att)">
                  <button
                    type="button"
                    @click.stop
                    class="w-6 h-6 rounded-full bg-gray-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-800 shadow transition transform hover:scale-110 cursor-pointer"
                    title="Tùy chọn"
                  >
                    <el-icon :size="12"><MoreFilled /></el-icon>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="download" class="flex items-center space-x-1.5">
                        <el-icon :size="14"><Download /></el-icon>
                        <span>Tải xuống</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="preview" v-if="isImageFile(att)" class="flex items-center space-x-1.5">
                        <el-icon :size="14"><View /></el-icon>
                        <span>Xem ảnh phóng to</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="w-full h-24 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden mb-2 flex items-center justify-center relative">
                <img
                  v-if="isImageFile(att)"
                  :src="att.file_path"
                  alt="attachment"
                  class="w-full h-full object-cover"
                />
                <el-icon v-else :size="32" class="text-gray-400"><Document /></el-icon>
              </div>
              <div class="text-xs font-medium truncate text-gray-800 dark:text-gray-200 pl-6" :title="att.file_name">
                {{ att.file_name }}
              </div>
              <div class="text-[10px] text-gray-400 pl-6">
                {{ formatDate(att.uploaded_at) }}
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic">
            Chưa có file đính kèm
          </div>
        </div>

        <!-- Web Links Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Web links</h3>
            <button @click="openAddWebLinkModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition cursor-pointer" title="Thêm Web Link mới">
              <el-icon :size="16"><Plus /></el-icon>
            </button>
          </div>

          <div v-if="(task.web_links || []).length > 0" class="space-y-1">
            <div
              v-for="(link, idx) in task.web_links"
              :key="link.id"
              class="group flex items-center justify-between text-xs sm:text-sm py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/40 px-1 rounded transition"
            >
              <div class="flex items-center space-x-2 min-w-0 pr-2">
                <!-- STT -->
                <span class="font-bold text-gray-500 dark:text-gray-400 shrink-0 font-mono text-xs">{{ idx + 1 }}.</span>
                <!-- Tên link dạng Link (thẻ <a>) -->
                <a
                  :href="link.url"
                  target="_blank"
                  class="truncate font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  :title="link.url"
                >
                  {{ link.title || link.url }}
                </a>
              </div>
              <!-- Icon X (Xoá link) ở cuối dòng -->
              <button
                type="button"
                @click.stop="handleDeleteWebLink(link.id)"
                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition cursor-pointer shrink-0"
                title="Xoá Web Link này"
              >
                <el-icon :size="14"><Close /></el-icon>
              </button>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic">
            Chưa có web link liên kết
          </div>
        </div>

        <!-- Sub-tasks Section -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Sub-tasks</h3>
            <button @click="handleAddSubtask" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition cursor-pointer" title="Tạo Sub-task mới">
              <el-icon :size="16"><Plus /></el-icon>
            </button>
          </div>

          <div v-if="(task.sub_tasks || []).length > 0" class="space-y-1">
            <div
              v-for="(st, idx) in task.sub_tasks"
              :key="st.id"
              class="group flex items-center justify-between text-xs sm:text-sm py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/40 px-1 rounded transition"
            >
              <div
                class="flex items-center space-x-2 min-w-0 pr-2 cursor-pointer"
                @click="openSubtaskDetail(st)"
                title="Nhấn để xem chi tiết Sub-task này"
              >
                <!-- STT -->
                <span class="font-bold text-gray-500 dark:text-gray-400 shrink-0 font-mono text-xs">{{ idx + 1 }}.</span>
                <!-- Badge Mã Subtask -->
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-mono shrink-0 hover:bg-blue-200">
                  {{ st.task_code }}
                </span>
                <!-- Tiêu đề Subtask dạng Link (thẻ <a>) -->
                <span class="truncate font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {{ st.title }}
                </span>
              </div>
              <div class="flex items-center space-x-2 shrink-0">
                <!-- Trạng thái -->
                <el-tag size="small" :type="getStatusBadgeType(st.status)">
                  {{ getStatusLabel(st.status) }}
                </el-tag>
                <!-- Icon X (Xoá Subtask) ở cuối dòng -->
                <button
                  type="button"
                  @click.stop="handleDeleteSubtask(st.id)"
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition cursor-pointer shrink-0"
                  title="Xoá Sub-task này"
                >
                  <el-icon :size="14"><Close /></el-icon>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic">
            Chưa có sub-task nào được liên kết
          </div>
        </div>

        <!-- Activity / Comments Section -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Activity</h3>
            <div class="flex items-center space-x-2 text-xs text-gray-500">
              <span>Show:</span>
              <el-select v-model="activityFilter" size="small" class="!w-28">
                <el-option label="Comments" value="comments" />
                <el-option label="History" value="history" />
              </el-select>
            </div>
          </div>

          <!-- Comments List (Lịch sử bình luận nằm ở TRÊN) -->
          <div class="space-y-4 mb-6">
            <div
              v-for="cm in (task.comments || [])"
              :key="cm.id"
              class="flex space-x-3 text-xs"
            >
              <el-avatar :size="28" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" class="shrink-0" />
              <div class="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-gray-800 dark:text-gray-200">{{ cm.author_id }}</span>
                    <span class="text-gray-400 text-[10px]">{{ formatDate(cm.created_at) }}</span>
                  </div>

                  <!-- Menu 3 chấm bên phải comment -->
                  <el-dropdown trigger="click" @command="(cmd: string) => handleCommentMenuCommand(cmd, cm.id)">
                    <button
                      type="button"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
                      title="Tùy chọn comment"
                    >
                      <el-icon :size="14"><MoreFilled /></el-icon>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="delete" class="!text-red-500 font-medium">
                          <el-icon :size="14" class="mr-1.5"><Delete /></el-icon>
                          <span>Xoá comment</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <!-- Comment Body with Rich List Formatting -->
                <div class="space-y-1">
                  <div
                    v-for="(line, lIdx) in renderCommentLines(cm.content)"
                    :key="lIdx"
                    class="text-xs font-normal"
                  >
                    <!-- Numbered list -->
                    <div v-if="/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\.\s/.test(line)" class="flex items-start space-x-1.5 text-gray-800 dark:text-gray-200">
                      <span class="font-bold font-mono text-blue-600 dark:text-blue-400 shrink-0 text-[11px] min-w-[16px] text-right">{{ line.match(/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\./)?.[0] }}</span>
                      <span>{{ line.replace(/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\.\s*/, '') }}</span>
                    </div>
                    <!-- Bullet list -->
                    <div v-else-if="/^\s*[•o▪✓\-\*]\s/.test(line)" class="flex items-start space-x-1.5 text-gray-800 dark:text-gray-200">
                      <span class="font-bold text-blue-600 dark:text-blue-400 shrink-0 text-xs leading-none">•</span>
                      <span>{{ line.replace(/^\s*[•o▪✓\-\*]\s*/, '') }}</span>
                    </div>
                    <div v-else-if="line" class="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {{ line }}
                    </div>
                    <div v-else class="h-1.5"></div>
                  </div>
                </div>

                <!-- Comment Attachments Display -->
                <div v-if="cm.attachments && cm.attachments.length > 0" class="mt-2.5 space-y-2">
                  <!-- Image Attachments Grid -->
                  <div v-if="getImageAttachments(cm.attachments).length > 0" class="flex flex-wrap gap-2">
                    <div
                      v-for="img in getImageAttachments(cm.attachments)"
                      :key="img.id"
                      class="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm max-w-[200px]"
                    >
                      <el-image
                        :src="img.file_path"
                        :preview-src-list="[img.file_path]"
                        fit="cover"
                        class="w-full h-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition transform duration-200"
                        loading="lazy"
                      />
                      <div class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate">
                        {{ img.file_name }}
                      </div>
                    </div>
                  </div>

                  <!-- Document File Attachments Chips -->
                  <div v-if="getNonImageAttachments(cm.attachments).length > 0" class="flex flex-wrap gap-2">
                    <a
                      v-for="file in getNonImageAttachments(cm.attachments)"
                      :key="file.id"
                      :href="file.file_path"
                      target="_blank"
                      download
                      class="flex items-center space-x-2 text-xs bg-gray-100 hover:bg-blue-50 dark:bg-gray-700/60 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-600/60 transition group"
                    >
                      <el-icon class="text-blue-500 group-hover:scale-110 transition transform"><Paperclip /></el-icon>
                      <span class="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[180px]">{{ file.file_name }}</span>
                      <span v-if="file.file_size" class="text-[10px] text-gray-400">({{ formatFileSize(file.file_size) }})</span>
                      <el-icon :size="12" class="text-gray-400 group-hover:text-blue-500 ml-1"><Download /></el-icon>
                    </a>
                  </div>
                </div>

                <!-- Comment Actions Footer (Like, Dislike, Trả lời + Hover Reactions) -->
                <div class="mt-2.5 flex items-center space-x-4 pt-1.5 border-t border-gray-100 dark:border-gray-700/40 text-xs font-medium">
                  
                  <!-- Nút Like với Popover Hover chọn Reactions (Facebook style: Like, Tim, Haha, Wow, Buồn, Phẫn nộ) -->
                  <div class="relative group/like py-0.5">
                    <!-- Reaction Emoji Picker Toolbar (Hiển thị mượt mà không hẫng khi Hover) -->
                    <div class="absolute bottom-full left-0 pb-2 hidden group-hover/like:flex z-50">
                      <div class="flex items-center space-x-1.5 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-xl border border-gray-200 dark:border-gray-700">
                        <button
                          v-for="emoji in reactionList"
                          :key="emoji.symbol"
                          type="button"
                          @click.prevent.stop="toggleCommentReaction(cm.id, emoji.symbol)"
                          class="w-7 h-7 flex items-center justify-center text-lg hover:scale-130 transition transform rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          :title="emoji.label"
                        >
                          {{ emoji.symbol }}
                        </button>
                      </div>
                    </div>

                    <!-- Nút Like chính -->
                    <button
                      type="button"
                      @click="toggleCommentReaction(cm.id, cm.userReaction ? cm.userReaction : '👍')"
                      class="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                      :class="cm.userReaction ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'"
                    >
                      <span class="text-sm">{{ cm.userReaction || '👍' }}</span>
                      <span>{{ cm.userReaction ? getReactionLabel(cm.userReaction) : 'Thích' }}</span>
                    </button>
                  </div>

                  <!-- Nút DisLike -->
                  <button
                    type="button"
                    @click="toggleCommentDislike(cm.id)"
                    class="flex items-center space-x-1 hover:text-red-500 transition cursor-pointer"
                    :class="cm.isDisliked ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'"
                  >
                    <span class="text-sm">👎</span>
                    <span>Không thích</span>
                  </button>

                  <!-- Nút Trả lời -->
                  <button
                    type="button"
                    @click="toggleReplyInput(cm.id)"
                    class="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    <el-icon :size="12"><ChatDotRound /></el-icon>
                    <span>Trả lời</span>
                  </button>
                </div>

                <!-- Reactions & Dislike Summary Badges (Gộp icon + Pure Tailwind Hover Tooltip hiển thị Tên Nhân Viên) -->
                <div v-if="getCommentReactionGroups(cm).length > 0" class="flex flex-wrap items-center gap-1.5 mt-2">
                  <div
                    v-for="group in getCommentReactionGroups(cm)"
                    :key="group.emoji"
                    class="relative group/badge inline-block"
                  >
                    <!-- Hover Tooltip Popup (Tự động hiển thị lập tức khi Rê chuột vào Badge) -->
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/badge:block z-50 pointer-events-none whitespace-nowrap">
                      <div class="bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-xl border border-gray-700 space-y-1">
                        <div
                          v-for="u in group.users"
                          :key="u.userId"
                          class="flex items-center space-x-1.5"
                        >
                          <span class="font-medium text-gray-100">• {{ u.userName }}</span>
                          <span>{{ u.emoji }}</span>
                        </div>
                      </div>
                      <!-- Mũi tên Tooltip chỉ xuống nút -->
                      <div class="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 mx-auto"></div>
                    </div>

                    <!-- Badge Button -->
                    <button
                      type="button"
                      @click="group.emoji === '👎' ? toggleCommentDislike(cm.id) : toggleCommentReaction(cm.id, group.emoji)"
                      class="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full cursor-pointer transition select-none"
                      :class="group.emoji === '👎' ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/40' : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40'"
                    >
                      <span>{{ group.emoji }}</span>
                      <span class="font-bold">{{ group.count }}</span>
                    </button>
                  </div>
                </div>

                <!-- Inline Reply Form (Hiển thị khi nhấp Nút Trả lời - Có Google Docs toolbar) -->
                <div v-if="replyingCommentId === cm.id" class="mt-3 pl-3 border-l-2 border-blue-500 space-y-2">
                  <!-- Google Docs Style Formatting Toolbar for Reply -->
                  <div class="flex items-center flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 select-none">
                    <!-- In đậm -->
                    <button
                      type="button"
                      @click="insertReplyFormat('bold')"
                      class="w-5 h-5 flex items-center justify-center text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                      title="In đậm (Bold)"
                    >
                      B
                    </button>
                    <!-- In nghiêng -->
                    <button
                      type="button"
                      @click="insertReplyFormat('italic')"
                      class="w-5 h-5 flex items-center justify-center text-[11px] italic font-serif text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                      title="In nghiêng (Italic)"
                    >
                      I
                    </button>

                    <div class="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                    <!-- Numbered List Dropdown -->
                    <el-dropdown trigger="click" @command="(cmd: string) => applyReplyListStyle('numbered', cmd)">
                      <button
                        type="button"
                        @click="applyReplyListStyle('numbered', '1')"
                        class="flex items-center space-x-1 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                        title="Danh sách số"
                      >
                        <span class="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-[10px]">1.</span>
                        <span>Số</span>
                        <el-icon :size="9" class="ml-0.5"><ArrowDown /></el-icon>
                      </button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="1">1. 2. 3. (Số tự nhiên)</el-dropdown-item>
                          <el-dropdown-item command="a">a. b. c. (Chữ cái thường)</el-dropdown-item>
                          <el-dropdown-item command="I">I. II. III. (Số La Mã)</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>

                    <!-- Bulleted List Dropdown -->
                    <el-dropdown trigger="click" @command="(cmd: string) => applyReplyListStyle('bullet', cmd)">
                      <button
                        type="button"
                        @click="applyReplyListStyle('bullet', '•')"
                        class="flex items-center space-x-1 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                        title="Danh sách đầu dòng"
                      >
                        <span class="font-mono text-blue-600 dark:text-blue-400 font-bold text-xs leading-none">•</span>
                        <span>Đầu dòng</span>
                        <el-icon :size="9" class="ml-0.5"><ArrowDown /></el-icon>
                      </button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="•">• Chấm tròn đặc</el-dropdown-item>
                          <el-dropdown-item command="o">o Chấm tròn rỗng</el-dropdown-item>
                          <el-dropdown-item command="▪">▪ Ô vuông nhỏ</el-dropdown-item>
                          <el-dropdown-item command="✓">✓ Dấu tích xanh</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>

                    <div class="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                    <!-- Indent / Outdent Buttons -->
                    <button
                      type="button"
                      @click="adjustReplyIndent('outdent')"
                      class="px-1 py-0.5 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                      title="Giảm lề (Shift+Tab)"
                    >
                      ⇥
                    </button>
                    <button
                      type="button"
                      @click="adjustReplyIndent('indent')"
                      class="px-1 py-0.5 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                      title="Tăng lề (Tab)"
                    >
                      ⇤
                    </button>
                    <div class="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                    <!-- Đính kèm tệp cho Reply -->
                    <button
                      type="button"
                      @click="triggerReplyFileUpload"
                      class="w-5 h-5 flex items-center justify-center text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition cursor-pointer"
                      title="Đính kèm tệp / hình ảnh"
                    >
                      <el-icon :size="12"><Paperclip /></el-icon>
                    </button>
                  </div>

                  <!-- Input File ẩn cho Reply -->
                  <input
                    ref="replyFileInputRef"
                    type="file"
                    multiple
                    class="hidden"
                    @change="handleReplyFileSelected"
                  />

                  <el-input
                    :ref="(el: any) => setReplyInputRef(el, cm.id)"
                    v-model="replyText"
                    type="textarea"
                    :rows="2"
                    :placeholder="`Trả lời bình luận của ${cm.author_id}...`"
                    size="small"
                    @keydown="handleReplyKeydown"
                  />

                  <!-- Pending Reply Files Preview -->
                  <div v-if="pendingReplyFiles.length > 0" class="flex flex-wrap gap-1.5 pt-1">
                    <div
                      v-for="(f, fIdx) in pendingReplyFiles"
                      :key="fIdx"
                      class="flex items-center space-x-1 text-[11px] bg-gray-100 dark:bg-gray-700/80 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <img v-if="isImageFile(f.type || f.name)" :src="getFilePreviewUrl(f)" class="w-4 h-4 object-cover rounded" />
                      <el-icon v-else class="text-blue-500"><Document /></el-icon>
                      <span class="truncate max-w-[120px] text-gray-700 dark:text-gray-200 font-medium">{{ f.name }}</span>
                      <span class="text-[10px] text-gray-400">({{ formatFileSize(f.size) }})</span>
                      <button
                        type="button"
                        @click="removePendingReplyFile(fIdx)"
                        class="text-gray-400 hover:text-red-500 ml-0.5 transition cursor-pointer"
                      >
                        <el-icon :size="10"><Close /></el-icon>
                      </button>
                    </div>
                  </div>

                  <div class="flex justify-end space-x-2">
                    <el-button size="small" @click="replyingCommentId = null">Hủy</el-button>
                    <el-button type="primary" size="small" :disabled="!replyText.trim() && pendingReplyFiles.length === 0" @click="submitReply(cm.id)">
                      Gửi trả lời
                    </el-button>
                  </div>
                </div>

                <!-- Nested Replies List -->
                <div v-if="(cm.replies || []).length > 0" class="mt-3 space-y-2.5 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                  <div
                    v-for="rep in cm.replies"
                    :key="rep.id"
                    class="flex space-x-2 text-xs bg-white/60 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/40"
                  >
                    <el-avatar :size="22" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" class="shrink-0" />
                    <div class="flex-1 space-y-1">
                      <div class="flex items-center justify-between mb-0.5">
                        <div class="flex items-center space-x-2">
                          <span class="font-bold text-gray-800 dark:text-gray-200">{{ rep.author_id }}</span>
                          <span class="text-gray-400 text-[10px]">{{ formatDate(rep.created_at) }}</span>
                        </div>

                        <!-- Menu 3 chấm bên phải reply -->
                        <el-dropdown trigger="click" @command="(cmd: string) => handleCommentMenuCommand(cmd, rep.id)">
                          <button
                            type="button"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer"
                            title="Tùy chọn comment"
                          >
                            <el-icon :size="12"><MoreFilled /></el-icon>
                          </button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="delete" class="!text-red-500 font-medium">
                                <el-icon :size="13" class="mr-1.5"><Delete /></el-icon>
                                <span>Xoá trả lời</span>
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                      
                      <!-- Nested Reply Content formatted with lists -->
                      <div
                        v-for="(line, lIdx) in renderCommentLines(rep.content)"
                        :key="lIdx"
                        class="text-xs font-normal"
                      >
                        <!-- Numbered list -->
                        <div v-if="/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\.\s/.test(line)" class="flex items-start space-x-1.5 text-gray-800 dark:text-gray-200">
                          <span class="font-bold font-mono text-blue-600 dark:text-blue-400 shrink-0 text-[11px] min-w-[16px] text-right">{{ line.match(/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\./)?.[0] }}</span>
                          <span>{{ line.replace(/^\s*(\d+|[a-zA-Z]|[I|V|X]+)\.\s*/, '') }}</span>
                        </div>
                        <!-- Bullet list -->
                        <div v-else-if="/^\s*[•o▪✓\-\*]\s/.test(line)" class="flex items-start space-x-1.5 text-gray-800 dark:text-gray-200">
                          <span class="font-bold text-blue-600 dark:text-blue-400 shrink-0 text-xs leading-none">•</span>
                          <span>{{ line.replace(/^\s*[•o▪✓\-\*]\s*/, '') }}</span>
                        </div>
                        <div v-else-if="line" class="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {{ line }}
                        </div>
                        <div v-else class="h-1.5"></div>
                      </div>

                      <!-- Nested Reply Attachments Display -->
                      <div v-if="rep.attachments && rep.attachments.length > 0" class="mt-2 space-y-1.5">
                        <div v-if="getImageAttachments(rep.attachments).length > 0" class="flex flex-wrap gap-1.5">
                          <div
                            v-for="img in getImageAttachments(rep.attachments)"
                            :key="img.id"
                            class="relative group rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs max-w-[160px]"
                          >
                            <el-image
                              :src="img.file_path"
                              :preview-src-list="[img.file_path]"
                              fit="cover"
                              class="w-full h-24 object-cover rounded-md cursor-pointer hover:scale-105 transition transform duration-200"
                              loading="lazy"
                            />
                            <div class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                              {{ img.file_name }}
                            </div>
                          </div>
                        </div>

                        <div v-if="getNonImageAttachments(rep.attachments).length > 0" class="flex flex-wrap gap-1.5">
                          <a
                            v-for="file in getNonImageAttachments(rep.attachments)"
                            :key="file.id"
                            :href="file.file_path"
                            target="_blank"
                            download
                            class="flex items-center space-x-1.5 text-[11px] bg-gray-100 hover:bg-blue-50 dark:bg-gray-700/60 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600/60 transition group"
                          >
                            <el-icon :size="11" class="text-blue-500 group-hover:scale-110 transition transform"><Paperclip /></el-icon>
                            <span class="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[150px]">{{ file.file_name }}</span>
                            <span v-if="file.file_size" class="text-[9px] text-gray-400">({{ formatFileSize(file.file_size) }})</span>
                            <el-icon :size="11" class="text-gray-400 group-hover:text-blue-500 ml-0.5"><Download /></el-icon>
                          </a>
                        </div>
                      </div>

                      <!-- Reply Actions Footer (Like, Dislike, Trả lời + Hover Reactions cho Reply) -->
                      <div class="mt-2 flex items-center space-x-3 pt-1 border-t border-gray-100 dark:border-gray-700/30 text-[11px] font-medium">
                        <!-- Nút Like với Popover Hover chọn Reactions -->
                        <div class="relative group/rep-like py-0.5">
                          <div class="absolute bottom-full left-0 pb-2 hidden group-hover/rep-like:flex z-50">
                            <div class="flex items-center space-x-1.5 bg-white dark:bg-gray-800 p-1 rounded-full shadow-xl border border-gray-200 dark:border-gray-700">
                              <button
                                v-for="emoji in reactionList"
                                :key="emoji.symbol"
                                type="button"
                                @click.prevent.stop="toggleCommentReaction(rep.id, emoji.symbol)"
                                class="w-6 h-6 flex items-center justify-center text-base hover:scale-130 transition transform rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                :title="emoji.label"
                              >
                                {{ emoji.symbol }}
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            @click="toggleCommentReaction(rep.id, rep.userReaction ? rep.userReaction : '👍')"
                            class="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                            :class="rep.userReaction ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'"
                          >
                            <span class="text-xs">{{ rep.userReaction || '👍' }}</span>
                            <span>{{ rep.userReaction ? getReactionLabel(rep.userReaction) : 'Thích' }}</span>
                          </button>
                        </div>

                        <!-- Nút DisLike -->
                        <button
                          type="button"
                          @click="toggleCommentDislike(rep.id)"
                          class="flex items-center space-x-1 hover:text-red-500 transition cursor-pointer"
                          :class="rep.isDisliked ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'"
                        >
                          <span class="text-xs">👎</span>
                          <span>Không thích</span>
                        </button>

                        <!-- Nút Trả lời -->
                        <button
                          type="button"
                          @click="toggleReplyInput(rep.id)"
                          class="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                        >
                          <el-icon :size="11"><ChatDotRound /></el-icon>
                          <span>Trả lời</span>
                        </button>
                      </div>

                      <!-- Reactions & Dislike Summary Badges for Reply -->
                      <div v-if="getCommentReactionGroups(rep).length > 0" class="flex flex-wrap items-center gap-1 mt-1.5">
                        <div
                          v-for="group in getCommentReactionGroups(rep)"
                          :key="group.emoji"
                          class="relative group/badge inline-block"
                        >
                          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/badge:block z-50 pointer-events-none whitespace-nowrap">
                            <div class="bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md shadow-xl border border-gray-700 space-y-0.5">
                              <div
                                v-for="u in group.users"
                                :key="u.userId"
                                class="flex items-center space-x-1"
                              >
                                <span class="font-medium text-gray-100">• {{ u.userName }}</span>
                                <span>{{ u.emoji }}</span>
                              </div>
                            </div>
                            <div class="w-0 h-0 border-x-3 border-x-transparent border-t-3 border-t-gray-900 mx-auto"></div>
                          </div>

                          <button
                            type="button"
                            @click="group.emoji === '👎' ? toggleCommentDislike(rep.id) : toggleCommentReaction(rep.id, group.emoji)"
                            class="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer transition select-none"
                            :class="group.emoji === '👎' ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/40' : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40'"
                          >
                            <span>{{ group.emoji }}</span>
                            <span class="font-bold">{{ group.count }}</span>
                          </button>
                        </div>
                      </div>

                      <!-- Inline Reply Form for Nested Reply -->
                      <div v-if="replyingCommentId === rep.id" class="mt-2 pl-2 border-l-2 border-blue-500 space-y-1.5">
                        <div class="flex items-center flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 select-none">
                          <button
                            type="button"
                            @click="insertReplyFormat('bold')"
                            class="w-5 h-5 flex items-center justify-center text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                            title="In đậm (Bold)"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            @click="insertReplyFormat('italic')"
                            class="w-5 h-5 flex items-center justify-center text-[11px] italic font-serif text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                            title="In nghiêng (Italic)"
                          >
                            I
                          </button>
                          <div class="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>
                          <el-dropdown trigger="click" @command="(cmd: string) => applyReplyListStyle('numbered', cmd)">
                            <button
                              type="button"
                              @click="applyReplyListStyle('numbered', '1')"
                              class="flex items-center space-x-1 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                            >
                              <span class="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-[10px]">1.</span>
                              <span>Số</span>
                              <el-icon :size="9" class="ml-0.5"><ArrowDown /></el-icon>
                            </button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item command="1">1. 2. 3. (Số tự nhiên)</el-dropdown-item>
                                <el-dropdown-item command="a">a. b. c. (Chữ cái thường)</el-dropdown-item>
                                <el-dropdown-item command="I">I. II. III. (Số La Mã)</el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                          <el-dropdown trigger="click" @command="(cmd: string) => applyReplyListStyle('bullet', cmd)">
                            <button
                              type="button"
                              @click="applyReplyListStyle('bullet', '•')"
                              class="flex items-center space-x-1 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                            >
                              <span class="font-mono text-blue-600 dark:text-blue-400 font-bold text-xs leading-none">•</span>
                              <span>Đầu dòng</span>
                              <el-icon :size="9" class="ml-0.5"><ArrowDown /></el-icon>
                            </button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item command="•">• Chấm tròn đặc</el-dropdown-item>
                                <el-dropdown-item command="o">o Chấm tròn rỗng</el-dropdown-item>
                                <el-dropdown-item command="▪">▪ Ô vuông nhỏ</el-dropdown-item>
                                <el-dropdown-item command="✓">✓ Dấu tích xanh</el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>

                          <div class="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                          <!-- Đính kèm tệp cho Nested Reply -->
                          <button
                            type="button"
                            @click="triggerReplyFileUpload"
                            class="w-5 h-5 flex items-center justify-center text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition cursor-pointer"
                            title="Đính kèm tệp / hình ảnh"
                          >
                            <el-icon :size="12"><Paperclip /></el-icon>
                          </button>
                        </div>
                        <el-input
                          :ref="(el: any) => setReplyInputRef(el, rep.id)"
                          v-model="replyText"
                          type="textarea"
                          :rows="2"
                          :placeholder="`Trả lời ${rep.author_id}...`"
                          size="small"
                          @keydown="handleReplyKeydown"
                        />
                        <div class="flex justify-end space-x-2">
                          <el-button size="small" @click="replyingCommentId = null">Hủy</el-button>
                          <el-button type="primary" size="small" :disabled="!replyText.trim()" @click="submitReply(rep.id)">
                            Gửi trả lời
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Comment Form (Phần nhập bình luận nằm ở DƯỚI) -->
          <div class="flex space-x-3">
            <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" class="shrink-0" />
            <div class="flex-1 space-y-2">
              <!-- Google Docs Style Formatting Toolbar for Comment -->
              <div class="flex items-center flex-wrap gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 select-none">
                <!-- In đậm -->
                <button
                  type="button"
                  @click="insertCommentFormat('bold')"
                  class="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                  title="In đậm (Bold)"
                >
                  B
                </button>
                <!-- In nghiêng -->
                <button
                  type="button"
                  @click="insertCommentFormat('italic')"
                  class="w-6 h-6 flex items-center justify-center text-xs italic font-serif text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                  title="In nghiêng (Italic)"
                >
                  I
                </button>

                <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                <!-- Numbered List Dropdown -->
                <el-dropdown trigger="click" @command="(cmd: string) => applyCommentListStyle('numbered', cmd)">
                  <button
                    type="button"
                    @click="applyCommentListStyle('numbered', '1')"
                    class="flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                    title="Danh sách số"
                  >
                    <span class="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">1.</span>
                    <span>Số</span>
                    <el-icon :size="10" class="ml-0.5"><ArrowDown /></el-icon>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="1">1. 2. 3. (Số tự nhiên)</el-dropdown-item>
                      <el-dropdown-item command="a">a. b. c. (Chữ cái thường)</el-dropdown-item>
                      <el-dropdown-item command="I">I. II. III. (Số La Mã)</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <!-- Bulleted List Dropdown -->
                <el-dropdown trigger="click" @command="(cmd: string) => applyCommentListStyle('bullet', cmd)">
                  <button
                    type="button"
                    @click="applyCommentListStyle('bullet', '•')"
                    class="flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition cursor-pointer"
                    title="Danh sách đầu dòng"
                  >
                    <span class="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm leading-none">•</span>
                    <span>Đầu dòng</span>
                    <el-icon :size="10" class="ml-0.5"><ArrowDown /></el-icon>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="•">• Chấm tròn đặc</el-dropdown-item>
                      <el-dropdown-item command="o">o Chấm tròn rỗng</el-dropdown-item>
                      <el-dropdown-item command="▪">▪ Ô vuông nhỏ</el-dropdown-item>
                      <el-dropdown-item command="✓">✓ Dấu tích xanh</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                <!-- Indent / Outdent Buttons -->
                <button
                  type="button"
                  @click="adjustCommentIndent('outdent')"
                  class="px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                  title="Giảm lề (Shift+Tab)"
                >
                  ⇥
                </button>
                <button
                  type="button"
                  @click="adjustCommentIndent('indent')"
                  class="px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition"
                  title="Tăng lề (Tab)"
                >
                  ⇤
                </button>
                <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

                <!-- Đính kèm tệp -->
                <button
                  type="button"
                  @click="triggerCommentFileUpload"
                  class="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition cursor-pointer"
                  title="Đính kèm tệp / hình ảnh"
                >
                  <el-icon :size="14"><Paperclip /></el-icon>
                </button>
              </div>

              <!-- Input File ẩn cho Comment -->
              <input
                ref="commentFileInputRef"
                type="file"
                multiple
                class="hidden"
                @change="handleCommentFileSelected"
              />

              <el-input
                ref="commentInputRef"
                v-model="newCommentText"
                type="textarea"
                :rows="3"
                placeholder="Thêm bình luận"
                @keydown="handleCommentKeydown"
              />

              <!-- Pending Comment Files Preview List -->
              <div v-if="pendingCommentFiles.length > 0" class="flex flex-wrap gap-2 pt-1">
                <div
                  v-for="(f, fIdx) in pendingCommentFiles"
                  :key="fIdx"
                  class="flex items-center space-x-1.5 text-xs bg-gray-100 dark:bg-gray-700/80 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
                >
                  <img v-if="isImageFile(f.type || f.name)" :src="getFilePreviewUrl(f)" class="w-5 h-5 object-cover rounded" />
                  <el-icon v-else class="text-blue-500"><Document /></el-icon>
                  <span class="truncate max-w-[140px] text-gray-700 dark:text-gray-200 font-medium">{{ f.name }}</span>
                  <span class="text-[10px] text-gray-400">({{ formatFileSize(f.size) }})</span>
                  <button
                    type="button"
                    @click="removePendingCommentFile(fIdx)"
                    class="text-gray-400 hover:text-red-500 ml-1 p-0.5 transition cursor-pointer"
                    title="Xóa tệp"
                  >
                    <el-icon :size="11"><Close /></el-icon>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between pt-1">
                <div class="text-[11px] text-gray-400">Gợi ý: Nhấn Enter để tự động tạo dòng danh sách tiếp theo</div>
                <el-button type="primary" size="small" :disabled="!newCommentText.trim() && pendingCommentFiles.length === 0" @click="submitComment">
                  Save
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Details Sidebar Panel -->
      <div class="w-full lg:w-80 p-6 space-y-6 bg-gray-50/40 dark:bg-gray-800/20 text-xs">
        <div>
          <div class="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
            <h4 class="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Details</h4>
          </div>

          <div class="space-y-4">
            <!-- Board Selection (Chỉ hiện khi ở Chế độ Tạo Mới) -->
            <div v-if="isCreateMode && allBoards && allBoards.length > 0" class="flex flex-col space-y-1.5">
              <span class="text-gray-400 font-medium">Board Dự Án</span>
              <el-select
                v-model="task.board_id"
                placeholder="Chọn Board..."
                size="small"
                class="w-full"
              >
                <el-option
                  v-for="b in allBoards"
                  :key="b.id"
                  :label="b.board_name"
                  :value="b.id"
                />
              </el-select>
            </div>

            <!-- Priority Selection -->
            <div class="flex flex-col space-y-1.5">
              <span class="text-gray-400 font-medium">Độ ưu tiên (Priority)</span>
              <el-select
                v-model="task.priority"
                placeholder="Chọn độ ưu tiên..."
                size="small"
                class="w-full"
                @change="handlePriorityChange"
              >
                <el-option label="Critical (Rất gấp)" value="CRITICAL" />
                <el-option label="High (Cao)" value="HIGH" />
                <el-option label="Medium (Vừa)" value="MEDIUM" />
                <el-option label="Low (Thấp)" value="LOW" />
              </el-select>
            </div>

            <!-- Assignee -->
            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-gray-400 font-medium">Assignee</span>
                <button
                  v-if="task.assignee_id"
                  type="button"
                  @click="removeAssignee"
                  class="text-gray-400 hover:text-red-500 p-0.5 rounded transition cursor-pointer"
                  title="Xoá người thực hiện (Unassign)"
                >
                  <el-icon :size="14"><Close /></el-icon>
                </button>
              </div>

              <!-- Nếu đã có Assignee -->
              <div v-if="task.assignee_id" class="flex items-center justify-between bg-white dark:bg-gray-800 p-1.5 rounded border border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-2 min-w-0">
                  <el-avatar :size="24" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                  <span class="font-semibold text-gray-700 dark:text-gray-200 truncate">{{ task.assignee_id }}</span>
                </div>
                <button @click="assignToMe" class="text-blue-600 dark:text-blue-400 hover:underline shrink-0 text-[11px] font-medium pl-1">
                  Assign to me
                </button>
              </div>

              <!-- Nếu chưa có Assignee -> Hiển thị Select hỗ trợ gõ tìm kiếm & Assign to me trên 1 dòng -->
              <div v-else class="flex items-center space-x-2">
                <el-select
                  v-model="selectedAssigneeSelect"
                  filterable
                  placeholder="Tìm người..."
                  size="small"
                  class="flex-1 min-w-0"
                  @change="handleSelectAssignee"
                >
                  <el-option
                    v-for="user in assigneeOptions"
                    :key="user.id"
                    :label="user.name"
                    :value="user.name"
                  >
                    <div class="flex items-center space-x-2">
                      <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                      <span class="truncate">{{ user.name }}</span>
                    </div>
                  </el-option>
                </el-select>
                <button
                  type="button"
                  @click="assignToMe"
                  class="text-blue-600 dark:text-blue-400 hover:underline shrink-0 text-[11px] font-medium whitespace-nowrap cursor-pointer"
                >
                  Assign to me
                </button>
              </div>
            </div>

            <!-- Labels -->
            <div class="flex flex-col space-y-1">
              <span class="text-gray-400 font-medium">Labels</span>
              <div class="flex flex-wrap gap-1">
                <template v-if="(task.labels || []).length > 0">
                  <span
                    v-for="l in task.labels"
                    :key="l.id"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                    :style="{ backgroundColor: l.color }"
                  >
                    {{ l.label_name }}
                  </span>
                </template>
                <span v-else class="text-gray-400 italic">None</span>
              </div>
            </div>

            <!-- Parent -->
            <div class="flex flex-col space-y-1">
              <span class="text-gray-400 font-medium">Parent</span>
              <div
                v-if="parentTask || task.parent_id || task.parent_code"
                class="flex items-center space-x-1.5 bg-blue-50/60 dark:bg-blue-950/30 p-1.5 rounded border border-blue-200/60 dark:border-blue-800/60"
              >
                <span class="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">
                  {{ parentTask?.task_code || task.parent_code || 'PARENT' }}
                </span>
                <span class="text-gray-700 dark:text-gray-200 truncate max-w-[170px] font-medium">
                  {{ parentTask?.title || task.parent_title || task.parent_id }}
                </span>
              </div>
              <div v-else class="flex items-center space-x-2">
                <span class="text-gray-400 italic">None</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 dark:bg-purple-900/40 text-purple-600 font-bold">NEW</span>
              </div>
            </div>

            <!-- Story Point Estimate -->
            <div class="flex flex-col space-y-1">
              <span class="text-gray-400 font-medium">Story point estimate</span>
              <span class="text-gray-600 dark:text-gray-300 font-medium">{{ task.estimated_hours ? `${task.estimated_hours} hrs` : 'None' }}</span>
            </div>
          </div>
        </div>



        <!-- Reporter Section -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-gray-400 font-medium">Reporter</span>
            <button
              v-if="task.reporter_id"
              type="button"
              @click="removeReporter"
              class="text-gray-400 hover:text-red-500 p-0.5 rounded transition cursor-pointer"
              title="Xoá người báo cáo"
            >
              <el-icon :size="14"><Close /></el-icon>
            </button>
          </div>

          <!-- Nếu đã có Reporter -->
          <div v-if="task.reporter_id" class="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded border border-gray-200 dark:border-gray-700">
            <el-avatar :size="24" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <span class="font-semibold text-gray-700 dark:text-gray-200 truncate">{{ task.reporter_id }}</span>
          </div>

          <!-- Nếu chưa có Reporter -> Hiển thị Select hỗ trợ gõ tìm kiếm -->
          <div v-else>
            <el-select
              v-model="selectedReporterSelect"
              filterable
              placeholder="Tìm người báo cáo..."
              size="small"
              class="w-full"
              @change="handleSelectReporter"
            >
              <el-option
                v-for="user in reporterOptions"
                :key="user.id"
                :label="user.name"
                :value="user.name"
              >
                <div class="flex items-center space-x-2">
                  <el-avatar :size="20" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                  <span class="truncate">{{ user.name }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>

        <!-- Automation -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
          <span class="text-gray-400 font-medium">Automation</span>
          <div class="flex items-center space-x-1 text-blue-600 cursor-pointer hover:underline">
            <el-icon><Lightning /></el-icon>
            <span>Rule ...</span>
          </div>
        </div>

      </div>
    </div>
    <!-- Image Viewer Modal xem ảnh phóng to -->
    <el-image-viewer
      v-if="showImagePreview"
      :url-list="previewImageUrl ? [previewImageUrl] : []"
      @close="showImagePreview = false"
    />

    <!-- Dialog Form Thêm Web Link (2 inputs: Tên link & Đường dẫn URL) -->
    <el-dialog
      v-model="showWebLinkModal"
      title="Thêm Web Link"
      width="460px"
      destroy-on-close
      append-to-body
    >
      <div class="space-y-4 py-2">
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Tên link <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="webLinkTitle"
            placeholder="Ví dụ: Tài liệu thiết kế Figma, Google Drive..."
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Đường dẫn URL <span class="text-red-500">*</span>
          </label>
          <el-input
            v-model="webLinkUrl"
            placeholder="Ví dụ: https://figma.com/file/... hoặc https://docs.google.com/..."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="showWebLinkModal = false">Hủy</el-button>
          <el-button type="primary" @click="confirmAddWebLink">Thêm Web Link</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Modal Tạo / Xem chi tiết Sub-task (Hiển thị popup modal chuẩn) -->
    <CreateTaskModal
      v-if="isSubtaskModalOpen"
      v-model="isSubtaskModalOpen"
      :parent-task="task"
      :is-subtask-mode="true"
      :task-data="selectedSubtaskForModal"
      :selected-board-id="task?.board_id"
      :all-boards="allBoards"
      @created="onSubtaskCreated"
      @updated="emit('updated')"
    />
    <!-- Action Footer Bar khi ở Chế độ Tạo Mới (Create Mode) -->
    <div v-if="isCreateMode && !hideFooter" class="sticky bottom-0 z-30 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-end space-x-3 shadow-lg">
      <el-button @click="$emit('cancel')">Hủy</el-button>
      <el-button
        type="primary"
        :disabled="!task.title.trim()"
        :loading="isSubmitting"
        @click="handleCreateTaskSubmit"
        class="!font-bold px-6"
      >
        Tạo Task
      </el-button>
    </div>
  </div>

  <div v-else class="p-8 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 italic">
    Vui lòng chọn 1 task ở Card 3 để xem nội dung chi tiết.
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Paperclip,
  Connection,
  Link,
  CollectionTag,
  CircleCheck,
  MoreFilled,
  Plus,
  Document,
  Edit,
  Delete,
  Close,
  Download,
  View,
  Share,
  Lightning,
  ChatDotRound
} from '@element-plus/icons-vue'
import { projectManagementService, type TaskItem } from '@/api/projectManagementService'
import CreateTaskModal from './CreateTaskModal.vue'

const props = withDefaults(
  defineProps<{
    taskData?: TaskItem | null
    isCreateMode?: boolean
    selectedBoardId?: string
    allBoards?: any[]
    hideFooter?: boolean
    parentTask?: TaskItem | null
    isSubtaskMode?: boolean
  }>(),
  {
    taskData: null,
    isCreateMode: false,
    selectedBoardId: '',
    allBoards: () => [],
    hideFooter: false,
    parentTask: null,
    isSubtaskMode: false
  }
)

const emit = defineEmits<{
  (e: 'updated'): void
  (e: 'created', task: TaskItem): void
  (e: 'cancel'): void
}>()

const task = ref<TaskItem | null>(null)

const getPriorityLabel = (priority?: string) => {
  switch (priority) {
    case 'CRITICAL': return 'Critical'
    case 'HIGH': return 'High'
    case 'MEDIUM': return 'Medium'
    case 'LOW': return 'Low'
    default: return priority || 'High'
  }
}

const getPriorityChipClass = (priority?: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100'
    case 'HIGH':
      return 'border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 hover:bg-orange-100'
    case 'MEDIUM':
      return 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 hover:bg-blue-100'
    case 'LOW':
      return 'border-green-400 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-100'
    default:
      return 'border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 hover:bg-orange-100'
  }
}

const handlePriorityChange = async (command: string) => {
  if (!task.value) return
  const newPriority = command as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  task.value.priority = newPriority
  if (!props.isCreateMode && task.value.id) {
    try {
      await projectManagementService.updateTask(task.value.id, { priority: newPriority })
      ElMessage.success(`Đã đổi độ ưu tiên sang ${getPriorityLabel(newPriority)}`)
      emit('updated')
    } catch (e) {
      ElMessage.error('Không thể cập nhật độ ưu tiên')
    }
  }
}

const isEditingDesc = ref(false)
const editDescValue = ref('')
const isEditingTitle = ref(false)
const descInputRef = ref<any>(null)

const renderedDescriptionLines = computed(() => {
  if (!task.value?.description) return []
  return task.value.description.split('\n').map(l => l.trim())
})

const insertFormat = (type: 'bold' | 'italic' | 'numbered-list' | 'bullet-list') => {
  const textarea = descInputRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  let text = editDescValue.value || ''
  
  if (textarea) {
    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const selected = text.substring(start, end)
    
    let replacement = ''
    if (type === 'bold') {
      replacement = `**${selected || 'Văn bản in đậm'}**`
    } else if (type === 'italic') {
      replacement = `*${selected || 'Văn bản in nghiêng'}*`
    } else if (type === 'numbered-list') {
      applyListStyle('numbered', '1')
      return
    } else if (type === 'bullet-list') {
      applyListStyle('bullet', '•')
      return
    }
    
    editDescValue.value = text.substring(0, start) + replacement + text.substring(end)
  }
}

const applyListStyle = (kind: 'numbered' | 'bullet', style: string) => {
  const textarea = descInputRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  let text = editDescValue.value || ''
  
  if (textarea) {
    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const lineEnd = text.indexOf('\n', end)
    const effectiveEnd = lineEnd === -1 ? text.length : lineEnd
    const selectedBlock = text.substring(lineStart, effectiveEnd)
    
    const lines = selectedBlock.split('\n')
    const formattedLines = lines.map((line, idx) => {
      const cleanLine = line.replace(/^(\s*)([•o▪✓\-\*]|\d+\.|\w+\.)\s*/, '$1')
      if (kind === 'numbered') {
        if (style === 'a') return `a. ${cleanLine}`
        if (style === 'I') return `I. ${cleanLine}`
        return `${idx + 1}. ${cleanLine}`
      } else {
        return `${style} ${cleanLine}`
      }
    })

    const newBlock = formattedLines.join('\n')
    editDescValue.value = text.substring(0, lineStart) + newBlock + text.substring(effectiveEnd)
  } else {
    if (kind === 'numbered') {
      editDescValue.value = (editDescValue.value ? editDescValue.value + '\n' : '') + '1. Mục 1\n2. Mục 2\n3. Mục 3'
    } else {
      editDescValue.value = (editDescValue.value ? editDescValue.value + '\n' : '') + `${style} Mục 1\n${style} Mục 2\n${style} Mục 3`
    }
  }
}

const adjustIndent = (dir: 'indent' | 'outdent') => {
  const textarea = descInputRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  let text = editDescValue.value || ''
  if (!textarea) return
  
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const lineEnd = text.indexOf('\n', end)
  const effectiveEnd = lineEnd === -1 ? text.length : lineEnd
  const selectedBlock = text.substring(lineStart, effectiveEnd)
  
  const lines = selectedBlock.split('\n')
  const newLines = lines.map(line => {
    if (dir === 'indent') {
      return '  ' + line
    } else {
      return line.replace(/^  /, '')
    }
  })
  
  const newBlock = newLines.join('\n')
  editDescValue.value = text.substring(0, lineStart) + newBlock + text.substring(effectiveEnd)
}

const handleDescKeydown = (evt: Event | KeyboardEvent) => {
  const e = evt as KeyboardEvent
  if (e.key === 'Tab') {
    e.preventDefault()
    adjustIndent(e.shiftKey ? 'outdent' : 'indent')
  } else if (e.key === 'Enter' && !e.shiftKey) {
    const textarea = e.target as HTMLTextAreaElement | null
    if (!textarea) return
    const start = textarea.selectionStart || 0
    const value = editDescValue.value || ''
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const currentLine = value.substring(lineStart, start)
    
    const numMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/)
    const letterMatch = currentLine.match(/^(\s*)([a-z])\.\s*(.*)$/i)
    const bulletMatch = currentLine.match(/^(\s*)([•o▪✓\-\*])\s*(.*)$/)

    if (numMatch && numMatch[1] !== undefined && numMatch[2] !== undefined && numMatch[3] !== undefined) {
      const indent = numMatch[1]
      const numStr = numMatch[2]
      const contentStr = numMatch[3]
      const num = parseInt(numStr, 10)
      const content = contentStr.trim()

      if (!content) {
        e.preventDefault()
        editDescValue.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }

      e.preventDefault()
      const nextNum = num + 1
      const prefix = `\n${indent}${nextNum}. `
      editDescValue.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    } else if (letterMatch && letterMatch[1] !== undefined && letterMatch[2] !== undefined && letterMatch[3] !== undefined) {
      const indent = letterMatch[1]
      const charStr = letterMatch[2]
      const contentStr = letterMatch[3]
      const charCode = charStr.charCodeAt(0)
      const content = contentStr.trim()

      if (!content) {
        e.preventDefault()
        editDescValue.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }

      e.preventDefault()
      const nextChar = String.fromCharCode(charCode + 1)
      const prefix = `\n${indent}${nextChar}. `
      editDescValue.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    } else if (bulletMatch && bulletMatch[1] !== undefined && bulletMatch[2] !== undefined && bulletMatch[3] !== undefined) {
      const indent = bulletMatch[1]
      const bulletSymbol = bulletMatch[2]
      const contentStr = bulletMatch[3]
      const content = contentStr.trim()

      if (!content) {
        e.preventDefault()
        editDescValue.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }

      e.preventDefault()
      const prefix = `\n${indent}${bulletSymbol} `
      editDescValue.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    }
  }
}

const activityFilter = ref('comments')
const newCommentText = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const isSubmitting = ref(false)

const initCreateTaskDraft = (): TaskItem => ({
  id: '',
  task_code: props.isSubtaskMode ? 'NEW-SUBTASK' : 'NEW-TASK',
  board_id: props.selectedBoardId || (props.parentTask ? props.parentTask.board_id : (props.allBoards && props.allBoards.length > 0 && props.allBoards[0] ? props.allBoards[0].id : '')),
  title: '',
  description: '',
  task_type: props.isSubtaskMode ? 'SUB_TASK' : 'TASK',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  assignee_id: '',
  reporter_id: '',
  parent_id: props.parentTask ? props.parentTask.id : '',
  parent_task_id: props.parentTask ? props.parentTask.id : '',
  parent_code: props.parentTask ? props.parentTask.task_code : '',
  parent_title: props.parentTask ? props.parentTask.title : '',
  sub_tasks: [],
  attachments: [],
  web_links: [],
  comments: []
})

const handleCreateTaskSubmit = async () => {
  if (!task.value || !task.value.title.trim()) {
    ElMessage.warning('Vui lòng nhập tiêu đề công việc')
    return
  }
  try {
    isSubmitting.value = true
    const createdTask = await projectManagementService.createTask({
      board_id: task.value.board_id || props.selectedBoardId,
      title: task.value.title.trim(),
      description: task.value.description,
      status: task.value.status,
      priority: task.value.priority,
      assignee_id: task.value.assignee_id,
      reporter_id: task.value.reporter_id,
      due_date: task.value.due_date,
      start_date: task.value.start_date,
    })

    if (task.value.sub_tasks && task.value.sub_tasks.length > 0) {
      createdTask.sub_tasks = task.value.sub_tasks
    }
    if (task.value.attachments && task.value.attachments.length > 0) {
      createdTask.attachments = task.value.attachments
    }
    if (task.value.web_links && task.value.web_links.length > 0) {
      createdTask.web_links = task.value.web_links
    }

    ElMessage.success(`Đã tạo công việc "${createdTask.task_code}: ${createdTask.title}" thành công`)
    emit('created', createdTask)
    emit('updated')
  } catch (e) {
    ElMessage.error('Không thể tạo công việc mới')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => [props.taskData, props.isCreateMode],
  async () => {
    if (props.isCreateMode) {
      task.value = initCreateTaskDraft()
      editDescValue.value = ''
      selectedAssigneeSelect.value = ''
      selectedReporterSelect.value = ''
    } else if (props.taskData) {
      task.value = { ...props.taskData }
      editDescValue.value = task.value.description || ''
      try {
        const fullDetail = await projectManagementService.getTaskDetail(props.taskData.id)
        if (fullDetail) task.value = fullDetail
      } catch (e) {
        console.error(e)
      }
    } else {
      task.value = null
    }
  },
  { immediate: true, deep: true }
)

const getStatusLabel = (st?: string) => {
  switch (st) {
    case 'OPEN': return 'To Do'
    case 'IN_PROGRESS': return 'In Progress'
    case 'DONE': return 'Done'
    case 'BLOCKED': return 'Blocked'
    case 'CANCELLED': return 'Cancelled'
    default: return st || 'To Do'
  }
}

const getStatusBadgeType = (st?: string) => {
  switch (st) {
    case 'OPEN': return 'info'
    case 'IN_PROGRESS': return 'primary'
    case 'DONE': return 'success'
    case 'BLOCKED': return 'warning'
    case 'CANCELLED': return 'danger'
    default: return 'info'
  }
}

const formatDate = (dt?: string) => {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const handleStatusChange = async (newStatus: any) => {
  if (!task.value) return
  try {
    const updated = await projectManagementService.updateTask(task.value.id, { status: newStatus })
    task.value.status = updated.status
    ElMessage.success(`Đã đổi trạng thái sang ${getStatusLabel(newStatus)}`)
    emit('updated')
  } catch (e) {
    ElMessage.error('Không thể cập nhật trạng thái')
  }
}

const saveDesc = async () => {
  if (!task.value) return
  
  if (props.isCreateMode || !task.value.id || task.value.id === 'NEW-TASK' || task.value.id.startsWith('st-')) {
    task.value.description = editDescValue.value
    isEditingDesc.value = false
    ElMessage.success('Đã cập nhật mô tả')
    return
  }

  try {
    await projectManagementService.updateTask(task.value.id, { description: editDescValue.value })
    task.value.description = editDescValue.value
    isEditingDesc.value = false
    ElMessage.success('Đã lưu mô tả')
    emit('updated')
  } catch (e) {
    task.value.description = editDescValue.value
    isEditingDesc.value = false
    ElMessage.success('Đã cập nhật mô tả')
  }
}

const showImagePreview = ref(false)
const previewImageUrl = ref('')

const isImageFile = (att: any) => {
  if (!att) return false
  const type = att.file_type || ''
  const path = att.file_path || ''
  const name = att.file_name || ''
  return (
    type.startsWith('image') ||
    path.includes('http') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name) ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path)
  )
}

const handleAttachmentCardClick = (att: any) => {
  if (isImageFile(att)) {
    previewImageUrl.value = att.file_path
    showImagePreview.value = true
  } else {
    downloadFile(att.file_path, att.file_name)
  }
}

const downloadFile = (url: string, fileName: string) => {
  if (!url) return
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'attachment'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success(`Bắt đầu tải xuống file ${fileName}`)
}

const handleAttachmentMenuCommand = (cmd: string, att: any) => {
  if (cmd === 'download') {
    downloadFile(att.file_path, att.file_name)
  } else if (cmd === 'preview') {
    previewImageUrl.value = att.file_path
    showImagePreview.value = true
  }
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const selectedAttachmentIds = ref<string[]>([])

const isAllAttachmentsSelected = computed(() => {
  const list = task.value?.attachments || []
  return list.length > 0 && selectedAttachmentIds.value.length === list.length
})

const toggleSelectAllAttachments = () => {
  const list = task.value?.attachments || []
  if (isAllAttachmentsSelected.value) {
    selectedAttachmentIds.value = []
  } else {
    selectedAttachmentIds.value = list.map(a => a.id)
  }
}

const toggleSelectAttachment = (attId: string) => {
  const idx = selectedAttachmentIds.value.indexOf(attId)
  if (idx !== -1) {
    selectedAttachmentIds.value.splice(idx, 1)
  } else {
    selectedAttachmentIds.value.push(attId)
  }
}

const handleDeleteAttachment = (attId: string) => {
  ElMessageBox.confirm('Bạn có chắc chắn muốn xoá file đính kèm này không?', 'Xác nhận xoá file', {
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Hủy',
    type: 'warning',
  }).then(async () => {
    if (task.value && task.value.attachments) {
      task.value.attachments = task.value.attachments.filter(a => a.id !== attId)
      selectedAttachmentIds.value = selectedAttachmentIds.value.filter(id => id !== attId)
      try {
        await projectManagementService.deleteAttachment(attId)
      } catch (e) {
        console.warn(e)
      }
      ElMessage.success('Đã xoá file đính kèm thành công')
      emit('updated')
    }
  }).catch(() => {})
}

const handleBatchDeleteAttachments = () => {
  const count = selectedAttachmentIds.value.length
  if (count === 0) return

  ElMessageBox.confirm(`Bạn có chắc chắn muốn xoá ${count} file đính kèm đã chọn không?`, 'Xoá nhiều file đính kèm', {
    confirmButtonText: 'Xoá tất cả',
    cancelButtonText: 'Hủy',
    type: 'warning',
  }).then(async () => {
    if (task.value && task.value.attachments) {
      const idsToDelete = new Set(selectedAttachmentIds.value)
      task.value.attachments = task.value.attachments.filter(a => !idsToDelete.has(a.id))
      
      await Promise.all(
        Array.from(idsToDelete).map(id => projectManagementService.deleteAttachment(id).catch(() => {}))
      )
      
      selectedAttachmentIds.value = []
      ElMessage.success(`Đã xoá ${count} file đính kèm thành công`)
      emit('updated')
    }
  }).catch(() => {})
}

const handleFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0 && task.value) {
    const files = Array.from(target.files)
    if (!task.value.attachments) task.value.attachments = []
    
    files.forEach(file => {
      task.value?.attachments?.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        task_id: task.value?.id || '',
        uploader_id: 'Jason Howie',
        file_name: file.name,
        file_path: URL.createObjectURL(file),
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      })
    })
    
    ElMessage.success(`Đã tải lên ${files.length} file đính kèm thành công`)
    target.value = ''
    emit('updated')
  }
}

const showWebLinkModal = ref(false)
const webLinkTitle = ref('')
const webLinkUrl = ref('')

const openAddWebLinkModal = () => {
  webLinkTitle.value = ''
  webLinkUrl.value = ''
  showWebLinkModal.value = true
}

const confirmAddWebLink = () => {
  if (!webLinkTitle.value.trim()) {
    ElMessage.warning('Vui lòng nhập Tên link')
    return
  }
  if (!webLinkUrl.value.trim()) {
    ElMessage.warning('Vui lòng nhập Đường dẫn URL')
    return
  }
  
  let formattedUrl = webLinkUrl.value.trim()
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`
  }

  if (task.value) {
    if (!task.value.web_links) task.value.web_links = []
    task.value.web_links.push({
      id: `w-${Date.now()}`,
      url: formattedUrl,
      title: webLinkTitle.value.trim()
    })
    ElMessage.success('Đã thêm Web Link thành công')
    showWebLinkModal.value = false
    emit('updated')
  }
}

const handleDeleteWebLink = (linkId: string) => {
  if (task.value && task.value.web_links) {
    task.value.web_links = task.value.web_links.filter(w => w.id !== linkId)
    ElMessage.success('Đã xoá Web Link')
    emit('updated')
  }
}

const isSubtaskModalOpen = ref(false)
const selectedSubtaskForModal = ref<TaskItem | null>(null)

const handleAddSubtask = () => {
  selectedSubtaskForModal.value = null
  isSubtaskModalOpen.value = true
}

const openSubtaskDetail = (subtask: any) => {
  selectedSubtaskForModal.value = subtask
  isSubtaskModalOpen.value = true
}

const onSubtaskCreated = (newSubtask: TaskItem) => {
  if (!task.value) return
  if (!task.value.sub_tasks) task.value.sub_tasks = []
  
  if (!newSubtask.task_code || newSubtask.task_code === 'NEW-SUBTASK') {
    newSubtask.task_code = `${task.value.task_code}-${task.value.sub_tasks.length + 1}`
  }
  
  task.value.sub_tasks.push(newSubtask)
  ElMessage.success(`Đã tạo sub-task "${newSubtask.title}" cho task ${task.value.task_code}`)
  emit('updated')
}

const handleDeleteSubtask = (subtaskId: string) => {
  if (task.value && task.value.sub_tasks) {
    task.value.sub_tasks = task.value.sub_tasks.filter(st => st.id !== subtaskId)
    ElMessage.success('Đã xoá sub-task thành công')
    emit('updated')
  }
}

const selectedAssigneeSelect = ref('')

const assigneeOptions = [
  { id: 'u1', name: 'TN001 - Nguyễn Văn Tiến' },
  { id: 'u2', name: 'TN002 - Trần Tiến Nga' },
  { id: 'u3', name: 'TN003 - Lê Minh Đức' },
  { id: 'u4', name: 'TN004 - Phạm Hoàng Nam' },
  { id: 'u5', name: 'Jason Howie' },
  { id: 'u6', name: 'Unassigned' }
]

const selectedReporterSelect = ref('')

const reporterOptions = [
  { id: 'r1', name: 'TN001 - Nguyễn Văn Tiến' },
  { id: 'r2', name: 'TN002 - Trần Tiến Nga' },
  { id: 'r3', name: 'TN003 - Lê Minh Đức' },
  { id: 'r4', name: 'TN004 - Phạm Hoàng Nam' },
  { id: 'r5', name: 'Rob Evans' },
  { id: 'r6', name: 'Jason Howie' }
]

const removeReporter = async () => {
  if (!task.value) return
  task.value.reporter_id = ''
  selectedReporterSelect.value = ''
  
  if (props.isCreateMode || !task.value.id || task.value.id === 'NEW-TASK' || task.value.id.startsWith('st-')) {
    ElMessage.success('Đã xoá người báo cáo')
    return
  }

  try {
    await projectManagementService.updateTask(task.value.id, { reporter_id: '' })
    ElMessage.success('Đã xoá người báo cáo')
    emit('updated')
  } catch (e) {
    ElMessage.success('Đã xoá người báo cáo')
  }
}

const handleSelectReporter = async (val: string) => {
  if (!task.value) return
  task.value.reporter_id = val
  
  if (props.isCreateMode || !task.value.id || task.value.id === 'NEW-TASK' || task.value.id.startsWith('st-')) {
    ElMessage.success(`Đã chọn người báo cáo: ${val}`)
    return
  }

  try {
    await projectManagementService.updateTask(task.value.id, { reporter_id: val })
    ElMessage.success(`Đã chọn người báo cáo: ${val}`)
    emit('updated')
  } catch (e) {
    ElMessage.success(`Đã chọn người báo cáo: ${val}`)
  }
}

const removeAssignee = async () => {
  if (!task.value) return
  task.value.assignee_id = ''
  selectedAssigneeSelect.value = ''
  
  if (props.isCreateMode || !task.value.id || task.value.id === 'NEW-TASK' || task.value.id.startsWith('st-')) {
    ElMessage.success('Đã xoá người thực hiện')
    return
  }

  try {
    await projectManagementService.updateTask(task.value.id, { assignee_id: '' })
    ElMessage.success('Đã xoá người thực hiện')
    emit('updated')
  } catch (e) {
    ElMessage.success('Đã xoá người thực hiện')
  }
}

const handleSelectAssignee = async (val: string) => {
  if (!task.value) return
  const finalVal = val === 'Unassigned' ? '' : val
  task.value.assignee_id = finalVal
  
  if (props.isCreateMode || !task.value.id || task.value.id === 'NEW-TASK' || task.value.id.startsWith('st-')) {
    if (finalVal) {
      ElMessage.success(`Đã gán người thực hiện: ${val}`)
    } else {
      ElMessage.success('Đã chuyển sang Unassigned')
    }
    return
  }

  try {
    await projectManagementService.updateTask(task.value.id, { assignee_id: finalVal })
    if (finalVal) {
      ElMessage.success(`Đã gán người thực hiện: ${val}`)
    } else {
      ElMessage.success('Đã chuyển sang Unassigned')
    }
    emit('updated')
  } catch (e) {
    if (finalVal) {
      ElMessage.success(`Đã gán người thực hiện: ${val}`)
    } else {
      ElMessage.success('Đã chuyển sang Unassigned')
    }
  }
}

const commentInputRef = ref<any>(null)

const renderCommentLines = (content: string) => {
  if (!content) return []
  return content.split('\n').map(l => l.trim())
}

const insertCommentFormat = (type: 'bold' | 'italic') => {
  const textarea = commentInputRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  let text = newCommentText.value || ''
  if (!textarea) return
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const selected = text.substring(start, end)
  let replacement = type === 'bold' ? `**${selected || 'Văn bản in đậm'}**` : `*${selected || 'Văn bản in nghiêng'}*`
  newCommentText.value = text.substring(0, start) + replacement + text.substring(end)
}

const applyCommentListStyle = (kind: 'numbered' | 'bullet', style: string) => {
  const textarea = commentInputRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  let text = newCommentText.value || ''
  if (!textarea) {
    newCommentText.value = (newCommentText.value ? newCommentText.value + '\n' : '') + (kind === 'numbered' ? '1. Mục 1' : `${style} Mục 1`)
    return
  }
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const lineEnd = text.indexOf('\n', end)
  const effectiveEnd = lineEnd === -1 ? text.length : lineEnd
  const selectedBlock = text.substring(lineStart, effectiveEnd)
  const lines = selectedBlock.split('\n')
  const formattedLines = lines.map((line, idx) => {
    const cleanLine = line.replace(/^(\s*)([•o▪✓\-\*]|\d+\.|\w+\.)\s*/, '$1')
    if (kind === 'numbered') {
      if (style === 'a') return `a. ${cleanLine}`
      if (style === 'I') return `I. ${cleanLine}`
      return `${idx + 1}. ${cleanLine}`
    } else {
      return `${style} ${cleanLine}`
    }
  })
  const newBlock = formattedLines.join('\n')
  newCommentText.value = text.substring(0, lineStart) + newBlock + text.substring(effectiveEnd)
}

const adjustCommentIndent = (dir: 'indent' | 'outdent') => {
  const textarea = commentInputRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  let text = newCommentText.value || ''
  if (!textarea) return
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const lineEnd = text.indexOf('\n', end)
  const effectiveEnd = lineEnd === -1 ? text.length : lineEnd
  const selectedBlock = text.substring(lineStart, effectiveEnd)
  const lines = selectedBlock.split('\n')
  const newLines = lines.map(line => dir === 'indent' ? '  ' + line : line.replace(/^  /, ''))
  newCommentText.value = text.substring(0, lineStart) + newLines.join('\n') + text.substring(effectiveEnd)
}

const handleCommentKeydown = (evt: Event | KeyboardEvent) => {
  const e = evt as KeyboardEvent
  if (e.key === 'Tab') {
    e.preventDefault()
    adjustCommentIndent(e.shiftKey ? 'outdent' : 'indent')
  } else if (e.key === 'Enter' && !e.shiftKey) {
    const textarea = e.target as HTMLTextAreaElement | null
    if (!textarea) return
    const start = textarea.selectionStart || 0
    const value = newCommentText.value || ''
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const currentLine = value.substring(lineStart, start)
    
    const numMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/)
    const letterMatch = currentLine.match(/^(\s*)([a-z])\.\s*(.*)$/i)
    const bulletMatch = currentLine.match(/^(\s*)([•o▪✓\-\*])\s*(.*)$/)

    if (numMatch && numMatch[1] !== undefined && numMatch[2] !== undefined && numMatch[3] !== undefined) {
      const indent = numMatch[1]
      const num = parseInt(numMatch[2], 10)
      const content = numMatch[3].trim()
      if (!content) {
        e.preventDefault()
        newCommentText.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }
      e.preventDefault()
      const prefix = `\n${indent}${num + 1}. `
      newCommentText.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    } else if (letterMatch && letterMatch[1] !== undefined && letterMatch[2] !== undefined && letterMatch[3] !== undefined) {
      const indent = letterMatch[1]
      const charCode = letterMatch[2].charCodeAt(0)
      const content = letterMatch[3].trim()
      if (!content) {
        e.preventDefault()
        newCommentText.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }
      e.preventDefault()
      const prefix = `\n${indent}${String.fromCharCode(charCode + 1)}. `
      newCommentText.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    } else if (bulletMatch && bulletMatch[1] !== undefined && bulletMatch[2] !== undefined && bulletMatch[3] !== undefined) {
      const indent = bulletMatch[1]
      const bulletSymbol = bulletMatch[2]
      const content = bulletMatch[3].trim()
      if (!content) {
        e.preventDefault()
        newCommentText.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }
      e.preventDefault()
      const prefix = `\n${indent}${bulletSymbol} `
      newCommentText.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    }
  }
}

const reactionList = [
  { symbol: '👍', label: 'Like (Thích)' },
  { symbol: '❤️', label: 'Tim (Yêu thích)' },
  { symbol: '😂', label: 'Haha' },
  { symbol: '😮', label: 'Wow (Ngạc nhiên)' },
  { symbol: '😢', label: 'Buồn' },
  { symbol: '😡', label: 'Phẫn nộ' }
]

const getReactionLabel = (symbol: string) => {
  const item = reactionList.find(r => r.symbol === symbol)
  return item ? item.label.split(' ')[0] : 'Thích'
}

const replyInputMap = new Map<string, any>()

const setReplyInputRef = (el: any, id: string) => {
  if (el) {
    replyInputMap.set(id, el)
  } else {
    replyInputMap.delete(id)
  }
}

const getActiveReplyTextarea = (): HTMLTextAreaElement | null => {
  if (!replyingCommentId.value) return null
  const comp = replyInputMap.get(replyingCommentId.value)
  if (!comp) return null
  const el = comp.$el || comp
  if (el.querySelector) return el.querySelector('textarea')
  if (el instanceof HTMLTextAreaElement) return el
  return null
}

const replyingCommentId = ref<string | null>(null)
const replyText = ref('')

const insertReplyFormat = (type: 'bold' | 'italic') => {
  const textarea = getActiveReplyTextarea()
  let text = replyText.value || ''
  if (!textarea) {
    let selected = 'Văn bản'
    let replacement = type === 'bold' ? `**${selected}**` : `*${selected}*`
    replyText.value = text + replacement
    return
  }
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const selected = text.substring(start, end)
  let replacement = type === 'bold' ? `**${selected || 'Văn bản in đậm'}**` : `*${selected || 'Văn bản in nghiêng'}*`
  replyText.value = text.substring(0, start) + replacement + text.substring(end)
}

const applyReplyListStyle = (kind: 'numbered' | 'bullet', style: string) => {
  const textarea = getActiveReplyTextarea()
  let text = replyText.value || ''
  if (!textarea) {
    replyText.value = (replyText.value ? replyText.value + '\n' : '') + (kind === 'numbered' ? '1. Mục 1' : `${style} Mục 1`)
    return
  }
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const lineEnd = text.indexOf('\n', end)
  const effectiveEnd = lineEnd === -1 ? text.length : lineEnd
  const selectedBlock = text.substring(lineStart, effectiveEnd)
  const lines = selectedBlock.split('\n')
  const formattedLines = lines.map((line, idx) => {
    const cleanLine = line.replace(/^(\s*)([•o▪✓\-\*]|\d+\.|\w+\.)\s*/, '$1')
    if (kind === 'numbered') {
      if (style === 'a') return `a. ${cleanLine}`
      if (style === 'I') return `I. ${cleanLine}`
      return `${idx + 1}. ${cleanLine}`
    } else {
      return `${style} ${cleanLine}`
    }
  })
  const newBlock = formattedLines.join('\n')
  replyText.value = text.substring(0, lineStart) + newBlock + text.substring(effectiveEnd)
}

const adjustReplyIndent = (dir: 'indent' | 'outdent') => {
  const textarea = getActiveReplyTextarea()
  let text = replyText.value || ''
  if (!textarea) return
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const lineEnd = text.indexOf('\n', end)
  const effectiveEnd = lineEnd === -1 ? text.length : lineEnd
  const selectedBlock = text.substring(lineStart, effectiveEnd)
  const lines = selectedBlock.split('\n')
  const newLines = lines.map(line => dir === 'indent' ? '  ' + line : line.replace(/^  /, ''))
  replyText.value = text.substring(0, lineStart) + newLines.join('\n') + text.substring(effectiveEnd)
}

const handleReplyKeydown = (evt: Event | KeyboardEvent) => {
  const e = evt as KeyboardEvent
  if (e.key === 'Tab') {
    e.preventDefault()
    adjustReplyIndent(e.shiftKey ? 'outdent' : 'indent')
  } else if (e.key === 'Enter' && !e.shiftKey) {
    const textarea = e.target as HTMLTextAreaElement | null
    if (!textarea) return
    const start = textarea.selectionStart || 0
    const value = replyText.value || ''
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const currentLine = value.substring(lineStart, start)
    
    const numMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/)
    const letterMatch = currentLine.match(/^(\s*)([a-z])\.\s*(.*)$/i)
    const bulletMatch = currentLine.match(/^(\s*)([•o▪✓\-\*])\s*(.*)$/)

    if (numMatch && numMatch[1] !== undefined && numMatch[2] !== undefined && numMatch[3] !== undefined) {
      const indent = numMatch[1]
      const num = parseInt(numMatch[2], 10)
      const content = numMatch[3].trim()
      if (!content) {
        e.preventDefault()
        replyText.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }
      e.preventDefault()
      const prefix = `\n${indent}${num + 1}. `
      replyText.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    } else if (letterMatch && letterMatch[1] !== undefined && letterMatch[2] !== undefined && letterMatch[3] !== undefined) {
      const indent = letterMatch[1]
      const charCode = letterMatch[2].charCodeAt(0)
      const content = letterMatch[3].trim()
      if (!content) {
        e.preventDefault()
        replyText.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }
      e.preventDefault()
      const prefix = `\n${indent}${String.fromCharCode(charCode + 1)}. `
      replyText.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    } else if (bulletMatch && bulletMatch[1] !== undefined && bulletMatch[2] !== undefined && bulletMatch[3] !== undefined) {
      const indent = bulletMatch[1]
      const bulletSymbol = bulletMatch[2]
      const content = bulletMatch[3].trim()
      if (!content) {
        e.preventDefault()
        replyText.value = value.substring(0, lineStart) + value.substring(start)
        setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = lineStart }, 0)
        return
      }
      e.preventDefault()
      const prefix = `\n${indent}${bulletSymbol} `
      replyText.value = value.substring(0, start) + prefix + value.substring(start)
      setTimeout(() => { if (textarea) textarea.selectionStart = textarea.selectionEnd = start + prefix.length }, 0)
    }
  }
}

const findCommentById = (id: string, list: any[]): any | null => {
  for (const c of list) {
    if (c.id === id) return c
    if (c.replies && c.replies.length > 0) {
      const found = findCommentById(id, c.replies)
      if (found) return found
    }
  }
  return null
}

const deleteCommentById = (id: string, list: any[]): boolean => {
  const index = list.findIndex(c => c.id === id)
  if (index !== -1) {
    list.splice(index, 1)
    return true
  }
  for (const c of list) {
    if (c.replies && c.replies.length > 0) {
      if (deleteCommentById(id, c.replies)) return true
    }
  }
  return false
}

const findRootComment = (id: string, list: any[]): any | null => {
  for (const c of list) {
    if (c.id === id) return c
    if (c.replies && c.replies.some((r: any) => r.id === id)) return c
    if (c.replies) {
      const found = findRootComment(id, c.replies)
      if (found) return c
    }
  }
  return null
}

const toggleReplyInput = (cmId: string) => {
  if (replyingCommentId.value === cmId) {
    replyingCommentId.value = null
    replyText.value = ''
  } else {
    replyingCommentId.value = cmId
    const target = findCommentById(cmId, task.value?.comments || [])
    const root = findRootComment(cmId, task.value?.comments || [])
    if (target && root && target.id !== root.id) {
      replyText.value = `@${target.author_id} `
    } else {
      replyText.value = ''
    }
  }
}

const commentFileInputRef = ref<any>(null)
const replyFileInputRef = ref<any>(null)

const pendingCommentFiles = ref<File[]>([])
const pendingReplyFiles = ref<File[]>([])

const triggerCommentFileUpload = () => {
  commentFileInputRef.value?.click()
}

const triggerReplyFileUpload = () => {
  replyFileInputRef.value?.click()
}

const handleCommentFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    pendingCommentFiles.value.push(...files)
    target.value = ''
  }
}

const handleReplyFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    pendingReplyFiles.value.push(...files)
    target.value = ''
  }
}

const removePendingCommentFile = (index: number) => {
  pendingCommentFiles.value.splice(index, 1)
}

const removePendingReplyFile = (index: number) => {
  pendingReplyFiles.value.splice(index, 1)
}

const getFilePreviewUrl = (file: File) => {
  return URL.createObjectURL(file)
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getImageAttachments = (attachments?: any[]) => {
  if (!attachments) return []
  return attachments.filter(a => isImageFile(a.file_type || a.file_name))
}

const getNonImageAttachments = (attachments?: any[]) => {
  if (!attachments) return []
  return attachments.filter(a => !isImageFile(a.file_type || a.file_name))
}

const submitReply = (cmId: string) => {
  if (!task.value || (!replyText.value.trim() && pendingReplyFiles.value.length === 0) || !task.value.comments) return
  const targetComment = findCommentById(cmId, task.value.comments)
  const rootComment = findRootComment(cmId, task.value.comments) || targetComment

  if (rootComment) {
    const textContent = replyText.value.trim() || (pendingReplyFiles.value.length > 0 ? 'Đã đính kèm tệp' : '')
    const newReply: any = {
      id: `cm-reply-${Date.now()}`,
      task_id: task.value.id,
      parent_comment_id: cmId,
      author_id: 'Jason Howie',
      content: textContent,
      created_at: new Date().toISOString()
    }
    if (pendingReplyFiles.value.length > 0) {
      newReply.attachments = pendingReplyFiles.value.map((f, i) => ({
        id: `att-rep-${Date.now()}-${i}`,
        task_id: task.value!.id,
        uploader_id: 'Jason Howie',
        file_name: f.name,
        file_path: URL.createObjectURL(f),
        file_type: f.type,
        file_size: f.size,
        uploaded_at: new Date().toISOString()
      }))
    }
    if (!rootComment.replies) rootComment.replies = []
    rootComment.replies.push(newReply)
    replyText.value = ''
    pendingReplyFiles.value = []
    replyingCommentId.value = null
    ElMessage.success('Đã gửi câu trả lời')
    emit('updated')
  }
}

const submitComment = async () => {
  if (!task.value || (!newCommentText.value.trim() && pendingCommentFiles.value.length === 0)) return
  try {
    const textContent = newCommentText.value.trim() || (pendingCommentFiles.value.length > 0 ? 'Đã đính kèm tệp' : '')
    const cm = await projectManagementService.addComment(task.value.id, textContent)
    if (pendingCommentFiles.value.length > 0) {
      cm.attachments = pendingCommentFiles.value.map((f, i) => ({
        id: `att-cm-${Date.now()}-${i}`,
        task_id: task.value!.id,
        uploader_id: 'Jason Howie',
        file_name: f.name,
        file_path: URL.createObjectURL(f),
        file_type: f.type,
        file_size: f.size,
        uploaded_at: new Date().toISOString()
      }))
    }
    if (!task.value.comments) task.value.comments = []
    if (!task.value.comments.some(c => c.id === cm.id)) {
      task.value.comments.push(cm)
    }
    newCommentText.value = ''
    pendingCommentFiles.value = []
    ElMessage.success('Đã thêm bình luận thành công')
    emit('updated')
  } catch (e) {
    ElMessage.error('Không thể đăng bình luận')
  }
}

const MY_USER_NAME = 'Jason Howie'
const MY_USER_ID = 'me'

const toggleCommentReaction = (cmId: string, symbol: string) => {
  if (!task.value || !task.value.comments) return
  const cm = findCommentById(cmId, task.value.comments)
  if (!cm) return
  if (!cm.reactionUsers) cm.reactionUsers = []

  // Xoá phản hồi cũ của 'me'
  cm.reactionUsers = cm.reactionUsers.filter((u: any) => u.userId !== MY_USER_ID)

  if (cm.userReaction === symbol) {
    cm.userReaction = undefined
    cm.isDisliked = false
  } else {
    cm.userReaction = symbol
    cm.isDisliked = false
    cm.reactionUsers.push({
      userId: MY_USER_ID,
      userName: MY_USER_NAME,
      emoji: symbol
    })
  }
  emit('updated')
}

const toggleCommentDislike = (cmId: string) => {
  if (!task.value || !task.value.comments) return
  const cm = findCommentById(cmId, task.value.comments)
  if (!cm) return
  if (!cm.reactionUsers) cm.reactionUsers = []

  // Xoá phản hồi cũ của 'me'
  cm.reactionUsers = cm.reactionUsers.filter((u: any) => u.userId !== MY_USER_ID)

  cm.isDisliked = !cm.isDisliked

  if (cm.isDisliked) {
    cm.userReaction = undefined
    cm.reactionUsers.push({
      userId: MY_USER_ID,
      userName: MY_USER_NAME,
      emoji: '👎'
    })
    ElMessage.info('Đã đánh dấu Không thích')
  }
  emit('updated')
}

const getCommentReactionGroups = (cm: any) => {
  if (!cm) return []
  const list: { userId: string; userName: string; emoji: string }[] = [...(cm.reactionUsers || [])]

  // Group by emoji
  const map = new Map<string, { emoji: string; count: number; users: { userId: string; userName: string; emoji: string }[] }>()

  list.forEach(item => {
    if (!map.has(item.emoji)) {
      map.set(item.emoji, { emoji: item.emoji, count: 0, users: [] })
    }
    const grp = map.get(item.emoji)!
    grp.count++
    grp.users.push(item)
  })

  return Array.from(map.values())
}

const handleCommentMenuCommand = (command: string, commentId: string) => {
  if (command === 'delete') {
    ElMessageBox.confirm('Bạn có chắc chắn muốn xoá mục này không?', 'Xác nhận xoá', {
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }).then(() => {
      if (task.value && task.value.comments) {
        deleteCommentById(commentId, task.value.comments)
        ElMessage.success('Đã xoá thành công')
        emit('updated')
      }
    }).catch(() => {})
  }
}

const assignToMe = async () => {
  if (!task.value) return
  const myName = 'Jason Howie'
  task.value.assignee_id = myName
  selectedAssigneeSelect.value = myName
  await projectManagementService.updateTask(task.value.id, { assignee_id: myName })
  ElMessage.success('Đã phân công cho bạn')
}

const handleDeleteTask = () => {
  ElMessageBox.confirm('Bạn có chắc chắn muốn xoá task này không?', 'Xác nhận xoá', {
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Hủy',
    type: 'warning',
  }).then(async () => {
    if (task.value) {
      task.value = null
      ElMessage.success('Đã xoá task thành công')
      emit('updated')
    }
  }).catch(() => {})
}

defineExpose({
  handleCreateTaskSubmit,
  task,
  isSubmitting
})
</script>

<style scoped>
html.dark :deep(.el-select__wrapper),
.dark :deep(.el-select__wrapper) {
  background-color: #1f2937 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
  color: #f3f4f6 !important;
}

html.dark :deep(.el-select__wrapper:hover),
.dark :deep(.el-select__wrapper:hover),
html.dark :deep(.el-select__wrapper.is-focused),
.dark :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #3b82f6 inset !important;
}

html.dark :deep(.el-select__placeholder),
.dark :deep(.el-select__placeholder),
html.dark :deep(.el-select__selected-item),
.dark :deep(.el-select__selected-item) {
  color: #e5e7eb !important;
}

html.dark :deep(.el-input__wrapper),
.dark :deep(.el-input__wrapper) {
  background-color: #1f2937 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
  color: #f3f4f6 !important;
}
</style>
