import { axiosInstance } from "../utils/axios";

export const scheduleServices = {
  createSchedule: async (scheduleData) => {
    try {
      const response = await axiosInstance.post("/schedules", scheduleData);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  getSchedulesByClass: async (classId) => {
    try {
      const response = await axiosInstance.get(`/schedules/class/${classId}`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const response = await axiosInstance.put(`/schedules/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await axiosInstance.delete(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      return error.response?.data || { status: false, message: error.message };
    }
  },
};
