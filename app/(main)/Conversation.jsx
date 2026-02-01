import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers'
import { Colors } from '../../constants/theme'

const Conversation = () => {
    return (
        <ScreenWrapper>
            <Headers color={Colors.white}>Conversation</Headers>
        </ScreenWrapper>
    )
}

export default Conversation

const styles = StyleSheet.create({})