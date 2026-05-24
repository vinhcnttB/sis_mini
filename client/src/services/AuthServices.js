import { axiosInstance, baseURL } from "../utils/axios";

export const authServices = {
  login: async (userAccount) => {
    try {
      const response = await axiosInstance.post("/auth/login", userAccount);
      return response?.data;
    } catch (error) {
      return error.response?.data;
    }
  },
  signup: async (userAccount) => {
    try {
      const response = await axiosInstance.post("/auth/register", userAccount);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return error.response.data;
    }
  },
  handleOAuthLogin: async (provider) => {
    console.log(provider);
    try {
      if (provider === "Google") {
        window.open(`${baseURL}/auth/google`, "_self");
      } else if (provider === "Facebook") {
        window.open(`${baseURL}/auth/facebook`, "_self");
      }
    } catch (error) {}
  },
  createNewPassword: async (userAccount, email) => {
    try {
      const response = await axiosInstance.post(
        `/auth/create-new-password?email=${email}`,
        userAccount
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return error.response.data;
    }
  },
  sendVerificationToEmail: async (email) => {
    try {
      const response = await axiosInstance.get(
        `/auth/forgot-password?email=${email}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response.data;
    }
  },
};
