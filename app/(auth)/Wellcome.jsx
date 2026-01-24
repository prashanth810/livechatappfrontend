import React from 'react';
import { StyleSheet, Text, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers';
import { Colors, spacingX, spacingY } from '../../constants/theme';
import { verticalScale } from '../../util/styling';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

// images 
import wellcome from '../../assets/images/welcome.png';
import Button from '../../components/Button';

const Wellcome = () => {
    const router = useRouter();

    const handlenavigate = () => {
        router.push('/(auth)/Register')
    }
    return (
        <ScreenWrapper showPattern={true} bgOpacity={0.5}>
            <View style={styles.container}>
                <View style={{ alignItems: "center" }}>
                    <Headers color={Colors.white} fontWeight={900} size={40}> Bubbly Chat </Headers>
                </View>
                <Animated.Image
                    entering={FadeIn.duration(700).springify()}
                    source={wellcome}
                    style={styles.wellcomeImage}
                    resizeMode={"contain"} />

                <View>
                    <Headers color={Colors.white} fontWeight={900} size={30}>  Stay connected </Headers>

                    <Headers color={Colors.white} fontWeight={900} size={30}>  with your friends  </Headers>

                    <Headers color={Colors.white} fontWeight={900} size={30}>  and family </Headers>
                </View>

                <Button style={{ backgroundColor: Colors.white }}
                    onPress={handlenavigate}>
                    <Headers size={22} fontWeight='bold'> Get Started </Headers>
                </Button>
            </View>
        </ScreenWrapper>
    )
}

export default Wellcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-around",
        paddingHorizontal: spacingX._20,
        marginVertical: spacingY._10,
    },
    background: {
        flex: 1,
        backgroundColor: Colors.neutral900,
    },
    wellcomeImage: {
        height: verticalScale(300),
        aspectRatio: 1,
        alignSelf: "center",
    }
})