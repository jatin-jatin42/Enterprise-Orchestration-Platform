// Zustand store types
export interface StoreState {
  // Common state properties
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export interface StoreActions<T> {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setData: (data: T) => void;
  reset: () => void;
}