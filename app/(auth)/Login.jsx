import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import { Colors, radius, spacingX, spacingY } from '../../constants/theme'
import BackButton from '../../components/BackButton';
import Headers from '../../components/Headers';
import Inputs from '../../components/Inputs';
import Fontisto from 'react-native-vector-icons/Fontisto';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import { verticalScale } from '../../util/styling';
import Button from '../../components/Button';
import { handlelogin } from '../../redux/slices/AuthSlce';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket } from '../../sockets/Socket';


const Login = () => {
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [isLoasing, setIsLoading] = useState(false);
    const router = useRouter();

    const dispatch = useDispatch();
    const { loginloading } = useSelector((state) => state.authslice.logindata);

    const handlesubmit = async () => {
        const email = emailRef.current;
        const password = passwordRef.current;

        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Error", "Please fill all fields!");
            return;
        }

        const data = {
            email,
            password,
        };

        try {
            // 🔥 wait for API result
            const res = await dispatch(handlelogin(data)).unwrap();
            const token = res?.token;
            await AsyncStorage.setItem("token", token);

            if (token) {
                // socket connection makes 
                await connectSocket();
                router.replace("/(main)/Home");
            }

        } catch (error) {
            // ❌ ERROR → show backend message
            Alert.alert(
                "Login Failed",
                error || "Invalid email or password"
            );
        }
    };



    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : "height"}>
            <ScreenWrapper showPattern={true}>
                <View style={styles.container}>
                    <View style={styles.header} >
                        <BackButton iconSize={28} />
                        <Headers size={14} color={Colors.white}>
                            Forgot your password
                        </Headers>
                    </View>

                    <View style={styles.content}>
                        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} >
                            <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
                                <Headers size={28} fontWeight={600}>
                                    Wellcome back
                                </Headers>

                                <Headers color={Colors.neutral600}>
                                    We are happy to see you
                                </Headers>
                            </View>

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
                                <Button loading={loginloading} onPress={handlesubmit}>
                                    <Headers fontWeight='bold' color={Colors.black} size={20}> Login </Headers>
                                </Button>

                                <View style={styles.footer}>
                                    <Text> Don't have an account?  </Text>
                                    <Pressable onPress={() => router.push("/(auth)/Register")}>
                                        <Headers color={Colors.primaryDark} fontWeight='bold'> Sing Up </Headers>
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

export default Login

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