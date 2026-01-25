import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import splashimage from '../assets/images/splashImage.png';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket } from '../sockets/Socket';


const index = () => {
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            await connectSocket();
            if (token) {
                // ✅ User already logged in
                setTimeout(() => {
                    router.replace("/(main)/Home");
                }, 1500);
            } else {
                // ❌ Not logged in
                setTimeout(() => {
                    router.replace("/(auth)/Login");
                }, 1500);
            }
        } catch (err) {
            setTimeout(() => {
                router.replace("/(auth)/Login");
            }, 1500);
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <StatusBar barStyle={"light-content"} backgroundColor={Colors.neutral900} />

            <Animated.Image
                source={splashimage}
                entering={FadeInDown.duration(700).springify()}
                style={styles.mainlogo}
                resizeMode={"contain"}
            />
        </ScreenWrapper>
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