import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import styles from "./ClassInfoDashboard.module.sass";
import Card from "./Card";
import { errorToast } from "../../../../utils/toast";
import { classServices } from "../../../../services/ClassServices";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import CreateAssignmentModal from "./CreateAssignmentModal";
import { assignmentServices } from "../../../../services/AssignmentServices";
import * as dayjs from "dayjs";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
const ClassInfoDashboard = ({ classId }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openCreateAssignmentModal, setOpenCreateAssignmentModal] =
    useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setIsLoading(true);
    // Call API to get all assignment here
    // Call API to get class info here
    const getClassInfo = async () => {
      const response = await classServices.getClassDetail(classId);
      if (response.status) {
        setClassInfo(response.data);
      } else {
        return errorToast(
          "Có sự cố xảy ra, không thể lấy được thông tin lớp. Vui lòng thử lại sau."
        );
      }
    };
    getClassInfo();

    // Call API to get assignment List
    const getAssignmentList = async () => {
      const response = await assignmentServices.getAssignmentList(classId);
      if (response.status) {
        setAssignments(response.data);
      } else {
        return errorToast(
          "Không thể lấy được danh sách bài tập. Vui lòng thử lại sau."
        );
      }
    };
    getAssignmentList();
    setIsLoading(false);
  }, [classId]);
  const goToAssignment = (id) => {
    if (user.role === "teacher")
      navigate(`assignment/${id}/teacher`, { replace: true });
    else if (user.role === "student") {
      navigate(`assignment/${id}/student`, { replace: true });
    }
  };
  const handleCreateAssignment = () => {
    setOpenCreateAssignmentModal(true);
  };
  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {/**Button create new assignment for teacher */}
      {!isLoading && user.role === "teacher" && (
        <button
          className={cn("button", styles.button)}
          onClick={handleCreateAssignment}
        >
          Tạo bài tập mới
        </button>
      )}
      {!isLoading && !assignments?.length && (
        <div className={styles.description}>
          Hiện tại chưa có bài tập nào trong lớp học.
        </div>
      )}
      {!isLoading &&
        assignments &&
        assignments.map((assignment, index) => {
          return (
            <div
              key={index}
              onClick={() => {
                goToAssignment(assignment.id);
              }}
            >
              <Card
                className={cn(styles.card)}
                title={`Giáo viên ${assignment.teacher.lastName} ${assignment.teacher.firstName} đã tạo bài tập mới: ${assignment.name}`}
                classTitle={cn("title-green", styles.title)}
              >
                <div className={styles.description}>
                  <div className={styles.field}>
                    Mô tả: {assignment.description}
                  </div>
                  <div>
                    Ngày tạo:
                    {" " + dayjs(assignment.createdAt).format("DD/MM/YYYY")}
                  </div>
                  <div>
                    Hạn nộp:
                    {assignment.dueDate !== null
                      ? " " + dayjs(assignment.dueDate).format("DD/MM/YYYY") // '25/01/2019'
                      : " Không có thời hạn"}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      <CreateAssignmentModal
        classId={classId}
        visible={openCreateAssignmentModal}
        onClose={() => {
          setOpenCreateAssignmentModal(false);
        }}
      />
    </div>
  );
};

export default ClassInfoDashboard;
