import { create } from 'zustand';

export interface IssueReport {
  id: string;
  roomId: string;
  roomTitle: string;
  tenantId: string;
  tenantName: string;
  title: string;
  category: 'dien-nuoc' | 'thiet-bi' | 'internet' | 'khac';
  description: string;
  image?: string;
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
  resolutionNote?: string;
  resolvedAt?: string;
}

interface IssuesState {
  reports: IssueReport[];
  addReport: (report: Omit<IssueReport, 'id' | 'status' | 'createdAt'>) => void;
  updateReportStatus: (reportId: string, status: 'pending' | 'processing' | 'resolved', resolutionNote?: string) => void;
}

export const useIssues = create<IssuesState>((set) => ({
  reports: [
    {
      id: 'issue-1',
      roomId: 'room-2',
      roomTitle: 'Phòng 202 - Căn hộ Studio cao cấp ban công riêng',
      tenantId: 'tenant-1',
      tenantName: 'Đỗ Tiến Đạt',
      title: 'Hỏng vòi hoa sen trong toilet',
      category: 'dien-nuoc',
      description: 'Vòi hoa sen bị nứt ở khớp nối dẫn đến rò rỉ nước rất mạnh khi bật nước tắm. Mong chủ nhà cho người qua sửa giúp.',
      status: 'resolved',
      createdAt: '2026-06-15',
      resolutionNote: 'Đã thay vòi hoa sen inox mới.',
      resolvedAt: '2026-06-16'
    },
    {
      id: 'issue-2',
      roomId: 'room-2',
      roomTitle: 'Phòng 202 - Căn hộ Studio cao cấp ban công riêng',
      tenantId: 'tenant-1',
      tenantName: 'Đỗ Tiến Đạt',
      title: 'Máy lạnh chảy nước',
      category: 'thiet-bi',
      description: 'Máy lạnh bật tầm 1 tiếng là bắt đầu có giọt nước chảy xuống giường. Nghi bị tắc đường ống thoát nước ngưng.',
      status: 'pending',
      createdAt: '2026-07-06'
    }
  ],
  addReport: (report) => set((state) => ({
    reports: [
      ...state.reports,
      {
        ...report,
        id: `issue-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      }
    ]
  })),
  updateReportStatus: (reportId, status, resolutionNote) => set((state) => ({
    reports: state.reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status,
            resolutionNote: resolutionNote || r.resolutionNote,
            resolvedAt: status === 'resolved' ? new Date().toISOString().split('T')[0] : r.resolvedAt
          }
        : r
    )
  }))
}));
