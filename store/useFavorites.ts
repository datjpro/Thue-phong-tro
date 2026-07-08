import { create } from 'zustand';

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (roomId: string) => void;
  isFavorite: (roomId: string) => boolean;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  favorites: [],
  
  toggleFavorite: (roomId) => set((state) => {
    const isFav = state.favorites.includes(roomId);
    const updatedFavorites = isFav 
      ? state.favorites.filter((id) => id !== roomId) 
      : [...state.favorites, roomId];
    return { favorites: updatedFavorites };
  }),
  
  isFavorite: (roomId) => {
    return get().favorites.includes(roomId);
  }
}));
