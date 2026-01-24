import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/theme'
import { verticalScale } from '../util/styling'

const Headers = ({ size = 16, color = Colors.text, fontWeight = "400", children, style, textProps = {} }) => {

    const TextStyle = {
        fontSize: verticalScale(size),
        color,
        fontWeight,
    };

    return (
        <View>
            <Text style={[TextStyle, style]} {...textProps}> {children} </Text>
        </View>
    )
}

export default Headers;