import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchselfprofile } from '../redux/slices/AuthSlce';
import { Colors, radius, spacingX, spacingY } from '../constants/theme';
import Avatar from './Avatar';
import Headers from './Headers';
import { Header } from '@react-navigation/elements';
import moment from 'moment';

const MessagItems = ({ item, isDirect }) => {
    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    const me = item.sender?.id === profileuser?._id;

    console.log(me, 'mmmmmmmmmmmmmmm')
    console.log(!isDirect, 'directtttttttttttttt')

    const formatedate = () => {
        moment(item.createdAt).isSame(moment(), "day") ?
            moment(item.createdAt).format("h:mm A") :
            moment(item.createdAt).format("MMM : D, h:mm A");
    }
    return (
        <View style={[styles.container, me ? styles.mymessage : styles.theirmessage]}>

            {!me && !isDirect && (
                <Avatar uri={item?.sender?.avatar} style={styles.messageavaatr} />
            )}

            <View style={[
                styles.messagebubble,
                me ? styles.mybubble : styles.otherbubble
            ]}>
                {!me && !isDirect && (
                    <Headers size={13} color={Colors.neutral900}> {item.sender.name} </Headers>
                )}

                {item.content && <Headers size={13}>{item.content}</Headers>}

                {item.attachement && (
                    <Image
                        source={{ uri: item.attachement }}
                        style={{ width: 150, height: 150, borderRadius: 10 }}
                    />
                )}

                <Headers
                    style={{ alignSelf: "flex-end" }}
                    size={11}
                    fontWeight='500'
                    color={Colors.neutral600}
                > {formatedate} </Headers>
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
        gap: spacingY._10,
        marginTop: 4,
        overflow: "scroll"
    },
    mybubble: {
        backgroundColor: Colors.myBubble,
    },
    otherbubble: {
        backgroundColor: Colors.otherBubble,
    },
})