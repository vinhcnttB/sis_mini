import { axiosInstance } from "../utils/axios";

export const assignmentServices = {
    // API get assignment list
    getAssignmentList: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/assignments/${classId}/all`
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    getAssignmentReviews: async (assignmentId) => {
        try {
            const response = await axiosInstance.get(
                `/assignments/${assignmentId}/requested-grade-view`
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    getAssignmentById: async (assignmentId) => {
        try {
            const response = await axiosInstance.get(
                `/assignments/${assignmentId}`
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    // API create new assignment for student
    createAssignment: async (assignmentData) => {
        try {
            const response = await axiosInstance.post(
                "/assignments",
                assignmentData
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    updateAssignment: async (assignmentData, assignmentId) => {
        try {
            const response = await axiosInstance.put(
                `/assignments/${assignmentId}`,
                assignmentData
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    deleteAssignment: async (assignmentId) => {
        try {
            const response = await axiosInstance.delete(
                `/assignments/${assignmentId}`
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    uploadFile: async (fileUrl) => {
        try {
            const file = new FormData();
            file.append("file", fileUrl);
            const response = await axiosInstance.post("/files/upload", file, {
                headers: {
                    "content-type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    markScoreForStudent: async (assignmentId, data) => {
        try {
            const response = await axiosInstance.post(
                `/assignments/${assignmentId}/mark-score`,
                data
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    markScoreExcel: async (assignmentId, body) => {
        try {
            const response = await axiosInstance.post(
                `/assignments/${assignmentId}/mark-score-excel`,
                body,
                {
                    headers: {
                        "content-type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    getMessageList: async (studentRequestedReviewId) => {
        try {
            const response = await axiosInstance.get(
                `/assignments/requested-grade-view/${studentRequestedReviewId}/conversation`
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    sendMessage: async (assignmentId, studentRequestedReviewId, message) => {
        try {
            const response = await axiosInstance.post(
                `/assignments/${assignmentId}/requested-grade-view/${studentRequestedReviewId}/conversation`,
                {
                    message: message,
                }
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    updateReviewScoreResult: async (studentRequestedReviewId, data) => {
        try {
            const response = await axiosInstance.put(
                `/assignments/requested-grade-view/${studentRequestedReviewId}`,
                data
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    postAssignmentReview: async (assignmentId, body) => {
        try {
            const response = await axiosInstance.post(
                `/assignments/${assignmentId}/requested-grade-view`,
                body
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },

    studentSubmitAssignment: async (assignmentId, data) => {
        try {
            const response = await axiosInstance.post(
                `/assignments/${assignmentId}/student-assignment`,
                data
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
    confirmAssignmentGrade: async (classId, gradeId) => {
        try {
            const response = await axiosInstance.put(
                `/classes/${classId}/grades/${gradeId}`,
                { status: "COMPLETE" }
            );
            return response.data;
        } catch (error) {
            return error?.response?.data || { status: false, message: error.message };
        }
    },
};
