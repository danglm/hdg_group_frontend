import { getApiUrl, getApiHeaders } from './apiConfig';

export interface Board {
  id: string;
  board_name: string;
  board_key: string;
  description?: string;
  project_id?: string | null;
  owner_id: string;
  default_assignee_id?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: string;
  updated_at?: string;
}

export interface TaskLabel {
  id: string;
  board_id?: string;
  label_name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploader_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

export interface TaskCommentReactionUser {
  userId: string;
  userName: string;
  emoji: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string | null;
  is_edited?: boolean;
  created_at: string;
  updated_at?: string;
  reactions?: Record<string, number>;
  userReaction?: string;
  isDisliked?: boolean;
  replies?: TaskComment[];
  reactionUsers?: TaskCommentReactionUser[];
  attachments?: TaskAttachment[];
}

export interface TaskActivityLog {
  id: string;
  task_id: string;
  actor_id: string;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  details?: string;
  created_at: string;
}

export interface TaskItem {
  id: string;
  task_code: string;
  board_id: string;
  column_id?: string;
  parent_task_id?: string | null;
  parent_id?: string | null;
  parent_code?: string | null;
  parent_title?: string | null;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  task_type: 'TASK' | 'BUG' | 'STORY' | 'EPIC' | 'SUB_TASK';
  assignee_id?: string | null;
  reporter_id?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  position?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'BLOCKED';
  created_at?: string;
  updated_at?: string;
  labels?: TaskLabel[];
  sub_task_count?: number;
  comment_count?: number;
  sub_tasks?: TaskItem[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  activity_logs?: TaskActivityLog[];
  web_links?: Array<{ id: string; url: string; title: string }>;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  column_name: string;
  position: number;
  column_type: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  wip_limit?: number | null;
  color?: string;
  tasks?: TaskItem[];
}

export interface BoardDetail extends Board {
  columns: BoardColumn[];
  labels: TaskLabel[];
}

// Fallback Mock Data
const MOCK_BOARDS: Board[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    board_name: 'Dự Án Tiến Nga 2026',
    board_key: 'TN',
    description: 'Quản lý thu mua, kho mủ và vận hành Tiến Nga',
    owner_id: 'TN001',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00',
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    board_name: 'Hệ Thống Ggomoosin',
    board_key: 'GGO',
    description: 'Quản lý nhân sự và nhà máy sản xuất',
    owner_id: 'TN001',
    status: 'ACTIVE',
    created_at: '2026-08-02T09:00:00',
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    board_name: 'Dự Án Cho Thuê BĐS',
    board_key: 'RNT',
    description: 'Quản lý tài sản và hợp đồng cho thuê',
    owner_id: 'TN002',
    status: 'ARCHIVED',
    created_at: '2026-07-15T10:00:00',
  },
];

const MOCK_TASKS: TaskItem[] = [
  {
    id: 't1111111-1111-1111-1111-111111111111',
    task_code: 'TN-001',
    board_id: 'b1111111-1111-1111-1111-111111111111',
    title: 'Stability checks & ESR compliance confirmation',
    description: 'Confirm capacitor ESR compliance according to hardware requirements. Perform high voltage thermal tests and issue test logs.',
    priority: 'HIGH',
    task_type: 'TASK',
    assignee_id: 'TN002',
    reporter_id: 'TN001',
    due_date: '2026-08-10',
    position: 0,
    status: 'IN_PROGRESS',
    labels: [{ id: 'l1', label_name: 'Gấp', color: '#EF4444' }, { id: 'l2', label_name: 'Hardware', color: '#3B82F6' }],
    sub_task_count: 2,
    comment_count: 3,
    sub_tasks: [
      {
        id: 'st-01',
        task_code: 'TN-001-1',
        board_id: 'b1111111-1111-1111-1111-111111111111',
        title: 'Check capacitor datasheet parameters',
        priority: 'MEDIUM',
        task_type: 'SUB_TASK',
        status: 'DONE',
      },
      {
        id: 'st-02',
        task_code: 'TN-001-2',
        board_id: 'b1111111-1111-1111-1111-111111111111',
        title: 'Verify Altium 365 schematic alignment',
        priority: 'HIGH',
        task_type: 'SUB_TASK',
        status: 'IN_PROGRESS',
      }
    ],
    attachments: [
      {
        id: 'att-1',
        task_id: 't1111111-1111-1111-1111-111111111111',
        uploader_id: 'TN001',
        file_name: 'original-screenshot.png',
        file_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
        file_type: 'image/png',
        file_size: 145200,
        uploaded_at: '2026-06-28T18:00:00',
      }
    ],
    web_links: [
      { id: 'w1', url: 'https://altium365.com/workspace', title: 'Created with Altium 365' }
    ],
    comments: [
      {
        id: 'cm-1',
        task_id: 't1111111-1111-1111-1111-111111111111',
        author_id: 'TN001 - Nguyễn Văn Tiến',
        content: 'Một Workspace Jira Task được đặt sẽ tạo ra một Jira Issue được đồng bộ trong không gian Jira. Hai bên đồng bộ với Issue Key trong Jira.',
        created_at: '2026-08-02T10:15:00',
        reactionUsers: [
          { userId: 'u1', userName: 'TN001 - Nguyễn Văn Tiến', emoji: '👍' },
          { userId: 'u2', userName: 'TN002 - Trần Tiến Nga', emoji: '❤️' },
          { userId: 'u3', userName: 'TN003 - Lê Minh Đức', emoji: '❤️' }
        ]
      }
    ]
  },
  {
    id: 't2222222-2222-2222-2222-222222222222',
    task_code: 'TN-002',
    board_id: 'b1111111-1111-1111-1111-111111111111',
    title: 'Kiểm tra sổ sách thu mua mủ đợt 1',
    description: 'Rà soát danh sách phiếu cân và xác nhận tổng khối lượng mủ khô nhập kho.',
    priority: 'CRITICAL',
    task_type: 'TASK',
    assignee_id: 'TN001',
    reporter_id: 'TN002',
    due_date: '2026-08-05',
    position: 1,
    status: 'IN_PROGRESS',
    labels: [{ id: 'l1', label_name: 'Gấp', color: '#EF4444' }],
    sub_task_count: 0,
    comment_count: 1,
  },
  {
    id: 't3333333-3333-3333-3333-333333333333',
    task_code: 'TN-003',
    board_id: 'b1111111-1111-1111-1111-111111111111',
    title: 'Lập hợp đồng cung ứng cao su quý 3',
    description: 'Soạn thảo điều khoản thanh toán và phạt vi phạm tiến độ giao hàng.',
    priority: 'MEDIUM',
    task_type: 'STORY',
    assignee_id: 'TN003',
    reporter_id: 'TN001',
    due_date: '2026-08-15',
    position: 0,
    status: 'OPEN',
    labels: [{ id: 'l3', label_name: 'Pháp lý', color: '#10B981' }],
    sub_task_count: 1,
    comment_count: 0,
  },
  {
    id: 't4444444-4444-4444-4444-444444444444',
    task_code: 'TN-004',
    board_id: 'b1111111-1111-1111-1111-111111111111',
    title: 'Bảo trì máy đóng kiện số 2',
    description: 'Thay dầu thuỷ lực và kiểm tra hệ thống cảm biến áp suất.',
    priority: 'LOW',
    task_type: 'TASK',
    assignee_id: 'TN002',
    reporter_id: 'TN001',
    due_date: '2026-08-20',
    position: 0,
    status: 'DONE',
    labels: [{ id: 'l4', label_name: 'Bảo trì', color: '#F59E0B' }],
    sub_task_count: 0,
    comment_count: 0,
  },
  {
    id: 't5555555-5555-5555-5555-555555555555',
    task_code: 'GGO-001',
    board_id: 'b2222222-2222-2222-2222-222222222222',
    title: 'Tuyển dụng công nhân may công nghiệp đợt 2',
    description: 'Đăng tin tuyển dụng trên các kênh truyền thông và lên lịch phỏng vấn.',
    priority: 'HIGH',
    task_type: 'TASK',
    assignee_id: 'TN001',
    reporter_id: 'TN001',
    due_date: '2026-08-12',
    position: 0,
    status: 'IN_PROGRESS',
    labels: [{ id: 'l5', label_name: 'Tuyển dụng', color: '#8B5CF6' }],
    sub_task_count: 0,
    comment_count: 0,
  }
];

const MOCK_ACTIVITY_LOGS: TaskActivityLog[] = [
  {
    id: 'log-1',
    task_id: 't1111111-1111-1111-1111-111111111111',
    actor_id: 'Rob Evans',
    action: 'CREATED_TASK',
    details: 'Tạo công việc "Stability checks & ESR compliance confirmation"',
    created_at: '2026-08-01T09:30:00',
  },
  {
    id: 'log-2',
    task_id: 't1111111-1111-1111-1111-111111111111',
    actor_id: 'Jason Howie',
    action: 'STATUS_CHANGED',
    field_name: 'status',
    old_value: 'OPEN',
    new_value: 'IN_PROGRESS',
    details: 'Chuyển trạng thái task sang In Progress',
    created_at: '2026-08-02T08:15:00',
  },
  {
    id: 'log-3',
    task_id: 't2222222-2222-2222-2222-222222222222',
    actor_id: 'TN001',
    action: 'ASSIGNED',
    field_name: 'assignee_id',
    new_value: 'TN001',
    details: 'Phân công cho TN001',
    created_at: '2026-08-02T11:00:00',
  }
];

export const projectManagementService = {
  // 1. Get Boards
  async getBoards(status: 'ACTIVE' | 'ARCHIVED' = 'ACTIVE'): Promise<Board[]> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/get-boards?status=${status}`, {
        headers: getApiHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API getBoards failed, fallback to mock data', e);
    }
    return MOCK_BOARDS.filter(b => b.status === status);
  },

  // 2. Get Board Detail
  async getBoardDetail(boardId: string): Promise<BoardDetail | null> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/get-board/${boardId}`, {
        headers: getApiHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getBoardDetail failed, fallback mock', e);
    }

    const board = MOCK_BOARDS.find(b => b.id === boardId) || MOCK_BOARDS[0];
    if (!board) return null;

    const boardTasks = MOCK_TASKS.filter(t => t.board_id === board.id);

    return {
      ...board,
      columns: [
        {
          id: 'c-todo',
          board_id: board.id,
          column_name: 'To Do',
          position: 0,
          column_type: 'TODO',
          color: '#6B7280',
          tasks: boardTasks.filter(t => t.status === 'OPEN'),
        },
        {
          id: 'c-in-progress',
          board_id: board.id,
          column_name: 'In Progress',
          position: 1,
          column_type: 'IN_PROGRESS',
          color: '#3B82F6',
          tasks: boardTasks.filter(t => t.status === 'IN_PROGRESS'),
        },
        {
          id: 'c-done',
          board_id: board.id,
          column_name: 'Done',
          position: 2,
          column_type: 'DONE',
          color: '#10B981',
          tasks: boardTasks.filter(t => t.status === 'DONE'),
        },
      ],
      labels: [
        { id: 'l1', label_name: 'Gấp', color: '#EF4444' },
        { id: 'l2', label_name: 'Hardware', color: '#3B82F6' },
        { id: 'l3', label_name: 'Pháp lý', color: '#10B981' },
      ],
    };
  },

  // 3. Get Tasks with Filters
  async getTasks(params: {
    board_id?: string;
    status?: string;
    priority?: string;
    task_type?: string;
    search?: string;
  }): Promise<TaskItem[]> {
    try {
      const baseUrl = await getApiUrl();
      const query = new URLSearchParams();
      if (params.board_id) query.append('board_id', params.board_id);
      if (params.status) query.append('status', params.status);
      if (params.priority) query.append('priority', params.priority);
      if (params.task_type) query.append('task_type', params.task_type);
      if (params.search) query.append('search', params.search);

      const res = await fetch(`${baseUrl}/v1/project-management/get-tasks?${query.toString()}`, {
        headers: getApiHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('API getTasks failed, returning mock filtered tasks', e);
    }

    let filtered = [...MOCK_TASKS];
    if (params.board_id) filtered = filtered.filter(t => t.board_id === params.board_id);
    if (params.status) filtered = filtered.filter(t => t.status === params.status);
    if (params.priority) filtered = filtered.filter(t => t.priority === params.priority);
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(s) || t.task_code.toLowerCase().includes(s));
    }
    return filtered;
  },

  // 4. Get Task Detail
  async getTaskDetail(taskId: string): Promise<TaskItem | null> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/get-task/${taskId}`, {
        headers: getApiHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getTaskDetail failed, returning mock item', e);
    }
    const found = MOCK_TASKS.find(t => t.id === taskId);
    return found || MOCK_TASKS[0] || null;
  },

  // 5. Add Board
  async createBoard(payload: { board_name: string; board_key: string; description?: string }): Promise<Board> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/add-boards`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify([{ ...payload, owner_id: 'TN001' }]),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) return data[0];
      }
    } catch (e) {
      console.warn('API createBoard failed', e);
    }

    const newBoard: Board = {
      id: `b-${Date.now()}`,
      board_name: payload.board_name,
      board_key: payload.board_key.toUpperCase(),
      description: payload.description,
      owner_id: 'TN001',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };
    MOCK_BOARDS.unshift(newBoard);
    return newBoard;
  },

  // 5.1. Update Board
  async updateBoard(boardId: string, payload: Partial<Board>): Promise<Board> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/update-boards`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify([{ id: boardId, ...payload }]),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) return data[0];
      }
    } catch (e) {
      console.warn('API updateBoard failed', e);
    }

    const idx = MOCK_BOARDS.findIndex(b => b.id === boardId);
    if (idx !== -1) {
      MOCK_BOARDS[idx] = { ...MOCK_BOARDS[idx], ...payload, updated_at: new Date().toISOString() };
      return MOCK_BOARDS[idx];
    }
    throw new Error('Board not found');
  },

  // 5.2. Delete Board
  async deleteBoard(boardId: string): Promise<boolean> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/delete-boards?ids=${boardId}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn('API deleteBoard failed', e);
    }

    const idx = MOCK_BOARDS.findIndex(b => b.id === boardId);
    if (idx !== -1) {
      MOCK_BOARDS.splice(idx, 1);
    }
    return true;
  },

  // 5.3. Archive / Unarchive Board
  async archiveBoard(boardId: string): Promise<Board> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/archive-board/${boardId}`, {
        method: 'POST',
        headers: getApiHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API archiveBoard failed', e);
    }

    const found = MOCK_BOARDS.find(b => b.id === boardId);
    if (found) {
      found.status = found.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
      found.updated_at = new Date().toISOString();
      return found;
    }
    throw new Error('Board not found');
  },

  // 6. Add Task
  async createTask(payload: Partial<TaskItem>): Promise<TaskItem> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/add-tasks`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify([payload]),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) return data[0];
      }
    } catch (e) {
      console.warn('API createTask failed', e);
    }

    const board = MOCK_BOARDS.find(b => b.id === payload.board_id) || MOCK_BOARDS[0];
    const boardKey = board ? board.board_key : 'TN';
    const codeIndex = MOCK_TASKS.length + 1;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      task_code: `${boardKey}-${String(codeIndex).padStart(3, '0')}`,
      board_id: payload.board_id || (board ? board.id : 'b1111111-1111-1111-1111-111111111111'),
      title: payload.title || 'Công việc mới',
      description: payload.description || '',
      priority: payload.priority || 'MEDIUM',
      task_type: payload.task_type || 'TASK',
      assignee_id: payload.assignee_id || 'Jason Howie',
      reporter_id: payload.reporter_id || 'Rob Evans',
      due_date: payload.due_date || null,
      status: payload.status || 'OPEN',
      created_at: new Date().toISOString(),
      sub_task_count: 0,
      comment_count: 0,
    };
    MOCK_TASKS.unshift(newTask);
    return newTask;
  },

  // 7. Update Task
  async updateTask(taskId: string, payload: Partial<TaskItem>): Promise<TaskItem> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/update-tasks`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify([{ id: taskId, ...payload }]),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) return data[0];
      }
    } catch (e) {
      console.warn('API updateTask failed', e);
    }

    const existing = MOCK_TASKS.find(t => t.id === taskId);
    const idx = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (existing && idx !== -1) {
      const updatedItem: TaskItem = {
        ...existing,
        ...payload,
        id: existing.id,
        task_code: payload.task_code || existing.task_code,
        board_id: payload.board_id || existing.board_id,
        title: payload.title || existing.title,
        priority: payload.priority || existing.priority,
        task_type: payload.task_type || existing.task_type,
        status: payload.status || existing.status,
        updated_at: new Date().toISOString()
      };
      MOCK_TASKS[idx] = updatedItem;
      return updatedItem;
    }
    throw new Error('Task not found');
  },

  // 8. Add Comment
  async addComment(taskId: string, content: string, authorId: string = 'Jason Howie'): Promise<TaskComment> {
    const newComment: TaskComment = {
      id: `cm-${Date.now()}`,
      task_id: taskId,
      author_id: authorId,
      content,
      created_at: new Date().toISOString(),
    };

    const task = MOCK_TASKS.find(t => t.id === taskId);
    if (task) {
      if (!task.comments) task.comments = [];
      if (!task.comments.some(c => c.id === newComment.id)) {
        task.comments.push(newComment);
      }
      task.comment_count = (task.comments || []).length;
    }

    return newComment;
  },

  // 9. Get Activity Logs
  async getActivityLogs(taskId?: string): Promise<TaskActivityLog[]> {
    try {
      const baseUrl = await getApiUrl();
      const query = taskId ? `?task_id=${taskId}` : '';
      const res = await fetch(`${baseUrl}/v1/project-management/get-task-activity-logs${query}`, {
        headers: getApiHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('API getActivityLogs failed', e);
    }

    if (taskId) {
      return MOCK_ACTIVITY_LOGS.filter(l => l.task_id === taskId);
    }
    return MOCK_ACTIVITY_LOGS;
  },

  // 10. Delete Attachment
  async deleteAttachment(attId: string): Promise<boolean> {
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}/v1/project-management/delete-attachment/${attId}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn('API deleteAttachment failed', e);
    }
    return true;
  }
};
