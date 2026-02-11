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


const Conversation = () => {
    const [message, setMessage] = useState("");
    const [selectedfile, setSelectedfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allmessages, setAllmessages] = useState([]);


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

    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    // Determine conversation details
    let conversationavatar = avatar;
    const isDirect = type === "direct";

    const otherparticipants = isDirect ? participants.find((p) => p._id != profileuser?._id) : null;

    if (isDirect && otherparticipants) conversationavatar = otherparticipants.avatar;

    let conversationName = isDirect ? otherparticipants?.name : name;


    useEffect(() => {
        if (!conversationId || !profileuser?._id) return;

        // Register listeners
        newmessage(handlenewmessages);
        getmessages(handlegetmessages);

        // Fetch messages for this conversation
        getmessages({ conversationId });

        return () => {
            newmessage(handlenewmessages, true);
            getmessages(handlegetmessages, true);
        }
    }, [conversationId, profileuser?._id]);

    const handlenewmessages = (res) => {
        console.log("📩 New message received:", res);

        if (!res.success) return;

        const msgData = res.data;
        const msg = {
            _id: msgData._id,
            id: msgData._id,
            content: msgData.content || '',
            attachement: msgData.attachement || null,
            createdAt: msgData.createdAt,
            conversationId: msgData.conversationId,
            sender: {
                id: msgData.sender?.id || msgData.sender?._id,
                name: msgData.sender?.name || msgData.sender?.fullName || 'Unknown',
                avatar: msgData.sender?.avatar || null,
            },
            isMe: (msgData.sender?.id || msgData.sender?._id) === profileuser?._id,
        };

        console.log("📝 Formatted new message:", msg);
        setAllmessages(prev => [msg, ...prev]); // prepend because list is inverted
    };


    const handlegetmessages = (res) => {
        console.log("📬 Get messages response:", res);

        if (res.success && res.data) {
            const formatted = res.data.map(msg => {
                // Handle mongoose document structure with _doc
                const msgData = msg._doc || msg;
                const senderData = msgData.senderId || msg.sender;

                const formattedMsg = {
                    _id: msgData._id || msg.id,
                    id: msgData._id || msg.id,
                    content: msgData.content || '',
                    attachement: msgData.attachement || null,
                    createdAt: msgData.createdAt,
                    conversationId: msgData.conversationId,
                    sender: {
                        id: senderData?._id || senderData?.id,
                        name: senderData?.name || senderData?.fullName || 'Unknown',
                        avatar: senderData?.avatar || null,
                    },
                    isMe: (senderData?._id || senderData?.id) === profileuser?._id,
                };

                return formattedMsg;
            });

            console.log("✅ Formatted messages:", formatted);
            setAllmessages(formatted);
        }
    };


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
                    return;
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
                attachement: attachements || null,
            });

            console.log(attachements, 'aaaaaaaaaaaa');
            // 🔥 RESET AFTER SUCCESS
            setMessage("");
            setSelectedfile(null);
            setLoading(false)
        }
        catch (error) {
            console.log("error message", error);
            Alert.alert("Error", "Failed to send message");
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
                            isGroup={type === "group"} />

                        <Headers color={Colors.white}>
                            {conversationName}
                        </Headers>
                    </View>}
                    rightIcon={<TouchableOpacity style={{ marginBottom: verticalScale(8) }}>
                        <Entypo name="dots-three-vertical" color={Colors.white} size={20} />
                    </TouchableOpacity>} />

                {/* messages  */}
                <View style={styles.content}>
                    {allmessages.length === 0 ? (
                        <View style={styles.emptystate}>
                            <Headers color={Colors.neutral500}>No messages yet. Start the conversation!</Headers>
                        </View>
                    ) : (
                        <FlatList
                            data={allmessages}
                            inverted={true}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.messageconentent}
                            renderItem={({ item }) => (
                                <MessagItems item={item} isDirect={isDirect} />
                            )}
                            keyExtractor={(item, i) => item.id || item._id || i.toString()}
                        />
                    )}

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
    emptystate: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._50,
    },
    messageconentent: {
        paddingVertical: spacingY._15,
        gap: spacingY._10,
    },
    footer: {
        paddingTop: spacingY._7,
        paddingBottom: verticalScale(22),
    },
    inputrighticon: {
        position: "absolute",
        right: scale(10),
        top: verticalScale(15),
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