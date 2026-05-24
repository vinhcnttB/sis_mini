import React, { useState, useEffect } from "react";
import styles from "./CustomerList.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Form from "../../../components/Form";
import TextInput from "../../../components/TextInput";
import Table from "./Table";
import GradeTable from "./GradeTable";
import Panel from "./Panel";
import Details from "./Details";
import Modal from "./Modal";
import Icon from "../../../components/Icon";
import { errorToast, successToast } from "../../../utils/toast";
import { useAuth } from "../../../hooks/useAuth";
import { classServices } from "../../../services/ClassServices";
import { useParams } from "react-router-dom";
import { useRef } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { EMAIL_REGEX } from "../../../constants";
import SettingModal from "./SettingModal";
import ClassInfoDashboard from "./ClassInfoDashboard";
import Schedule from "./Schedule";
import Attendance from "./Attendance";
const optionListTeacher = ["Bảng tin", "Danh sách", "Bảng điểm", "Lịch học", "Điểm danh"];
const CustomerList = () => {
  const { user, token } = useAuth();
  const [classInfo, setClassInfo] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradeComposition, setGradeComposition] = useState([]);
  const [classCode, setClassCode] = useState(null);
  const [urlClass, setUrlClass] = useState("http://example.com");
  const [activeUser, setActiveUser] = useState({});
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [optionValue, setOptionValue] = useState(optionListTeacher[0]);
  const [gradeBoard, setGradeBoard] = useState();
  const [visibleSettingModal, setVisibleSettingModal] = useState(false);
  const handleActive = (user) => {
    setActiveUser(user);
  };

  const [isLoading, setIsLoading] = useState(false);
  const { classId } = useParams();
  const fetchGradeBoard = async () => {
    setIsLoading(true);
    const response = await classServices.getGradeBoard(classId);
    const responseData = await response.data;
    setGradeBoard(responseData);
    setIsLoading(false);
  };

  const fetchClassDetail = async () => {
    setIsLoading(true);
    try {
      const response = await classServices.getClassDetail(classId);
      const responseData = response.data;
      if (!responseData) {
        setIsLoading(false);
        return;
      }
      setClassCode(responseData.uniqueCode);
      setClassInfo({
        name: responseData.name,
        description: responseData.description,
        maximumStudents: responseData.maximumStudents,
      });
      const loadTeachers = responseData.teachers?.map((teacher) => ({
        name: teacher.firstName + " " + teacher.lastName,
        email: teacher.email,
        id: teacher.id,
        role: "Giáo viên",
      })) || [];
      setTeachers(loadTeachers);

      const loadStudents = responseData.students?.map((student) => ({
        name: student.firstName + " " + student.lastName,
        email: student.email,
        id: student.id,
        role: "Học sinh",
      })) || [];
      setStudents(loadStudents);

      // Fetch invite link
      try {
        const urlResp = await classServices.getInviteLinkClass(classId);
        if (urlResp.status) setUrlClass(urlResp.data);
      } catch (_) {}

      // Fetch grade composition
      try {
        const gradeResp = await classServices.getClassGradeComposition(classId);
        if (gradeResp.status) {
          const gradeCompositionData = gradeResp.data.map((grade) => ({
            id: grade.id,
            name: grade.name,
            percentage: grade.percentage,
            assignments: grade.assignments ? grade.assignments : [],
          }));
          setGradeComposition(gradeCompositionData);
        }
      } catch (_) {}
    } catch (err) {
      errorToast("Không thể lấy thông tin lớp học. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchGradeBoard();
    fetchClassDetail();
  };

  useEffect(() => {
    fetchGradeBoard();
  }, [classId]);
  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = (e) => {
    alert();
  };
  // Modal để thêm học sinh
  const handleAddingStudent = () => {
    setOpenModal(true);
    setContent(
      <>
        <div className={cn("title-green", styles.modaltitle)}>
          Thêm thành viên
        </div>
        <div className={styles.info}>
          Thêm các thành viên vào lớp học của bạn.
        </div>
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
            label="Địa chỉ email"
            name="title"
            type="text"
            required
            innerRef={inputRef}
          />
          <button
            className={cn("button-stroke", styles.button)}
            onClick={handleInviteMember}
          >
            <span>Thêm</span>
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

  // Import students from Excel file
  const handleImportStudents = () => {
    fileInputRef.current?.click();
  };

  const isTeacher = teachers.some((t) => t.id === user.id);

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm("Bạn có chắc chắn muốn loại học sinh này khỏi lớp?")) {
      const response = await classServices.removeStudent(classId, studentId);
      if (response.status) {
        successToast("Đã loại học sinh khỏi lớp", 2000);
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        if (activeUser?.id === studentId) {
          setVisible(false);
        }
      } else {
        errorToast(response.message || "Có lỗi xảy ra", 2000);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const response = await classServices.importStudentsFromExcel(classId, file);
    if (response.status) {
      successToast(`Nhập danh sách thành công! Đã thêm ${response.data?.added || 0} sinh viên.`, 3000);
      // Reload class data
      window.location.reload();
    } else {
      errorToast(response.message || "Nhập danh sách thất bại");
    }
    // Reset file input
    e.target.value = null;
  };

  const downloadBase64File = (base64Data, filename) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download sample Excel template
  const handleDownloadSampleTemplate = async () => {
    const response = await classServices.downloadSampleTemplate(classId);
    if (response.status) {
      downloadBase64File(response.data, `Sample_Student_Template_${Date.now()}.xlsx`);
    } else {
      errorToast("Tải mẫu Excel thất bại");
    }
  };

  const handleDownloadGradeBoard = async () => {
    const response = await classServices.exportGradeBoard(classId);
    if (response.status) {
      downloadBase64File(response.data, `GradeBoard_${Date.now()}.xlsx`);
    } else {
      return errorToast("Lấy bảng điểm thất bại");
    }
  };
  // Modal để show xác nhận rời khỏi lớp
  const handleOutGroup = () => {
    setOpenModal(true);
    setContent(
      <>
        <div className={cn("title-green", styles.modaltitle)}>
          Xác nhận rời lớp
        </div>
        <div className={styles.info}>
          Bạn thật sự muốn rời khỏi lớp học này chứ?
        </div>
        <div className={styles.foot}>
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            className={cn("button-stroke", styles.button)}
          >
            <span>Quay lại</span>
          </button>
          <button className={cn("button", styles.button)}>
            <span>Rời lớp</span>
            <Icon name="arrow-right" size="24" />
          </button>
        </div>
      </>
    );
  };

  const [openModal, setOpenModal] = useState(false);
  const [content, setContent] = useState(null);

  const handleInviteMember = async () => {
    // Sử dụng current để truy cập đến phần tử DOM
    const email = inputRef.current.value;
    if (validateData(email) === 1) {
      // 2. Gọi API để kiểm tra xem email có tồn tại hay không
      const response = await classServices.checkEmailExist(classId, email);
      if (response.status) {
        successToast("Đã gửi lời mời!", 2000);
        setOpenModal(false);
      } else {
        errorToast("Tài khoản này chưa tham gia vào ứng dụng!");
      }
    }
  };

  const validateData = (email) => {
    let result = 1;
    if (email === "") {
      return errorToast("Email không được để trống");
    }
    if (EMAIL_REGEX.test(email) === false) {
      return errorToast("Email không hợp lệ");
    }
    return result;
  };

  // Xử lí việc rời khỏi lớp học
  const handleOutClass = () => {};

  return (
    <>
      <Card
        className={styles.card}
        title="Thông tin lớp học"
        classTitle={cn("title-purple", styles.title)}
        classCardHead={cn(styles.head, { [styles.hidden]: visible })}
        head={
          <>
            <button 
              className={cn("button-stroke", styles.button)} 
              onClick={handleRefresh}
              style={{ marginRight: '10px' }}
            >
              Làm mới
            </button>
            <Form
              className={styles.form}
              value={search}
              setValue={setSearch}
              onSubmit={() => handleSubmit()}
              placeholder="Tìm theo tên hoặc theo email"
              type="text"
              name="search"
              icon="search"
            />
            {/**Button xem thông tin cài đặt của lớp học */}
            {user?.role === "teacher" && (
              <button
                style={{ marginLeft: "20px" }}
                className={cn(
                  "button-square-stroke button-small",
                  styles.button
                )}
                onClick={() => setVisibleSettingModal(true)}
              >
                <Icon name="setting" size="24" />
              </button>
            )}
          </>
        }
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && (
          <>
            <div className={styles.nav}>
              {optionListTeacher.map((x, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: x === optionValue,
                  })}
                  onClick={() => setOptionValue(x)}
                  key={index}
                  type="button"
                >
                  {x}
                </button>
              ))}
            </div>
            <div className={cn(styles.row, { [styles.flex]: visible })}>
            {optionValue === "Bảng tin" && (
              <ClassInfoDashboard classId={classId} />
            )}
            {optionValue === "Danh sách" && (
              <>
                {teachers.length === 0 && students.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", width: "100%" }}>
                    Không tìm thấy thành viên nào trong lớp
                  </div>
                ) : (
                  <Table
                    className={styles.table}
                    activeTable={visible}
                    setActiveTable={setVisible}
                    teachers={teachers}
                    students={students}
                    onActive={handleActive}
                    isTeacher={isTeacher}
                    onRemoveStudent={handleRemoveStudent}
                  />
                )}
              </>
            )}

            {optionValue === "Bảng điểm" && (
              <GradeTable
                gradeBoard={gradeBoard}
                gradeComposition={gradeComposition}
                className={styles.table}
                activeTable={visible}
                setActiveTable={setVisible}
                teachers={teachers}
                students={students}
                onActive={handleActive}
              />
            )}

            {optionValue === "Lịch học" && (
              <Schedule classId={classId} />
            )}

            {optionValue === "Điểm danh" && (
              <Attendance classId={classId} isTeacher={isTeacher} students={students} />
            )}

            <Details
              className={styles.details}
              onClose={() => setVisible(false)}
              activeUser={activeUser}
            />
          </div>
          </>
        )}

      </Card>
      {!isLoading && gradeComposition && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
          <Panel
            role={user.role}
            activeTab={optionValue}
            addStudent={handleAddingStudent}
            outGroup={handleOutGroup}
            downloadGradeBoard={handleDownloadGradeBoard}
            importStudents={handleImportStudents}
            downloadSampleTemplate={handleDownloadSampleTemplate}
          />
          <Modal
            outerClassName={styles.outer}
            visible={openModal}
            onClose={() => setOpenModal(false)}
          >
            {content}
          </Modal>
          <SettingModal
            urlClass={urlClass}
            classCode={classCode}
            classId={classId}
            classInfo={classInfo}
            gradeComposition={gradeComposition}
            visible={visibleSettingModal}
            onClose={() => setVisibleSettingModal(false)}
          />
        </>
      )}
    </>
  );
};

export default CustomerList;
