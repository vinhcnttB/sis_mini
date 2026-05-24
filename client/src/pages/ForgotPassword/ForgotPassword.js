import React, { useState } from "react";
import cn from "classnames";
import styles from "./ForgotPassword.module.sass";
import { use100vh } from "react-div-100vh";
import { Link } from "react-router-dom";
import TextInput from "../../components/TextInput";
import { EMAIL_REGEX } from "../../constants";
import { errorToast, successToast } from "../../utils/toast";
import { authServices } from "../../services/AuthServices";

const ForgotPassword = () => {
    const initalState = {
        email: "",
    };
    const [userAccount, setUserAccount] = useState(initalState);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const isValidData = validateData(userAccount);
        if (isValidData === 1) {
            const response = await authServices.sendVerificationToEmail(
                userAccount.email
            );
            console.log(response);
            if (response.status === true) {
                return successToast(response.message);
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
        if (userAccount.email === "") {
            return errorToast("Email không được để trống");
        }
        if (EMAIL_REGEX.test(userAccount.email) === false) {
            return errorToast("Email không hợp lệ");
        }

        return result;
    };

    const heightWindow = use100vh();
    return (
        <div className={styles.login} style={{ minHeight: heightWindow }}>
            <div className={styles.wrapper}>
                <form className={styles.form}>
                    <div className={cn("h2", styles.title)}>Quên mật khẩu</div>
                    <div className={styles.body}>
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

                        <button
                            onClick={handleSubmit}
                            className={cn("button", styles.button)}
                        >
                            Xác nhận
                        </button>

                        <div className={styles.note}>
                            Trang web này thực hiện cho môn học Phát triển ứng
                            dụng Web nâng cao.
                        </div>
                        <div className={styles.info}>
                            Đã có tài khoản?{" "}
                            <Link className={styles.link} to="../sign-in">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
