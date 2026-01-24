import BaseUrl from "../../constants/BaseUrl";


export const loginApi = (data) => {
    return BaseUrl.post("/login", data);
};

export const registerApi = (data) => {
    return BaseUrl.post("/register", data);
};
