import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Headers from './Headers'
import { Colors } from '../constants/theme';

const HeadComponent = ({ title, rightIcon, onRightPress, leftIcon, style }) => {
    return (
        <View style={[styles.container, style]}>
            {/* LEFT ICON */}
            {leftIcon && (
                <Pressable style={styles.leftIcon} onPress={onRightPress}>
                    {leftIcon}
                </Pressable>
            )}

            {title && (
                <Headers size={22} color={Colors.white} fontWeight='600' style={styles.title}> {title}  </Headers>
            )}
            {/* RIGHT ICON */}
            {rightIcon && (
                <Pressable style={styles.rightIcon} onPress={onRightPress}>
                    {rightIcon}
                </Pressable>
            )}

        </View>
    )
}

export default HeadComponent

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    title: {
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingRight: 20,
    },
    leftIcon: {
        alignSelf: "flex-start",
        zIndex: 20,
    },
    rightIcon: {
        alignSelf: "flex-end",
        zIndex: 30,
    }
})