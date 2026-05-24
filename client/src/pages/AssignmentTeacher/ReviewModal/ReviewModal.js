import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { createPortal } from "react-dom";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import styles from "./ReviewModal.module.sass";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import LargeInput from "../../../components/LargeInput";
import TextInput from "../../../components/TextInput";
import { errorToast, successToast } from "../../../utils/toast";
import { assignmentServices } from "../../../services/AssignmentServices";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
const ReviewModal = ({ visible, onClose, item }) => {
  const { user } = useAuth();
  const { assignmentId } = useParams();
  const [messageData, setMessageData] = useState([]);
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
  const { control: messageControl, handleSubmit: handleMessageSubmit } =
    useForm();

  // Lấy nội dung tin nhắn
  useEffect(() => {
    const getMessageList = async () => {
      const studentRequestedReviewId = item.studentRequestedReviewId;
      try {
        const response = await assignmentServices.getMessageList(
          studentRequestedReviewId
        );
        if (response.status) {
          setMessageData(response.data);
        } else {
          return errorToast("Không lấy được tin nhắn. Vui lòng thử lại sau.");
        }
      } catch (error) {
        return errorToast("Không lấy được tin nhắn. Vui lòng thử lại sau.");
      }
    };
    getMessageList();
  }, []);

  const handleReviewScore = async (isAccepted) => {
    try {
      if (isAccepted) {
        const response = await assignmentServices.updateReviewScoreResult(
          item.studentRequestedReviewId,
          {
            actualScore: item.expectedScore,
            status: isAccepted ? "ACCEPT" : "DENIED",
            studentAssignmentId: item.studentAssignmentId,
          }
        );
        if (response.status) {
          window.location.reload();
          return successToast("Đã cập nhật thành công", 2000);
        } else {
          return errorToast("Không gửi được. Vui lòng thử lại sau.");
        }
      } else {
        const response = await assignmentServices.updateReviewScoreResult(
          item.studentRequestedReviewId,
          {
            status: isAccepted ? "ACCEPT" : "DENIED",
            studentAssignmentId: item.studentAssignmentId,
          }
        );
        if (response.status) {
          window.location.reload();
          return successToast("Đã cập nhật thành công", 2000);
        } else {
          return errorToast("Không gửi được. Vui lòng thử lại sau.");
        }
      }
    } catch (error) {
      return errorToast("Không gửi được. Vui lòng thử lại sau");
    }
  };

  const onSubmitMessage = async (data) => {
    try {
      const response = await assignmentServices.sendMessage(
        assignmentId,
        item.studentRequestedReviewId,
        data.message
      );
      if (response.status) {
        window.location.reload();
        return successToast("Đã gửi tin nhắn", 2000);
      } else {
        return errorToast("Không gửi được. Vui lòng thử lại sau.");
      }
    } catch (error) {
      return errorToast("Không gửi được. Vui lòng thử lại sau");
    }
  };
  return createPortal(
    visible && (
      <div id="modal-product" className={styles.modal}>
        <div className={styles.control}>
          <div className={cn("button-white", styles.button)}>Phúc khảo</div>
          <button className={styles.close} onClick={onClose}>
            <Icon name="close" size="20" />
          </button>
        </div>
        <div className={styles.outer}>
          <Card className={cn(styles.card)}>
            <div style={{ display: "flex", gap: "40px" }}>
              <div style={{ flex: 3 }} className={cn(styles.head)}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div className={cn("title-green", styles.title)}>
                    Nhắn tin
                  </div>
                  <div>Nội dung tin nhắn</div>
                  <div className={styles.messagebox}>
                    {messageData.length &&
                      messageData.map((message, index) => {
                        if (message.userId !== user?.id) {
                          return (
                            <div className={styles.another_message}>
                              <div className={styles.name}>{message.user}</div>
                              <div className={styles.content}>
                                {message.message}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className={styles.your_message}>
                              <div className={styles.name}>{message.user}</div>
                              <div className={styles.content}>
                                {message.message}
                              </div>
                            </div>
                          );
                        }
                      })}
                  </div>
                  {item?.status === "OPENED" ? (
                    <form
                      onSubmit={handleMessageSubmit(onSubmitMessage)}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: "20px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Controller
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              className={styles.field}
                              label="Nội dung nhắn"
                              type="text"
                              value={value}
                              onChange={onChange}
                            />
                          )}
                          name="message"
                          control={messageControl}
                        />
                      </div>
                      <button
                        className={cn("button-white", styles.button)}
                        style={{ marginTop: "20px" }}
                        type="submit"
                      >
                        Gửi
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
              <div style={{ flex: 1 }} className={cn(styles.head)}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div className={cn("title-green", styles.title)}>
                    Chấm điểm
                  </div>
                  <div>
                    <TextInput
                      className={styles.field}
                      label="Số điểm mong muốn"
                      type="number"
                      value={item.expectedScore}
                      disabled
                    />
                    <br />
                    <LargeInput
                      className={styles.field}
                      label="Lý do phúc khảo"
                      value={item.comment || "Không có lý do được cung cấp"}
                      disabled
                    />
                    <br />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      {item?.status === "OPENED" ? (
                        <>
                          <button
                            onClick={() => {
                              handleReviewScore(true);
                            }}
                            className={cn("button", styles.button)}
                          >
                            Đồng ý
                          </button>
                          <button
                            onClick={() => {
                              handleReviewScore(false);
                            }}
                            className={cn("button", styles.button)}
                            style={{}}
                          >
                            Từ chối
                          </button>{" "}
                        </>
                      ) : (
                        <div>Đã xử lý xong</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    document.body
  );
};

export default ReviewModal;
