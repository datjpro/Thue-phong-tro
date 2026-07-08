import { create } from 'zustand';

interface CompareState {
  compareIds: string[];
  toggleCompare: (roomId: string) => void;
  clearCompare: () => void;
  isComparing: (roomId: string) => boolean;
}

export const useCompare = create<CompareState>((set, get) => ({
  compareIds: [],
  
  toggleCompare: (roomId) => set((state) => {
    const isComp = state.compareIds.includes(roomId);
    if (isComp) {
      return { compareIds: state.compareIds.filter(id => id !== roomId) };
    } else {
      // Giới hạn tối đa 3 phòng so sánh cùng lúc
      if (state.compareIds.length >= 3) {
        return { compareIds: [...state.compareIds.slice(1), roomId] };
      }
      return { compareIds: [...state.compareIds, roomId] };
    }
  }),
  
  clearCompare: () => set({ compareIds: [] }),
  
  isComparing: (roomId) => get().compareIds.includes(roomId)
}));
