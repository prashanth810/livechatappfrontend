import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers'
import { Colors, radius, spacingX, spacingY } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import { disconnectSocket } from '../../sockets/Socket';
import { getconversation, Testingsocket, newcpncersation, newmessage } from '../../sockets/SocketEvents';
import { verticalScale } from '../../util/styling';
import { useDispatch, useSelector } from 'react-redux';
import { fetchselfprofile } from '../../redux/slices/AuthSlce';
import { FontAwesome6 } from 'react-native-vector-icons0;'
import Conversationmessages from '../../components/Conversationmessages';
import Loading from '../../components/Loading';
import Entypo from 'react-native-vector-icons/Entypo'


const Home = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [selectedtab, setSelectedtab] = useState(0);
    const [conversation, setConversation] = useState([]);

    // need to remove not needed 
    useEffect(() => {
        Testingsocket(handler);
        Testingsocket(null);

        return () => {
            Testingsocket(handler, true); // cleanup
        };
    }, []);

    // Ref so the socket callback is never stale
    const procesgetconversationRef = useRef(null);

    procesgetconversationRef.current = (data) => {
        console.log(data, 'homeeeeeeeeee');
        setLoading(false);
        if (data?.success && data?.data) {
            setConversation(data.data);
        }
    };

    // When newcpncersation fires, just re-fetch the list
    const handlenewcpncersationRef = useRef(null);

    handlenewcpncersationRef.current = (data) => {
        console.log("🆕 New conversation event in Home, refetching...");
        if (data?.success) {
            getconversation(); // re-emit to refresh list
        }
    };

    // Stable wrappers — registered once, always call latest ref
    const stableGetConversationHandler = useRef((data) => {
        procesgetconversationRef.current?.(data);
        console.log(data, 'ddddddddddddddddd');
    }).current;

    const stableNewConversationHandler = useRef((data) => {
        handlenewcpncersationRef.current?.(data);
    }).current;

    // Register listeners once
    useEffect(() => {
        getconversation(stableGetConversationHandler);
        newcpncersation(stableNewConversationHandler);
        newmessage(handlenewmesssages);

        return () => {
            getconversation(stableGetConversationHandler, true);
            newcpncersation(stableNewConversationHandler, true);
            newmessage(handlenewmesssages, true);
        }
    }, []);

    // Re-fetch every time Home screen comes into focus (e.g. navigating back)
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            getconversation(); // emit to fetch
        }, [])
    );

    const handler = (data) => {
        console.log("Received:", data);
    };

    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);


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

    // Normalize raw server data into shape Conversationmessages expects
    const processConversations = (data) => {
        const myId = profileuser?._id?.toString();

        return data.map((item) => {
            let name = item.name || "";
            let avatar = item.avatar || null;

            if (item.type === "direct") {
                // participants can be ObjectId strings or populated objects
                const other = item.participants?.find((p) => {
                    const pid = p?._id ? p._id.toString() : p?.toString();
                    return pid !== myId;
                });

                // other could be a populated object { _id, fullName, avatar } or just an ObjectId string
                if (other && typeof other === "object" && other._id) {
                    name = other.fullName || other.name || "Unknown";
                    avatar = other.avatar || null;
                } else {
                    // not populated — just show the raw id as fallback
                    name = "User";
                    avatar = null;
                }
            }

            return {
                ...item,
                _id: item._id?.toString(),
                name: name,
                avatar: avatar,
                // lastMessage might not exist yet — give a safe default
                lastMessage: item.lastMessage || null,
            };
        });
    };

    const processed = profileuser?._id ? processConversations(conversation) : [];

    const directmessages = processed.filter((item) => item.type === "direct").sort((a, b) => {
        const adata = a?.lastMessage?.createdAt || a.createdAt;
        const bdata = b?.lastMessage?.createdAt || b.createdAt;
        return new Date(bdata).getTime() - new Date(adata)
            .getTime();
    })

    const groupmessages = processed.filter((item) => item.type === "group").sort((a, b) => {
        const adata = a?.lastMessage?.createdAt || a.createdAt;
        const bdata = b?.lastMessage?.createdAt || b.createdAt;
        return new Date(bdata).getTime() - new Date(adata)
            .getTime();
    })


    const handlenewmesssages = (res) => {
        if (res.success) {
            let conversationId = res.data.conversationdata;
            setConversation((prev) => {
                let updatedconverstion = prev.map((item, i) => {
                    if (item._id == conversationId) item.lastMessage = res.data;
                    return item;
                });
                return updatedconverstion;
            })
        }
    }



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