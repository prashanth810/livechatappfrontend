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

// export const uploadimagecloudinary = async (file, foldername) => {
//     try {
//         if (!file?.uri) {
//             return { success: true, data: null };
//         }
//         if (file && file.uri) {
//             const formdata = new FormData();
//             formdata.append("file", {
//                 uri: file?.uri,
//                 type: "image/jpg",
//                 name: file?.uri?.split('/') / pop() || "file.jpg",
//             });

//             formdata.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
//             formdata.append("folder", foldername);

//             const response = axios.post(CLOUDINARY_APIURL, formdata, {
//                 headers: {
//                     "Content-Type": "multiplart/form-data"
//                 }
//             });
//             return { success: true, data: response?.data?.secure_url };
//         }
//         return { success: true, data: null };
//     }
//     catch (error) {
//         console.log(error.message, "white uploading error");
//         return { success: true, message: error.message || "white uploading error" };
//     }
// }

export const uploadimagecloudinary = async (file, foldername) => {
    try {
        if (!file?.uri) return { success: true, data: null };

        const formdata = new FormData();

        const filename = file.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image`;

        formdata.append("file", {
            uri: file.uri,
            type: fileType,
            name: filename,
        });

        formdata.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formdata.append("folder", foldername);

        const response = await axios.post(CLOUDINARY_APIURL, formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return { success: true, data: response.data.secure_url };

    } catch (error) {
        console.log("Cloudinary Upload Error:", error.response?.data || error.message);
        return { success: false, message: error.message };
    }
};


const Avatar = ({ uri, size = 40, style, isGroup = false }) => {



    const getAvatarPath = (file, isGroup) => {
        if (file && typeof file == "string") return file;
        if (file && typeof file == "object") return file.uri;
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