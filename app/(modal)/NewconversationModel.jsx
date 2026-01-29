import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors, radius, spacingX, spacingY } from '../../constants/theme';
import HeadComponent from '../../components/HeadComponent';
import Avatar from '../../components/Avatar';
import Entypo from 'react-native-vector-icons/Entypo'
import { verticalScale } from '../../util/styling';
import * as ImagePicker from "expo-image-picker";
import Headers from '../../components/Headers';
import Button from '../../components/Button';

const NewconversationModel = () => {
    const { isGroup } = useLocalSearchParams();
    const isGroupMode = isGroup == "1";
    const [gropuavatar, setGroupavatar] = useState(null);
    const [groupname, setGrouname] = useState("");
    const [selectedusers, setSelectedusers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const contacts = [
        { id: "1", name: "Alice Johnson", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
        { id: "2", name: "Bob Smith", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
        { id: "3", name: "Charlie Brown", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
        { id: "4", name: "Diana Prince", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
        { id: "5", name: "Ethan Hunt", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
    ];


    const handleaddgroupimage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            aspect: [4, 3],
            quality: 0.5,
        });
        console.log(result);

        if (!result.canceled) {
            setGroupavatar(result.assets[0]);
        }
    }

    const toggleparticipant = (user) => {
        setSelectedusers((prev) => {
            if (prev.find(u => u.id === user.id)) {
                return prev.filter(u => u.id !== user.id);
            }
            return [...prev, user.id];
        })
    }

    const onselect = (user) => {
        if (!user) {
            return Alert.alert("User not found, please login and chat again.");
        }

        if (isGroupMode) {
            toggleparticipant(user);
        }
        else {

        }
    }


    const createGroup = async () => {
        if (!groupname.trim() || selectedusers.length < 2) return;


    }


    return (
        <ScreenWrapper isModel={true}>
            <View style={styles.container}>
                <HeadComponent title={isGroupMode ? "New Group" : "Select User"} color={Colors.white}
                    leftIcon={<Entypo name="chevron-left" size={verticalScale(28)} color={Colors.white} />}
                    rightIcon={<Text />}
                />
            </View>

            {isGroupMode && (
                <View style={styles.groupInfoContainer}>
                    <View style={styles.avatarcontainer}>
                        <TouchableOpacity onPress={handleaddgroupimage}>
                            <Avatar uri={gropuavatar?.uri || null} isGroup={true} size={80} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.groupnamecontainer}>
                        <TextInput style={styles.input}
                            placeholder='Enter group name...'
                            value={groupname}
                            onChangeText={setGrouname}
                        />
                    </View>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.contactList}>
                {contacts.map((user, i) => {

                    const isSelected = selectedusers.includes(user.id); // Replace with actual selection logic
                    return (
                        <TouchableOpacity key={user.id} style={[styles.contactRow, isSelected && styles.selectContact]} onPress={() => onselect(user)}>
                            <Avatar uri={user.avatar} size={45} />
                            <Headers color={Colors.white} >{user.name}</Headers>
                            {isGroupMode && (
                                <View style={styles.selectIndicator}>
                                    <View style={[styles.checkbox, isSelected && styles.checked]} />
                                </View>
                            )}
                        </TouchableOpacity>
                    )

                })}
            </ScrollView>

            {isGroupMode && selectedusers.length >= 2 && (
                <View style={styles.createbutton}>
                    <Button onPress={createGroup}
                        disabled={!groupname.trim()}
                        loading={isLoading}
                    > <Headers fontWeight='bold' size={16}> Create</Headers> </Button>
                </View>
            )}
        </ScreenWrapper>
    );
};

export default NewconversationModel;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacingX._15,
    },
    groupInfoContainer: {
        alignItems: "center",
        marginTop: spacingY._10,
    },
    avatarcontainer: {
        marginBottom: spacingY._10,
    },
    groupnamecontainer: {
        width: "94%",
    },
    input: {
        backgroundColor: "#1E1E1E",     // dark card look
        borderWidth: 1,
        placeholderTextColor: "#fff",
        borderColor: "#333",            // soft border
        color: "#fff",
        borderRadius: 12,
        fontSize: verticalScale(15),
        paddingLeft: verticalScale(15),
    },
    contactList: {
        gap: spacingY._12,
        marginTop: spacingY._10,
        paddingTop: spacingX._10,
        paddingBottom: spacingY._20,
    },

    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: spacingX._10,
        marginTop: 5,
    },
    selectIndicator: {
        marginLeft: "auto",
        marginRight: spacingX._10,
    },
    checkbox: {
        width: verticalScale(20),
        height: verticalScale(20),
        borderWidth: 2,
        borderColor: Colors.white,
        borderRadius: 10,
    },
    checked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    selectContact: {
        backgroundColor: "#272727",
        borderRadius: radius._15,
    },
    createbutton: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacingX._15,
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderTopColor: Colors.neutral700,
    }
});
