import React, { useState } from "react";
import cn from "classnames";
import styles from "./SignUp.module.sass";
import { use100vh } from "react-div-100vh";
import { Link } from "react-router-dom";
import TextInput from "../../components/TextInput";
import { EMAIL_REGEX } from "../../constants";
import { authServices } from "../../services/AuthServices";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { errorToast, successToast } from "../../utils/toast";
const SignUp = () => {
  const initialState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const [userAccount, setUserAccount] = useState(initialState);
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValidData = validateData(userAccount);
    if (isValidData === 1) {
      const { confirmPassword, ...userData } = userAccount;
      const response = await authServices.signup(userData);
      if (response.status === true) {
        successToast(
          "Đăng ký thành công. Một tin nhắn xác thực đã được gửi đến email của bạn. Vui lòng vào email để xác thực trước khi đăng nhập.",
          3000
        );
        navigate("/");
      } else {
        return errorToast(response.message);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserAccount((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateData = (userAccount) => {
    let result = 1;
    if (userAccount.firstName === "") {
      return errorToast("Tên không được để trống");
    }
    if (userAccount.lastName === "") {
      return errorToast("Họ không được để trống");
    }
    if (userAccount.email === "") {
      return errorToast("Email không được để trống");
    }
    if (EMAIL_REGEX.test(userAccount.email) === false) {
      return errorToast("Email không hợp lệ");
    }
    if (userAccount.password === "") {
      return errorToast("Mật khẩu không được để trống");
    }
    if (userAccount.password !== userAccount.confirmPassword) {
      return errorToast("Xác nhận mật khẩu không trùng khớp");
    }
    if (userAccount.confirmPassword === "") {
      return errorToast("Xác nhận mật khẩu không được để trống");
    }
    return result;
  };

  const heightWindow = use100vh();

  return (
    <div className={styles.login} style={{ minHeight: heightWindow }}>
      <div className={styles.wrapper}>
        <form className={styles.form}>
          <div className={cn("h2", styles.title)}>Đăng ký</div>
          <div className={styles.body}>
            <TextInput
              className={styles.field}
              name="firstName"
              type="text"
              placeholder="Tên của bạn"
              required
              icon="edit"
              onChange={handleChange}
              value={userAccount.firstName}
            />
            <TextInput
              className={styles.field}
              name="lastName"
              type="text"
              placeholder="Họ của bạn"
              required
              icon="edit"
              onChange={handleChange}
              value={userAccount.lastName}
            />
            <TextInput
              className={styles.field}
              name="email"
              type="email"
              placeholder="Địa chỉ Email"
              required
              icon="mail"
              onChange={handleChange}
              value={userAccount.email}
            />
            <TextInput
              className={styles.field}
              name="password"
              type="password"
              placeholder="Mật khẩu"
              required
              icon="lock"
              onChange={handleChange}
              value={userAccount.password}
            />
            <TextInput
              className={styles.field}
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu"
              required
              icon="lock"
              onChange={handleChange}
              value={userAccount.confirmPassword}
            />
            <button
              onClick={handleSubmit}
              className={cn("button", styles.button)}
            >
              Đăng ký
            </button>
            <div className={styles.note}>
              Trang web này thực hiện cho môn học Phát triển ứng dụng Web nâng
              cao.
            </div>
            <div className={styles.info}>
              Đã có tài khoản?{" "}
              <Link className={styles.link} to="../sign-in">
                Đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
