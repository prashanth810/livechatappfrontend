import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { Colors, radius, spacingX } from '../constants/theme';
import { verticalScale } from '../util/styling';

const Inputs = (props) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={[
            styles.container, props.contanerStyle && props.containerStyle,
            isFocused && styles.primaryBorder
        ]}>

            {props.icon && props.icon}

            <TextInput
                style={[styles.input, props.inpuStyle]}
                placeholderTextColor={Colors.neutral400}
                ref={props.inputRef && props.inputRef}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
        </View>
    )
}

export default Inputs

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: verticalScale(56),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.neutral200,
        borderRadius: radius.full,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._20,
        backgroundColor: Colors.neutral100,
        gap: spacingX._10,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontSize: verticalScale(14),
    },
    primaryBorder: {
        borderColor: Colors.primary,
    }
})