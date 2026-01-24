import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors, radius } from '../constants/theme'
import { verticalScale } from '../util/styling'
import Loading from './Loading'

const Button = ({ style, onPress, children, loading = false }) => {
    if (loading) {
        return (
            <View style={[styles.button, style, { backgroundColor: "transparent" }]} >
                <Loading />
            </View>
        )
    }
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
            <Text> {children} </Text>
        </TouchableOpacity>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        borderRadius: radius.full,
        height: verticalScale(56),
        justifyContent: "center",
        alignItems: 'center',
    }
})