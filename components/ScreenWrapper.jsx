import { Dimensions, ImageBackground, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';
import bgPattern from '../assets/images/bgPattern.png'


const height = Dimensions.get("window");
const ScreenWrapper = ({ children, style, showPattern = false, isModel = false, bgOpacity = 1, }) => {

    let paddingTop = Platform.OS == "ios" ? height * 0.06 : 40;
    let paddingBottom = 0;

    if (isModel) {
        paddingTop = Platform.OS == "ios" ? height * 0.02 : 45;
        paddingBottom = height * 0.02;
    }

    return (
        <ImageBackground
            style={{
                flex: 1,
                backgroundColor: isModel ? Colors.white : Colors.neutral900,
            }}
            source={bgPattern}
        >
            <View
                style={[
                    {
                        paddingTop,
                        paddingBottom,
                        flex: 1,
                    },
                    style,
                ]}
            >
                <StatusBar barStyle={"light-content"} backgroundColor={'transparent'} />
                {children}
            </View>
        </ImageBackground>
    )
}

export default ScreenWrapper 