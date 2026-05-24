import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./AssignmentTeacher.module.sass";
import cn from "classnames";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import UpdateAssignmentModal from "./UpdateAssignmentModal";
import CountdownTimer from "../../components/CountdownTimer";
import StudentSubmissionList from "./StudentSubmissionList";
import StudentReviewList from "./StudentReviewList";
import * as dayjs from "dayjs";
import { assignmentServices } from "../../services/AssignmentServices";
import { errorToast, successToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import Modal from "./ConfirmDeleteModal";

const AssignmentTeacher = () => {
  const { assignmentId, classId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState("");
  const [assignmentReviews, setAssignmentReviews] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  // Lấy toàn bộ danh sách học sinh phúc khảo
  useEffect(() => {
    setIsLoading(true);
    const getAssignmentData = async () => {
      const assignmentDetailResponse =
        await assignmentServices.getAssignmentById(assignmentId);
      if (assignmentDetailResponse.status) {
        setAssignmentData(assignmentDetailResponse.data);
      } else {
        return errorToast("Không thể lấy được dữ liệu. Vui lòng thử lại sau.");
      }
    };
    getAssignmentData();
    const getAssignmentReviews = async () => {
      const assignmentReviewsResponse =
        await assignmentServices.getAssignmentReviews(assignmentId);
      if (assignmentReviewsResponse.status) {
        setAssignmentReviews(assignmentReviewsResponse.data);
      } else {
        return errorToast("Không thể lấy được dữ liệu. Vui lòng thử lại sau.");
      }
    };
    getAssignmentReviews();
    setIsLoading(false);
  }, [assignmentId]);

  const handleDeleteAssignment = async () => {
    const response = await assignmentServices.deleteAssignment(assignmentId);
    if (response.status) {
      return successToast("Xóa bài tập thành công!", 2000);
    } else {
      return errorToast("Xóa bài tập thất bại, vui lòng thử lại sau.");
    }
  };
  const handleUpdateAssignment = () => {
    setOpenModal(true);
  };
  const handleOpenDeleteModal = async () => {
    setOpenDeleteModal(true);
    setContent(
      <>
        <div className={cn("title-green", styles.modaltitle)}>
          Xác nhận xóa bài tập đã tạo
        </div>
        <div className={styles.info}>Bạn thật sự muốn xóa bài tập này chứ?</div>
        <div className={styles.foot}>
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            className={cn("button-stroke", styles.button)}
          >
            <span>Quay lại</span>
          </button>
          <button
            onClick={() => {
              handleDeleteAssignment();
            }}
            className={cn("button", styles.button)}
          >
            <span>Xóa bài tập</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {isLoading && <LoadingSpinner />}
      {!isLoading && assignmentData && (
        <>
          <Card
            className={styles.card}
            title={`${assignmentData.grades.name} (${assignmentData.grades.percentage}%)`}
            classTitle={cn("title-purple", styles.title)}
            classCardHead={cn(styles.head)}
          >
            <div
              className={styles.description}
              style={{ display: "flex", flexDirection: "column", gap: "25px" }}
            >
              <div className={styles.content}>
                Tên bài tập: {assignmentData.name}
              </div>
              <div className={styles.content}>{assignmentData.description}</div>
              {assignmentData.metadata && (
                <div className={styles.content}>
                  File đính kèm:{" "}
                  <a
                    href={assignmentData.metadata}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#22c55e", textDecoration: "underline" }}
                  >
                    Tải xuống / Xem tài liệu đính kèm
                  </a>
                </div>
              )}
              <div className={styles.content}>
                Hạn nộp: {dayjs(assignmentData.dueDate).format("HH:mm DD/MM/YYYY")}
              </div>
              <CountdownTimer dueDate={assignmentData.dueDate} />
            </div>
            <div
              style={{
                marginTop: "25px",
                display: "flex",
                flexDirection: "row",
                gap: "20px",
              }}
            >
              <button
                className={cn("button", styles.button)}
                onClick={handleUpdateAssignment}
              >
                Cập nhật bài tập
              </button>
              {/* <button
                className={cn("button", styles.button)}
                onClick={handleOpenDeleteModal}
              >
                Xóa bài tập
              </button> */}
            </div>
            <UpdateAssignmentModal
              visible={openModal}
              classId={classId}
              assignmentInfo={assignmentData}
              onClose={() => {
                setOpenModal(false);
              }}
            />
            <Modal
              outerClassName={styles.outer}
              visible={openDeleteModal}
              onClose={() => setOpenModal(false)}
            >
              {content}
            </Modal>
          </Card>
          <Card
            className={styles.card}
            title="Sinh viên đã nộp "
            classTitle={cn("title-green", styles.title)}
            classCardHead={cn(styles.head)}
          >
            {!isLoading && assignmentData.studentAssignments?.length > 0 && (
              <div className={styles.classes}>
                <div className={styles.wrapper}>
                  <StudentSubmissionList
                    items={assignmentData.studentAssignments}
                  />
                </div>
              </div>
            )}
            {!isLoading && assignmentData.studentAssignments?.length <= 0 && (
              <div className={styles.content} style={{ textAlign: "center" }}>
                Không có sinh viên nào nộp bài.
              </div>
            )}
          </Card>
          <Card
            className={styles.card}
            title="Danh sách phúc khảo"
            classTitle={cn("title-green", styles.title)}
            classCardHead={cn(styles.head)}
          >
            {!isLoading && assignmentReviews?.length > 0 && (
              <div className={styles.classes}>
                <div className={styles.wrapper}>
                  <StudentReviewList items={assignmentReviews} />
                </div>
              </div>
            )}
            {!isLoading && assignmentReviews?.length <= 0 && (
              <div className={styles.content} style={{ textAlign: "center" }}>
                Không có sinh viên nào phúc khảo.
              </div>
            )}
          </Card>
          <button
            style={{ alignSelf: "flex-end" }}
            className={cn("button", styles.button)}
            onClick={() => {
              navigate(`/classes/${classId}`, { replace: true });
            }}
          >
            Quay lại
          </button>
        </>
      )}
    </div>
  );
};

export default AssignmentTeacher;
