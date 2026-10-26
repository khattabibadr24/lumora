import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "lumora:favorites";
function readFavorites(): string[] { if (typeof window === "undefined") return []; try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; } }

type FavoritesContextValue = { favoriteHandles: string[]; isFavorite: (handle: string) => boolean; toggleFavorite: (handle: string) => void; count: number };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) { const [favoriteHandles, setFavoriteHandles] = useState<string[]>(readFavorites); const toggleFavorite = useCallback((handle: string) => { setFavoriteHandles(current => { const next = current.includes(handle) ? current.filter(item => item !== handle) : [...current, handle]; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; }); }, []); const value = useMemo(() => ({ favoriteHandles, isFavorite: (handle: string) => favoriteHandles.includes(handle), toggleFavorite, count: favoriteHandles.length }), [favoriteHandles, toggleFavorite]); return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>; }
export function useFavorites() { const context = useContext(FavoritesContext); if (!context) throw new Error("useFavorites must be used inside FavoritesProvider"); return context; }
