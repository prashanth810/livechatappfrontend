import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers'
import { Colors, radius, spacingX, spacingY } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import { disconnectSocket } from '../../sockets/Socket';
import { Testingsocket } from '../../sockets/SocketEvents';
import { verticalScale } from '../../util/styling';
import { useDispatch, useSelector } from 'react-redux';
import { fetchselfprofile } from '../../redux/slices/AuthSlce';
import { FontAwesome6 } from 'react-native-vector-icons0;'
import Conversationmessages from '../../components/Conversationmessages';
import Loading from '../../components/Loading';
import Entypo from 'react-native-vector-icons/Entypo'

const conversations = [
    {
        name: "Project Team",
        type: "group",
        lastMessage: {
            senderName: "Sarah",
            content: "Meeting rescheduled to 3pm tomorrow.",
            createdAt: "2025-06-21T14:10:00Z",
        },
    },
    {
        name: "Bob",
        type: "direct",
        lastMessage: {
            // attachment: { uri: "image.png" },
            senderName: "Bob",
            content: "Can you send the files?",
            createdAt: "2025-06-23T09:30:00Z",
        },
    },
    {
        name: "Family Group",
        type: "group",
        lastMessage: {
            senderName: "Mom",
            content: "Dinner is ready 🍲",
            createdAt: "2025-06-24T19:05:00Z",
        },
    },
    {
        name: "Design Squad",
        type: "group",
        lastMessage: {
            senderName: "Arjun",
            content: "New UI screens are uploaded to Figma.",
            createdAt: "2025-06-24T11:45:00Z",
        },
    },
    {
        name: "Akhil",
        type: "direct",
        lastMessage: {
            senderName: "Akhil",
            content: "Bro where are you?",
            createdAt: "2025-06-25T17:12:00Z",
        },
    },
    {
        name: "Office HR",
        type: "group",
        lastMessage: {
            senderName: "HR Team",
            content: "Salary credited 💰",
            createdAt: "2025-06-25T10:00:00Z",
        },
    },
    {
        name: "Ritika",
        type: "direct",
        lastMessage: {
            senderName: "You",
            content: "I'll call you later.",
            createdAt: "2025-06-25T20:18:00Z",
        },
    },
];



const Home = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedtab, setSelectedtab] = useState(0);

    // need to remove not needed 
    useEffect(() => {
        Testingsocket(handler);
        Testingsocket(null);

        return () => {
            Testingsocket(handler, true); // cleanup
        };
    }, []);

    const handler = (data) => {
        console.log("Received:", data);
    };

    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);


    console.log(profileuser, ' uuuuuuuuuuuuuuuuuuuu')

    const handlelogout = async () => {
        try {
            setLoading(true);

            // 1️⃣ Disconnect socket first
            disconnectSocket();

            // 2️⃣ Remove token
            await AsyncStorage.removeItem("token");

            // 3️⃣ Navigate
            router.replace("/(auth)/Login");
        } catch (err) {
            console.log("❌ Logout error:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleopenprofile = () => {
        router.push("/(profile)/ProfileModel");
    }

    const directmessages = conversations.filter((item) => item.type === "direct").sort((a, b) => {
        const adata = a?.lastMessage?.createdAt || a.createdAt;
        const bdata = b?.lastMessage?.createdAt || b.createdAt;
        return new Date(bdata).getTime() - new Date(adata)
            .getTime();
    })

    const groupmessages = conversations.filter((item) => item.type === "group").sort((a, b) => {
        const adata = a?.lastMessage?.createdAt || a.createdAt;
        const bdata = b?.lastMessage?.createdAt || b.createdAt;
        return new Date(bdata).getTime() - new Date(adata)
            .getTime();
    })

    // const directmessages = [];
    // const groupmessages = [];



    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Headers
                            color={Colors.neutral200}
                            size={17}
                            textProps={{ numberOfLines: 1 }} >
                            WelCome back,{" "}
                            <Text style={{ color: Colors.white, fontSize: 20, fontWeight: "800" }}>
                                {profileuser?.fullName}
                            </Text>
                            <Text> 👋 </Text>
                        </Headers>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.settingicon} onPress={handleopenprofile}>
                            <FontAwesome6 name="gear" size={verticalScale(20)} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.content}>
                    <ScrollView showsVerticalScrollIndicator={false}
                        style={{ paddingVertical: spacingY._20 }} >
                        <View style={styles.navbar}>
                            <View style={styles.tabs}>
                                <TouchableOpacity style={[styles.tabstyle, selectedtab === 0 && styles.activetabstyles]} onPress={() => setSelectedtab(0)}>
                                    <Headers> Message </Headers>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.tabstyle, selectedtab === 1 && styles.activetabstyles]} onPress={() => setSelectedtab(1)}>
                                    <Headers> Groups </Headers>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.conersationlist}>
                            {
                                selectedtab === 0 && directmessages.map((mes, i) => {
                                    return (
                                        <Conversationmessages key={i} item={mes} router={router}
                                            showDivider={directmessages.length != i + 1} />
                                    )
                                })

                            }


                            {
                                selectedtab === 1 && groupmessages.map((mes, i) => {
                                    return (
                                        <Conversationmessages key={i} item={mes} router={router}
                                            showDivider={groupmessages.length != i + 1} />
                                    )
                                })
                            }

                            {!loading && selectedtab === 0 && directmessages.length === 0 && (
                                <Headers style={{ textAlign: "center", paddingTop: verticalScale(20) }}>  You don't have messages  </Headers>
                            )}

                            {!loading && selectedtab === 1 && groupmessages.length === 0 && (
                                <Headers style={{ textAlign: "center", paddingTop: verticalScale(20) }}>  You haven't joined any groups </Headers>
                            )}


                            {loading && <Loading />}
                        </View>
                    </ScrollView>
                </View>
            </View>

            <Button style={styles.floatbutton}
                onPress={() => router.push({
                    pathname: "/(modal)/NewconversationModel",
                    params: { isGroup: selectedtab }
                })}>
                <Entypo name="plus" size={verticalScale(20)} fontWeight="bold" color={Colors.black} /> </Button>
        </ScreenWrapper>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        paddingHorizontal: spacingX._20,
        gap: spacingY._15,
        paddingTop: spacingY._15,
        paddingBottom: spacingY._20,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: radius._50,
        borderTopRightRadius: radius._50,
        borderCurve: "continuous",
        overflow: "hidden",
        paddingHorizontal: spacingX._20,
    },
    navbar: {
        flexDirection: "row",
        gap: spacingX._15,
        alignItems: 'center',
        paddingHorizontal: spacingX._10,
    },
    tabs: {
        flex: 1,
        flexDirection: "row",
        gap: spacingX._10,
        justifyContent: "center",
        alignItems: "center",
    },
    tabstyle: {
        paddingVertical: spacingY._10,
        paddingHorizontal: spacingX._20,
        borderRadius: radius.full,
        backgroundColor: Colors.neutral100,
    },
    activetabstyles: {
        backgroundColor: Colors.primaryLight,
    },
    conersationlist: {
        paddingVertical: spacingY._10,
    },
    settingicon: {
        padding: spacingY._10,
        backgroundColor: Colors.neutral700,
        borderRadius: radius.full,
    },
    floatbutton: {
        height: verticalScale(40),
        width: verticalScale(40),
        borderRadius: 100,
        position: "absolute",
        bottom: verticalScale(30),
        right: verticalScale(30),
        paddingLeft: 4,
        paddingTop: 2
    }
})