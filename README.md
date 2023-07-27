# React Native THEOplayer Sample List View

![](./doc/logo-react-native.png) ![](./doc/logo-theo.png)

## License

This projects falls under the license as defined in https://github.com/THEOplayer/license-and-disclaimer.

## Overview

This sample app showcases how to use [`react-native-theoplayer`](https://github.com/THEOplayer/react-native-theoplayer) to create a vertically scrolling list of video players. 
It leverages the [`@shopify/flash-list`](https://www.npmjs.com/package/@shopify/flash-list) component, 
which enhances the functionality of [`recyclerlistview`](https://www.npmjs.com/package/recyclerlistview) for efficient list rendering.

The demo highlights key elements essential for delivering an optimized user experience with seamless scrolling and
rapid playback startup.

![](./doc/demo.gif)

## Creating an Effective User Experience

To ensure a smooth and efficient user experience, we focus on these key areas:

### Managing the THEOplayerView Lifecycle

Proper management of THEOplayerView and its associated THEOplayer instances is crucial. This includes:

  - Maintaining a **limited number of active players** to optimize resource usage.
  - **Recycling player instances** instead of constantly destroying and recreating them, which helps improve performance.

### Handling Player Visibility

While buffering can continue when a player is off-screen, playback should only begin when the player becomes visible. 
Playback should pause or stop when the player scrolls out of view.

In this demo, multiple players can stream simultaneously while visible on the screen. 
With minor adjustments, the app could be modified to allow only one player to start playback at a time or enable users 
to manually play/pause any of the visible players, instead of relying on autoplay.

### Optimizing Time-To-First-Frame (TTFF)

To ensure rapid playback startup, we begin downloading video segments at the lowest acceptable quality. 
This is achieved by setting the ABR (Adaptive Bitrate) strategy to performance. 

```tsx
player.abr.strategy = ABRStrategyType.performance;
```

After the initial segments are loaded, the connection speed is assessed, allowing the player to 
automatically adjust to an appropriate quality level.

## App Design

The demo features a list of 50 items, reusing a limited set of DASH and HLS stream assets.

A `PlayerListContentProvider` serves as the central data source, tracking all list items and their metadata, along with 
the visibility status of each item. It also offers convenient methods for `FlashList` to toggle the visibility of each player.

Additionally, the `PlayerListContentProvider` can be extended to track the current playback position. 
This would allow the app to resume playback from the same point when a player becomes visible again, 
creating a built-in **bookmarking** feature.

## Known Limitations

- On Android, the audio focus manager currently pauses play-out whenever another player start playing. Because we allow multiple players to stream in parallel, we disabled this featured for this demo.
- On iOS, enabling IMA client-side ads would impact performance slightly when setting a source. This results in scrolling not being smooth.
