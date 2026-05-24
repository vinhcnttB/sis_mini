import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { createPortal } from "react-dom";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import styles from "./SettingModal.module.sass";
import Icon from "../../../../components/Icon";
import Card from "../../../../components/Card";
import TextInput from "../../../../components/TextInput";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Dropdown from "../../../../components/Dropdown";
import { errorToast, successToast } from "../../../../utils/toast";
import { classServices } from "../../../../services/ClassServices";
import { userServices } from "../../../../services/UserServices";
const SettingModal = ({
  visible,
  onClose,
  classDetail,
  item,
  classId,
  urlClass,
  classCode,
  gradeComposition,
  classInfo,
}) => {
  const {
    control: controlScore,
    setValue: setValueScore,
    handleSubmit: handleSubmitScore,
  } = useForm();

  const {
    control: controlClassInfo,
    setValue: setValueClassInfo,
    handleSubmit: handleSubmitClassInfo,
  } = useForm();
  const {
    fields: fieldsScore,
    append: appendScore,
    remove: removeScore,
  } = useFieldArray({
    control: controlScore,
    name: "grades",
  });
  const { control: controlUploadStudent, handleSubmit: handleUploadStudent } =
    useForm();

  const arrangeOption = ["Tăng dần", "Giảm dần"];
  const [optionValue, setOptionValue] = useState(arrangeOption[0]);
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
    // set old value for grade composition
    setValueScore("grades", gradeComposition);
    setValueClassInfo("name", classInfo.name);
    setValueClassInfo("description", classInfo.description);
    setValueClassInfo("maximumStudents", classInfo.maximumStudents);
  }, [gradeComposition, classInfo]);

  // Handle upload student list
  const onUploadStudent = async (data) => {
    if (data) {
      const formData = new FormData();
      formData.append("file", data.file);
      try {
        // You can write the URL of your server or any other endpoint used for file upload
        const response = await userServices.updateStudentIdByFile(formData);
        if (response.status) {
          window.location.reload();
          return successToast("Upload thành công!");
        } else return errorToast("Không thể upload. Vui lòng thử lại sau");
      } catch (error) {
        return errorToast("Không thể upload. Vui lòng thử lại sau");
      }
    }
  };
  // Handle submit score compositions
  const onSubmitScore = async (data) => {
    // Validate data before submit
    data.grades = data.grades.map((item, index) => {
      return {
        name: item.name,
        percentage: parseInt(item.percentage),
      };
    });
    const calculateTotalPercentage = (grades) => {
      let sum = 0;
      for (let i = 0; i < grades.length; i++) {
        sum = sum + grades[i].percentage;
      }
      return sum;
    };
    const totalPercent = calculateTotalPercentage(data.grades);
    if (totalPercent !== 100) {
      return errorToast("Tổng điểm thành phần phải là 100%");
    }
    // call API to send data to server
    const response = await classServices.updateClassGradeComposition(
      classId,
      data
    );
    if (response.status) {
      successToast("Cập nhật thành công!", 3000);
      window.location.reload();
    } else {
      errorToast("Cập nhật thất bại!");
      window.location.reload();
    }
  };

  // Handle submit class info
  const onSubmitClassInfo = async (classInfo) => {
    // Change maximumStudent to int
    const requestData = {
      ...classInfo,
      maximumStudents: parseInt(classInfo.maximumStudents),
    };
    // Call API to update
    const response = await classServices.updateClassDetail(
      classId,
      requestData
    );
    if (response.status) {
      return successToast("Cập nhật thành công!", 3000);
    } else {
      return errorToast("Cập nhật thất bại!");
    }
  };

  const downloadBase64File = (base64Data, filename) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle download class student list
  const handleDownloadClassList = async () => {
    const response = await classServices.downloadClassList(classId);
    if (response.status) {
      downloadBase64File(response.data, `StudentList_${Date.now()}.xlsx`);
    } else {
      return errorToast("Lấy danh sách thất bại");
    }
  };

  const sortValue = (isAscending) => {
    if (isAscending === true) {
      // sắp xếp tăng dần
      fieldsScore.sort((a, b) => a.percentage - b.percentage);
    } else {
      // sắp xếp giảm dần
      fieldsScore.sort((a, b) => b.percentage - a.percentage);
    }
  };
  return createPortal(
    visible && (
      <div id="modal-product" className={styles.modal}>
        <div className={styles.control}>
          <div className={cn("button-white", styles.button)}>Thông tin lớp</div>
          <button className={styles.close} onClick={onClose}>
            <Icon name="close" size="20" />
          </button>
        </div>
        <div className={styles.outer}>
          <Card
            className={cn(styles.card)}
            title="Thông tin chung"
            classTitle={cn("title-green", styles.title)}
          >
            <form
              onSubmit={handleSubmitClassInfo(onSubmitClassInfo)}
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
                    label="Tên lớp học"
                    type="text"
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="name"
                control={controlClassInfo}
              />

              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={styles.field}
                    label="Mô tả lớp học"
                    type="text"
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="description"
                control={controlClassInfo}
              />
              <Controller
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={styles.field}
                    label="Số lượng tối đa"
                    type="number"
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
                name="maximumStudents"
                control={controlClassInfo}
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
          <Card
            className={cn(styles.card)}
            title="Thang điểm"
            classTitle={cn("title-green", styles.title)}
            classCardHead={cn(styles.head, {
              [styles.hidden]: visible,
            })}
            head={
              <div className={styles.dropdownBox}>
                <Dropdown
                  className={styles.dropdown}
                  classDropdownHead={styles.dropdownHead}
                  value={optionValue}
                  setValue={setOptionValue}
                  sortValue={sortValue}
                  options={arrangeOption}
                  small
                />
              </div>
            }
          >
            <form
              className={styles.description}
              onSubmit={handleSubmitScore(onSubmitScore)}
            >
              {fieldsScore.map((item, index) => (
                <div
                  key={item.id}
                  className={styles.group}
                  style={{ marginTop: "20px" }}
                >
                  <Controller
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={styles.field}
                        label=""
                        type="text"
                        placeholder="Tên cột điểm"
                        required
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                    name={`grades.${index}.name`}
                    control={controlScore}
                  />
                  <Controller
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={styles.field}
                        label=""
                        type="number"
                        placeholder="Tỉ lệ điểm (%)"
                        required
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                    name={`grades.${index}.percentage`}
                    control={controlScore}
                  />
                  <button
                    className={`${styles.field} ${styles.close}`}
                    onClick={() => {
                      removeScore(index);
                    }}
                  >
                    <Icon name="close" size="20" />
                  </button>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  className={cn("button", styles.button)}
                  style={{ marginTop: "20px" }}
                  onClick={() =>
                    appendScore({
                      name: "",
                      percentage: "",
                    })
                  }
                >
                  Thêm loại điểm
                </button>
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
          <Card
            className={cn(styles.card)}
            title="Liên kết mời"
            classTitle={cn("title-green", styles.title)}
          >
            {/**Url invite */}
            <div className={styles.description}>
              <div className={styles.info}>
                Đây là đường dẫn đến lớp học của bạn: <br /> {urlClass}
              </div>
              <div>
                <button
                  onClick={() => {
                    navigator.clipboard
                      .writeText(urlClass)
                      .then(() => {
                        return successToast("Đã sao chép!", 1000);
                      })
                      .catch((err) => {
                        return errorToast("Sao chép thất bại!", 1000);
                      });
                  }}
                  className={cn("button", styles.button)}
                >
                  <span>Copy</span>
                  <Icon name="arrow-right" size="24" />
                </button>
              </div>
            </div>

            <div className={styles.description}>
              <div className={styles.info}>
                Đây là mã mời đến lớp học của bạn: <br /> {classCode}
              </div>
              {/**Key Invite */}
              <div>
                <button
                  onClick={() => {
                    navigator.clipboard
                      .writeText(classCode)
                      .then(() => {
                        return successToast("Đã sao chép!", 1000);
                      })
                      .catch((err) => {
                        return errorToast("Sao chép thất bại!", 1000);
                      });
                  }}
                  className={cn("button", styles.button)}
                >
                  <span>Copy</span>
                  <Icon name="arrow-right" size="24" />
                </button>
              </div>
            </div>
          </Card>
          <Card
            className={cn(styles.card)}
            title="Upload và Download danh sách học sinh"
            classTitle={cn("title-green", styles.title)}
          >
            <form onSubmit={handleUploadStudent(onUploadStudent)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: "20px",
                }}
              >
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
                      value={value?.fileName}
                      multiple={false}
                    />
                  )}
                  name="file"
                  control={controlUploadStudent}
                />
                <button
                  type="submit"
                  className={cn("button-white", styles.button)}
                  style={{ marginTop: "20px" }}
                >
                  Upload danh sách
                </button>
              </div>
            </form>
            <button
              onClick={handleDownloadClassList}
              className={cn("button-white", styles.button)}
              style={{ marginTop: "20px" }}
              type="button"
            >
              Download danh sách
            </button>
          </Card>
        </div>
      </div>
    ),
    document.body
  );
};

export default SettingModal;
