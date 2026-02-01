import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors, spacingX, spacingY } from '../constants/theme'
import Avatar from './Avatar'
import Headers from './Headers';
import moment from 'moment';
import { useRouter } from 'expo-router';

const Conversationmessages = ({ item, i, showDivider }) => {
    const lastmessage = item.lastMessage;
    const direct = item.type === "direct";

    const router = useRouter();
    console.log(item, 'iiiiiiiiiiiiiiii')

    // For direct: pick the other user from participants
    // For group: use item.avatar
    const getAvatar = () => {
        if (direct) {
            const other = item.participants?.find((p) => p._id !== item.participants[0]._id) || item.participants?.[0];
            return other?.avatar || null;
        }
        return item.avatar || null;
    };

    // For direct: pick the other user's fullName from participants
    // For group: use item.name
    const getName = () => {
        if (direct) {
            const other = item.participants?.find((p) => p._id !== item.participants[0]._id) || item.participants?.[0];
            return other?.fullName || "User";
        }
        return item.name || "Group";
    };

    const formateddata = () => {
        if (!lastmessage?.createdAt) return "";

        const messageDate = moment(lastmessage.createdAt);
        const today = moment();

        if (messageDate.isSame(today, "day")) {
            return messageDate.format("h:mm A");   // 5:30 PM
        }

        if (messageDate.isSame(today, "year")) {
            return messageDate.format("MMM D");    // Jun 24
        }

        return messageDate.format("MMM D, YYYY");  // Jun 24, 2025
    };

    const getLastmessage = () => {
        if (!lastmessage) return "Say Hi 👋";
        return lastmessage?.attachment ? "Image" : lastmessage.content;
    }


    const startconversation = () => {
        router.push({
            pathname: "/(main)/Conversation",
            params: {
                id: item._id,
                name: item.name,
                avatar: item.avatar,
                participants: JSON.stringify(item.participants),
            }
        })
    }

    return (
        <View key={i}>
            <TouchableOpacity
                style={styles.conversationmes} onPress={startconversation}>
                <View>
                    <Avatar uri={getAvatar()} size={40} isGroup={item.type === "group"} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                        <Headers size={15} fontWeight='600' color={Colors.black}>
                            {getName()}
                        </Headers>

                        {item.lastMessage && (
                            <Headers size={13} color="#777">
                                {formateddata()}
                            </Headers>
                        )}
                    </View>

                    <Headers size={12}> {getLastmessage()} </Headers>
                </View>
            </TouchableOpacity>

            {showDivider && <View style={styles.divider} />}
        </View>
    )
}

export default Conversationmessages

const styles = StyleSheet.create({
    conversationmes: {
        gap: spacingX._10,
        marginVertical: spacingY._12,
        flexDirection: "row",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    divider: {
        height: 1,
        width: "95%",
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.07)",
    }
})