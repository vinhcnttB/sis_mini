import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { createPortal } from "react-dom";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import styles from "./MarkAssignmentModal.module.sass";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import LargeInput from "../../../components/LargeInput";
import TextInput from "../../../components/TextInput";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { errorToast, successToast } from "../../../utils/toast";
import { assignmentServices } from "../../../services/AssignmentServices";

const MarkAssignmentModal = ({ visible, onClose, assignmentDetail }) => {
    const { assignmentId, classId } = useParams();
    const escFunction = useCallback(
        (e) => {
            if (e.keyCode === 27) {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [escFunction]);

    useEffect(() => {
        if (visible) {
            const target = document.querySelector("#modal-product");
            disableBodyScroll(target);
        } else {
            clearAllBodyScrollLocks();
        }
    }, [visible]);

    const { control, setValue, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        const score = parseFloat(data.score);
        if (score < 0 || score > 10) {
            return errorToast("Số điểm không hợp lệ!");
        } else {
            const requestObject = {
                scores: [
                    {
                        studentId: assignmentDetail.students.id,
                        score: score,
                    },
                ],
            };

            const response = await assignmentServices.markScoreForStudent(
                assignmentId,
                requestObject
            );
            if (response.status) {
                onClose();
                window.location.reload();
                return successToast("Chấm điểm thành công");
            } else {
                return errorToast("Chấm điểm thất bại!");
            }
        }
    };
    return createPortal(
        visible && (
            <div id="modal-product" className={styles.modal}>
                <div className={styles.control}>
                    <div className={cn("button-white", styles.button)}>
                        Bài nộp
                    </div>
                    <button className={styles.close} onClick={onClose}>
                        <Icon name="close" size="20" />
                    </button>
                </div>
                <div className={styles.outer}>
                    <Card className={cn(styles.card)}>
                        <div style={{ display: "flex", gap: "40px" }}>
                            <div
                                style={{ flex: 2 }}
                                className={cn(styles.head)}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "20px",
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "title-green",
                                            styles.title
                                        )}
                                    >
                                        Bài đã làm
                                    </div>
                                    <div>Nội dung đã làm</div>
                                    <LargeInput
                                        className={styles.field}
                                        value={assignmentDetail.description}
                                        disabled
                                    />
                                    <div>File đính kèm</div>
                                    <a
                                        href={assignmentDetail.metadata}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {assignmentDetail.metadata}
                                    </a>
                                </div>
                            </div>
                            <div
                                style={{ flex: 1 }}
                                className={cn(styles.head)}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "20px",
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "title-green",
                                            styles.title
                                        )}
                                    >
                                        Chấm điểm
                                    </div>
                                    {assignmentDetail.score !== null && assignmentDetail.score !== undefined ? (
                                        <div>Đã chấm điểm: {assignmentDetail.score}</div>
                                    ) : (
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <Controller
                                                render={({
                                                    field: {
                                                        onChange,
                                                        onBlur,
                                                        value,
                                                    },
                                                }) => (
                                                    <TextInput
                                                        className={styles.field}
                                                        label="Số điểm muốn chấm"
                                                        type="number"
                                                        required
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                    />
                                                )}
                                                name="score"
                                                control={control}
                                            />
                                            <button
                                                className={cn(
                                                    "button",
                                                    styles.button
                                                )}
                                                style={{}}
                                                type="submit"
                                            >
                                                Chấm điểm
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                            {/* <div style={{ flex: 1 }} className={cn(styles.head)}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div className={cn("title-green", styles.title)}>
                    Phúc khảo
                  </div>
                  <div className={styles.messagebox}>
                    <div className={styles.another_message}>
                      <div className={styles.name}>khagnnl2412@gmail.com</div>
                      <div className={styles.content}>Phúc khảo giúp em</div>
                    </div>
                    <div className={styles.your_message}>
                      <div className={styles.name}>Bạn</div>
                      <div className={styles.content}>Phúc cc</div>
                    </div>
                  </div>
                  <form onSubmit={handleSubmitReview(onSubmitReview)}>
                    <Controller
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          className={styles.field}
                          label="Nội dung phản hồi"
                          type="text"
                          required
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                        />
                      )}
                      name="reviewContent"
                      control={reviewControl}
                    />
                    <button
                      className={cn("button", styles.button)}
                      style={{}}
                      type="submit"
                    >
                      Gửi
                    </button>
                  </form>
                </div>
              </div> */}
                        </div>
                    </Card>
                </div>
            </div>
        ),
        document.body
    );
};

export default MarkAssignmentModal;
