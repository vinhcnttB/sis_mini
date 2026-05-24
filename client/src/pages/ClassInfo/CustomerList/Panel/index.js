import React from "react";
import cn from "classnames";
import styles from "./Panel.module.sass";

const Panel = ({ 
    addStudent, 
    outGroup, 
    role, 
    activeTab,
    downloadGradeBoard, 
    importStudents, 
    downloadSampleTemplate 
}) => {
    const isTeacher = role === "teacher";

    // Xác định xem có nút bấm nào sẽ được hiển thị hay không
    const hasButtons = 
        (activeTab === "Danh sách" && isTeacher) || 
        (activeTab === "Bảng điểm" && isTeacher);

    // Nếu không có nút nào hiển thị cho tab hiện tại, ẩn hoàn toàn Panel
    if (!hasButtons) {
        return null;
    }

    return (
        <div className={cn("panel", styles.panel)}>
            <div className={styles.info}></div>
            <div className={styles.btns}>
                {activeTab === "Danh sách" && isTeacher && (
                    <>
                        <button
                            className={cn("button", styles.button)}
                            onClick={addStudent}
                        >
                            Thêm thành viên
                        </button>
                        <button
                            className={cn("button-stroke", styles.button)}
                            onClick={importStudents}
                        >
                            Nhập Excel
                        </button>
                        <button
                            className={cn("button-stroke", styles.button)}
                            onClick={downloadSampleTemplate}
                        >
                            Tải mẫu Excel
                        </button>
                    </>
                )}

                {activeTab === "Bảng điểm" && isTeacher && (
                    <button
                        className={cn("button-stroke", styles.button)}
                        onClick={downloadGradeBoard}
                    >
                        Xuất bảng điểm
                    </button>
                )}
            </div>
        </div>
    );
};

export default Panel;

