import React, { useEffect, useState } from "react";
import styles from "./Classes.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Form from "../../../components/Form";
import Dropdown from "../../../components/Dropdown";
import ClassList from "./ClassList";
import Table from "./Table";
import TextInput from "../../../components/TextInput";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
// data
import { traffic } from "../../../mocks/traffic";
import { viewers } from "../../../mocks/viewers";
import { market } from "../../../mocks/market";
import Modal from "./Modal";
import Icon from "../../../components/Icon";
import { useAuth } from "../../../hooks/useAuth";
import { classServices } from "../../../services/ClassServices";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { successToast, errorToast } from "../../../utils/toast";

const indicatorsTraffic = [
    {
        title: "Market",
        color: "#FFBC99",
    },
    {
        title: "Social media",
        color: "#CABDFF",
    },
    {
        title: "Direct",
        color: "#B5E4CA",
    },
    {
        title: "UI8",
        color: "#B1E5FC",
    },
    {
        title: "Others",
        color: "#FFD88D",
    },
];

const indicatorsViewers = [
    {
        title: "Followers",
        color: "#B5E4CA",
    },
    {
        title: "Others",
        color: "#CABDFF",
    },
];

const Classes = () => {
    // Lấy thông tin user
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigation = ["Market", "Traffic sources", "Viewers"];

    const [activeTab, setActiveTab] = useState(navigation[0]);
    const [search, setSearch] = useState("");

    const handleSubmit = (e) => {
        alert();
    };
    const [classList, setClassList] = useState([]);
    // Fetch dữ liệu lớp học từ server
    useEffect(() => {
        setIsLoading(true);
        const getClassList = async () => {
            if (user.role === "teacher") {
                const response = await classServices.getTeacherClass(token);
                if (response.status) {
                    const classRendered = response.data.filter(
                        (item) => item.isDisabled !== true
                    );
                    setClassList(classRendered);
                }
            } else if (user.role === "student") {
                const response = await classServices.getStudentClass(token);
                if (response.status) {
                    const classRendered = response.data.filter(
                        (item) => item.isDisabled !== true
                    );
                    setClassList(classRendered);
                }
            }
            setIsLoading(false);
        };
        getClassList();
    }, [user.role]);
    const [openModal, setOpenModal] = useState(false);
    const [content, setContent] = useState(null);
    const {
        control: controlAssignmentInfo,
        handleSubmit: handleSubmitAssignmentInfo,
    } = useForm();
    const onStudentJoinClass = async (data) => {
        if (data.code === "" || !data.code) {
            return errorToast("Bạn chưa nhập Code!");
        }
        console.log(data);
        try {
            const response = await classServices.studentJoinClass(data.code);
            if (response.status) {
                window.location.reload();
                return successToast("Vào lớp thành công!");
            } else return errorToast("Không thể vào lớp. Vui lòng thử lại sau");
        } catch (error) {
            return errorToast("Không thể vào lớp. Vui lòng thử lại sau");
        }
    };
    // Modal để vào lớp qua ID
    const handleJoinClass = () => {
        setOpenModal(true);
        setContent(
            <>
                <div className={cn("title-green", styles.modaltitle)}>
                    Tham gia lớp học bằng code
                </div>
                <div className={styles.info}>Hãy nhập mã lớp học</div>
                <form
                    onSubmit={handleSubmitAssignmentInfo(onStudentJoinClass)}
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
                                label="Mã lớp học"
                                type="text"
                                onChange={(event) => {
                                    onChange(event.target.value);
                                }}
                                onBlur={onBlur}
                                value={value}
                            />
                        )}
                        name="code"
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
                        <button
                            type="submit"
                            className={cn("button", styles.button)}
                        >
                            <span>Vào lớp</span>
                        </button>
                    </div>
                </form>
            </>
        );
    };
    return (
        <Card
            className={styles.card}
            title="Danh sách các lớp học"
            classTitle={cn("title-purple", styles.title)}
            classCardHead={styles.head}
            head={
                <>
                    {/* <Form
            className={styles.form}
            value={search}
            setValue={setSearch}
            onSubmit={() => handleSubmit()}
            placeholder="Tìm lớp"
            type="text"
            name="search"
            icon="search"
          /> */}
                    {/**Button dùng để tạo lớp học
                     * nếu role = 'teacher' (teacher thì mới có quyền tạo lớp)
                     */}
                    {user.role === "teacher" ? (
                        <Link
                            className={cn("button-small", styles.button)}
                            to="addClass"
                        >
                            <Icon name="add" size="20" />
                            <span>Tạo lớp</span>
                        </Link>
                    ) : null}
                    {user.role === "student" ? (
                        <div
                            className={cn("button-small", styles.button)}
                            onClick={handleJoinClass}
                        >
                            <Icon name="add" size="20" />
                            <span>Tham gia lớp</span>
                        </div>
                    ) : null}
                </>
            }
        >
            {isLoading && <LoadingSpinner />}
            {!isLoading && classList.length > 0 && (
                <div className={styles.classes}>
                    <div className={styles.wrapper}>
                        <ClassList items={classList} />
                    </div>
                </div>
            )}
            <Modal
                outerClassName={styles.outer}
                visible={openModal}
                onClose={() => setOpenModal(false)}
            >
                {content}
            </Modal>
            {!isLoading && classList.length <= 0 && (
                <div className={styles.text} style={{ textAlign: "center" }}>
                    Không tìm thấy lớp học bạn đã tham gia
                </div>
            )}
        </Card>
    );
};

export default Classes;
