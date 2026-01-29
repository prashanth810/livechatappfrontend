import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { spacingX, spacingY } from '../constants/theme'
import Avatar from './Avatar'
import Headers from './Headers';
import moment from 'moment';

const Conversationmessages = ({ item, i, showDivider }) => {
    const lastmessage = item.lastMessage;
    const direct = item.type === "direct";

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


    const startconversation = () => { }

    return (
        <View key={i}>
            <TouchableOpacity
                style={styles.conversationmes} onPress={startconversation}>
                <View>
                    <Avatar uri={null} size={40} isGroup={item.type === "group"} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                        <Headers size={15} fontWeight='600'>
                            {item.name}
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