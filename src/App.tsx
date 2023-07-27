import * as React from 'react';
import { View, StyleSheet } from "react-native";
import { VideoPlayer } from "./VideoPlayer";
import { PlayListData } from "./PlayListData";
import { FlashList, ViewToken } from "@shopify/flash-list";
import { PlayerListContextProvider, usePlayerListContext } from "./PlayerListContextProvider";

const ITEM_HEIGHT = 250;

export default function App() {
    return <PlayerListContextProvider>
        <PlayerList />
    </PlayerListContextProvider>
}

/**
 * The example app demonstrates the use of the THEOplayerView with a custom UI using the provided UI components.
 * If you don't want to create a custom UI, you can just use the THEOplayerDefaultUi component instead.
 */
function PlayerList() {
    const store = usePlayerListContext();

    // Given type and data, return the view component.
    // Do not add key prop to the output of rowRenderer. Adding it will stop recycling and cause random mounts/unmounts.
    const rowRenderer = (props: {item: PlayListData }) => {
        const { item } = props;

        return <View style={{width: "100%", height: ITEM_HEIGHT}}>
            <VideoPlayer
                source={item.source}
                isViewable={store.isViewable(item.index)}
                playlistData={item}
            />
        </View>
    };

    const onViewableItemsChanged = React.useCallback((info: {
        viewableItems: ViewToken[];
        changed: ViewToken[];
    }) => {
        // Notify context is an item's viewability was changed.
        info.changed.forEach((token: ViewToken) => {
            console.log('DEMO', `Player ${token.index} became ${token.isViewable? 'visible' : 'invisible'}`);

            store.setViewable(token.index, token.isViewable);
        });
    }, []);

    return (
        <PlayerListContextProvider>
            <View style={[StyleSheet.absoluteFill, {backgroundColor: '#000000'}]}>
                <FlashList
                    // A plain array of items of a given type.
                    data={store.items}

                    // Takes an item from data and renders it into the list.
                    renderItem={rowRenderer}

                    // A single numeric value that hints FlashList about the approximate size of the items before they're rendered.
                    estimatedItemSize={ITEM_HEIGHT}

                    // Called when the viewability of rows changes.
                    onViewableItemsChanged={onViewableItemsChanged}

                    // Configuration for determining whether items are viewable.
                    viewabilityConfig = {{
                        // Minimum amount of time (in milliseconds) that an item must be physically viewable before the viewability callback will be fired.
                        minimumViewTime: 350,

                        // Nothing is considered viewable until the user scrolls or recordInteraction is called after render.
                        waitForInteraction: false,

                        // Percent of the item that must be visible for a partially occluded item to count as "viewable", 0-100.
                        itemVisiblePercentThreshold: 50
                    }}

                    // Draw distance for advanced rendering (in dp/px).
                    // Platform default: 250
                    drawDistance={0.5 * ITEM_HEIGHT}

                    extraData={store.viewable}
                />
            </View>
        </PlayerListContextProvider>
    );
}
