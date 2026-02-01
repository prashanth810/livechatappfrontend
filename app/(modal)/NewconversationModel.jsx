import React, { useEffect, useState, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors, radius, spacingX, spacingY } from '../../constants/theme';
import HeadComponent from '../../components/HeadComponent';
import Avatar, { uploadimagecloudinary } from '../../components/Avatar';
import Entypo from 'react-native-vector-icons/Entypo'
import { verticalScale } from '../../util/styling';
import * as ImagePicker from "expo-image-picker";
import Headers from '../../components/Headers';
import Button from '../../components/Button';
import { getcontacts, newcpncersation } from '../../sockets/SocketEvents';
import { useDispatch, useSelector } from 'react-redux';
import { fetchselfprofile } from '../../redux/slices/AuthSlce';

const NewconversationModel = () => {
    const { isGroup } = useLocalSearchParams();
    const isGroupMode = isGroup == "1";
    const [gropuavatar, setGroupavatar] = useState(null);
    const [groupname, setGrouname] = useState("");
    const [selectedusers, setSelectedusers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState([]);

    const router = useRouter();
    const routerRef = useRef(router);
    routerRef.current = router;

    const dispatch = useDispatch();

    const { profileuser, profileloading, profileerror } = useSelector((state) => state.authslice.profiledata);

    // Refs to always hold the latest callback — fixes stale closure
    const handlegetcontactsRef = useRef(null);
    const handlegetnewcpncersationRef = useRef(null);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    // Update refs every render so socket always calls the latest version
    handlegetcontactsRef.current = (data) => {
        console.log("Contacts data received:", data);
        if (data?.success) {
            setContacts(data.data || []);
        }
        else {
            Alert.alert("Error", data?.message || "Failed to fetch contacts.");
        }
    };

    handlegetnewcpncersationRef.current = (data) => {
        // console.log("📥 Server response:", data.data.participants);
        setIsLoading(false);

        if (data?.data?._id) {
            console.log("✅ Navigating to conversation:", data.data._id.toString());
            routerRef.current.push({
                pathname: "/(main)/Conversation",
                params: {
                    id: data.data._id.toString(),
                    name: data.data.name,
                    avatar: data.data.avatar,
                    type: data.data.type,
                    participants: JSON.stringify(data.data.participants)
                }
            });
            return;
        }

        if (data?.data) {
            console.log("✅ Fallback navigate:", data.data._id?.toString());
            routerRef.current.push({
                pathname: "/(main)/Conversation",
                params: {
                    id: data.data._id?.toString(),
                    name: data.data.name,
                    avatar: data.data.avatar,
                    type: data.data.type,
                    participants: JSON.stringify(data.data.participants)
                }
            });
            return;
        }

        console.log("⚠️ No ID from backend, but conversation might exist");
    };

    // Stable wrappers — registered once, always delegate to current ref
    const stableContactsHandler = useRef((data) => {
        handlegetcontactsRef.current?.(data);
    }).current;

    const stableNewConversationHandler = useRef((data) => {
        handlegetnewcpncersationRef.current?.(data);
    }).current;

    useEffect(() => {
        getcontacts(stableContactsHandler);
        newcpncersation(stableNewConversationHandler);
        getcontacts();

        return () => {
            getcontacts(stableContactsHandler, true);
            newcpncersation(stableNewConversationHandler, true);
        }
    }, []);


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

    // Selects or deselects a user — works for 1 or more
    const toggleparticipant = (user) => {
        setSelectedusers((prev) => {
            if (prev.includes(user.id)) {
                return prev.filter(id => id !== user.id);
            }
            return [...prev, user.id];
        })
    }

    // Direct mode only
    const onselect = (user) => {
        if (!profileuser?._id) return;

        const payload = {
            type: "direct",
            participants: [profileuser._id, user.id],
        };
        console.log(profileuser._id, user.id);

        newcpncersation(payload);

        console.log("➡️ Waiting for server response to navigate");
    };



    const createGroup = async () => {
        // Need a name AND at least 2 other users
        if (!groupname.trim() || selectedusers.length < 2) {
            Alert.alert("Error", "Please enter a group name and select at least 2 users.");
            return;
        }

        if (!profileuser?._id) {
            Alert.alert("Error", "Profile not loaded. Please try again.");
            return;
        }

        setIsLoading(true);

        try {
            // Avatar is optional — only upload if picked
            let avatarurl = null;
            if (gropuavatar) {
                const uploadresults = await uploadimagecloudinary(gropuavatar, "group-avatars");
                if (uploadresults?.success) avatarurl = uploadresults.data;
            }

            newcpncersation({
                type: "group",
                participants: [profileuser._id, ...selectedusers],
                name: groupname.trim(),
                avatar: avatarurl,
            });

        }
        catch (error) {
            console.log("Error creating group:", error);
            setIsLoading(false);
            Alert.alert("Error", "Failed to create group. Please try again.");
        }
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
                        <TouchableOpacity onPress={handleaddgroupimage} >
                            <Avatar uri={gropuavatar?.uri || null} isGroup={true} size={80} />
                        </TouchableOpacity>
                        <Text style={styles.optionalLabel}>Optional</Text>
                    </View>

                    <View style={styles.groupnamecontainer}>
                        <TextInput style={styles.input}
                            placeholder='Enter group name...'
                            value={groupname}
                            onChangeText={setGrouname}
                        />
                    </View>

                    {selectedusers.length > 0 && (
                        <Text style={styles.selectedCount}>
                            {selectedusers.length} {selectedusers.length === 1 ? "user" : "users"} selected
                            {selectedusers.length < 2 && (
                                <Text style={styles.minUsersHint}> — select at least 2</Text>
                            )}
                        </Text>
                    )}
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.contactList}>
                {contacts.map((user, i) => {
                    console.log(user, 'uuuuuuuuuuuuuuu')
                    const isSelected = selectedusers.includes(user.id);
                    return (
                        <TouchableOpacity
                            key={user.id}
                            style={[styles.contactRow, isSelected && styles.selectContact]}
                            onPress={() => isGroupMode ? toggleparticipant(user) : onselect(user)} >
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

            {/* Shows when at least 2 users are selected in group mode */}
            {isGroupMode && selectedusers.length >= 2 && (
                <View style={styles.createbutton}>
                    <Button onPress={createGroup}
                        disabled={!groupname.trim() || isLoading}
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
        alignItems: "center",
    },
    optionalLabel: {
        color: "#888",
        fontSize: verticalScale(12),
        marginTop: 4,
    },
    selectedCount: {
        color: Colors.primary,
        fontSize: verticalScale(13),
        marginTop: spacingY._5,
        marginBottom: spacingY._5,
    },
    minUsersHint: {
        color: "#888",
        fontSize: verticalScale(12),
    },
    groupnamecontainer: {
        width: "94%",
    },
    input: {
        backgroundColor: "#1E1E1E",
        borderWidth: 1,
        placeholderTextColor: "#fff",
        borderColor: "#333",
        color: "#fff",
        borderRadius: 12,
        fontSize: verticalScale(15),
        paddingLeft: verticalScale(15),
        height: verticalScale(48),
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