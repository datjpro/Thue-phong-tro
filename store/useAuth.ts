import { create } from 'zustand';
import { User, users } from '../data/users';

interface AuthState {
  currentUser: User | null;
  loginAs: (role: 'tenant' | 'landlord', userId?: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
  // Mặc định đăng nhập với vai trò tenant đầu tiên để tiện trải nghiệm
  const defaultTenant = users.find(u => u.role === 'tenant') || null;

  return {
    currentUser: defaultTenant,
    loginAs: (role, userId) => {
      let user: User | null = null;
      if (userId) {
        user = users.find(u => u.id === userId) || null;
      } else {
        user = users.find(u => u.role === role) || null;
      }
      set({ currentUser: user });
    },
    logout: () => set({ currentUser: null }),
  };
});
