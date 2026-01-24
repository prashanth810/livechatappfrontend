import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers'
import { Colors } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';

const Home = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handlelogout = async () => {
        setLoading(true);
        await AsyncStorage.removeItem("token");
        setTimeout(() => {
            router.replace("/(auth)/Login");
            setLoading(false);
        }, 1000);
    }
    return (
        <ScreenWrapper>
            <Headers color={Colors.white}>Home</Headers>
            <Button onPress={handlelogout} loading={loading}>
                <Headers> Logout </Headers>
            </Button>
        </ScreenWrapper>
    )
}

export default Home

const styles = StyleSheet.create({})