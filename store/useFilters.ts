import { create } from 'zustand';

export interface FilterState {
  search: string;
  city: 'all' | 'Hồ Chí Minh' | 'Hà Nội';
  district: string;
  type: 'all' | 'phong-tro' | 'chung-cu-mini' | 'o-ghep';
  maxPrice: number; // Tối đa 10,000,000
  amenities: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';
  branchId: 'all' | string;
  setFilter: (fields: Partial<Omit<FilterState, 'setFilter' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

const initialFilters = {
  search: '',
  city: 'all' as const,
  district: 'all',
  type: 'all' as const,
  maxPrice: 8000000, // 8 triệu là tối đa trong seed data
  amenities: [],
  sortBy: 'newest' as const,
  branchId: 'all',
};

export const useFilters = create<FilterState>((set) => ({
  ...initialFilters,
  
  setFilter: (fields) => set((state) => ({ ...state, ...fields })),
  
  resetFilters: () => set(initialFilters),
}));
