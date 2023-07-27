import * as React from "react";
import { View, StyleProp, ViewStyle, Text} from "react-native";
import { PlayListData } from "./PlayListData";

export interface PlayerOverlayProps {
    style?: StyleProp<ViewStyle>;
    data: PlayListData;
}

export const PlayerOverlay = (props: PlayerOverlayProps) => {
    const { data } = props;
    return (
        <View style={[{margin: 15}, props.style]}>
            <Text style={{backgroundColor: 'transparent', color: 'white', fontSize: 18}}>{`${data.index}: ${data.name}`}</Text>
        </View>
    );
};
