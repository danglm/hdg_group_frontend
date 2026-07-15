<template>
  <div class="h-full flex overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner">
    <!-- LEFT SIDEBAR: Chat List & Groups -->
    <div class="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shrink-0">
      <!-- Header / New Chat Button -->
      <div class="p-4 border-b border-gray-150 dark:border-gray-700 space-y-3 shrink-0">
        <button 
          @click="selectNewChat" 
          class="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:scale-98 shadow-sm"
        >
          <el-icon :size="16"><Plus /></el-icon>
          <span>Cuộc trò chuyện mới</span>
        </button>

        <!-- Group Search Input -->
        <el-input
          v-model="groupSearch"
          placeholder="Tìm nhóm Telegram..."
          :prefix-icon="Search"
          clearable
          class="custom-search-input"
        />
      </div>

      <!-- Scrollable Group List Grouped by Project -->
      <div class="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 custom-scrollbar">
        <div v-if="loadingGroups" class="flex flex-col items-center justify-center py-10 space-y-2">
          <el-icon class="animate-spin text-blue-500 text-2xl"><Loading /></el-icon>
          <span class="text-xs text-gray-400">Đang tải danh sách nhóm...</span>
        </div>
        
        <div v-else-if="filteredProjectsTree.length === 0" class="text-center py-10 text-xs text-gray-400">
          Không tìm thấy nhóm hoặc dự án nào
        </div>

        <template v-else>
          <!-- Loop through projects -->
          <div 
            v-for="project in filteredProjectsTree" 
            :key="project.id"
            class="space-y-1.5"
          >
            <!-- Project Accordion Header -->
            <div 
              @click="toggleProject(project.id)"
              class="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 hover:bg-gray-100/70 dark:hover:bg-gray-800/80 cursor-pointer select-none transition-all duration-200 border border-gray-100 dark:border-gray-700/60 shadow-sm"
            >
              <div class="flex items-center gap-2 min-w-0">
                <el-icon class="text-blue-500 shrink-0"><Connection /></el-icon>
                <span class="text-xs font-extrabold text-gray-750 dark:text-gray-200 truncate uppercase tracking-wider">
                  {{ project.project_name }}
                </span>
              </div>
              <el-icon 
                class="text-gray-400 dark:text-gray-500 transition-transform duration-250 shrink-0" 
                :class="{ 'rotate-90': expandedProjects.includes(project.id) }"
                :size="12"
              >
                <ArrowRight />
              </el-icon>
            </div>

            <!-- Project Content (Main & Member groups) -->
            <div 
              v-show="expandedProjects.includes(project.id)" 
              class="pl-2.5 mt-1 space-y-3.5 border-l border-dashed border-gray-200 dark:border-gray-700/80 ml-3.5"
            >
              <!-- 1. MAIN GROUPS SECTION -->
              <div>
                <div 
                  @click="toggleMainSection(project.id)"
                  class="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-gray-550 dark:text-gray-455 uppercase tracking-widest select-none w-full cursor-pointer hover:text-blue-500 transition-colors"
                >
                  <el-checkbox
                    v-if="project.mainGroups.length > 0"
                    :model-value="isAllMainSelected(project)"
                    :indeterminate="isMainIndeterminate(project)"
                    @change="(val) => toggleSelectAllMain(val, project)"
                    @click.stop
                    class="mr-1 scale-90"
                    style="height: auto; margin-right: 4px;"
                  />
                  <el-icon :size="10" class="text-blue-500"><ChatLineRound /></el-icon>
                  <span>Nhóm Main</span>
                  <span class="ml-1 font-mono text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.25 rounded-full shrink-0">
                    {{ project.mainGroups.length }}
                  </span>
                  
                  <el-icon 
                    class="ml-auto text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-90': expandedMainSections.includes(project.id) }"
                    :size="10"
                  >
                    <ArrowRight />
                  </el-icon>
                </div>

                <div v-show="expandedMainSections.includes(project.id)" class="space-y-1 mt-1">
                  <div v-if="project.mainGroups.length === 0" class="text-[10px] text-gray-400 italic pl-3 py-1 select-none">
                    Không có nhóm main
                  </div>

                  <div class="space-y-1" v-else>
                    <div 
                      v-for="grp in project.mainGroups" 
                      :key="grp.chat_id"
                      @click="handleGroupItemClick(grp)"
                      class="group p-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2.5 relative select-none border border-transparent"
                      :class="[
                        isGroupSelected(grp)
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-blue-100 dark:border-blue-900/40 shadow-sm'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'
                      ]"
                    >
                      <el-checkbox
                        :model-value="isGroupSelected(grp)"
                        @change="(val) => handleCheckboxChange(val, grp)"
                        @click.stop
                        class="mr-1"
                        style="height: auto; margin-right: 4px;"
                      />
                      <!-- Small Avatar / Initials -->
                      <div class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold shrink-0 text-xs shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {{ (grp.group_name || grp.title).substring(0, 2).toUpperCase() }}
                      </div>
                      <!-- Details -->
                      <div class="flex-1 min-w-0 text-left">
                        <div class="text-xs font-semibold truncate leading-tight">{{ grp.group_name || grp.title }}</div>
                        <div v-if="grp.custom_title" class="mt-0.5">
                          <span class="text-[9px] px-1 py-0.25 rounded font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {{ grp.custom_title }}
                          </span>
                        </div>
                        <p class="text-[9px] text-gray-400 dark:text-gray-500 truncate font-mono mt-0.5">ID: {{ grp.chat_id }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. MEMBER GROUPS SECTION -->
              <div>
                <div 
                  @click="toggleMemberSection(project.id)"
                  class="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-gray-550 dark:text-gray-455 uppercase tracking-widest select-none w-full cursor-pointer hover:text-purple-500 transition-colors"
                >
                  <el-checkbox
                    v-if="project.memberGroups.length > 0"
                    :model-value="isAllMemberSelected(project)"
                    :indeterminate="isMemberIndeterminate(project)"
                    @change="(val) => toggleSelectAllMember(val, project)"
                    @click.stop
                    class="mr-1 scale-90"
                    style="height: auto; margin-right: 4px;"
                  />
                  <el-icon :size="10" class="text-purple-500"><User /></el-icon>
                  <span>Nhóm Member</span>
                  <span class="ml-1 font-mono text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.25 rounded-full shrink-0">
                    {{ project.memberGroups.length }}
                  </span>
                  
                  <el-icon 
                    class="ml-auto text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-90': expandedMemberSections.includes(project.id) }"
                    :size="10"
                  >
                    <ArrowRight />
                  </el-icon>
                </div>

                <div v-show="expandedMemberSections.includes(project.id)" class="space-y-1 mt-1">
                  <div v-if="project.memberGroups.length === 0" class="text-[10px] text-gray-400 italic pl-3 py-1 select-none">
                    Không có nhóm member
                  </div>

                  <div class="space-y-1" v-else>
                    <div 
                      v-for="grp in project.memberGroups" 
                      :key="grp.chat_id"
                      @click="handleGroupItemClick(grp)"
                      class="group p-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2.5 relative select-none border border-transparent"
                      :class="[
                        isGroupSelected(grp)
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold border-purple-100 dark:border-purple-900/40 shadow-sm'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'
                      ]"
                    >
                      <el-checkbox
                        :model-value="isGroupSelected(grp)"
                        @change="(val) => handleCheckboxChange(val, grp)"
                        @click.stop
                        class="mr-1"
                        style="height: auto; margin-right: 4px;"
                      />
                      <!-- Small Avatar / Initials -->
                      <div class="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-bold shrink-0 text-xs shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {{ (grp.group_name || grp.title).substring(0, 2).toUpperCase() }}
                      </div>
                      <!-- Details -->
                      <div class="flex-1 min-w-0 text-left">
                        <div class="text-xs font-semibold truncate leading-tight">{{ grp.group_name || grp.title }}</div>
                        <div v-if="grp.custom_title" class="mt-0.5">
                          <span class="text-[9px] px-1 py-0.25 rounded font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-655 dark:text-purple-400">
                            {{ grp.custom_title }}
                          </span>
                        </div>
                        <p class="text-[9px] text-gray-400 dark:text-gray-500 truncate font-mono mt-0.5">ID: {{ grp.chat_id }}</p>
                        <div v-if="grp.parentName" class="text-[8px] text-gray-400/80 dark:text-gray-500/80 italic truncate mt-0.5">
                          Thuộc: {{ grp.parentName }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- User footer profile stub -->
      <div class="p-4 border-t border-gray-150 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
        <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
          AD
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">Administrator</div>
          <div class="text-[10px] text-gray-400 truncate">Telegram Manager</div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: Chat Area -->
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 relative">
      
      <!-- Top header (Only shown if activeGroup is selected) -->
      <div v-if="activeGroup" class="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
            {{ (activeGroup.group_name || activeGroup.title).substring(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0 text-left">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mt-0.5">{{ activeGroup.group_name || activeGroup.title }}</h4>
              <span v-if="activeGroup.custom_title" class="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-650 dark:text-blue-400 px-1.5 py-0.25 rounded font-medium mt-0.5">
                {{ activeGroup.custom_title }}
              </span>
            </div>
            <p class="text-[10px] text-gray-400 font-mono truncate">Chat ID: {{ activeGroup.chat_id }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <el-button 
            size="small" 
            type="info" 
            plain 
            :icon="User"
            @click="showGroupMembers"
            class="font-semibold"
          >
            Thành viên
          </el-button>
        </div>
      </div>

      <!-- Top header for bulk broadcast -->
      <div v-else-if="selectedGroups.length > 1" class="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            BS
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mt-0.5">Gửi tới {{ selectedGroups.length }} nhóm</h4>
            <p class="text-[10px] text-gray-400 font-medium truncate">Chế độ gửi tin nhắn hàng loạt</p>
          </div>
        </div>
      </div>

      <!-- Scrollable Message Feed -->
      <div 
        ref="feedContainer" 
        class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        :class="selectedGroups.length > 0 ? 'bg-white dark:bg-gray-900/30' : 'flex items-center justify-center'"
      >
        <!-- 1. EMPTY STATE / WELCOME PAGE (No group selected) -->
        <div v-if="selectedGroups.length === 0" class="max-w-xl text-center space-y-8 select-none p-4">
          <!-- Pulse Animated Icon -->
          <div class="flex justify-center">
            <div class="relative flex items-center justify-center w-20 h-20 bg-blue-500 rounded-3xl text-white shadow-lg shadow-blue-500/20 transform rotate-12 transition-all hover:scale-105 duration-300">
              <span class="absolute w-20 h-20 bg-blue-500/30 rounded-3xl animate-ping -z-10"></span>
              <el-icon :size="40"><ChatDotSquare /></el-icon>
            </div>
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Tiến Nga Telegram Assistant</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Giao diện gửi tin nhắn và quản lý hoạt động nhóm thông qua chatbot. Hãy chọn một hoặc nhiều nhóm ở thanh bên trái để bắt đầu.
            </p>
          </div>

          <!-- Suggested Action Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div 
              v-for="card in suggestCards" 
              :key="card.title"
              @click="applySuggestion(card.message)"
              class="p-4 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 group/card active:scale-98"
            >
              <div class="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center justify-between mb-1">
                <span>{{ card.title }}</span>
                <el-icon class="text-gray-300 group-hover/card:text-blue-500 transition-colors"><TopRight /></el-icon>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                {{ card.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- 2. MESSAGES FEED (Exactly one group selected) -->
        <template v-else-if="selectedGroups.length === 1">
          <!-- System Welcome Banner inside chat -->
          <div class="flex justify-center my-4">
            <div class="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-400 font-semibold tracking-wider uppercase select-none">
              Bắt đầu phiên kết nối chatbot
            </div>
          </div>

          <!-- Chat history rendering -->
          <div 
            v-for="(msg, index) in chatMessages" 
            :key="index"
            class="flex items-start gap-4 max-w-3xl mx-auto"
            :class="msg.sender === 'user' ? 'flex-row-reverse' : ''"
          >
            <!-- Avatar -->
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm font-bold text-xs select-none"
              :class="msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'"
            >
              {{ msg.sender === 'user' ? 'AD' : 'TG' }}
            </div>

            <!-- Message Bubble -->
            <div class="space-y-1 max-w-[80%] text-left">
              <div class="text-[10px] text-gray-400 font-semibold select-none flex items-center gap-2" :class="msg.sender === 'user' ? 'justify-end' : ''">
                <span>{{ msg.performer }}</span>
                <span>•</span>
                <span>{{ msg.time }}</span>
                <span v-if="msg.status">
                  <el-tag size="small" :type="msg.status === 'SUCCESS' ? 'success' : 'danger'" effect="plain" class="font-bold border-0 scale-90">
                    {{ msg.status }}
                  </el-tag>
                </span>
              </div>
              
              <div 
                class="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap select-all font-sans"
                :class="[
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-850 dark:text-gray-150 rounded-tl-none shadow-sm'
                ]"
              >
                <!-- HTML / Text message parsing -->
                <div v-html="formatMessageText(msg.text)"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- 3. BULK BROADCAST PANEL (Multiple groups selected) -->
        <template v-else>
          <div class="max-w-3xl mx-auto space-y-6 text-left">
            <div class="p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <el-icon :size="24"><ChatDotSquare /></el-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-extrabold text-gray-850 dark:text-gray-150">Chế độ gửi hàng loạt</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Bạn đang chọn <strong>{{ selectedGroups.length }}</strong> nhóm để gửi tin nhắn đồng thời. Nội dung tin nhắn và tài liệu đính kèm sẽ được gửi tuần tự đến từng nhóm.
                </p>
                <div class="mt-3 flex items-center gap-2">
                  <el-button 
                    size="small" 
                    type="danger" 
                    plain 
                    class="font-semibold"
                    @click="selectedGroups = []"
                  >
                    Bỏ chọn tất cả
                  </el-button>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Danh sách nhóm nhận tin ({{ selectedGroups.length }})</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  v-for="grp in selectedGroups" 
                  :key="grp.chat_id"
                  class="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div 
                      class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]"
                      :class="grp.role === 'main' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-650 dark:text-purple-400'"
                    >
                      {{ (grp.group_name || grp.title).substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="min-w-0 text-left">
                      <div class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate leading-tight">{{ grp.group_name || grp.title }}</div>
                      <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span class="text-[8px] font-mono text-gray-400 dark:text-gray-500">ID: {{ grp.chat_id }}</span>
                        <span class="text-[8px] font-semibold px-1 rounded" :class="grp.role === 'main' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-650 dark:text-purple-400'">
                          {{ grp.role === 'main' ? 'Main' : 'Member' }}
                        </span>
                        <span v-if="grp.custom_title" class="text-[8px] font-semibold px-1 rounded" :class="grp.role === 'main' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-650 dark:text-purple-400'">
                          {{ grp.custom_title }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="shrink-0 flex items-center">
                    <template v-if="broadcastStatus[grp.chat_id]">
                      <el-icon v-if="broadcastStatus[grp.chat_id].status === 'sending'" class="animate-spin text-blue-500" :size="16"><Loading /></el-icon>
                      <el-icon v-else-if="broadcastStatus[grp.chat_id].status === 'success'" class="text-green-500" :size="16"><CircleCheck /></el-icon>
                      <el-tooltip 
                        v-else-if="broadcastStatus[grp.chat_id].status === 'failed'"
                        class="item"
                        effect="dark"
                        :content="broadcastStatus[grp.chat_id].error || 'Lỗi không xác định'"
                        placement="top"
                      >
                        <el-icon class="text-red-500 cursor-pointer" :size="16"><CircleClose /></el-icon>
                      </el-tooltip>
                      <span v-else class="text-[10px] text-gray-400 font-medium">Chờ...</span>
                    </template>
                    <button 
                      v-else
                      @click="handleCheckboxChange(false, grp)" 
                      class="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-650 transition-colors"
                    >
                      <el-icon :size="12"><Close /></el-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>

      <!-- Bottom Chat Input Bar -->
      <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-150 dark:border-gray-700 shrink-0 z-10 shadow-lg">
        <div class="max-w-3xl mx-auto space-y-3">
          
          <!-- Selected File Preview Card -->
          <div v-if="selectedFile" class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 animate-fade-in">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs select-none">
                {{ getFileExtension(selectedFile.name) }}
              </div>
              <div class="min-w-0 text-left">
                <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{{ selectedFile.name }}</p>
                <p class="text-[10px] text-gray-400 font-mono">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button @click="removeSelectedFile" class="w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <!-- Input Row -->
          <div 
            class="relative flex items-end border rounded-2xl p-2 pr-3 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all duration-200 shadow-inner"
            :class="[
              isDragging 
                ? 'border-blue-500 dark:border-blue-500 bg-blue-50/10' 
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            ]"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <!-- Hidden Input File -->
            <input 
              type="file" 
              ref="fileInputRef" 
              style="display: none" 
              @change="handleFileChange" 
            />

            <!-- Attachment Button (+) -->
            <button 
              @click="triggerFileSelect"
              class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 shadow-sm shrink-0 active:scale-95 cursor-pointer mr-1"
              title="Đính kèm tệp tin"
            >
              <el-icon :size="18"><Plus /></el-icon>
            </button>

            <textarea
              v-model="typedMessage"
              ref="chatInputRef"
              rows="1"
              placeholder="Nhập tin nhắn..."
              class="flex-1 bg-transparent border-0 outline-none resize-none px-3 py-2 text-sm text-gray-800 dark:text-gray-100 max-h-40 min-h-[36px] custom-scrollbar focus:ring-0"
              @keydown.enter.exact.prevent="sendMessage"
              @input="adjustTextareaHeight"
            ></textarea>

            <button 
              @click="sendMessage"
              :disabled="(!typedMessage.trim() && !selectedFile) || sendingMessage"
              class="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 transition-all duration-200 shadow-md shrink-0 active:scale-95 cursor-pointer ml-2"
            >
              <el-icon v-if="sendingMessage" class="animate-spin"><Loading /></el-icon>
              <el-icon v-else :size="16"><Promotion /></el-icon>
            </button>
          </div>

        </div>
        <p class="text-[10px] text-gray-400 text-center mt-2 select-none">
          Bot Telegram sẽ gửi tài liệu hoặc tin nhắn trực tiếp đến nhóm dưới tên của quản trị viên.
        </p>
      </div>

    </div>

    <!-- Member Details Drawer -->
    <el-drawer
      v-model="memberDrawerVisible"
      title="THÀNH VIÊN TRONG NHÓM"
      direction="rtl"
      size="420px"
      destroy-on-close
      class="custom-member-drawer"
    >
      <div v-loading="loadingMembers" class="h-full flex flex-col p-4 space-y-4">
        <div class="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-700">
          <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Danh sách thành viên</span>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {{ groupMembers.length }} người
          </span>
        </div>

        <div v-if="groupMembers.length === 0" class="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <el-icon :size="40" class="text-gray-300 dark:text-gray-600"><UserFilled /></el-icon>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy thành viên nào</p>
          <p class="text-xs text-gray-400">Thành viên có thể hiển thị sau khi bot cập nhật danh sách.</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div 
            v-for="mbr in groupMembers" 
            :key="mbr.user_id"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900/80 transition-all shadow-sm"
          >
            <!-- Member initial -->
            <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
              {{ mbr.name.substring(0, 1).toUpperCase() }}
            </div>
            
            <div class="flex-1 min-w-0 text-left">
              <div class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ mbr.name }}</div>
              <div class="text-[10px] text-gray-400 truncate">@{{ mbr.username }}</div>
            </div>

            <!-- Role Badge -->
            <el-tag size="small" :type="getMemberRoleType(mbr.status)" effect="plain" class="font-bold scale-90 border-0">
              {{ translateRole(mbr.status) }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Search, Plus, Promotion, Loading, User, UserFilled, TopRight, Close, Connection, ChatLineRound, ArrowRight, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { telegramService } from '@/api/telegramService'
import { tienNgaService } from '@/api/tienNgaService'

interface TelegramGroup {
  chat_id: string;
  title: string;
  group_name?: string;
  custom_title?: string;
  username?: string;
  type?: string;
  role?: string;
  parent_id?: string;
  parentName?: string;
  project_id?: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  performer: string;
  status?: string;
}

interface GroupMember {
  user_id: string;
  name: string;
  username: string;
  status: string;
}

// State
const loadingGroups = ref(false)
const groupSearch = ref('')
const groups = ref<TelegramGroup[]>([])
const selectedGroups = ref<TelegramGroup[]>([])

const activeGroup = computed({
  get() {
    return selectedGroups.value.length === 1 ? selectedGroups.value[0] : null
  },
  set(val) {
    if (val) {
      selectedGroups.value = [val]
    } else {
      selectedGroups.value = []
    }
  }
})

interface BroadcastGroupStatus {
  status: 'pending' | 'sending' | 'success' | 'failed';
  error?: string;
}
const broadcastStatus = ref<Record<string, BroadcastGroupStatus>>({})

const typedMessage = ref('')
const sendingMessage = ref(false)

// Projects tree state
const loadedProjects = ref<any[]>([])
const expandedProjects = ref<string[]>([])

const chatMessages = ref<ChatMessage[]>([])
const feedContainer = ref<HTMLDivElement | null>(null)
const chatInputRef = ref<HTMLTextAreaElement | null>(null)

// Attachment State
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null
  }
}

const removeSelectedFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const isDragging = ref(false)

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    selectedFile.value = e.dataTransfer.files[0]
    ElMessage.success(`Đã đính kèm tệp: ${selectedFile.value.name}`)
  }
}

const getFileExtension = (filename: string) => {
  if (!filename) return 'FILE'
  const idx = filename.lastIndexOf('.')
  if (idx === -1) return 'FILE'
  return filename.substring(idx + 1).toUpperCase()
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Member Drawer State
const memberDrawerVisible = ref(false)
const loadingMembers = ref(false)
const groupMembers = ref<GroupMember[]>([])

const suggestCards = [
  {
    title: '📢 Thông báo khẩn cấp',
    desc: 'Gửi tin nhắn thông báo bảo trì, mất điện hoặc thay đổi lịch làm việc khẩn cấp.',
    message: '📢 THÔNG BÁO KHẨN CẤP\n\nKính gửi toàn thể nhân viên, hệ thống máy chủ sẽ tiến hành bảo trì định kỳ từ 22:00 hôm nay đến 02:00 ngày mai. Vui lòng hoàn thành công việc trước thời gian trên.'
  },
  {
    title: '⚡ Lịch bảo dưỡng bồn mủ',
    desc: 'Gửi thông báo lịch trình bảo dưỡng định kỳ bồn mủ cao su cho các xưởng.',
    message: '⚡ LỊCH BẢO DƯỠNG ĐỊNH KỲ\n\nTiến hành sục rửa bồn mủ trung tâm vào lúc 14:00 ngày mai. Kính đề nghị các tổ thu hoạch sắp xếp thời gian tập kết hàng sớm.'
  },
  {
    title: '📝 Cập nhật chính sách hao hụt',
    desc: 'Gửi cập nhật phương pháp tính hao hụt sản lượng mủ khô theo tỷ lệ độ.',
    message: '📝 CẬP NHẬT CHÍNH SÁCH\n\nTừ ngày mai, tỷ lệ độ trừ hao khô sẽ áp dụng phương pháp đo mới tại cân Tiến Nga. Xin thông báo để bà con theo dõi sát.'
  },
  {
    title: '👥 Nhắc nhở chấm công',
    desc: 'Gửi tin nhắn nhắc nhở nộp bảng kê thu mua và chấm công cuối tháng.',
    message: '👥 NHẮC NHỞ HOÀN THÀNH HỒ SƠ\n\nĐề nghị các đại diện xưởng nộp bảng kê thu mua mủ cao su của tháng này trước 17:00 chiều nay để kế toán duyệt lương.'
  }
]

const filteredGroups = computed(() => {
  if (!groupSearch.value.trim()) return groups.value
  const q = groupSearch.value.toLowerCase().trim()
  return groups.value.filter(g => 
    g.title.toLowerCase().includes(q) || 
    g.chat_id.includes(q)
  )
})

// Projects tree computed for display
const filteredProjectsTree = computed(() => {
  if (!groupSearch.value.trim()) return loadedProjects.value
  
  const q = groupSearch.value.toLowerCase().trim()
  return loadedProjects.value.map(proj => {
    // Filter main groups
    const filteredMains = proj.mainGroups.filter((g: any) => 
      g.title.toLowerCase().includes(q) || g.chat_id.includes(q)
    )
    
    // Filter member groups
    const filteredMembers = proj.memberGroups.filter((g: any) => 
      g.title.toLowerCase().includes(q) || g.chat_id.includes(q) || (g.parentName && g.parentName.toLowerCase().includes(q))
    )
    
    // Return project only if project name matches OR it has matching groups
    if (proj.project_name.toLowerCase().includes(q) || filteredMains.length > 0 || filteredMembers.length > 0) {
      return {
        ...proj,
        mainGroups: filteredMains,
        memberGroups: filteredMembers
      }
    }
    return null
  }).filter(Boolean) as any[]
})

const toggleProject = (projId: string) => {
  const index = expandedProjects.value.indexOf(projId)
  if (index > -1) {
    expandedProjects.value.splice(index, 1)
  } else {
    expandedProjects.value.push(projId)
  }
}

const expandedMainSections = ref<string[]>([])
const expandedMemberSections = ref<string[]>([])

const toggleMainSection = (projId: string) => {
  const index = expandedMainSections.value.indexOf(projId)
  if (index > -1) {
    expandedMainSections.value.splice(index, 1)
  } else {
    expandedMainSections.value.push(projId)
  }
}

const toggleMemberSection = (projId: string) => {
  const index = expandedMemberSections.value.indexOf(projId)
  if (index > -1) {
    expandedMemberSections.value.splice(index, 1)
  } else {
    expandedMemberSections.value.push(projId)
  }
}

// Auto-expand projects when searching
import { watch } from 'vue'
watch(groupSearch, (newVal) => {
  if (newVal.trim()) {
    filteredProjectsTree.value.forEach(proj => {
      if (!expandedProjects.value.includes(proj.id)) {
        expandedProjects.value.push(proj.id)
      }
      if (!expandedMainSections.value.includes(proj.id)) {
        expandedMainSections.value.push(proj.id)
      }
      if (!expandedMemberSections.value.includes(proj.id)) {
        expandedMemberSections.value.push(proj.id)
      }
    })
  }
})

// Fetch Telegram Groups
const fetchGroups = async () => {
  loadingGroups.value = true
  try {
    const projectsList = await tienNgaService.getProjects()
    
    // Fetch all main groups for all projects in parallel
    const projectsWithMains = await Promise.all(
      projectsList.map(async (proj) => {
        const mains = await tienNgaService.getTelegramGroups({
          project_id: proj.id,
          role: 'main'
        }).catch(err => {
          console.error(`Error loading main groups for project ${proj.project_name}:`, err)
          return []
        })
        
        return {
          id: proj.id,
          project_name: proj.project_name,
          mains
        }
      })
    )
    
    // Now fetch member groups for all main groups in parallel
    const results = await Promise.all(
      projectsWithMains.map(async (projData) => {
        const mainGroupsMapped = projData.mains.map((m: any) => ({
          chat_id: m.chat_id,
          group_name: m.group_name || 'Nhóm không tên',
          custom_title: m.custom_title || '',
          title: m.custom_title || m.group_name || 'Nhóm không tên',
          member_count: m.member_count,
          role: 'main',
          project_id: projData.id
        }))
        
        const memberGroupPromises = mainGroupsMapped.map(async (mainGrp) => {
          const members = await tienNgaService.getTelegramGroups({
            project_id: projData.id,
            role: 'member',
            parent_id: mainGrp.chat_id
          }).catch(err => {
            console.error(`Error loading member groups for main group ${mainGrp.title}:`, err)
            return []
          })
          
          return members.map((m: any) => ({
            chat_id: m.chat_id,
            group_name: m.group_name || 'Nhóm không tên',
            custom_title: m.custom_title || '',
            title: m.custom_title || m.group_name || 'Nhóm không tên',
            member_count: m.member_count,
            role: 'member',
            parent_id: mainGrp.chat_id,
            parentName: mainGrp.title,
            project_id: projData.id
          }))
        })
        
        const memberGroupsResults = await Promise.all(memberGroupPromises)
        const memberGroupsMapped = memberGroupsResults.flat()
        
        return {
          id: projData.id,
          project_name: projData.project_name,
          mainGroups: mainGroupsMapped,
          memberGroups: memberGroupsMapped
        }
      })
    )
    
    loadedProjects.value = results
    
    // Flatten groups list to keep compatibility with other features (sending messages, suggested cards)
    const flatGroups: any[] = []
    results.forEach(proj => {
      flatGroups.push(...proj.mainGroups)
      flatGroups.push(...proj.memberGroups)
    })
    groups.value = flatGroups
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Lỗi khi tải danh sách nhóm Telegram')
  } finally {
    loadingGroups.value = false
  }
}

// Auto height adjustment for textarea
const adjustTextareaHeight = () => {
  const textarea = chatInputRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

// Message formatter (converts html tags to display nicely, converts bold tag, code, etc.)
const formatMessageText = (text: string) => {
  if (!text) return ''
  // Convert HTML tags safely (keeping basic styling tags like b, u, i, code)
  return text
    .replace(/\n/g, '<br/>')
}

// Reset chat input height
const resetInput = () => {
  typedMessage.value = ''
  nextTick(() => {
    if (chatInputRef.value) {
      chatInputRef.value.style.height = 'auto'
    }
  })
}

// Scroll chat feed to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (feedContainer.value) {
      feedContainer.value.scrollTop = feedContainer.value.scrollHeight
    }
  })
}

// Suggestions trigger
const applySuggestion = (message: string) => {
  if (!activeGroup.value) {
    // Select first group if none active
    if (groups.value.length > 0) {
      activeGroup.value = groups.value[0] || null
      loadChatHistory()
    } else {
      ElMessage.warning('Vui lòng tạo/chọn nhóm Telegram trước')
      return
    }
  }
  typedMessage.value = message
  nextTick(() => {
    adjustTextareaHeight()
    if (chatInputRef.value) {
      chatInputRef.value.focus()
    }
  })
}

// Selected new chat / Welcome screen
const selectNewChat = () => {
  activeGroup.value = null
  chatMessages.value = []
}

const isGroupSelected = (group: TelegramGroup) => {
  return selectedGroups.value.some(g => g.chat_id === group.chat_id)
}

const handleCheckboxChange = (checked: any, group: TelegramGroup) => {
  if (checked) {
    if (!selectedGroups.value.some(g => g.chat_id === group.chat_id)) {
      selectedGroups.value.push(group)
    }
  } else {
    selectedGroups.value = selectedGroups.value.filter(g => g.chat_id !== group.chat_id)
  }
  if (selectedGroups.value.length === 1) {
    loadChatHistory()
  }
}

const handleGroupItemClick = (group: TelegramGroup) => {
  selectedGroups.value = [group]
  loadChatHistory()
}

// Checkboxes for Main Groups
const isAllMainSelected = (project: any) => {
  if (project.mainGroups.length === 0) return false
  return project.mainGroups.every((g: any) => isGroupSelected(g))
}

const isMainIndeterminate = (project: any) => {
  const selectedCount = project.mainGroups.filter((g: any) => isGroupSelected(g)).length
  return selectedCount > 0 && selectedCount < project.mainGroups.length
}

const toggleSelectAllMain = (checked: any, project: any) => {
  if (checked) {
    project.mainGroups.forEach((g: any) => {
      if (!isGroupSelected(g)) {
        selectedGroups.value.push(g)
      }
    })
  } else {
    const mainChatIds = project.mainGroups.map((g: any) => g.chat_id)
    selectedGroups.value = selectedGroups.value.filter(g => !mainChatIds.includes(g.chat_id))
  }
  if (selectedGroups.value.length === 1) {
    loadChatHistory()
  }
}

// Checkboxes for Member Groups
const isAllMemberSelected = (project: any) => {
  if (project.memberGroups.length === 0) return false
  return project.memberGroups.every((g: any) => isGroupSelected(g))
}

const isMemberIndeterminate = (project: any) => {
  const selectedCount = project.memberGroups.filter((g: any) => isGroupSelected(g)).length
  return selectedCount > 0 && selectedCount < project.memberGroups.length
}

const toggleSelectAllMember = (checked: any, project: any) => {
  if (checked) {
    project.memberGroups.forEach((g: any) => {
      if (!isGroupSelected(g)) {
        selectedGroups.value.push(g)
      }
    })
  } else {
    const memberChatIds = project.memberGroups.map((g: any) => g.chat_id)
    selectedGroups.value = selectedGroups.value.filter(g => !memberChatIds.includes(g.chat_id))
  }
  if (selectedGroups.value.length === 1) {
    loadChatHistory()
  }
}

// Load Chat History by matching notification logs of the selected group
const loadChatHistory = async () => {
  if (!activeGroup.value) return
  chatMessages.value = []
  
  try {
    // Fetch logs to populate initial message history
    const logsData = await telegramService.getNotifyLogs({
      limit: 30
    })

    // Filter logs that match our current active chat ID or title
    const filteredLogs = logsData.filter((log: any) => 
      String(log.chat_id) === String(activeGroup.value?.chat_id) || 
      (log.group_name && activeGroup.value?.title && log.group_name.toLowerCase() === activeGroup.value?.title.toLowerCase())
    )

    // Map logs to messages
    const mapped = filteredLogs.reverse().map((log: any) => ({
      sender: 'bot' as const,
      text: log.details,
      time: formatLogTime(log.created_at),
      performer: log.performer || 'System Log',
      status: log.status
    }))

    chatMessages.value = mapped
    scrollToBottom()
  } catch (error) {
    console.error('Failed to populate logs for chat:', error)
  }
}

const formatLogTime = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const hrs = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${hrs}:${mins}`
  } catch (e) {
    return ''
  }
}

// Send Message
const sendMessage = async () => {
  if (selectedGroups.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một nhóm Telegram từ danh sách bên trái!')
    return
  }
  if ((!typedMessage.value.trim() && !selectedFile.value) || sendingMessage.value) return

  const messageText = typedMessage.value
  const hasFile = !!selectedFile.value
  const fileObj = selectedFile.value
  sendingMessage.value = true

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  if (selectedGroups.value.length === 1) {
    // === SINGLE GROUP MODE ===
    const targetGroup = selectedGroups.value[0]
    const performerUser = 'Admin'
    let displayLogText = messageText
    if (hasFile && fileObj) {
      displayLogText = `📎 <b>Đính kèm tệp:</b> ${fileObj.name} (${formatFileSize(fileObj.size)})`
      if (messageText.trim()) {
        displayLogText += `<br/><br/>${messageText}`
      }
    }

    chatMessages.value.push({
      sender: 'user',
      text: displayLogText,
      time: timeStr,
      performer: performerUser
    })
    
    const targetChatId = targetGroup.chat_id
    const targetGroupName = targetGroup.group_name || targetGroup.title
    removeSelectedFile()
    resetInput()
    scrollToBottom()

    try {
      if (hasFile && fileObj) {
        await telegramService.sendDocument(targetChatId, fileObj, messageText)
      } else {
        await telegramService.sendMessage(targetChatId, messageText)
      }
      
      chatMessages.value.push({
        sender: 'bot',
        text: hasFile 
          ? `✅ <b>Tệp tin đã được gửi thành công</b>\n\nFile <b>${fileObj?.name}</b> đã được tải lên và gửi tới tất cả thành viên trong nhóm <b>${targetGroupName}</b>.`
          : `✅ <b>Tin nhắn đã gửi thành công</b>\n\nNội dung đã được gửi tới tất cả thành viên trong nhóm <b>${targetGroupName}</b>.`,
        time: timeStr,
        performer: 'System Agent',
        status: 'SUCCESS'
      })
      ElMessage.success('Đã gửi thành công!')
    } catch (error: any) {
      console.error(error)
      chatMessages.value.push({
        sender: 'bot',
        text: `❌ <b>Gửi thất bại</b>\n\nChi tiết lỗi: ${error.message || 'Lỗi không xác định.'}`,
        time: timeStr,
        performer: 'System Agent',
        status: 'FAILED'
      })
      ElMessage.error(error.message || 'Lỗi khi gửi tới Telegram')
    } finally {
      sendingMessage.value = false
      scrollToBottom()
    }
  } else {
    // === BULK BROADCAST MODE ===
    // Initialize status for each group
    broadcastStatus.value = {}
    selectedGroups.value.forEach(grp => {
      broadcastStatus.value[grp.chat_id] = { status: 'pending' }
    })

    const totalGroups = selectedGroups.value.length
    let successCount = 0
    let failedCount = 0

    // Keep inputs but clear typing to simulate immediate response
    removeSelectedFile()
    resetInput()

    for (const grp of selectedGroups.value) {
      broadcastStatus.value[grp.chat_id].status = 'sending'
      try {
        if (hasFile && fileObj) {
          await telegramService.sendDocument(grp.chat_id, fileObj, messageText)
        } else {
          await telegramService.sendMessage(grp.chat_id, messageText)
        }
        broadcastStatus.value[grp.chat_id].status = 'success'
        successCount++
      } catch (error: any) {
        console.error(`Failed to send to group ${grp.group_name || grp.title}:`, error)
        broadcastStatus.value[grp.chat_id].status = 'failed'
        broadcastStatus.value[grp.chat_id].error = error.message || 'Lỗi không xác định'
        failedCount++
      }
    }

    sendingMessage.value = false

    if (failedCount === 0) {
      ElMessage.success(`Đã gửi thành công tới tất cả ${successCount}/${totalGroups} nhóm!`)
    } else if (successCount === 0) {
      ElMessage.error(`Gửi thất bại trên toàn bộ ${failedCount}/${totalGroups} nhóm!`)
    } else {
      ElMessage.warning(`Hoàn thành gửi: Thành công ${successCount}/${totalGroups}, Thất bại ${failedCount}/${totalGroups}`)
    }
  }
}

// Drawer Details: Show Group Members
const showGroupMembers = async () => {
  if (!activeGroup.value) return
  memberDrawerVisible.value = true
  loadingMembers.value = true
  groupMembers.value = []

  try {
    const data = await telegramService.getMembersInGroup(activeGroup.value.chat_id, 'telegram')
    if (data && data.members) {
      groupMembers.value = data.members
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Không thể tải danh sách thành viên từ Telegram API. Bot có thể thiếu quyền Admin.')
  } finally {
    loadingMembers.value = false
  }
}

const translateRole = (role: string) => {
  switch (role.toUpperCase()) {
    case 'OWNER': return 'Trưởng nhóm'
    case 'ADMINISTRATOR': return 'Admin'
    case 'MEMBER': return 'Thành viên'
    default: return 'Thành viên'
  }
}

const getMemberRoleType = (role: string) => {
  switch (role.toUpperCase()) {
    case 'OWNER': return 'danger'
    case 'ADMINISTRATOR': return 'warning'
    default: return 'info'
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.custom-search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  background-color: var(--el-fill-color-blank);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

/* Custom dark mode input details for search bar */
html.dark .custom-search-input :deep(.el-input__wrapper) {
  background-color: #1f2937 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
}
html.dark .custom-search-input :deep(.el-input__inner) {
  color: #f3f4f6 !important;
  -webkit-text-fill-color: #f3f4f6 !important;
}

</style>

<style>
/* Teleported Drawer Styling */
html.dark .custom-member-drawer {
  background-color: #111827 !important;
  border-left: 1px solid #1f2937 !important;
}
html.dark .custom-member-drawer .el-drawer__header {
  color: #f3f4f6 !important;
  border-bottom: 1px solid #1f2937 !important;
  margin-bottom: 0;
  padding: 16px;
}
</style>
