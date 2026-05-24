import React, { useState, useRef } from "react";
import styles from "./GradeTable.module.sass";
import cn from "classnames";
import Checkbox from "../../../../components/Checkbox";
import { errorToast, successToast } from "../../../../utils/toast";
import Loader from "../../../../components/Loader";
import TextInput from "../../../../components/TextInput";
import Row from "./Row";
import Dropdown from "./Dropdown";
import { useAuth } from "../../../../hooks/useAuth";
import Modal from "../Modal";
import { classServices } from "../../../../services/ClassServices";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { assignmentServices } from "../../../../services/AssignmentServices";
// data
import { customers } from "../../../../mocks/customers";

const gradeOptions = ["Xuất", "Nhập", "Chốt"];

let activeAssignment;

const GradeTable = ({
  className,
  activeTable,
  setActiveTable,
  teachers,
  students,
  onActive,
  gradeComposition,
  gradeBoard,
}) => {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const { classId } = useParams();
  const [activeAssignmentId, setActiveAssignmentId] = useState("");

  const [chooseAll, setСhooseAll] = useState(false);
  const [activeId, setActiveId] = useState(customers[0].id);
  const [gradeOptionValue, setGradeOptionValue] = useState("...");
  const [selectedFilters, setSelectedFilters] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [content, setContent] = useState(null);

  const [selectedExcelFile, setSelectedExcelFile] = useState(null);

  const {
    control: controlAssignmentInfo,
    handleSubmit: handleSubmitAssignmentInfo,
  } = useForm();

  const validateGrade = (grade) => {
    let result = 1;
    if (grade < 0 || grade > 10) {
      return errorToast(
        "Điểm nhập vào phải lớn hơn hoặc bằng 0 và bé hơn hoặc bằng 10"
      );
    }
    return result;
  };
  const handleChangeGrade = async (gradeId, userId) => {
    const grade = inputRef.current.value;
    if (validateGrade(grade) === 1) {
      // 2. Gọi API để kiểm tra xem email có tồn tại hay không
      const response = await classServices.updateAssignmentGrade(gradeId, {
        scores: [
          {
            studentId: userId,
            score: grade,
          },
        ],
      });
      if (response.status) {
        window.location.reload();
        return successToast("Đã cập nhật điểm", 2000);
      } else {
        return errorToast("Đã xảy ra lỗi, xin vui lòng thử lại!");
      }
    }
  };
  const handleEditGrade = (grade, userId) => {
    setOpenModal(true);
    console.log(grade, userId);
    setContent(
      <>
        <div className={cn("title-green", styles.modaltitle)}>Sửa điểm</div>
        <div className={styles.info}>Sửa điểm cho sinh viên</div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <TextInput
            className={styles.field}
            label={grade.name + " ( " + grade.percentage + " %) "}
            name="score"
            type="number"
            min="0"
            max="10"
            step="0.01"
            required
            innerRef={inputRef}
          />

          <button
            className={cn("button-stroke", styles.button)}
            onClick={() => {
              handleChangeGrade(grade.id, userId);
            }}
          >
            <span>Sửa</span>
          </button>
        </div>
        <div className={styles.foot}>
          <button
            className={cn("button-stroke", styles.button)}
            onClick={() => {
              setOpenModal(false);
            }}
          >
            <span>Quay lại</span>
          </button>
        </div>
      </>
    );
  };

  const handleChange = (id) => {
    if (selectedFilters.includes(id)) {
      setSelectedFilters(selectedFilters.filter((x) => x !== id));
    } else {
      setSelectedFilters((selectedFilters) => [...selectedFilters, id]);
    }
  };

  const handleClickAssignmentOptions = async (
    option,
    assignmentId,
    gradeId
  ) => {
    if (option === "Xuất") {
      console.log(assignmentId);
      const response = await classServices.downloadScoreFromAssignment(
        assignmentId
      );
      if (response.status) {
        successToast("Lấy thành công", 2000);
        window.open(response.data);
      } else {
        return errorToast("Xuất thất bại, vui lòng thử lại sau");
      }
    }
    if (option === "Nhập") {
      setActiveAssignmentId(assignmentId);
      handleUploadGradeByExcel(assignmentId);
      activeAssignment = assignmentId;
    }
    if (option === "Chốt") {
      const response = await assignmentServices.confirmAssignmentGrade(
        classId,
        gradeId
      );
      if (response.status) {
        successToast("Chốt thành công", 2000);
      } else {
        return errorToast("Chốt thất bại, vui lòng thử lại sau");
      }
    }
  };
  const onUpdateAssignmentInfo = async (data) => {
    if (!data) {
      return errorToast("Bạn chưa tải file lên!");
    }
    const formData = new FormData();
    formData.append("file", data.file);
    try {
      const response = await assignmentServices.markScoreExcel(
        activeAssignment,
        formData
      );
      if (response.status) {
        window.location.reload();
        return successToast("Upload thành công!");
      } else return errorToast("Không thể upload. Vui lòng thử lại sau");
    } catch (error) {
      return errorToast("Không thể upload. Vui lòng thử lại sau");
    }
  };
  // Modal để show xác nhận rời khỏi lớp
  const handleUploadGradeByExcel = (assignmentId) => {
    setOpenModal(true);
    setContent(
      <>
        <div className={cn("title-green", styles.modaltitle)}>
          Nhập điểm bằng excel
        </div>
        <div className={styles.info}>Hãy upload file excel bảng điểm</div>
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
                label="Đính kèm tệp"
                type="file"
                onChange={(event) => {
                  onChange(event.target.files[0]);
                }}
                onBlur={onBlur}
                value={value?.fileName}
              />
            )}
            name="file"
            control={controlAssignmentInfo}
          />

          <div className={styles.foot}>
            <button
              onClick={() => {
                setOpenModal(false);
              }}
              className={cn("button-stroke", styles.button)}
            >
              <span>Quay lại</span>
            </button>
            <button type="submit" className={cn("button", styles.button)}>
              <span>Upload</span>
            </button>
          </div>
        </form>
      </>
    );
  };
  return (
    <>
      <Modal
        outerClassName={styles.outer}
        visible={openModal}
        onClose={() => setOpenModal(false)}
      >
        {content}
      </Modal>
      <div className={cn(styles.wrapper, className)}>
        <div className={cn(styles.table)}>
          <div
            className={cn(styles.row, {
              [styles.active]: activeTable,
            })}
          >
            {/* <div className={styles.col}>
                            <Checkbox
                                className={styles.checkbox}
                                value={chooseAll}
                                onChange={() => setСhooseAll(!chooseAll)}
                            />
                        </div> */}
            <div className={styles.col}>Họ và tên</div>
            <div className={styles.col}>MSSV</div>
            {gradeComposition &&
              gradeComposition.map((grade, index) => (
                <div className={styles.col} key={index}>
                  <div className={styles.flex}>
                    <div>{grade.name} </div>
                    <div className={styles.dropdownBox}>
                      {user.role === "teacher" && (
                        <Dropdown
                          className={styles.dropdown}
                          setValue={setGradeOptionValue}
                          options={gradeOptions}
                          chooseOption={(option) => {
                            console.log(grade);
                            handleClickAssignmentOptions(
                              option,
                              grade.assignments?.id,
                              grade.id
                            );
                          }}
                          small
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            <div className={styles.col} style={{ fontWeight: "bold", color: "#6C5DD3" }}>
              <div className={styles.flex}>
                <div>Tổng kết</div>
              </div>
            </div>
          </div>

          {students.map((x, index) => {
            const studentGradeArray = [];
            let totalScore = 0;
            const studentGradeInfo = gradeBoard?.find(
              (grade) => grade.userId === x.id
            );
            console.log(studentGradeInfo);
            if (!studentGradeInfo) {
              for (let i = 0; i < gradeComposition.length; i++) {
                studentGradeArray.push("");
              }
            } else {
              for (let i = 0; i < gradeComposition.length; i++) {
                const pushedGrade = studentGradeInfo.scores.find(
                  (grade) => grade.gradeName === gradeComposition[i].name
                );
                if (pushedGrade) {
                  studentGradeArray.push(pushedGrade.grade);
                  totalScore += (parseFloat(pushedGrade.grade) * gradeComposition[i].percentage) / 100;
                } else {
                  studentGradeArray.push("");
                }
              }
            }
            console.log(studentGradeArray);
            return (
              <Row
                gradeComposition={gradeComposition}
                item={x}
                studentGradeInfo={studentGradeInfo}
                key={index}
                onChoose={onActive}
                studentGradeArray={studentGradeArray}
                totalScore={studentGradeInfo ? totalScore.toFixed(2) : ""}
                editGrade={(grade, userId) => {
                  handleEditGrade(grade, userId);
                }}
                activeTable={activeTable}
                setActiveTable={setActiveTable}
                activeId={activeId}
                setActiveId={setActiveId}
                value={selectedFilters.includes(x.id)}
                onChange={() => handleChange(x.id)}
              />
            );
          })}
        </div>
        {/* <div className={styles.foot}>
                    <button
                        className={cn("button-stroke button-small", styles.button)}
                    >
                        <Loader className={styles.loader} />
                        <span>Load more</span>
                    </button>
                </div> */}
      </div>
    </>
  );
};

export default GradeTable;
