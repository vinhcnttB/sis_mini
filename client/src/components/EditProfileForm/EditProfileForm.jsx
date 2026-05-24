/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import cn from "classnames";
import FormInput from "../../components/FormInput/FormInput";
import Button from "../../components/Button/Button";
import { Form } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import { successToast } from "../../utils/toast";

import { userServices } from "../../services/UserServices";

import styles from "./EditProfileForm.module.sass";

const EditProfileForm = ({
    user,
    isEditing,
    editProfile,
    toggleEdit,
    token,
    isShow = true,
    isShowInputStudentId = false,
    isAdminView = false,
}) => {
    const initalState = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        uniqueId: user.uniqueId ? user.uniqueId : "",
    };
    const initalErrors = {
        email: "",
        firstName: "",
        lastName: "",
        uniqueId: "",
    };

    const [userAccount, setUserAccount] = useState(initalState);
    const [errors, setErrors] = useState(initalErrors);
    const [submitResult, setSubmitResult] = useState("");

    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const isValidData = validateData(userAccount);
        if (isValidData) {
            const response = await userServices.update(
                userAccount.email,
                userAccount,
                token
            );
            console.log(userAccount);
            if (response.status === true) {
                setUserAccount(response.data);
                setSuccess(true);
                const userStorage = JSON.parse(localStorage.getItem("user"));
                if (userStorage && userStorage.email === userAccount.email) {
                    const updatedUser = JSON.stringify({
                        ...userStorage,
                        firstName: userAccount.firstName,
                        lastName: userAccount.lastName,
                        uniqueId: userAccount.uniqueId,
                    });
                    localStorage.setItem("user", updatedUser);
                }
                editProfile(userAccount);
                // setSubmitResult(response.message);
                successToast(response.message);
                setTimeout(() => {
                    toggleEdit(false);
                    // window.location.reload();
                }, 1000);
            } else {
                setSubmitResult(response.message);
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
        setErrors(initalErrors);
        let result = 1;

        if (userAccount.firstName === "") {
            setErrors((prevState) => ({
                ...prevState,
                firstName: "Tên không được để trống",
            }));
            result = 0;
        }
        if (userAccount.lastName === "") {
            setErrors((prevState) => ({
                ...prevState,
                lastName: "Họ không được để trống",
            }));
            result = 0;
        }
        return result;
    };

    const formContent = (
        <div className={cn(styles.editContainer, { [styles.adminView]: isAdminView })}>
            {/* Banner Cover */}
            <div className={styles.profileBanner}></div>

            {/* Profile Header (Avatar only) */}
            <div className={styles.profileHeader}>
                <div className={styles.avatarWrapper}>
                    <img
                        src={user.image || user.avatar || "/assets/sample-avatar.jpg"}
                        alt="avatar"
                        className={styles.avatarImage}
                    />
                </div>
            </div>

            {/* Profile Name, Role Badge, and Action button side-by-side */}
            <div className={styles.profileMeta}>
                <div>
                    <h2 className={styles.profileName}>
                        {userAccount.lastName || ""} {userAccount.firstName || ""}
                    </h2>
                    <div className={styles.badgeWrapper}>
                        {user.role === "admin" && (
                            <span className={cn(styles.badge, styles.badgeAdmin)}>Admin</span>
                        )}
                        {user.role === "teacher" && (
                            <span className={cn(styles.badge, styles.badgeTeacher)}>Giáo viên</span>
                        )}
                        {user.role === "student" && (
                            <span className={cn(styles.badge, styles.badgeStudent)}>Học sinh</span>
                        )}
                    </div>
                </div>

                <div className={styles.actionContainer}>
                    {isEditing ? (
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => toggleEdit(false)}
                        >
                            Quay lại
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => toggleEdit(true)}
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>

            <Form onSubmit={handleSubmit} className={styles.editForm}>
                <div className={styles.editContext}>
                    <div className={styles.formField}>
                        <FormInput
                            type="email"
                            name="email"
                            title="Email"
                            placeholder="Nhập Email"
                            value={userAccount.email}
                            onChange={handleChange}
                            error={errors.email}
                            disabled={true}
                        />
                    </div>

                    <div className={styles.formInputLine}>
                        <div className={cn(styles.formField, styles.halfWidth)}>
                            <FormInput
                                type="text"
                                name="lastName"
                                title="Họ"
                                placeholder="Nhập Họ"
                                value={userAccount.lastName}
                                onChange={handleChange}
                                error={errors.lastName}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className={cn(styles.formField, styles.halfWidth)}>
                            <FormInput
                                type="text"
                                name="firstName"
                                title="Tên"
                                placeholder="Nhập Tên"
                                value={userAccount.firstName}
                                onChange={handleChange}
                                error={errors.firstName}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {(user.role === "student" || isShowInputStudentId) && (
                        <div className={styles.formField}>
                            <FormInput
                                type="text"
                                name="uniqueId"
                                title="Mã số sinh viên (MSSV)"
                                placeholder="Nhập mã số"
                                value={userAccount.uniqueId ? userAccount.uniqueId : ""}
                                onChange={handleChange}
                                error={errors.uniqueId}
                                disabled={!isEditing || (!isAdminView && !!user.uniqueId)}
                            />
                        </div>
                    )}

                    {isEditing && (
                        <button type="submit" className={styles.submitBtn}>
                            Xác nhận
                        </button>
                    )}
                </div>
            </Form>
        </div>
    );

    return (
        isShow && (
            isAdminView ? formContent : (
                <main className={styles.editScreen}>
                    {formContent}
                </main>
            )
        )
    );
};

export default EditProfileForm;
