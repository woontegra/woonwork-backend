import { z } from 'zod';

export const TenantRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type TenantRole = (typeof TenantRole)[keyof typeof TenantRole];

export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const ROLE_HIERARCHY: Record<TenantRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  EDITOR: 3,
  ADMIN: 4,
  OWNER: 5,
};

export function hasMinRole(userRole: TenantRole, required: TenantRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Proje adı gerekli').max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Görev başlığı gerekli').max(300),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().cuid().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const createPageSchema = z.object({
  title: z.string().min(1, 'Sayfa başlığı gerekli').max(300),
  parentId: z.string().cuid().optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;

export const updatePageSchema = createPageSchema.partial();

export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const BlockType = {
  PARAGRAPH: 'PARAGRAPH',
  HEADING_1: 'HEADING_1',
  HEADING_2: 'HEADING_2',
  HEADING_3: 'HEADING_3',
  BULLETED_LIST: 'BULLETED_LIST',
  NUMBERED_LIST: 'NUMBERED_LIST',
  TODO: 'TODO',
  QUOTE: 'QUOTE',
  CALLOUT: 'CALLOUT',
  DIVIDER: 'DIVIDER',
  CODE: 'CODE',
} as const;

export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export const blockContentSchema = z
  .object({
    text: z.string().optional(),
    checked: z.boolean().optional(),
    language: z.string().optional(),
    icon: z.string().optional(),
  })
  .passthrough();

export type BlockContent = z.infer<typeof blockContentSchema>;

export const createBlockSchema = z.object({
  type: z.nativeEnum(BlockType),
  content: blockContentSchema.optional(),
  parentBlockId: z.string().cuid().optional().nullable(),
  afterBlockId: z.string().cuid().optional().nullable(),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;

export const updateBlockSchema = z.object({
  type: z.nativeEnum(BlockType).optional(),
  content: blockContentSchema.optional(),
  parentBlockId: z.string().cuid().optional().nullable(),
});

export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;

export const reorderBlocksSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>;

export function defaultBlockContent(type: BlockType): BlockContent {
  switch (type) {
    case BlockType.TODO:
      return { text: '', checked: false };
    case BlockType.CODE:
      return { text: '', language: 'javascript' };
    case BlockType.CALLOUT:
      return { text: '', icon: '💡' };
    case BlockType.DIVIDER:
      return {};
    default:
      return { text: '' };
  }
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessBody<T> | ApiErrorBody;

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: TenantRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
  tenants: TenantSummary[];
}
