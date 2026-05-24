import { axiosInstance } from "../utils/axios";

export const NotificationServices = {
    getNotifications: async (token) => {
        try {
            const response = await axiosInstance.get("/notification", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    markAsRead: async (notiId, token) => {
        try {
            const response = await axiosInstance.put(
                `/notification/${notiId}/read`,
                {},
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    markAllAsRead: async (token) => {
        try {
            const response = await axiosInstance.put(
                "/notification/read-all",
                {},
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
};
