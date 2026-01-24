import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { Colors, radius, spacingX, spacingY } from '../../constants/theme'
import BackButton from '../../components/BackButton';
import Headers from '../../components/Headers';
import Inputs from '../../components/Inputs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import { verticalScale } from '../../util/styling';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { handleregister } from '../../redux/slices/AuthSlce';
import { current } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Register = () => {
    const nameRef = useRef("");
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [isLoasing, setIsLoading] = useState(false);
    const router = useRouter();

    const dispatch = useDispatch();

    const { risteruser, registerloading, registererror } = useSelector((state) => state.authslice.regisetdata);


    const handlesubmit = async () => {
        // Trim values
        const fullName = nameRef.current?.trim();
        const email = emailRef.current?.trim();
        const password = passwordRef.current?.trim();

        // 🔴 Empty validation
        if (!fullName || !email || !password) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        // 🔴 fullName validation
        if (fullName.length < 5) {
            Alert.alert("Error", "fullName must be at least 5 characters");
            return;
        }

        // 🔴 Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // 🔴 Password validation
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        const data = {
            fullName,
            email,
            password,
            avatar: "https://wallpapercave.com/wp/wp12606121.jpg"
        };

        try {
            const res = await dispatch(handleregister(data)).unwrap();
            const token = res.token;
            AsyncStorage.setItem("token", token);
            // ✅ Success
            Alert.alert("Success", "Registration successful!", [
                {
                    text: "Go to Login",
                    onPress: () => router.replace("/(auth)/Login"),
                },
            ]);
        } catch (err) {
            Alert.alert("Error", err || "Registration failed");
            console.log(err, 'error message');
        }
    };



    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : "height"}>
            <ScreenWrapper showPattern={true}>
                <View style={styles.container}>
                    <View style={styles.header} >
                        <BackButton iconSize={28} />
                        <Headers size={14} color={Colors.white}>
                            Need some help
                        </Headers>
                    </View>

                    <View style={styles.content}>
                        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} >
                            <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
                                <Headers size={28} fontWeight={600}>
                                    Geting Started
                                </Headers>

                                <Headers color={Colors.neutral600}>
                                    Create an account to continue
                                </Headers>
                            </View>

                            <Inputs placeholder="Enter Your Name ..."
                                icon={<FontAwesome name="user-o" size={verticalScale(20)} color={Colors.neutral500} />}
                                onChangeText={(e) => nameRef.current = e}
                            />

                            <Inputs placeholder="Enter Your Email ..."
                                icon={<Fontisto name="email" size={verticalScale(20)} color={Colors.neutral500} />}
                                onChangeText={(e) => emailRef.current = e}
                            />

                            <Inputs placeholder="Enter Your password ..."
                                icon={<SimpleLineIcons name="lock" size={verticalScale(20)} color={Colors.neutral500} />}
                                secureTextEntry
                                onChangeText={(e) => passwordRef.current = e}
                            />

                            <View style={{ marginTop: spacingY._25, gap: spacingY._15 }}>
                                <Button loading={registerloading} onPress={handlesubmit}>
                                    <Headers fontWeight='bold' color={Colors.black} size={20}> Sign Up </Headers>
                                </Button>

                                <View style={styles.footer}>
                                    <Text> Alredy have an account?  </Text>
                                    <Pressable onPress={() => router.push("/(auth)/Login")}>
                                        <Headers color={Colors.primaryDark} fontWeight='bold'> Login </Headers>
                                    </Pressable>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    header: {
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._15,
        paddingBottom: spacingY._25,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    content: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopRightRadius: radius._50,
        borderTopLeftRadius: radius._50,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._20,
    },
    form: {
        gap: spacingY._15,
        marginTop: spacingY._20,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    }

})