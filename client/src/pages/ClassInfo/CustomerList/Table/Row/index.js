import React, { useState } from "react";
import styles from "./Row.module.sass";
import cn from "classnames";
import Checkbox from "../../../../../components/Checkbox";
import Balance from "../../../../../components/Balance";

const Row = ({
    item,
    value,
    onChange,
    activeTable,
    setActiveTable,
    activeId,
    setActiveId,
    onChoose,
    isTeacher,
    onRemoveStudent,
}) => {
    const handleClick = (id) => {
        setActiveTable(true);
        setActiveId(id);
        console.log(id);
        onChoose(id);
    };

    return (
        <>
            <div
                className={cn(
                    styles.row,
                    { [styles.selected]: activeId === item.id },
                    { [styles.active]: activeTable }
                )}
            >
                {/* <div className={styles.col}>
                    <Checkbox
                        className={styles.checkbox}
                        value={value}
                        onChange={onChange}
                    />
                </div> */}
                <div className={styles.col}>
                    <div
                        className={styles.item}
                        onClick={() => handleClick(item)}
                    >
                        <div className={styles.avatar}>
                            <img src="/assets/sample-avatar.jpg" alt="Avatar" />
                        </div>
                        <div className={styles.details}>
                            <div className={styles.user}>{item.name}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.email}>{item.email}</div>
                </div>

                <div className={styles.col}>
                    <div className={styles.lifetime}>
                        <div>16th January, 2024</div>
                        {/* <Balance
                            className={styles.balance}
                            value={item.balance}
                        /> */}
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={cn("status-green-dark", styles.purchase)}>
                        {item.role}
                    </div>
                </div>
                {isTeacher && item.role === "Học sinh" && (
                    <div className={styles.col}>
                        <button
                            className={cn("button-stroke-red", styles.removeBtn)}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveStudent(item.id);
                            }}
                            title="Loại học sinh khỏi lớp"
                            style={{ padding: "0 10px", height: "32px", minWidth: "auto" }}
                        >
                            Xóa
                        </button>
                    </div>
                )}
                {isTeacher && item.role !== "Học sinh" && (
                    <div className={styles.col}></div>
                )}
            </div>
        </>
    );
};

export default Row;
