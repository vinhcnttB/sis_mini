import { axiosInstance } from "../utils/axios";

export const userServices = {
  update: async (email, userInfo, token) => {
    try {
      const response = await axiosInstance.put(
        `/user?email=${email}`,
        userInfo,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response.data;
    }
  },
  updateRole: async (email, firstName, lastName, roleId, token) => {
    try {
      const response = await axiosInstance.put(
        `/user?email=${email}`,
        {
          firstName,
          lastName,
          roleId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return error.response.data;
    }
  },
  getAll: async (token) => {
    try {
      const response = await axiosInstance.get("/user", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return error?.response?.data;
    }
  },

  updateStudentIdByFile: async (data) => {
    try {
      const response = await axiosInstance.post(
        "/user/update-studentId-file",
        data,
        {
          headers: {
            "content-type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  },

  downloadSampleTemplate: async () => {
    try {
      const response = await axiosInstance.get(
        "/user/sample-studentId-template"
      );
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  },
};
