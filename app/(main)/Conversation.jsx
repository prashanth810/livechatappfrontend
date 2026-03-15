import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert, Modal, Pressable, Animated } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Headers from '../../components/Headers'
import { Colors, radius, spacingX, spacingY } from '../../constants/theme'
import { useLocalSearchParams } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchselfprofile } from '../../redux/slices/AuthSlce'
import HeadComponent from '../../components/HeadComponent';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import { scale, verticalScale } from '../../util/styling'
import Avatar, { uploadimagecloudinary } from '../../components/Avatar';
import MessagItems from '../../components/MessagItems'
import * as ImagePicker from "expo-image-picker";
import Feather from 'react-native-vector-icons/Feather'
import Loading from '../../components/Loading'
import { getmessages, newmessage } from '../../sockets/SocketEvents'

// ── Long Press Menu ───────────────────────────────────────────────
const MessageMenu = ({ visible, onClose, item, onView, onEdit, onDelete }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const hasImage = !!item?.attachement;
    const hasText = !!item?.content?.trim();
    const isMe = item?.isMe;

    const options = [
        ...(hasImage ? [{
            label: 'View Image',
            icon: 'eye',
            color: Colors.primary,
            onPress: onView,
        }] : []),
        ...(isMe && hasText ? [{
            label: 'Edit',
            icon: 'edit',
            color: Colors.neutral700,
            onPress: onEdit,
        }] : []),
        ...(isMe ? [{
            label: 'Delete',
            icon: 'trash',
            color: '#e53935',
            onPress: onDelete,
        }] : []),
    ];

    if (options.length === 0) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.menuOverlay} onPress={onClose}>
                <Animated.View style={[styles.menuContainer, { transform: [{ scale: scaleAnim }] }]}>
                    {options.map((opt, i) => (
                        <React.Fragment key={opt.label}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => { onClose(); opt.onPress(); }}>
                                <FontAwesome name={opt.icon} size={16} color={opt.color} />
                                <Text style={[styles.menuText, { color: opt.color }]}>{opt.label}</Text>
                            </TouchableOpacity>
                            {i < options.length - 1 && <View style={styles.menuDivider} />}
                        </React.Fragment>
                    ))}
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

// ── Image Viewer ──────────────────────────────────────────────────
const ImageViewer = ({ visible, uri, onClose }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        if (visible) {
            setImgError(false);
            setImgLoaded(false);
        }
    }, [visible, uri]);

    if (!visible || !uri) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent>
            <View style={styles.imageViewerOverlay}>
                <TouchableOpacity style={styles.closeViewer} onPress={onClose}>
                    <Entypo name="cross" size={28} color={Colors.white} />
                </TouchableOpacity>

                {!imgLoaded && !imgError && (
                    <View style={styles.imgLoadingContainer}>
                        <Loading loading={true} size="large" color={Colors.white} />
                    </View>
                )}

                {imgError ? (
                    <View style={styles.imgErrorContainer}>
                        <Feather name="image" size={50} color={Colors.neutral400} />
                        <Text style={styles.imgErrorText}>Failed to load image</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri, cache: 'force-cache' }}
                        style={[styles.fullImage, !imgLoaded && { opacity: 0 }]}
                        resizeMode="contain"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                    />
                )}

                <TouchableOpacity style={styles.closeViewerBottom} onPress={onClose}>
                    <Text style={styles.closeViewerText}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

// ── Image Preview Popup (before send) ────────────────────────────
const ImagePreviewPopup = ({ visible, uri, onConfirm, onCancel }) => {
    if (!visible || !uri) return null;
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
            <View style={styles.previewOverlay}>
                <View style={styles.previewContainer}>
                    <Text style={styles.previewTitle}>Send Image?</Text>
                    <Image
                        source={{ uri }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                    <View style={styles.previewButtons}>
                        <TouchableOpacity style={styles.previewCancelBtn} onPress={onCancel}>
                            <Text style={styles.previewCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.previewSendBtn} onPress={onConfirm}>
                            <Feather name="send" size={16} color={Colors.white} />
                            <Text style={styles.previewSendText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
// ─────────────────────────────────────────────────────────────────

const Conversation = () => {
    const [message, setMessage] = useState("");
    const [selectedfile, setSelectedfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allmessages, setAllmessages] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);

    const {
        id: conversationId,
        name,
        participants: stringifiedparticipants,
        avatar,
        type,
    } = useLocalSearchParams();

    const participants = stringifiedparticipants ? JSON.parse(stringifiedparticipants) : [];

    const dispatch = useDispatch();
    const { profileuser } = useSelector((state) => state.authslice.profiledata);

    useEffect(() => {
        dispatch(fetchselfprofile());
    }, [dispatch]);

    let conversationavatar = avatar;
    const isDirect = type === "direct";
    const otherparticipants = isDirect ? participants.find((p) => p._id != profileuser?._id) : null;
    if (isDirect && otherparticipants) conversationavatar = otherparticipants.avatar;
    let conversationName = isDirect ? otherparticipants?.name : name;

    useEffect(() => {
        if (!conversationId || !profileuser?._id) return;
        newmessage(handlenewmessages);
        getmessages(handlegetmessages);
        getmessages({ conversationId });
        return () => {
            newmessage(handlenewmessages, true);
            getmessages(handlegetmessages, true);
        }
    }, [conversationId, profileuser?._id]);

    const handlenewmessages = (res) => {
        if (!res.success) return;
        const msgData = res.data;
        const isMyMessage = (msgData.sender?.id || msgData.sender?._id) === profileuser?._id;
        const msg = {
            _id: msgData._id,
            id: msgData._id,
            content: msgData.content || '',
            attachement: msgData.attachement || null,
            createdAt: msgData.createdAt,
            conversationId: msgData.conversationId,
            sender: {
                id: msgData.sender?.id || msgData.sender?._id,
                name: msgData.sender?.name || msgData.sender?.fullName || 'Unknown',
                avatar: msgData.sender?.avatar || null,
            },
            isMe: isMyMessage,
        };
        if (isMyMessage) {
            setAllmessages(prev => {
                const filtered = prev.filter(m => !m.id.toString().startsWith('temp-'));
                return [msg, ...filtered];
            });
        } else {
            setAllmessages(prev => [msg, ...prev]);
        }
    };

    const handlegetmessages = (res) => {
        if (res.success && res.data) {
            const formatted = res.data.map(msg => {
                const msgData = msg._doc || msg;
                const senderData = msgData.senderId || msg.sender;
                return {
                    _id: msgData._id || msg.id,
                    id: msgData._id || msg.id,
                    content: msgData.content || '',
                    attachement: msgData.attachement || null,
                    createdAt: msgData.createdAt,
                    conversationId: msgData.conversationId,
                    sender: {
                        id: senderData?._id || senderData?.id,
                        name: senderData?.name || senderData?.fullName || 'Unknown',
                        avatar: senderData?.avatar || null,
                    },
                    isMe: (senderData?._id || senderData?.id) === profileuser?._id,
                };
            });
            setAllmessages(formatted);
        }
    };

    const onPickfiles = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            aspect: [4, 3],
            quality: 0.5,
        });
        if (!result.canceled) {
            setSelectedfile(result.assets[0]);
            setPreviewVisible(true);
        }
    };

    const handlePreviewCancel = () => {
        setPreviewVisible(false);
        setSelectedfile(null);
    };

    const handlePreviewConfirm = () => {
        setPreviewVisible(false);
    };

    const hanldesendmessages = async () => {
        if (!message.trim() && !selectedfile) return;
        if (!profileuser._id) return;

        const messageText = message.trim();
        const fileToSend = selectedfile;

        if (editingMessage) {
            setAllmessages(prev => prev.map(m =>
                m.id === editingMessage.id ? { ...m, content: messageText } : m
            ));
            setEditingMessage(null);
            setMessage("");
            return;
        }

        setMessage("");
        setSelectedfile(null);
        setLoading(true);

        try {
            let attachementUrl = null;

            if (fileToSend) {
                const uploadresults = await uploadimagecloudinary(fileToSend, "message-attachements");
                if (uploadresults.success) {
                    attachementUrl = uploadresults.data;
                } else {
                    Alert.alert("Error", "Upload failed: " + uploadresults.message);
                    setMessage(messageText);
                    setSelectedfile(fileToSend);
                    setLoading(false);
                    return;
                }
            }

            const dataToSend = {
                conversationId,
                sender: {
                    id: profileuser._id,
                    name: profileuser.fullName,
                    avatar: profileuser.avatar,
                },
                content: messageText || "",
                attachement: attachementUrl || null,
            };

            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                id: `temp-${Date.now()}`,
                content: messageText || "",
                attachement: attachementUrl || fileToSend?.uri || null,
                createdAt: new Date().toISOString(),
                conversationId,
                sender: {
                    id: profileuser._id,
                    name: profileuser.fullName,
                    avatar: profileuser.avatar,
                },
                isMe: true,
            };

            setAllmessages(prev => [optimisticMessage, ...prev]);
            newmessage(dataToSend);
            setLoading(false);
        } catch (error) {
            Alert.alert("Error", error.message);
            setMessage(messageText);
            setSelectedfile(fileToSend);
            setLoading(false);
        }
    };

    const handleLongPress = useCallback((item) => {
        setSelectedMessage(item);
        setMenuVisible(true);
    }, []);

    const handleView = () => {
        const uri = selectedMessage?.attachement;
        if (uri) {
            setViewingImage(uri);
            setImageViewerVisible(true);
        }
    };

    const handleEdit = () => {
        if (selectedMessage?.content) {
            setEditingMessage(selectedMessage);
            setMessage(selectedMessage.content);
        }
    };

    const handleDelete = () => {
        Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: () => setAllmessages(prev => prev.filter(m => m.id !== selectedMessage.id))
            }
        ]);
    };

    // Add this handler (after handleDelete)
    const handleImageTap = useCallback((uri) => {
        if (uri) {
            setViewingImage(uri);
            setImageViewerVisible(true);
        }
    }, []);

    // Update renderMessage
    const renderMessage = useCallback(({ item }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={300}>
            <MessagItems
                item={item}
                isDirect={isDirect}
                onImagePress={handleImageTap}
            />
        </TouchableOpacity>
    ), [isDirect]);

    return (
        <ScreenWrapper showPattern={true} bgOpacity={0.5}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}>

                <HeadComponent
                    style={styles.header}
                    leftIcon={
                        <View style={styles.headerleft}>
                            <FontAwesome name="angle-left" size={verticalScale(25)} color={Colors.white} />
                            <Avatar size={40} uri={conversationavatar} isGroup={type === "group"} />
                            <Headers color={Colors.white}>{conversationName}</Headers>
                        </View>
                    }
                    rightIcon={
                        <TouchableOpacity style={{ marginBottom: verticalScale(8) }}>
                            <Entypo name="dots-three-vertical" color={Colors.white} size={20} />
                        </TouchableOpacity>
                    }
                />

                <View style={styles.content}>
                    {/* Messages list */}
                    {allmessages.length === 0 ? (
                        <View style={styles.emptystate}>
                            <Headers color={Colors.neutral500}>
                                No messages yet. Start the conversation!
                            </Headers>
                        </View>
                    ) : (
                        <FlatList
                            data={allmessages}
                            inverted={true}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.messageconentent}
                            renderItem={renderMessage}
                            keyExtractor={(item, i) => item.id || item._id || i.toString()}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={15}
                            windowSize={10}
                            initialNumToRender={20}
                        />
                    )}

                    {/* Edit banner */}
                    {editingMessage && (
                        <View style={styles.editingBanner}>
                            <Feather name="edit-2" size={14} color={Colors.primary} />
                            <Text style={styles.editingText} numberOfLines={1}>
                                Editing: {editingMessage.content}
                            </Text>
                            <TouchableOpacity onPress={() => { setEditingMessage(null); setMessage(""); }}>
                                <Entypo name="cross" size={18} color={Colors.neutral500} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Selected image thumbnail above input */}
                    {selectedfile?.uri && (
                        <View style={styles.selectedImageRow}>
                            <Image source={{ uri: selectedfile.uri }} style={styles.selectedThumb} />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={() => setSelectedfile(null)}>
                                <Entypo name="cross" size={13} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Footer input row */}
                    <View style={styles.footer}>
                        <View style={styles.inputRow}>
                            {/* + button */}
                            <TouchableOpacity style={styles.roundBtn} onPress={onPickfiles}>
                                <Entypo name="plus" size={verticalScale(22)} color={Colors.black} />
                            </TouchableOpacity>

                            {/* Text input */}
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder={editingMessage ? "Edit message..." : "Type Message..."}
                                    placeholderTextColor={Colors.neutral400}
                                    style={styles.textInput}
                                    multiline
                                />
                            </View>

                            {/* Send button */}
                            <TouchableOpacity style={styles.roundBtn} onPress={hanldesendmessages}>
                                {loading ? (
                                    <Loading loading={loading} size='small' color={Colors.black} />
                                ) : (
                                    <Feather
                                        name={editingMessage ? "check" : "send"}
                                        color={Colors.black}
                                        size={verticalScale(20)}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Image preview popup */}
            <ImagePreviewPopup
                visible={previewVisible}
                uri={selectedfile?.uri}
                onConfirm={handlePreviewConfirm}
                onCancel={handlePreviewCancel}
            />

            {/* Long press menu */}
            <MessageMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                item={selectedMessage}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Image viewer */}
            <ImageViewer
                visible={imageViewerVisible}
                uri={viewingImage}
                onClose={() => { setImageViewerVisible(false); setViewingImage(null); }}
            />
        </ScreenWrapper>
    );
};

export default Conversation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacingX._15,
        paddingTop: spacingY._10,
        paddingBottom: spacingY._15,
    },
    headerleft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._20,
    },
    content: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: radius._50,
        borderTopRightRadius: radius._50,
        borderCurve: "continuous",
        overflow: "hidden",
        paddingHorizontal: spacingX._15,
    },
    emptystate: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacingY._50,
    },
    messageconentent: {
        paddingVertical: spacingY._15,
        gap: spacingY._10,
    },

    // ── Footer ────────────────────────────────────────────────────
    footer: {
        paddingTop: spacingY._7,
        paddingBottom: spacingY._15,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacingX._10,
    },
    inputWrapper: {
        flex: 1,
        minHeight: verticalScale(48),
        maxHeight: verticalScale(120),
        backgroundColor: Colors.neutral100,
        borderRadius: radius._20,
        borderWidth: 1,
        borderColor: Colors.neutral200,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._10,
        justifyContent: 'center',
    },
    textInput: {
        color: Colors.text,
        fontSize: verticalScale(14),
        padding: 0,
        margin: 0,
        lineHeight: verticalScale(20),
    },
    roundBtn: {
        backgroundColor: Colors.primary,
        borderRadius: radius.full,
        width: verticalScale(44),
        height: verticalScale(44),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },

    // ── Selected image above input ────────────────────────────────
    selectedImageRow: {
        paddingBottom: spacingY._7,
        paddingHorizontal: spacingX._5,
    },
    selectedThumb: {
        width: verticalScale(60),
        height: verticalScale(60),
        borderRadius: radius._10,
        borderWidth: 1,
        borderColor: Colors.neutral200,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -2,
        left: verticalScale(46),
        backgroundColor: Colors.neutral700,
        borderRadius: radius.full,
        padding: 3,
    },

    // ── Edit banner ───────────────────────────────────────────────
    editingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._10,
        backgroundColor: Colors.neutral100,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._7,
        borderRadius: radius._10,
        marginBottom: spacingY._7,
    },
    editingText: {
        flex: 1,
        fontSize: 13,
        color: Colors.neutral600,
    },

    // ── Long press menu ───────────────────────────────────────────
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: Colors.white,
        borderRadius: radius._20,
        paddingVertical: spacingY._7,
        minWidth: scale(180),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._15,
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        backgroundColor: Colors.neutral100,
        marginHorizontal: spacingX._10,
    },

    // ── Image viewer ──────────────────────────────────────────────
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.97)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '75%',
    },
    imgLoadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgErrorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    imgErrorText: {
        color: Colors.neutral400,
        fontSize: 14,
    },
    closeViewer: {
        position: 'absolute',
        top: verticalScale(50),
        right: scale(20),
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: radius.full,
        padding: 6,
        zIndex: 10,
    },
    closeViewerBottom: {
        marginTop: verticalScale(20),
        paddingHorizontal: spacingX._30,
        paddingVertical: spacingY._10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: radius.full,
    },
    closeViewerText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '500',
    },

    // ── Image preview popup ───────────────────────────────────────
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    previewContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: radius._30,
        borderTopRightRadius: radius._30,
        padding: spacingX._20,
        paddingBottom: verticalScale(40),
        alignItems: 'center',
        gap: spacingY._15,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.neutral800,
    },
    previewImage: {
        width: '100%',
        height: verticalScale(280),
        borderRadius: radius._15,
        backgroundColor: Colors.neutral100,
    },
    previewButtons: {
        flexDirection: 'row',
        gap: spacingX._15,
        width: '100%',
    },
    previewCancelBtn: {
        flex: 1,
        paddingVertical: spacingY._12,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: Colors.neutral300,
        alignItems: 'center',
    },
    previewCancelText: {
        color: Colors.neutral700,
        fontWeight: '600',
    },
    previewSendBtn: {
        flex: 1,
        paddingVertical: spacingY._12,
        borderRadius: radius.full,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacingX._7,
    },
    previewSendText: {
        color: Colors.white,
        fontWeight: '600',
    },
});