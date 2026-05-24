import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { createPortal } from "react-dom";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import styles from "./CreateAssignmentModal.module.sass";
import Icon from "../../../../../components/Icon";
import Card from "../../../../../components/Card";
import { useForm, Controller } from "react-hook-form";
import TextInput from "../../../../../components/TextInput";
import LargeInput from "../../../../../components/LargeInput";
import Dropdown from "../../../../../components/Dropdown";
import { assignmentServices } from "../../../../../services/AssignmentServices";
import { classServices } from "../../../../../services/ClassServices";
import { errorToast, successToast } from "../../../../../utils/toast";
const CreateAssignmentModal = ({ visible, onClose, classId }) => {
  const {
    control: controlAssignmentInfo,
    setValue: setValueAssignmentInfo,
    handleSubmit: handleSubmitAssignmentInfo,
    reset: resetForm,
  } = useForm({
    defaultValues: {
      name: "",
      gradeType: "",
      description: "",
      dueDate: "",
      file: null,
    },
  });

  // Manage grade type (but save only name)
  const [gradeTypesNameList, setGradeTypesNameList] = useState([]);
  // Manage grade type
  const [gradeTypesList, setGradeTypesList] = useState([]);
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

  useEffect(() => {
    // Get grades
    const getGradeCompositon = async () => {
      const response = await classServices.getClassGradeComposition(classId);
      if (response.status) {
        setGradeTypesList(response.data);
        const gradeCompositionNameList = [];
        response.data.map((gradeComposition, index) => {
          if (!gradeComposition?.assignments)
            gradeCompositionNameList.push(gradeComposition.name);
        });
        if (gradeCompositionNameList.length === 0) {
          gradeCompositionNameList.push("Không có dữ liệu");
        }
        setGradeTypesNameList(gradeCompositionNameList);
      } else {
      }
    };
    getGradeCompositon();
    // Get assignment created
  }, []);
  const onCreateAssignmentInfo = async (data) => {
    if (data.gradeType === "Không có dữ liệu" || !data.gradeType) {
      return errorToast("Vui lòng tạo thêm thang điểm trong Cài đặt lớp!");
    }
    // Get gradeId
    let fileUrl;
    const gradeTypeChoose = gradeTypesList.find((g) => g.name === data.gradeType);
    if (!gradeTypeChoose) {
      return errorToast("Lỗi: Không tìm thấy loại điểm này trong Cài đặt lớp!");
    }

    // Call API to upload file (if file exists)
    if (data?.file) {
      const uploadFileResponse = await assignmentServices.uploadFile(data.file);
      if (uploadFileResponse.status) {
        fileUrl = uploadFileResponse.data.url;
      } else {
        fileUrl = undefined;
      }
    }
    // Create request object
    const requestObject = {
      classId: classId,
      name: data.name,
      gradeId: gradeTypeChoose.id,
      description: data.description,
      dueDate: undefined,
      metadata: undefined,
    };

    if (data?.dueDate !== undefined) {
      requestObject.dueDate = data.dueDate;
    }

    if (fileUrl !== undefined) {
      requestObject.metadata = fileUrl;
    }
    const response = await assignmentServices.createAssignment(requestObject);
    if (response.status) {
      successToast("Tạo bài tập mới thành công!", 2000);
      const newGradeTypesNameList = gradeTypesNameList.filter(
        (item, index) => item !== gradeTypeChoose.name
      );
      setGradeTypesNameList(newGradeTypesNameList);
      resetForm();
      window.location.reload();
    } else {
      return errorToast("Tạo bài tập mới thất bại");
    }
  };

  return createPortal(
    visible && (
      <div id="modal-product" className={styles.modal}>
        <div className={styles.control}>
          <button className={styles.close} onClick={onClose}>
            <Icon name="close" size="20" />
          </button>
        </div>
        <div className={styles.outer}>
          <Card
            className={cn(styles.card)}
            title="Tạo bài tập mới"
            classTitle={cn("title-green", styles.title)}
          >
            <form
              onSubmit={handleSubmitAssignmentInfo(onCreateAssignmentInfo)}
              className={styles.description}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={styles.field}
                    label="Tên bài tập"
                    type="text"
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="name"
                control={controlAssignmentInfo}
              />
              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <Dropdown
                    className={styles.field}
                    label="Chọn loại kiểm tra"
                    options={gradeTypesNameList}
                    value={value}
                    setValue={onChange}
                    required
                  />
                )}
                name="gradeType"
                control={controlAssignmentInfo}
              />

              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <LargeInput
                    className={styles.field}
                    label="Mô tả bài tập"
                    type="text"
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="description"
                control={controlAssignmentInfo}
              />
              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={styles.field}
                    label="Hạn nộp (Ngày và Giờ)"
                    type="datetime-local"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="dueDate"
                control={controlAssignmentInfo}
              />
              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={styles.field}
                    label="Đính kèm tệp"
                    type="file"
                    onChange={(event) => {
                      onChange(event.target.files[0]);
                    }}
                    onBlur={onBlur}
                    value={value ? undefined : ""}
                  />
                )}
                name="file"
                control={controlAssignmentInfo}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className={cn("button", styles.button)}
                  style={{
                    marginTop: "20px",
                    marginLeft: "20px",
                  }}
                  type="submit"
                >
                  Tạo bài tập
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    ),
    document.body
  );
};

export default CreateAssignmentModal;
