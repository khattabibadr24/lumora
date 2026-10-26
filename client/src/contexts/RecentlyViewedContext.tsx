import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "lumora:recently-viewed";
function readRecent(): string[] { if (typeof window === "undefined") return []; try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; } }
type RecentlyViewedValue = { handles: string[]; remember: (handle: string) => void };
const RecentlyViewedContext = createContext<RecentlyViewedValue | null>(null);
export function RecentlyViewedProvider({ children }: { children: ReactNode }) { const [handles, setHandles] = useState<string[]>(readRecent); const remember = useCallback((handle: string) => { setHandles(current => { const next = [handle, ...current.filter(item => item !== handle)].slice(0, 8); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; }); }, []); const value = useMemo(() => ({ handles, remember }), [handles, remember]); return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>; }
export function useRecentlyViewed() { const context = useContext(RecentlyViewedContext); if (!context) throw new Error("useRecentlyViewed must be used inside RecentlyViewedProvider"); return context; }
