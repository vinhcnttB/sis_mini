import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./AssignmentStudent.module.sass";
import cn from "classnames";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import UpdateAssignmentModal from "./UpdateAssignmentModal";
import MarkAssignmentModal from "./MarkAssignmentModal";
import CountdownTimer from "../../components/CountdownTimer";
import StudentSubmissionList from "./StudentSubmissionList";
import * as dayjs from "dayjs";
import { assignmentServices } from "../../services/AssignmentServices";
import { errorToast, successToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Modal from "./ConfirmDeleteModal";

const AssignmentStudent = () => {
    const { user } = useAuth();
    const { assignmentId, classId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [assignmentData, setAssignmentData] = useState("");
    const [assignmentReview, setAssignmentReview] = useState();
    const [visibleModalProduct, setVisibleModalProduct] = useState(false);
    const [alreadySubmit, setAlreadySubmit] = useState();
    const [studentAssignment, setStudentAssignment] = useState({});
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        const getAssignmentData = async () => {
            const assignmentDetailResponse =
                await assignmentServices.getAssignmentById(assignmentId);
            if (assignmentDetailResponse.status) {
                setAssignmentData(assignmentDetailResponse.data);
            } else {
                return errorToast(
                    "Không thể lấy được dữ liệu. Vui lòng thử lại sau."
                );
            }
        };
        getAssignmentData();
        setIsLoading(false);
    }, [assignmentId]);

    // Lấy toàn bộ danh sách học sinh phúc khảo
    useEffect(() => {
        setIsLoading(true);
        const getAssignmentReview = async () => {
            const assignmentReviewsResponse =
                await assignmentServices.getAssignmentReviews(assignmentId);
            if (assignmentReviewsResponse.status) {
                let messageInfo = assignmentReviewsResponse.data.find(
                    (message) =>
                        message.studentId === user.id &&
                        message.status !== "DENIED" &&
                        message.status !== "ACCEPT"
                );
                console.log(messageInfo);
                setAssignmentReview(messageInfo);
            } else {
                return errorToast(
                    "Không thể lấy được dữ liệu. Vui lòng thử lại sau."
                );
            }
        };
        getAssignmentReview();
        setIsLoading(false);
    }, []);

    // const handleDeleteAssignment = async () => {
    //     const response = await assignmentServices.deleteAssignment(
    //         assignmentId
    //     );
    //     if (response.status) {
    //         return successToast("Xóa bài tập thành công!", 2000);
    //     } else {
    //         return errorToast("Xóa bài tập thất bại, vui lòng thử lại sau.");
    //     }
    // };
    const handleUpdateAssignment = () => {
        setOpenModal(true);
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
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "25px",
                            }}
                        >
                            <div className={styles.content}>
                                Tên bài tập: {assignmentData.name}
                            </div>
                            <div className={styles.content}>
                                {assignmentData.description}
                            </div>
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
                                Hạn nộp:{" "}
                                {dayjs(assignmentData.dueDate).format(
                                    "HH:mm DD/MM/YYYY"
                                )}
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
                                onClick={() => {
                                    let studentData;

                                    if (
                                        assignmentData.studentAssignments.find(
                                            (item) => item !== null
                                        )
                                    ) {
                                        studentData =
                                            assignmentData.studentAssignments.find(
                                                (item) =>
                                                    item.studentId === user.id
                                            );
                                    }
                                    setStudentAssignment(studentData);
                                    console.log(assignmentData);
                                    if (!studentData) {
                                        setAlreadySubmit(false);
                                    } else {
                                        setAlreadySubmit(true);
                                    }
                                    setVisibleModalProduct(true);
                                }}
                            >
                                Thông tin bài tập
                            </button>
                        </div>
                        {/* <UpdateAssignmentModal
                            visible={openModal}
                            classId={classId}
                            assignmentInfo={assignmentData}
                            onClose={() => {
                                setOpenModal(false);
                            }}
                        /> */}
                        <MarkAssignmentModal
                            onClose={() => setVisibleModalProduct(false)}
                            visible={visibleModalProduct}
                            assignmentDetail={studentAssignment}
                            review={assignmentReview}
                            alreadySubmit={alreadySubmit}
                        />
                        <Modal
                            outerClassName={styles.outer}
                            visible={openDeleteModal}
                            onClose={() => setOpenModal(false)}
                        >
                            {content}
                        </Modal>
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

export default AssignmentStudent;
