import {
    ABRStrategyType,
    PlayerConfiguration,
    PlayerEventType,
    SourceDescription,
    THEOplayer,
    THEOplayerView
} from "react-native-theoplayer";
import { StyleProp, ViewStyle } from "react-native";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { PlayListData } from "./PlayListData";
import { DEFAULT_THEOPLAYER_THEME, UiContainer } from "@theoplayer/react-native-ui";
import { PlayerOverlay } from "./PlayerOverlay";

const DEMO_THEME = DEFAULT_THEOPLAYER_THEME;
DEMO_THEME.colors.uiBackground = 'transparent';

const playerConfig: PlayerConfiguration = {
    // Get your THEOplayer license from https://portal.theoplayer.com/
    // Without a license, only demo sources hosted on '*.theoplayer.com' domains can be played.
    license: undefined,
    libraryLocation: 'theoplayer',
    cast: {
        chromecast: {
            appID: 'CC1AD845',
        },
        strategy: 'auto',
    },
    mediaControl: {
        mediaSessionEnabled: true,
    },
};

export interface VideoPlayerProps {
    style?: StyleProp<ViewStyle>;
    source: SourceDescription | undefined;
    isViewable: boolean;
    playlistData: PlayListData;
}

let playerID = 0;
const PLAYER_COUNT_WARNING = 6;

export const VideoPlayer = (props: VideoPlayerProps) => {
    const playerRef = useRef<THEOplayer | undefined>(undefined);
    const playerId = useRef<number | undefined>(undefined);

    useEffect(() => {
        const player = playerRef.current;
        if (!player) {
            return;
        }
        // Check for an update source
        if (player.source !== props.source) {
            player.autoplay = props.isViewable;
            player.source = props.source;
        }
        if (player.source) {
            // Start play-out as soon as the player becomes visible.
            if (props.isViewable && player.paused) {
                player.play();
            }
            // Pause play-out as soon as the player becomes invisible.
            if (!props.isViewable && !player.paused) {
                console.log('DEMO', `Player ${playerId.current} became invisible`);
                player.pause();
            }
        }
    }, [props.isViewable, props.source]);

    const onPlayerReady = async (player: THEOplayer) => {
        playerRef.current = player;
        playerId.current = playerID++;

        /**
         * Show a warning if too many players are created: there is probably an issue with recycling.
         */
        if (playerID > PLAYER_COUNT_WARNING) {
            console.warn('DEMO',
                `More than ${PLAYER_COUNT_WARNING} players created.`,
                'Something goes wrong while recycling players!');
        }

        // Loop play-out
        player.addEventListener(PlayerEventType.ENDED, () => {
            player.currentTime = 0;
            player.play();
        });
        player.muted = true;
        // player.preload = 'auto';

        // Start auto-playing once the player becomes visible.
        player.autoplay = props.isViewable;
        player.source = props.source;

        /**
         * Choose ABR strategy type 'performance'. The player will start with the lowest quality, which means playback
         * can start earlier. Optionally filter the target qualities first to make sure all resolutions that are
         * unacceptably low are removed.
         */
        if (player.abr) {
            player.abr.strategy = ABRStrategyType.performance;
        }

        /**
         * Disable background audio for multiple players. Optionally enable it for just one player.
         */
        player.backgroundAudioConfiguration = {enabled: false};
        player.pipConfiguration = {startsAutomatically: false};
    };

    const onPlayerDestroy = useCallback(() => {
        console.log('DEMO', 'Player destroyed');
    }, []);

    return <THEOplayerView config={playerConfig} onPlayerReady={onPlayerReady} onPlayerDestroy={onPlayerDestroy}>
        {playerRef.current !== undefined && (
            <UiContainer
                theme={DEMO_THEME}
                player={playerRef.current}
            />
        )}
        {/* Render the title overlay outside UiContainer so it is always visible and not affected
            by the UI fade-in/fade-out animation on touch. */}
        <PlayerOverlay
            data={props.playlistData}
            style={{position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2}}
        />
    </THEOplayerView>
};

VideoPlayer.displayName = "VideoPlayer";
