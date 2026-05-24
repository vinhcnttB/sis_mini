import { axiosInstance } from "../utils/axios";

export const classServices = {
    createClass: async (classInfo) => {
        try {
            const response = await axiosInstance.post("/classes", classInfo);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    // API lấy danh sách lớp học giáo viên tham gia
    getTeacherClass: async (token) => {
        try {
            const response = await axiosInstance.get("/classes/teacher", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    studentJoinClass: async (classCode) => {
        try {
            const response = await axiosInstance.get(
                `/classes/invite-by-class-code/${classCode}`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    // API lấy danh sách lớp học học sinh tham gia
    getStudentClass: async (token) => {
        try {
            const response = await axiosInstance.get("/classes/student", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    // API lấy danh sách các lớp học cho admin
    getAllClasses: async (token) => {
        try {
            const response = await axiosInstance.get("/classes/admin", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    // API lấy mã mời của lớp
    getInviteLinkClass: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${classId}/group-invite`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    // API chấp nhận lời mời
    acceptGroupInvite: async (invitationId, userId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/accept-group-invite/${invitationId}/${userId}`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    acceptEmailInvite: async (token) => {
        try {
            const response = await axiosInstance.get(
                `/classes/accept-invite/${token}`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    checkEmailExist: async (id, email) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${id}/invite/${email}`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getClassDetail: async (classId) => {
        try {
            const response = await axiosInstance.get(`/classes/${classId}`);

            return response.data;
        } catch (error) {
            console.log(error);
            return error.response.data;
        }
    },
    updateClassDetail: async (classId, classInfo) => {
        try {
            const response = await axiosInstance.put(
                `/classes/${classId}`,
                classInfo
            );
            return response.data;
        } catch (error) {
            console.log(error);
            return error.response.data;
        }
    },
    updateClassGradeComposition: async (classId, grades) => {
        try {
            const response = await axiosInstance.post(
                `/classes/${classId}/grades`,
                grades
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getClassGradeComposition: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${classId}/grades`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    downloadClassList: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${classId}/export-student-list`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    updateAssignmentGrade: async (assignmentId, body) => {
        try {
            const response = await axiosInstance.post(
                `/assignments/${assignmentId}/mark-score`,
                body
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    exportGradeBoard: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${classId}/export-grade-board`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getGradeBoard: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${classId}/grade-board`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    downloadScoreFromAssignment: async (assignmentId) => {
        try {
            const response = await axiosInstance.get(
                `/assignments/${assignmentId}/download-score`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    toggleActiveClass: async (classId, status) => {
        try {
            const response = await axiosInstance.put(`/classes/${classId}`, {
                isDisabled: status,
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    importStudentsFromExcel: async (classId, file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axiosInstance.post(
                `/classes/${classId}/import-students`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    downloadSampleTemplate: async (classId) => {
        try {
            const response = await axiosInstance.get(
                `/classes/${classId}/sample-student-template`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    removeStudent: async (classId, studentId) => {
        try {
            const response = await axiosInstance.delete(
                `/classes/${classId}/students/${studentId}`
            );
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
};
