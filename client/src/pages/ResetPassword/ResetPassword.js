import React, { useState } from "react";
import cn from "classnames";
import styles from "./ResetPassword.module.sass";
import { use100vh } from "react-div-100vh";
import { getTokenFromURL } from "../../utils/getTokenFromURL";
import TextInput from "../../components/TextInput";
import { authServices } from "../../services/AuthServices";
import { errorToast, successToast } from "../../utils/toast";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const navigation = useNavigate();
    const initalState = {
        newPassword: "",
        confirmedPassword: "",
    };
    const [userAccount, setUserAccount] = useState(initalState);
    const token = getTokenFromURL();
    const decoded = jwtDecode(token);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const isValidData = validateData(userAccount);
        if (isValidData === 1) {
            const response = await authServices.createNewPassword(
                userAccount,
                decoded.email
            );
            if (response.status === true) {
                setTimeout(() => {
                    navigation("/auth/sign-in");
                }, 3000);
                return successToast(
                    response.message +
                        "\nBạn sẽ được trả về trang đăng nhập sau 3 giây"
                );
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
        if (userAccount.newPassword === "") {
            return errorToast("Mật khẩu không được để trống");
        }

        if (userAccount.confirmedPassword === "") {
            return errorToast("Xác nhận mật khẩu không được để trống");
        }

        if (userAccount.confirmedPassword === "") {
            return errorToast("Xác nhận mật khẩu phải giống mật khẩu");
        }
        return result;
    };

    const heightWindow = use100vh();
    return (
        <div className={styles.login} style={{ minHeight: heightWindow }}>
            <div className={styles.wrapper}>
                <form className={styles.form}>
                    <div className={cn("h2", styles.title)}>Mật khẩu mới</div>
                    <div className={styles.body}>
                        <TextInput
                            className={styles.field}
                            name="newPassword"
                            type="password"
                            placeholder="Mật khẩu"
                            required
                            icon="lock"
                            onChange={handleChange}
                            value={userAccount.password}
                        />
                        <TextInput
                            className={styles.field}
                            name="confirmedPassword"
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            required
                            icon="lock"
                            onChange={handleChange}
                            value={userAccount.confirmedPassword}
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
