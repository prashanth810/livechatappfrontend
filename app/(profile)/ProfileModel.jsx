import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors, spacingX, spacingY } from '../../constants/theme';
import { useRouter } from 'expo-router';
import HeadComponent from '../../components/HeadComponent';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import Avatar, { uploadimagecloudinary } from '../../components/Avatar';
import { scale, verticalScale } from '../../util/styling';
import Headers from '../../components/Headers';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Button from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { disconnectSocket } from '../../sockets/Socket';
import { fetchselfprofile, logout } from '../../redux/slices/AuthSlce';
import { useDispatch, useSelector } from 'react-redux';
import { updateprofile } from '../../sockets/SocketEvents';
import * as ImagePicker from "expo-image-picker";


const ProfileModel = () => {
    const router = useRouter();
    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
    })
    const [isEditable, setIsEditable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    useEffect(() => {
        if (profileuser) {
            setUserData({
                fullName: profileuser.fullName || "",
                email: profileuser.email || "",
            });
        }
    }, [profileuser]);


    const handleclose = () => {
        router.back();
    }

    useEffect(() => {
        updateprofile(profileupdate);

        return () => {
            updateprofile(profileupdate, true);
        }
    }, []);

    const profileupdate = (data) => {
        console.log(data, 'dddddddddddd');
        setLoading(false);
        if (data.success) {
            AsyncStorage.setItem("token", data.data.token);
        }
        else {
            Alert.alert("profile updates failed !!!");
        }
    }

    const handlechange = (name, value) => {
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handlesubmit = async () => {
        const { fullName, avatar } = userData;

        if (!fullName.trim()) {
            Alert.alert("Fullname is required !!!");
            return;
        }

        if (avatar && avatar?.uri) {
            setLoading(true);
            const res = await uploadimagecloudinary(avatar, "profiles");
            if (res.success) {
                userData.avatar = res.data;
            }
            else {
                Alert.alert("user", res.message);
                setLoading(false);
                return;
            }
        }

        updateprofile(userData); // ✅ update only here
    };


    const handlelogoutmodel = () => {
        setShowLogoutModal(true);
    };


    const handlepicimage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            aspect: [4, 3],
            quality: 0.5,
        });
        console.log(result);

        if (!result.canceled) {
            setUserData({ ...userData, avatar: result.assets[0] });
        }
    }

    const handleLogout = async () => {
        try {
            setLoading(true);

            disconnectSocket(); // no await needed
            await AsyncStorage.removeItem("token");

            router.replace("/(auth)/Login");
        } catch (err) {
            console.log("Logout error:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <ScreenWrapper isModel={true}>
            <View style={styles.container}>

                {/* 🔹 HEADER */}
                <View style={styles.header}>
                    <HeadComponent title={"Update profile"}
                        rightIcon={<Text />}
                        leftIcon={<Entypo name='chevron-left' size={verticalScale(25)} color={Colors.white} />}
                        onRightPress={handleclose}
                    />
                </View>

                {/* 🔹 CONTENT */}
                <ScrollView style={styles.form}>
                    <View style={styles.avatarContainer}>
                        <Avatar uri={userData.avatar} size={115} />
                        <TouchableOpacity style={styles.editicons} onPress={handlepicimage}>
                            <FontAwesome name='pencil' size={verticalScale(20)} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ gap: spacingY._20, paddingTop: verticalScale(40) }}>
                        <View style={styles.inputcontainer}>
                            <Headers color={Colors.white} > Full Name </Headers>

                            <TextInput
                                value={userData.fullName}
                                placeholder="Enter full name..."
                                placeholderTextColor="#888"
                                style={styles.input}
                                onChangeText={(text) => handlechange("fullName", text)}
                            />

                        </View>

                        <View style={styles.inputcontainer}>
                            <Headers color={Colors.white} > Email </Headers>

                            <TextInput
                                value={userData.email}
                                placeholder="Enter email..."
                                placeholderTextColor="#888"
                                style={styles.input}
                                onChangeText={(text) => handlechange("email", text)}
                            />

                        </View>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.footer}>
                {!loading && (
                    <Button style={styles.logoutbutton} onPress={handlelogoutmodel}>
                        <MaterialIcons name="logout" size={verticalScale(25)} color={Colors.neutral300} />
                    </Button>
                )}

                <Button style={{ flex: 1 }} onPress={handlesubmit} loading={loading}>
                    <Headers color={Colors.black} size={verticalScale(17)} fontWeight='900'> Update </Headers>
                </Button>
            </View>

            {showLogoutModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <MaterialIcons name="logout" size={40} color={Colors.rose} />

                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to logout?
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.logoutBtn]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

        </ScreenWrapper>
    );
};

export default ProfileModel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingY._20,
    },

    header: {
        paddingTop: spacingY._15,
        paddingBottom: spacingY._20,
    },

    content: {
        flex: 1,
        justifyContent: "flex-start",
    },
    avatarContainer: {
        position: 'relative',
        alignSelf: "center",
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15,
    },
    editicons: {
        position: "absolute",
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        backgroundColor: Colors.neutral400,
        shadowColor: Colors.neutral600,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        elevation: 10,
        padding: spacingY._7,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderWidth: 1,
        borderBottomColor: Colors.neutral200,
        paddingBottom: spacingY._10,
        paddingVertical: 10,
    },
    logoutbutton: {
        backgroundColor: Colors.rose,
        height: verticalScale(60),
        width: verticalScale(60),
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        width: "85%",
        backgroundColor: "#1e1e1e",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
    },

    modalTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
    },

    modalText: {
        color: Colors.neutral300,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 20,
    },

    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },

    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    cancelBtn: {
        backgroundColor: Colors.neutral700,
    },

    logoutBtn: {
        backgroundColor: Colors.rose,
    },

    cancelText: {
        color: Colors.white,
        fontWeight: "600",
    },

    logoutText: {
        color: "white",
        fontWeight: "bold",
    },
    inputcontainer: {
        rowGap: verticalScale(10),
    },
    input: {
        backgroundColor: "#1E1E1E",     // dark card look
        borderWidth: 1,
        borderColor: "#333",            // soft border
        color: "#fff",
        paddingVertical: verticalScale(15),
        paddingHorizontal: spacingX._20,
        borderRadius: 12,
        fontSize: verticalScale(15),
        paddingLeft: verticalScale(15),

        // depth effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

});
