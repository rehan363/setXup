/**
 * frontend/lib/api-client.ts  —  T021 (US1)
 *
 * Typed fetch wrapper for the FastAPI backend.
 * All requests that need auth automatically include the Bearer token.
 */

import { getAuthHeaders, AuthUser } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Unknown error");
  }

  if (res.status === 204) return null as unknown as T;

  return res.json() as Promise<T>;
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Organization {
  id: number;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  created_by: number;
  created_at: string;
}

export interface OrgMember {
  id: number;
  org_id: number;
  user_id: number;
  role: "owner" | "admin" | "member" | "guest";
  joined_at: string;
  email?: string | null;
  name?: string | null;
}

export interface Space {
  id: number;
  org_id: number;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  is_private: boolean;
  created_by: number;
  created_at: string;
}

export interface Folder {
  id: number;
  space_id: number;
  name: string;
  created_by: number;
  created_at: string;
}

export interface ProjectList {
  id: number;
  space_id: number;
  folder_id: number | null;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
}

export interface Status {
  id: number;
  space_id: number;
  name: string;
  color: string;
  type: "open" | "closed";
  order: number;
}

export interface Tag {
  id: number;
  org_id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  user_id: number;
  list_id: number | null;
  status_id: number | null;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  order: number;
  start_date: string | null;
  due_date: string | null;
  parent_task_id: number | null;
  time_estimate: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string | null;
}

export interface ActivityLog {
  id: number;
  task_id: number;
  user_id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface Checklist {
  id: number;
  task_id: number;
  title: string;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  content: string;
  is_checked: boolean;
  order: number;
  assigned_to: number | null;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  in_progress_tasks: number;
  my_tasks: number;
}

export interface WorkloadEntry {
  user_id: number;
  email: string;
  task_count: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  workload: WorkloadEntry[];
  recent_activity: ActivityLog[];
  upcoming_tasks: Task[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── API Endpoints ───────────────────────────────────────────────────────────

const auth = {
  register(body: { email: string; password: string; name?: string }): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: { email: string; password: string }): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

const orgs = {
  list(): Promise<Organization[]> {
    return request<Organization[]>("/api/orgs/");
  },

  create(body: { name: string; logo_url?: string; brand_color?: string }): Promise<Organization> {
    return request<Organization>("/api/orgs/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  get(id: number): Promise<Organization> {
    return request<Organization>(`/api/orgs/${id}`);
  },

  update(id: number, body: { name?: string; logo_url?: string; brand_color?: string }): Promise<Organization> {
    return request<Organization>(`/api/orgs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  inviteMember(orgId: number, body: { email: string; role?: string }): Promise<OrgMember> {
    return request<OrgMember>(`/api/orgs/${orgId}/members/invite`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listMembers(orgId: number): Promise<OrgMember[]> {
    return request<OrgMember[]>(`/api/orgs/${orgId}/members`);
  },
};

const spaces = {
  list(orgId: number): Promise<Space[]> {
    return request<Space[]>(`/api/orgs/${orgId}/spaces`);
  },

  create(orgId: number, body: { name: string; icon?: string; color?: string; description?: string; is_private?: boolean }): Promise<Space> {
    return request<Space>(`/api/orgs/${orgId}/spaces`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  get(id: number): Promise<Space> {
    return request<Space>(`/api/spaces/${id}`);
  },

  update(id: number, body: { name?: string; icon?: string; color?: string; description?: string; is_private?: boolean }): Promise<Space> {
    return request<Space>(`/api/spaces/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(id: number): Promise<null> {
    return request<null>(`/api/spaces/${id}`, { method: "DELETE" });
  },

  listMembers(spaceId: number): Promise<OrgMember[]> {
    return request<OrgMember[]>(`/api/spaces/${spaceId}/members`);
  },

  addMember(spaceId: number, body: { email: string; role?: string }): Promise<OrgMember> {
    return request<OrgMember>(`/api/spaces/${spaceId}/members`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

const folders = {
  create(spaceId: number, body: { name: string }): Promise<Folder> {
    return request<Folder>(`/api/spaces/${spaceId}/folders`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  list(spaceId: number): Promise<Folder[]> {
    return request<Folder[]>(`/api/spaces/${spaceId}/folders`);
  },

  update(folderId: number, body: { name: string }): Promise<Folder> {
    return request<Folder>(`/api/folders/${folderId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(folderId: number): Promise<null> {
    return request<null>(`/api/folders/${folderId}`, { method: "DELETE" });
  },
};

const lists = {
  create(spaceId: number, body: { name: string; description?: string; folder_id?: number | null }): Promise<ProjectList> {
    return request<ProjectList>(`/api/spaces/${spaceId}/lists`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  list(spaceId: number): Promise<ProjectList[]> {
    return request<ProjectList[]>(`/api/spaces/${spaceId}/lists`);
  },

  get(id: number): Promise<ProjectList> {
    return request<ProjectList>(`/api/lists/${id}`);
  },

  update(id: number, body: { name?: string; description?: string }): Promise<ProjectList> {
    return request<ProjectList>(`/api/lists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(id: number): Promise<null> {
    return request<null>(`/api/lists/${id}`, { method: "DELETE" });
  },

  getTasks(listId: number): Promise<Task[]> {
    return request<Task[]>(`/api/lists/${listId}/tasks`);
  },
};

const statuses = {
  list(spaceId: number): Promise<Status[]> {
    return request<Status[]>(`/api/spaces/${spaceId}/statuses`);
  },

  create(spaceId: number, body: { name: string; color?: string; type?: string; order?: number }): Promise<Status> {
    return request<Status>(`/api/spaces/${spaceId}/statuses`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(statusId: number, body: { name?: string; color?: string; type?: string; order?: number }): Promise<Status> {
    return request<Status>(`/api/statuses/${statusId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(statusId: number): Promise<null> {
    return request<null>(`/api/statuses/${statusId}`, { method: "DELETE" });
  },
};

const tags = {
  list(orgId: number): Promise<Tag[]> {
    return request<Tag[]>(`/api/orgs/${orgId}/tags`);
  },

  create(orgId: number, body: { name: string; color?: string }): Promise<Tag> {
    return request<Tag>(`/api/orgs/${orgId}/tags`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  delete(tagId: number): Promise<null> {
    return request<null>(`/api/tags/${tagId}`, { method: "DELETE" });
  },

  attach(taskId: number, tagId: number): Promise<any> {
    return request<any>(`/api/tasks/${taskId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag_id: tagId }),
    });
  },

  detach(taskId: number, tagId: number): Promise<null> {
    return request<null>(`/api/tasks/${taskId}/tags/${tagId}`, {
      method: "DELETE",
    });
  },

  listForTask(taskId: number): Promise<Tag[]> {
    return request<Tag[]>(`/api/tasks/${taskId}/tags`);
  },
};

const comments = {
  list(taskId: number): Promise<Comment[]> {
    return request<Comment[]>(`/api/tasks/${taskId}/comments`);
  },

  create(taskId: number, body: { content: string }): Promise<Comment> {
    return request<Comment>(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(commentId: number, body: { content: string }): Promise<Comment> {
    return request<Comment>(`/api/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(commentId: number): Promise<null> {
    return request<null>(`/api/comments/${commentId}`, { method: "DELETE" });
  },
};

const dashboard = {
  getOrgStats(orgId: number): Promise<DashboardResponse> {
    return request<DashboardResponse>(`/api/orgs/${orgId}/dashboard`);
  },

  getSpaceStats(spaceId: number): Promise<DashboardResponse> {
    return request<DashboardResponse>(`/api/spaces/${spaceId}/dashboard`);
  },
};

const templates = {
  list(): Promise<any[]> {
    return request<any[]>("/api/templates");
  },

  get(id: string): Promise<any> {
    return request<any>(`/api/templates/${id}`);
  },

  apply(spaceId: number, templateId: string): Promise<any> {
    return request<any>(`/api/spaces/${spaceId}/apply-template`, {
      method: "POST",
      body: JSON.stringify({ template_id: templateId }),
    });
  },
};

const tasks = {
  list(): Promise<{ tasks: Task[] }> {
    return request<{ tasks: Task[] }>("/api/tasks");
  },

  create(body: {
    title: string;
    description?: string;
    priority?: string;
    list_id?: number | null;
    status_id?: number | null;
    start_date?: string | null;
    due_date?: string | null;
    parent_task_id?: number | null;
    time_estimate?: number | null;
  }): Promise<Task> {
    return request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(
    id: number,
    body: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      priority?: string;
      list_id?: number | null;
      status_id?: number | null;
      start_date?: string | null;
      due_date?: string | null;
      time_estimate?: number | null;
    }
  ): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(id: number): Promise<null> {
    return request<null>(`/api/tasks/${id}`, { method: "DELETE" });
  },

  updateStatus(taskId: number, statusId: number): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status_id: statusId }),
    });
  },

  reorder(taskId: number, order: number): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/order`, {
      method: "PATCH",
      body: JSON.stringify({ order }),
    });
  },

  createSubtask(
    taskId: number,
    body: {
      title: string;
      description?: string;
      priority?: string;
      status_id?: number | null;
      start_date?: string | null;
      due_date?: string | null;
      time_estimate?: number | null;
    }
  ): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listSubtasks(taskId: number): Promise<Task[]> {
    return request<Task[]>(`/api/tasks/${taskId}/subtasks`);
  },

  listActivity(taskId: number): Promise<ActivityLog[]> {
    return request<ActivityLog[]>(`/api/tasks/${taskId}/activity`);
  },

  createChecklist(taskId: number, body: { title: string }): Promise<Checklist> {
    return request<Checklist>(`/api/tasks/${taskId}/checklists`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listChecklists(taskId: number): Promise<Checklist[]> {
    return request<Checklist[]>(`/api/tasks/${taskId}/checklists`);
  },

  deleteChecklist(checklistId: number): Promise<null> {
    return request<null>(`/api/tasks/checklists/${checklistId}`, {
      method: "DELETE",
    });
  },

  createChecklistItem(
    checklistId: number,
    body: { content: string; assigned_to?: number | null }
  ): Promise<ChecklistItem> {
    return request<ChecklistItem>(`/api/tasks/checklists/${checklistId}/items`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
    return request<ChecklistItem[]>(`/api/tasks/checklists/${checklistId}/items`);
  },

  updateChecklistItem(
    itemId: number,
    body: { content?: string; is_checked?: boolean; assigned_to?: number | null }
  ): Promise<ChecklistItem> {
    return request<ChecklistItem>(`/api/tasks/checklist-items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  deleteChecklistItem(itemId: number): Promise<null> {
    return request<null>(`/api/tasks/checklist-items/${itemId}`, {
      method: "DELETE",
    });
  },
};

// ─── Named export ─────────────────────────────────────────────────────────────

export const api = {
  auth,
  orgs,
  spaces,
  folders,
  lists,
  statuses,
  tags,
  comments,
  dashboard,
  templates,
  tasks,
};
