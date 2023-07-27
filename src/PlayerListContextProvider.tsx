import { PlayListData } from "./PlayListData";
import * as React from "react";
import { ReactNode, useContext, useState } from "react";
import ALL_SOURCES from "./custom/sources.json";
import { Source } from "./custom/Source";
import { Platform } from "react-native";

export const SOURCES = ALL_SOURCES.filter((source) => source.os.indexOf(Platform.OS) >= 0) as Source[];
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
export const PlayerListContextProvider = ({children}: PlayerListContextProviderProps) => {
    const [viewable, setViewable] = useState<number[]>([]);
    const contextValue = {
        items: generateMockPlaylist(100),
        viewable,
        isViewable: (index: number) => viewable.includes(index),
        setViewable: (index: number | null, isViewable: boolean) => {
            if (index === null) {
                return;
            }
            if (isViewable) {
                setViewable(viewable => Array.from(new Set([...viewable, index])));
            } else {
                setViewable(viewable => viewable.filter(i => i !== index));
            }
        }
    };
    return <PlayerDataContext.Provider value={contextValue}>
        {children}
        </PlayerDataContext.Provider>
}

export const usePlayerListContext = () => {
    const context = useContext(PlayerDataContext);
    if (!context) {
        throw new Error("usePlayerDataContext must used be inside a PlayerDataContextProvider");
    }
    return context;
}
