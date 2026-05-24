import React, { useState } from "react";
import cn from "classnames";
import styles from "./SignIn.module.sass";
import { use100vh } from "react-div-100vh";
import { Link } from "react-router-dom";
import TextInput from "../../components/TextInput";
import { useAuth } from "../../hooks/useAuth";
import { EMAIL_REGEX } from "../../constants";
import { authServices } from "../../services/AuthServices";
import { errorToast } from "../../utils/toast";
import SignInModal from "./SignInModal/index";
import Dropdown from "../../components/Dropdown";
import { getRoleIdFromRole } from "../../utils/Role";
import { userServices } from "../../services/UserServices";

const SignIn = () => {
    const initalState = {
        email: "",
        password: "",
    };
    const [userAccount, setUserAccount] = useState(initalState);
    const [Response, setResponse] = useState(null);
    const [visibleModal, setVisibleModal] = useState(false);
    const { login } = useAuth();
    const roleList = ["Học sinh", "Giáo viên"];
    const [role, setRole] = useState(roleList[0]);

    // Xử lý việc đăng nhập thông thường
    const handleSubmit = async (event) => {
        event.preventDefault();
        const isValidData = validateData(userAccount);
        // Nếu dữ liệu hợp lệ thì gọi API
        if (isValidData === 1) {
            const response = await authServices.login(userAccount);
            if (response?.status === true) {
                setResponse(response.data);
                // Kiểm tra xem đã chọn role chưa
                // Nếu chưa có role (role === 'user') thì yêu cầu chọn role, ngược lại cho vào trang chủ
                if (response.data.user.role !== "user") {
                    login(response.data.user, response.data.token);
                } else {
                    setVisibleModal(true);
                }
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

    const handleUpdateRole = async () => {
        let userRole;
        // role=1: admin
        // role=2: user
        // role=3: student
        // role=4: teacher
        if (role === "Học sinh") {
            userRole = getRoleIdFromRole("student");
        } else if (role === "Giáo viên") {
            userRole = getRoleIdFromRole("teacher");
        } // Gọi service để lấy role ở đây
        const response = await userServices.updateRole(
            Response.user.email,
            Response.user.firstName,
            Response.user.lastName,
            userRole,
            Response.token
        );
        // Nếu thành công: update lên localStorage, cho vào trang đăng nhập
        if (response.status) {
            const updatedResponse = {
                user: {
                    id: Response.user.id,
                    email: Response.user.email,
                    firstName: Response.user.firstName,
                    lastName: Response.user.lastName,
                    role: response.data.user.role,
                    uniqueId: response.data.user.uniqueId,
                },
                token: Response.token,
            };
            login(updatedResponse.user, updatedResponse.token);
        }
        // Nếu thất bại: thông báo lỗi
        else {
            return errorToast(
                "Có lỗi xảy ra trong quá trình cập nhật, vui lòng thử lại sau."
            );
        }
    };
    const validateData = (userAccount) => {
        let result = 1;
        if (userAccount.email === "") {
            return errorToast("Email không được để trống");
        }
        if (EMAIL_REGEX.test(userAccount.email) === false) {
            return errorToast("Email không hợp lệ");
        }
        if (userAccount.password === "") {
            return errorToast("Mật khẩu không được để trống");
        }
        return result;
    };

    const heightWindow = use100vh();
    return (
        <div className={styles.login} style={{ minHeight: heightWindow }}>
            <div className={styles.wrapper}>
                <form className={styles.form}>
                    <div className={cn("h2", styles.title)}>Đăng nhập</div>
                    <div className={styles.head}>
                        <div className={styles.subtitle}>
                            Đăng nhập với tài khoản mạng xã hội
                        </div>
                        <div className={styles.btns}>
                            <button
                                onClick={() => {
                                    authServices.handleOAuthLogin("Google");
                                }}
                                type="button"
                                className={cn("button-stroke", styles.button)}
                            >
                                <img src="/assets/google.svg" alt="Google" />
                                Google
                            </button>
                            <button
                                type="button"
                                className={cn("button-stroke", styles.button)}
                                onClick={() => {
                                    authServices.handleOAuthLogin("Facebook");
                                }}
                            >
                                <img
                                    src="/assets/facebook.svg"
                                    width="33px"
                                    alt="facebook"
                                />
                                Facebook
                            </button>
                        </div>
                    </div>
                    <div className={styles.body}>
                        <div className={styles.subtitle}>
                            Hoặc đăng nhập với email
                        </div>
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
                        <button
                            onClick={handleSubmit}
                            className={cn("button", styles.button)}
                        >
                            Đăng nhập
                        </button>
                        <div
                            className={styles.info}
                            style={{ textAlign: "right" }}
                        >
                            <Link
                                className={styles.link}
                                to="../forgot-password"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className={styles.note}>
                            Trang web này thực hiện cho môn học Phát triển ứng
                            dụng Web nâng cao.
                        </div>
                        <div className={styles.info}>
                            Chưa có tài khoản?{" "}
                            <Link className={styles.link} to="../sign-up">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
            <SignInModal
                outerClassName={styles.outer}
                visible={visibleModal}
                onClose={() => setVisibleModal(false)}
            >
                <div>Chọn vai trò</div>
                <Dropdown
                    className={styles.dropdown}
                    classDropdownHead={styles.dropdownHead}
                    value={role}
                    setValue={setRole}
                    options={roleList}
                    small
                />
                <button
                    style={{ marginTop: "10px" }}
                    className={cn("button-small", styles.button)}
                    onClick={() => {
                        handleUpdateRole();
                    }}
                >
                    Chọn
                </button>
            </SignInModal>
        </div>
    );
};

export default SignIn;
