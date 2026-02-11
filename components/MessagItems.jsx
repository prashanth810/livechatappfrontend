import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchselfprofile } from '../redux/slices/AuthSlce';
import { Colors, radius, spacingX, spacingY } from '../constants/theme';
import Avatar from './Avatar';
import Headers from './Headers';
import moment from 'moment';
import { Image } from 'expo-image';
import { verticalScale } from '../util/styling';

const MessagItems = ({ item, isDirect }) => {
    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    // Safely extract sender ID
    const senderId = item?.sender?.id || item?.sender?._id || item?.senderId?._id;
    const me = senderId === profileuser?._id;

    console.log("Message item:", item);
    console.log("Is me:", me);
    console.log("Is direct:", isDirect);

    const formatedate = () => {
        if (!item?.createdAt) return '';

        return moment(item.createdAt).isSame(moment(), "day")
            ? moment(item.createdAt).format("h:mm A")
            : moment(item.createdAt).format("MMM D, h:mm A");
    };

    // Don't render if item is invalid
    if (!item) {
        console.warn("MessagItems received null/undefined item");
        return null;
    }

    return (
        <View style={[styles.container, me ? styles.mymessage : styles.theirmessage]}>

            {!me && !isDirect && (
                <Avatar uri={item?.sender?.avatar} style={styles.messageavaatr} size={32} />
            )}

            <View style={[
                styles.messagebubble,
                me ? styles.mybubble : styles.otherbubble
            ]}>

                {!me && !isDirect && (
                    <Headers size={13} color={Colors.neutral900} fontWeight="600">
                        {item?.sender?.name || 'Unknown'}
                    </Headers>
                )}

                {item?.content && item.content.trim() !== '' && (
                    <Headers size={14} color={Colors.neutral900}>
                        {item.content}
                    </Headers>
                )}

                {item?.attachement && (
                    <Image
                        source={{ uri: item.attachement }}
                        contentFit='cover'
                        transition={100}
                        style={styles.attachements}
                    />
                )}

                <Headers
                    style={{ alignSelf: "flex-end", marginTop: 4 }}
                    size={11}
                    fontWeight='500'
                    color={Colors.neutral600}
                >
                    {formatedate()}
                </Headers>
            </View>
        </View>
    )
}

export default MessagItems

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: spacingX._7,
        maxWidth: "80%",
        marginVertical: 4,
    },
    mymessage: {
        alignSelf: "flex-end",
    },
    theirmessage: {
        alignSelf: "flex-start",
    },
    messageavaatr: {
        alignSelf: "flex-end",
    },
    messagebubble: {
        padding: spacingX._10,
        borderRadius: radius._15,
        gap: spacingY._5,
        flex: 1,
    },
    mybubble: {
        backgroundColor: Colors.myBubble,
    },
    otherbubble: {
        backgroundColor: Colors.otherBubble,
    },
    attachements: {
        height: verticalScale(180),
        width: verticalScale(180),
        borderRadius: radius._10,
        marginVertical: 4,
    },
})