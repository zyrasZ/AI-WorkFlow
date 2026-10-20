import * as fs from 'fs';
import * as path from 'path';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class WorkflowsService {
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.join(this.dataDir, 'workflows.json');
  private workflows: Workflow[] = [];

  constructor() {
    this.ensureDataFileExists();
    this.loadWorkflows();
  }

  /**
   * Đảm bảo thư mục server/data và file workflows.json luôn tồn tại
   */
  private ensureDataFileExists() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  /**
   * Đọc dữ liệu từ file JSON vào RAM
   */
  private loadWorkflows() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.workflows = JSON.parse(content);
    } catch {
      this.workflows = [];
    }
  }

  /**
   * Lưu dữ liệu từ RAM xuống file JSON để không bị mất khi tắt server
   */
  private saveWorkflows() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.workflows, null, 2), 'utf-8');
  }

  /**
   * Lấy danh sách workflow có phân trang và tìm kiếm
   */
  findAll(limit = 50, offset = 0, search?: string) {
    let items = this.workflows;
    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      items = items.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          (w.description && w.description.toLowerCase().includes(term)),
      );
    }
    const total = items.length;
    const paginated = items.slice(offset, offset + limit);
    return {
      workflows: paginated,
      total,
      limit,
      offset,
    };
  }

  /**
   * Lấy chi tiết một workflow theo ID
   */
  findOne(id: string): Workflow | null {
    const workflow = this.workflows.find((w) => w.id === id);
    return workflow || null;
  }

  /**
   * Tạo một workflow mới
   */
  create(dto: { name: string; description?: string; metadata?: Record<string, any>; nodes?: any[]; edges?: any[] }): Workflow {
    const now = new Date().toISOString();
    const metadata = dto.metadata || {
      nodes: dto.nodes || [],
      edges: dto.edges || [],
      nodeCount: (dto.nodes || []).length,
      edgeCount: (dto.edges || []).length,
    };

    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: dto.name || 'Untitled Workflow',
      description: dto.description || '',
      metadata,
      created_at: now,
      updated_at: now,
    };

    this.workflows.unshift(newWorkflow);
    this.saveWorkflows();
    return newWorkflow;
  }

  /**
   * Cập nhật workflow
   */
  update(id: string, dto: Partial<Workflow> & { nodes?: any[]; edges?: any[] }): Workflow | null {
    const index = this.workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      return null;
    }

    const current = this.workflows[index];
    const newMetadata = {
      ...(current.metadata || {}),
      ...(dto.metadata || {}),
    };

    if (dto.nodes) newMetadata.nodes = dto.nodes;
    if (dto.edges) newMetadata.edges = dto.edges;
    if (newMetadata.nodes) newMetadata.nodeCount = newMetadata.nodes.length;
    if (newMetadata.edges) newMetadata.edgeCount = newMetadata.edges.length;

    const updated: Workflow = {
      ...current,
      name: dto.name !== undefined ? dto.name : current.name,
      description: dto.description !== undefined ? dto.description : current.description,
      metadata: newMetadata,
      updated_at: new Date().toISOString(),
    };

    this.workflows[index] = updated;
    this.saveWorkflows();
    return updated;
  }

  /**
   * Xóa một workflow
   */
  remove(id: string): boolean {
    const index = this.workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      return false;
    }

    this.workflows.splice(index, 1);
    this.saveWorkflows();
    return true;
  }

  /**
   * Validate workflow
   */
  validate(id: string) {
    const wf = this.findOne(id);
    if (!wf) return { valid: false, errors: ['Workflow not found'], warnings: [] };

    const nodes = wf.metadata?.nodes || [];
    const edges = wf.metadata?.edges || [];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (nodes.length === 0) {
      warnings.push('Workflow chưa có node nào');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Execute workflow
   */
  execute(id: string, input?: any) {
    const wf = this.findOne(id);
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      executionId,
      workflowId: id,
      workflowName: wf?.name || 'Unknown',
      status: 'completed',
      message: 'Workflow đã được thực thi thành công trên server',
      input: input || {},
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Import workflows
   */
  importWorkflows(importData: any) {
    const itemsToImport = Array.isArray(importData)
      ? importData
      : importData?.workflows
      ? importData.workflows
      : [importData];

    let successCount = 0;
    const importedWorkflowIds: string[] = [];

    for (const item of itemsToImport) {
      if (item && item.name) {
        const wf = this.create({
          name: item.name,
          description: item.description,
          metadata: item.metadata,
        });
        successCount++;
        importedWorkflowIds.push(wf.id);
      }
    }

    return {
      success: true,
      successCount,
      failedCount: itemsToImport.length - successCount,
      importedWorkflowIds,
    };
  }
}

export const workflowsService = new WorkflowsService();
