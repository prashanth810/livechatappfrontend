import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { verticalScale } from '../util/styling'
import { Colors, radius } from '../constants/theme';
import { Image } from 'expo-image';
import groupavatar from "../assets/images/defaultGroupAvatar.png";
import singleavatar from "../assets/images/defaultAvatar.png";
import { CLOUDINARY_NAME, CLOUDINARY_UPLOAD_PRESET } from '../constants/Utilities';
import axios from 'axios';

const CLOUDINARY_APIURL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

export const uploadimagecloudinary = async (file, foldername) => {

    try {
        // Validate file input
        if (!file?.uri) {
            console.error("❌ No file URI provided");
            return { success: false, message: "No file URI provided" };
        }

        // Create FormData
        const formdata = new FormData();

        const filename = file.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image/jpeg`;

        formdata.append("file", {
            uri: file.uri,
            type: fileType,
            name: filename,
        });

        formdata.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formdata.append("folder", foldername);


        // Upload to Cloudinary
        const response = await axios.post(CLOUDINARY_APIURL, formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });


        // Validate response has URL
        if (!response.data.secure_url) {
            console.error("❌ No secure_url in response");
            return {
                success: false,
                message: "Upload succeeded but no URL returned"
            };
        }

        return {
            success: true,
            data: response.data.secure_url
        };

    } catch (error) {
        console.error("❌ ========= UPLOAD FAILED =========");
        console.error("❌ Error:", error);
        console.error("❌ Message:", error.message);
        console.error("❌ Response data:", error.response?.data);
        console.error("❌ Response status:", error.response?.status);

        return {
            success: false,
            message: error.response?.data?.error?.message || error.message || "Upload failed"
        };
    }
};

const Avatar = ({ uri, size = 40, style, isGroup = false }) => {
    const getAvatarPath = (file, isGroup) => {
        if (file && typeof file === "string") return file;
        if (file && typeof file === "object") return file.uri;
        if (isGroup) return groupavatar;
        return singleavatar;
    }

    return (
        <View style={[styles.avatar,
        { height: verticalScale(size), width: verticalScale(size) },
            style
        ]}>
            <Image
                style={{ flex: 1 }}
                source={getAvatarPath(uri, isGroup)}
                contentFit='cover'
                transition={100}
            />
        </View>
    )
}

export default Avatar

const styles = StyleSheet.create({
    avatar: {
        alignSelf: "center",
        backgroundColor: Colors.neutral200,
        height: verticalScale(47),
        width: verticalScale(47),
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: Colors.neutral100,
        overflow: "hidden",
    }
})