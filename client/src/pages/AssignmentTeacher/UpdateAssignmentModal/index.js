import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { createPortal } from "react-dom";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import styles from "./UpdateAssignmentModal.module.sass";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import { useForm, Controller } from "react-hook-form";
import TextInput from "../../../components/TextInput";
import LargeInput from "../../../components/LargeInput";
import Dropdown from "../../../components/Dropdown";
import { assignmentServices } from "../../../services/AssignmentServices";
import { classServices } from "../../../services/ClassServices";
import { errorToast, successToast } from "../../../utils/toast";
const UpdateAssignmentModal = ({
  visible,
  onClose,
  classId,
  assignmentInfo,
}) => {
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
    setValueAssignmentInfo("name", assignmentInfo.name || "");
    setValueAssignmentInfo("gradeId", assignmentInfo.gradeId);
    setValueAssignmentInfo(
      "dueDate",
      assignmentInfo.dueDate ? assignmentInfo.dueDate.slice(0, 16) : ""
    );
    setValueAssignmentInfo("description", assignmentInfo.description || "");
    setValueAssignmentInfo("metadata", assignmentInfo.metadata || "");
    setValueAssignmentInfo("classId", classId);
    // Get grades
    const getGradeCompositon = async () => {
      const response = await classServices.getClassGradeComposition(classId);
      if (response.status) {
        setGradeTypesList(response.data);
        const gradeCompositionNameList = [];
        response.data.map((gradeComposition, index) => {
          gradeCompositionNameList.push(gradeComposition.name);
        });
        if (gradeCompositionNameList.length === 0) {
          gradeCompositionNameList.push("Không có dữ liệu");
        }
        setGradeTypesNameList(gradeCompositionNameList);
        const matched = response.data.find(
          (item) => item.id === assignmentInfo.gradeId
        );
        if (matched) {
          setValueAssignmentInfo("gradeType", matched.name);
        }
      } else {
      }
    };
    getGradeCompositon();
    // Get assignment created
  }, []);
  const onUpdateAssignmentInfo = async (data) => {
    if (data.gradeType === "Không có dữ liệu" || !data.gradeType) {
      return errorToast("Vui lòng tạo thêm thang điểm trong Cài đặt lớp!");
    }
    // Get gradeId
    let gradeTypeChoose;
    let fileUrl;
    for (let i = 0; i < gradeTypesList.length; i++) {
      if (data.gradeType === gradeTypesList[i].name) {
        gradeTypeChoose = gradeTypesList[i];
      }
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
    // Call API to update assignment info
    const response = await assignmentServices.updateAssignment(
      requestObject,
      assignmentInfo.id
    );
    if (response.status) {
      successToast("Cập nhật bài tập thành công!", 2000);
      const newGradeTypesNameList = gradeTypesNameList.filter(
        (item, index) => item !== gradeTypeChoose.name
      );
      setGradeTypesNameList(newGradeTypesNameList);
      resetForm();
      window.location.reload();
    } else {
      return errorToast("Cập nhật thất bại");
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
            title="Cập nhật thông tin bài tập"
            classTitle={cn("title-green", styles.title)}
          >
            <form
              onSubmit={handleSubmitAssignmentInfo(onUpdateAssignmentInfo)}
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
                  Cập nhật
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

export default UpdateAssignmentModal;
