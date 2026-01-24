import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import splashimage from '../assets/images/splashImage.png';
import { useRouter } from 'expo-router';


const index = () => {
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            router.replace("/(auth)/Wellcome")
        }, 1500);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={"light-content"} backgroundColor={Colors.neutral900} />

            <Animated.Image
                source={splashimage}
                entering={FadeInDown.duration(700).springify()}
                style={styles.mainlogo}
                resizeMode={"contain"}
            />
        </SafeAreaView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.neutral900,
    },
    mainlogo: {
        height: "23%",
        aspectRatio: 1,
    }
})