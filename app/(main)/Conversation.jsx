import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers'
import { Colors, radius, spacingX, spacingY } from '../../constants/theme'
import { useLocalSearchParams } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchselfprofile } from '../../redux/slices/AuthSlce'
import HeadComponent from '../../components/HeadComponent';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import { scale, verticalScale } from '../../util/styling'
import Avatar, { uploadimagecloudinary } from '../../components/Avatar';
import MessagItems from '../../components/MessagItems'
import Inputs from '../../components/Inputs'
import * as ImagePicker from "expo-image-picker";
import Feather from 'react-native-vector-icons/Feather'
import Loading from '../../components/Loading'
import { getmessages, newmessage } from '../../sockets/SocketEvents'



const dummyMessages = [
    {
        id: "msg_1",
        sender: {
            id: "user_2",
            name: "Jane Smith",
            avatar: null,
        },
        content: "Hey! Did you check the new UI updates?",
        createdAt: "10:30 AM",
        isMe: false,
    },
    {
        id: "msg_2",
        sender: {
            id: "me",
            name: "Me",
            avatar: null,
        },
        content: "Yes! The design looks super clean 🔥",
        createdAt: "10:31 AM",
        isMe: true,
    },
    {
        id: "msg_3",
        sender: {
            id: "user_2",
            name: "Jane Smith",
            avatar: null,
        },
        content: "Nice 😄 We should also add dark mode support.",
        createdAt: "10:33 AM",
        isMe: false,
    },
    {
        id: "msg_4",
        sender: {
            id: "me",
            name: "Me",
            avatar: null,
        },
        content: "Already on my list. Working on theme toggle.",
        createdAt: "10:35 AM",
        isMe: true,
    },
    {
        id: "msg_5",
        sender: {
            id: "user_2",
            name: "Jane Smith",
            avatar: null,
        },
        content: "Perfect! That would really help users.",
        createdAt: "10:38 AM",
        isMe: false,
    },
    {
        id: "msg_6",
        sender: {
            id: "me",
            name: "Me",
            avatar: null,
        },
        content: "Yes, I'm thinking about adding message reactions and file sharing.",
        createdAt: "10:41 AM",
        isMe: true,
    },
    {
        id: "msg_7",
        sender: {
            id: "user_2",
            name: "Jane Smith",
            avatar: null,
        },
        content: "Whoa nice, this app is leveling up 🚀",
        createdAt: "10:42 AM",
        isMe: false,
    },
    {
        id: "msg_8",
        sender: {
            id: "me",
            name: "Me",
            avatar: null,
        },
        content: "Next step → voice notes 🎤",
        createdAt: "10:44 AM",
        isMe: true,
    },
    {
        id: "msg_9",
        sender: {
            id: "user_2",
            name: "Jane Smith",
            avatar: null,
        },
        content: "Whoa nice, this app is leveling up 🚀",
        createdAt: "10:42 AM",
        isMe: false,
    },
    {
        id: "msg_10",
        sender: {
            id: "me",
            name: "Me",
            avatar: null,
        },
        content: "Next step → voice notes 🎤",
        createdAt: "10:44 AM",
        isMe: true,
    },
];


const Conversation = () => {
    const [message, setMessage] = useState("");
    const [selectedfile, setSelectedfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allmessages, setAllmessages] = useState([]);

    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);


    useEffect(() => {
        newmessage(handlenewmessages);
        getmessages(handlegetmessages);
        getmessages({ conversationId });

        return () => {
            newmessage(handlenewmessages, true);
            getmessages(handlegetmessages, true);
        }
    }, [conversationId]);

    const handlenewmessages = (res) => {
        if (!res.success) return;

        const msg = {
            ...res.data,
            id: res.data._id,
            isMe: res.data.sender.id === profileuser._id,
        };

        setAllmessages(prev => [msg, ...prev]); // because list inverted
    };


    const handlegetmessages = (res) => {
        console.log("GET MESSAGES:", res);

        if (res.success) {
            const formatted = res.data.map(msg => ({
                ...msg,
                id: msg._id,              // 🔥 required for FlatList
                isMe: msg.sender.id === profileuser._id,
            }));

            setAllmessages(formatted);
        }
    };


    const {
        id: conversationId,
        name,
        participants: stringifiedparticipants,
        avatar,
        type,
    } = useLocalSearchParams();

    console.log({
        id: conversationId,
        name,
        participants: stringifiedparticipants,
        avatar,
        type,
    }, 'ppppppp')

    const participants = stringifiedparticipants ? JSON.parse(stringifiedparticipants) : [];

    let conversationavatar = avatar;
    const isDirect = type === "direct";

    const otherparticipants = isDirect ? participants.find((p) => p._id != profileuser._id) : null;

    if (isDirect && otherparticipants) conversationavatar = otherparticipants.avatar;

    let conversationName = isDirect ? otherparticipants.name : name;

    const onPickfiles = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            aspect: [4, 3],
            quality: 0.5,
        });
        console.log(result);

        if (!result.canceled) {
            setSelectedfile(result.assets[0])
        }

    }


    const hanldesendmessages = async () => {
        if (!message.trim() && !selectedfile) return;
        if (!profileuser._id) return;
        setLoading(true);

        try {
            let attachements = null;
            if (selectedfile) {
                const uploadresults = await uploadimagecloudinary(
                    selectedfile,
                    "message-attachements"
                );
                if (uploadresults.success) {
                    attachements = uploadresults.data;
                }
                else {
                    setLoading(false);
                    Alert.alert("error failed to send image !");
                }
            }

            newmessage({
                conversationId,
                sender: {
                    id: profileuser._id,
                    name: profileuser.fullName,
                    avatar: profileuser.avatar,
                },
                content: message.trim() || "",
                attachement: attachements || null, // ✅ same name as backend
            });

            console.log(attachements, 'aaaaaaaaaaaa');
            // 🔥 RESET AFTER SUCCESS
            setMessage("");
            setSelectedfile(null);
            setLoading(false)
        }
        catch (error) {
            console.log("error message", error);
            Alert.alert("error message", error);
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <ScreenWrapper showPattern={true} bgOpacity={0.5}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container} >

                <HeadComponent style={styles.header}
                    leftIcon={<View style={styles.headerleft}>
                        <FontAwesome name="angle-left" size={verticalScale(25)} color={Colors.white} />
                        <Avatar size={40} uri={conversationavatar}
                            isGroup={type} />

                        <Headers color={Colors.white}>
                            {conversationName}
                        </Headers>
                    </View>}
                    rightIcon={<TouchableOpacity style={{ marginBottom: verticalScale(8) }}>
                        <Entypo name="dots-three-vertical" color={Colors.white} size={20} />
                    </TouchableOpacity>} />

                {/* messages  */}
                <View style={styles.content}>
                    <FlatList
                        data={allmessages}
                        inverted={true}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.messageconentent}
                        renderItem={({ item }) => (
                            <MessagItems item={item} isDirect={isDirect} />
                        )}
                        keyExtractor={(item, i) => item.id || i}
                    />

                    <View style={styles.footer}>
                        <Inputs
                            value={message}
                            onChangeText={setMessage}
                            contentContainerStyle={{
                                paddingLeft: spacingX._10,
                                paddingRight: scale(65),
                                borderWidth: 0
                            }}
                            placeholder="Type Message..."
                            icon={
                                <TouchableOpacity style={styles.inputIcon} onPress={onPickfiles}>
                                    <Entypo name="plus" size={verticalScale(22)}
                                        color={Colors.black} />

                                    {selectedfile && selectedfile.uri && (
                                        <Image source={{ uri: selectedfile.uri }}
                                            style={styles.selectedimage}
                                        />
                                    )}
                                </TouchableOpacity>
                            }
                        />


                        <View style={styles.inputrighticon}>
                            <TouchableOpacity style={styles.inputIcon} onPress={hanldesendmessages}>
                                {loading ? (
                                    <Loading loading={loading} size='small' color={Colors.black} />
                                ) : (
                                    <Feather name="send"
                                        color={Colors.black} size={verticalScale(22)}
                                    />
                                )}

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    )
}

export default Conversation

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacingX._15,
        paddingTop: spacingY._10,
        paddingBottom: spacingY._15,
    },
    headerleft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._20,
    },
    content: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: radius._50,
        borderTopRightRadius: radius._50,
        borderCurve: "continuous",
        overflow: "hidden",
        paddingHorizontal: spacingX._15,
    },
    footer: {
        paddingTop: spacingY._7,
        paddingBottom: verticalScale(22),
    },
    inputrighticon: {
        position: "absolute",
        right: scale(10),
        top: verticalScale(15),
        // paddingLeft: spacingX._12,
        borderWidth: 1,
        borderColor: Colors.neutral300,
        borderRadius: radius.full,
    },
    inputIcon: {
        backgroundColor: Colors.primary,
        borderRadius: radius.full,
        padding: 8
    },
    selectedimage: {
        position: 'absolute',
        height: verticalScale(35),
        width: verticalScale(35),
        borderRadius: radius.full,
        alignSelf: "center",
    },
})