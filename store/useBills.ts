import { create } from 'zustand';

export interface Bill {
  id: string;
  roomId: string;
  roomTitle: string;
  tenantId: string;
  month: string;
  amount: number;
  electricity: number; // số ký điện tiêu thụ
  water: number;       // khối nước tiêu thụ
  service: number;     // phí dịch vụ cố định
  status: 'unpaid' | 'pending' | 'paid';
  createdAt: string;
  paymentProof?: string;
  paymentDate?: string;
}

interface BillsState {
  bills: Bill[];
  payBill: (billId: string, paymentProof: string) => void;
  approveBill: (billId: string) => void;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
}

export const useBills = create<BillsState>((set) => ({
  bills: [
    {
      id: 'bill-1',
      roomId: 'room-2',
      roomTitle: 'Phòng 202 - Căn hộ Studio cao cấp ban công riêng',
      tenantId: 'tenant-1',
      month: '06/2026',
      amount: 5950000,
      electricity: 120, // 120kwh * 3500đ = 420k
      water: 4,         // 4 khối * 20k = 80k
      service: 150000,   // wifi + rác = 150k
      // Rent: 5.300.000đ
      status: 'paid',
      createdAt: '2026-06-01',
      paymentDate: '2026-06-02'
    },
    {
      id: 'bill-2',
      roomId: 'room-2',
      roomTitle: 'Phòng 202 - Căn hộ Studio cao cấp ban công riêng',
      tenantId: 'tenant-1',
      month: '07/2026',
      amount: 6050000,
      electricity: 150,
      water: 5,
      service: 150000,
      status: 'unpaid',
      createdAt: '2026-07-01'
    }
  ],
  payBill: (billId, paymentProof) => set((state) => ({
    bills: state.bills.map((b) =>
      b.id === billId
        ? {
            ...b,
            status: 'pending',
            paymentProof,
            paymentDate: new Date().toISOString().split('T')[0]
          }
        : b
    )
  })),
  approveBill: (billId) => set((state) => ({
    bills: state.bills.map((b) =>
      b.id === billId
        ? { ...b, status: 'paid' }
        : b
    )
  })),
  addBill: (bill) => set((state) => ({
    bills: [
      ...state.bills,
      {
        ...bill,
        id: `bill-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      }
    ]
  }))
}));
