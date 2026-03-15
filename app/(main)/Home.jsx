import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native'
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
import Entypo from 'react-native-vector-icons/Entypo'

// ── Skeleton components ──────────────────────────────────────────
const SkeletonBox = ({ width, height, borderRadius = 8, style }) => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

    return (
        <Animated.View
            style={[{ width, height, borderRadius, backgroundColor: Colors.neutral200, opacity }, style]}
        />
    );
};

const ConversationSkeleton = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacingY._10, gap: spacingX._10 }}>
        {/* Avatar circle */}
        <SkeletonBox width={verticalScale(48)} height={verticalScale(48)} borderRadius={100} />
        {/* Name + last message */}
        <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="55%" height={14} borderRadius={6} />
            <SkeletonBox width="80%" height={11} borderRadius={6} />
        </View>
        {/* Time */}
        <SkeletonBox width={40} height={11} borderRadius={6} />
    </View>
);

const HomeSkeleton = () => (
    <View style={{ paddingVertical: spacingY._10 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <ConversationSkeleton key={i} />
        ))}
    </View>
);
// ─────────────────────────────────────────────────────────────────

const Home = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [selectedtab, setSelectedtab] = useState(0);
    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        Testingsocket(handler);
        Testingsocket(null);
        return () => {
            Testingsocket(handler, true);
        };
    }, []);

    const procesgetconversationRef = useRef(null);
    procesgetconversationRef.current = (data) => {
        setLoading(false);
        if (data?.success && data?.data) {
            setConversation(data.data);
        }
    };

    const handlenewcpncersationRef = useRef(null);
    handlenewcpncersationRef.current = (data) => {
        if (data?.success) {
            getconversation();
        }
    };

    const stableGetConversationHandler = useRef((data) => {
        procesgetconversationRef.current?.(data);
    }).current;

    const stableNewConversationHandler = useRef((data) => {
        handlenewcpncersationRef.current?.(data);
    }).current;

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

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            getconversation();
        }, [])
    );

    const handler = (data) => {
        console.log("Received:");
    };

    const dispatch = useDispatch();
    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    const handleopenprofile = () => {
        router.push("/(profile)/ProfileModel");
    }

    const processConversations = (data) => {
        const myId = profileuser?._id?.toString();
        return data.map((item) => {
            let name = item.name || "";
            let avatar = item.avatar || null;
            if (item.type === "direct") {
                const other = item.participants?.find((p) => {
                    const pid = p?._id ? p._id.toString() : p?.toString();
                    return pid !== myId;
                });
                if (other && typeof other === "object" && other._id) {
                    name = other.fullName || other.name || "Unknown";
                    avatar = other.avatar || null;
                } else {
                    name = "User";
                    avatar = null;
                }
            }
            return {
                ...item,
                _id: item._id?.toString(),
                name,
                avatar,
                lastMessage: item.lastMessage || null,
            };
        });
    };

    const processed = profileuser?._id ? processConversations(conversation) : [];

    const directmessages = processed.filter((item) => item.type === "direct").sort((a, b) => {
        const adata = a?.lastMessage?.createdAt || a.createdAt;
        const bdata = b?.lastMessage?.createdAt || b.createdAt;
        return new Date(bdata).getTime() - new Date(adata).getTime();
    });

    const groupmessages = processed.filter((item) => item.type === "group").sort((a, b) => {
        const adata = a?.lastMessage?.createdAt || a.createdAt;
        const bdata = b?.lastMessage?.createdAt || b.createdAt;
        return new Date(bdata).getTime() - new Date(adata).getTime();
    });

    const handlenewmesssages = (res) => {
        if (res.success) {
            let conversationId = res.data.conversationdata;
            setConversation((prev) => {
                return prev.map((item) => {
                    if (item._id == conversationId) item.lastMessage = res.data;
                    return item;
                });
            });
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Headers
                            color={Colors.neutral200}
                            size={17}
                            textProps={{ numberOfLines: 1 }}>
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
                    <ScrollView showsVerticalScrollIndicator={false} style={{ paddingVertical: spacingY._20 }}>
                        <View style={styles.navbar}>
                            <View style={styles.tabs}>
                                <TouchableOpacity
                                    style={[styles.tabstyle, selectedtab === 0 && styles.activetabstyles]}
                                    onPress={() => setSelectedtab(0)}>
                                    <Headers> Message </Headers>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabstyle, selectedtab === 1 && styles.activetabstyles]}
                                    onPress={() => setSelectedtab(1)}>
                                    <Headers> Groups </Headers>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.conersationlist}>
                            {/* ✅ Skeleton replaces Loading component */}
                            {loading && <HomeSkeleton />}

                            {!loading && selectedtab === 0 && directmessages.map((mes, i) => (
                                <Conversationmessages key={i} item={mes} router={router}
                                    showDivider={directmessages.length != i + 1} />
                            ))}

                            {!loading && selectedtab === 1 && groupmessages.map((mes, i) => (
                                <Conversationmessages key={i} item={mes} router={router}
                                    showDivider={groupmessages.length != i + 1} />
                            ))}

                            {!loading && selectedtab === 0 && directmessages.length === 0 && (
                                <Headers style={{ textAlign: "center", paddingTop: verticalScale(20) }}>
                                    You don't have messages
                                </Headers>
                            )}

                            {!loading && selectedtab === 1 && groupmessages.length === 0 && (
                                <Headers style={{ textAlign: "center", paddingTop: verticalScale(20) }}>
                                    You haven't joined any groups
                                </Headers>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>

            <Button style={styles.floatbutton}
                onPress={() => router.push({
                    pathname: "/(modal)/NewconversationModel",
                    params: { isGroup: selectedtab }
                })}>
                <Entypo name="plus" size={verticalScale(20)} fontWeight="bold" color={Colors.black} />
            </Button>
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        paddingTop: 2,
    }
});