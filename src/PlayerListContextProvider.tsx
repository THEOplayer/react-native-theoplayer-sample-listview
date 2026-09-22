import { PlayListData } from "./PlayListData";
import * as React from "react";
import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import ALL_SOURCES from "./custom/sources.json";
import { Source } from "./custom/Source";
import { Platform } from "react-native";

const FAIRPLAY_INTEGRATIONS = new Set(['keyos_buydrm', 'castlabs']);
const PLATFORM_SOURCES = ALL_SOURCES.filter((source) => source.os.indexOf(Platform.OS) >= 0) as Source[];
export const SOURCES = Platform.OS === 'ios'
    ? PLATFORM_SOURCES.filter((item) => {
        const sources = item.source.sources;
        return !Array.isArray(sources) && FAIRPLAY_INTEGRATIONS.has(sources?.contentProtection?.integration ?? '');
    })
    : PLATFORM_SOURCES;

/**
 * Create a list of n items.
 */
function generateMockPlaylist(n: number): PlayListData[] {
    const entries = new Array(n);
    for (let i = 0; i < n; i++) {
        const item = (SOURCES as Source[])[i % SOURCES.length];
        entries[i] = {
            index: i,
            name: item.name,
            source: item.source
        }
    }
    return entries;
}

interface PlayerListContext {
    items: PlayListData[];
    viewable: number[];
    isViewable: (index: number) => boolean;
    setViewable: (index: number | null, isViewable: boolean) => void;
}

const PlayerDataContext = React.createContext<PlayerListContext | undefined>(undefined);

interface PlayerListContextProviderProps {
    children?: ReactNode;
}

/**
 *  PlayerListContextProvider stores & provides:
 *  - playlist data, i.e. a stream description for each list item;
 *  - a list of `viewable` (visible) items;
 *  -
 */
export const PlayerListContextProvider = ({ children }: PlayerListContextProviderProps) => {
    const [viewable, setViewable] = useState<number[]>([]);

    // The playlist is static for the lifetime of the app, so memoize it once.
    // This keeps the `data` prop reference stable so FlashList v2 does not re-layout
    // the entire list on every visibility change.
    const items = useMemo(() => generateMockPlaylist(100), []);

    const isViewable = useCallback((index: number) => viewable.includes(index), [viewable]);

    const setViewableCallback = useCallback((index: number | null, isViewable: boolean) => {
        if (index === null) {
            return;
        }
        if (isViewable) {
            setViewable(viewable => Array.from(new Set([...viewable, index])));
        } else {
            setViewable(viewable => viewable.filter(i => i !== index));
        }
    }, []);

    const contextValue = useMemo(() => ({
        items,
        viewable,
        isViewable,
        setViewable: setViewableCallback,
    }), [items, viewable, isViewable, setViewableCallback]);

    return <PlayerDataContext.Provider value={contextValue}>
        {children}
    </PlayerDataContext.Provider>
}

export const usePlayerListContext = () => {
    const context = useContext(PlayerDataContext);
    if (!context) {
        throw new Error("usePlayerListContext must be used inside a PlayerListContextProvider");
    }
    return context;
}
