import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchselfprofile } from '../redux/slices/AuthSlce';
import { Colors, radius, spacingX, spacingY } from '../constants/theme';
import Avatar from './Avatar';
import Headers from './Headers';
import moment from 'moment';
import { Image } from 'expo-image';
import { verticalScale } from '../util/styling';

const MessagItems = ({ item, isDirect, onImagePress }) => {
    const dispatch = useDispatch();
    const { profileuser } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    const senderId = item?.sender?.id || item?.sender?._id || item?.senderId?._id;
    const me = senderId === profileuser?._id;

    const formatedate = () => {
        if (!item?.createdAt) return '';
        return moment(item.createdAt).isSame(moment(), "day")
            ? moment(item.createdAt).format("h:mm A")
            : moment(item.createdAt).format("MMM D, h:mm A");
    };

    if (!item) return null;

    const hasContent = item?.content && item.content.trim() !== '';
    const hasAttachment = item?.attachement && item.attachement.trim() !== '';

    if (!hasContent && !hasAttachment) return null;

    return (
        <View style={[styles.container, me ? styles.mymessage : styles.theirmessage]}>
            {!me && !isDirect && (
                <Avatar uri={item?.sender?.avatar} style={styles.messageavaatr} size={32} />
            )}

            <View style={[
                styles.messagebubble,
                me ? styles.mybubble : styles.otherbubble,
                !hasContent && hasAttachment && styles.imageonlybubble
            ]}>
                {hasAttachment && (
                    // ✅ Single tap → open image viewer
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => onImagePress?.(item.attachement)}>
                        <Image
                            source={{ uri: item.attachement }}
                            contentFit='cover'
                            transition={100}
                            style={styles.attachements}
                        />
                    </TouchableOpacity>
                )}

                {!me && !isDirect && (
                    <Headers size={12} color={Colors.neutral900} fontWeight="400">
                        {item?.sender?.name || 'Unknown'}
                    </Headers>
                )}

                {hasContent && (
                    <Headers size={14} fontWeight='500' color={Colors.neutral900}>
                        {item.content}
                    </Headers>
                )}

                {(hasContent || hasAttachment) && (
                    <Headers
                        style={{ alignSelf: "flex-end", marginTop: 4 }}
                        size={11}
                        fontWeight='500'
                        color={Colors.neutral600}>
                        {formatedate()}
                    </Headers>
                )}
            </View>
        </View>
    )
}

export default MessagItems

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: spacingX._7,
        maxWidth: "70%",
        marginVertical: 4,
    },
    mymessage: { alignSelf: "flex-end" },
    theirmessage: { alignSelf: "flex-start" },
    messageavaatr: { alignSelf: "flex-end" },
    messagebubble: {
        padding: spacingX._10,
        borderRadius: radius._15,
        gap: spacingY._5,
        flex: 1,
    },
    imageonlybubble: {
        padding: 4,
        backgroundColor: 'transparent',
    },
    mybubble: { backgroundColor: Colors.myBubble },
    otherbubble: { backgroundColor: Colors.otherBubble },
    attachements: {
        height: verticalScale(90),
        width: verticalScale(90),
        borderRadius: radius._10,
        marginVertical: 4,
        backgroundColor: Colors.neutral200,
    },
})