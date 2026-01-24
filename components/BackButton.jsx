import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Colors } from '../constants/theme';
import { useRouter } from 'expo-router';
import { verticalScale } from '../util/styling';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const BackButton = ({ style, iconSize = 24, color = Colors.white }) => {
    const router = useRouter();
    return (
        <TouchableOpacity onPress={() => router.back()} style={[styles.button, style]}>
            <FontAwesome name='angle-left' size={iconSize} color={color} weight="bold" />
        </TouchableOpacity>
    )
}

export default BackButton

const styles = StyleSheet.create({
    button: {

    }
})