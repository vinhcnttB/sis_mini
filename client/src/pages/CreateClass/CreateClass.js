import React, { useState } from "react";
import cn from "classnames";
import styles from "./CreateClass.module.sass";
import Card from "../../components/Card";
import TextInput from "../../components/TextInput";
import Panel from "./Panel";
import { errorToast, successToast } from "../../utils/toast";
import { helper } from "../../utils/helper";
import { classServices } from "../../services/ClassServices";
import { useNavigate } from "react-router-dom";
import LargeInput from "../../components/LargeInput";

// Giao diện màn hình tạo lớp học cho giáo viên
const CreateClass = ({ className }) => {
  // State cho tạo lớp học
  const initialState = {
    name: "",
    maximumStudents: "",
    description: "",
  };

  // dùng hook useNavigate để redirect
  const navigate = useNavigate();

  // Khởi tạo state từ initialState
  const [createClass, setCreateClass] = useState(initialState);

  // Xử lý việc tạo lớp
  const handleCreateClass = async () => {
    if (validateData(createClass) === 1) {
      // Chuyển số lượng về number
      const classRequest = {
        ...createClass,
        maximumStudents: parseInt(createClass.maximumStudents),
      };
      // Gọi API xử lý
      const response = await classServices.createClass(classRequest);
      if (response.status) {
        // Nếu thành công: thông báo thành công và quay về trang class
        successToast("Tạo lớp học thành công!", 2000);
        navigate("/classes", { replace: true });
      } else {
        // Nếu thất bại: thông báo lỗi
        return errorToast(response.message);
      }
    }
  };

  // Xử lý validate data
  const validateData = (classInfo) => {
    let result = 1;
    if (classInfo.name === "") {
      return errorToast("Tên lớp không được để trống");
    }
    if (!helper.isPositiveNumber(classInfo.maximumStudents)) {
      return errorToast("Số lượng tối đa không hợp lệ");
    }
    if (classInfo.description === "") {
      return errorToast("Mô tả không được để trống");
    }
    return result;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCreateClass((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Tạo lớp học"
        classTitle={cn("title-green", styles.title)}
      >
        <div className={styles.description}>
          <TextInput
            className={styles.field}
            label="Tên lớp học"
            name="name"
            type="text"
            required
            onChange={handleChange}
          />
          <LargeInput
            className={styles.field}
            label="Mô tả lớp học"
            name="description"
            type="text"
            required
            onChange={handleChange}
          />
          <TextInput
            className={styles.field}
            label="Số lượng tối đa"
            name="maximumStudents"
            type="text"
            required
            onChange={handleChange}
          />
        </div>
      </Card>
      <Panel onCreateClass={handleCreateClass} />
    </>
  );
};

export default CreateClass;
