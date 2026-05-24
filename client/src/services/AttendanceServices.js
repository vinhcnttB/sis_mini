import { axiosInstance } from "../utils/axios";

export const attendanceServices = {
  saveAttendance: async (attendanceData) => {
    try {
      const response = await axiosInstance.post("/attendance", attendanceData);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  getAttendanceSessions: async (classId) => {
    try {
      const response = await axiosInstance.get(`/attendance/class/${classId}`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  getAttendanceDetail: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/attendance/${sessionId}`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  getStudentAttendance: async (classId) => {
    try {
      const response = await axiosInstance.get(`/attendance/class/${classId}/student`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  openAttendance: async (payload) => {
    try {
      const response = await axiosInstance.post("/attendance/open", payload);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  closeAttendance: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/attendance/${sessionId}/close`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  getActiveSession: async (classId) => {
    try {
      const response = await axiosInstance.get(`/attendance/class/${classId}/active`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  checkInAttendance: async (payload) => {
    try {
      const response = await axiosInstance.post("/attendance/check-in", payload);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
};
