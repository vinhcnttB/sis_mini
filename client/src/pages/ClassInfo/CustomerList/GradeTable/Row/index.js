import React, { useState, useEffect } from "react";
import styles from "./Row.module.sass";
import cn from "classnames";
import Checkbox from "../../../../../components/Checkbox";
import Balance from "../../../../../components/Balance";
import { useAuth } from "../../../../../hooks/useAuth";

const Row = ({
    item,
    value,
    onChange,
    activeTable,
    setActiveTable,
    activeId,
    setActiveId,
    onChoose,
    gradeComposition,
    editGrade,
    studentGradeArray,
    studentGradeInfo,
    totalScore,
}) => {
    const handleClick = (id) => {
        setActiveTable(true);
        setActiveId(id);
        onChoose(id);
    };
    const [userId, setUserId] = useState();
    useEffect(() => {
        setUserId(item.id);
    }, [item.id]);
    const handleEditGrade = (grade) => {
        editGrade(grade, userId);
    };
    useEffect(() => {
        setUserId(item.id);
        console.log("gradecompo", gradeComposition);
    }, [item.id]);
    const { user } = useAuth();

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
                    <div className={styles.item}>
                        <div className={styles.avatar}>
                            <img src="/assets/sample-avatar.jpg" alt="Avatar" />
                        </div>
                        <div className={styles.details}>
                            <div className={styles.user}>{item.name}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.col}>{studentGradeInfo?.studentId}</div>

                {studentGradeArray &&
                    studentGradeArray.map((grade, index) => (
                        <div className={styles.col} key={index}>
                            {/* <div className={styles.lifetime}> */}
                            <div className={styles.flex}>
                                <div>{grade}</div>
                            </div>
                            {/* <Balance
                {gradeComposition &&
                    gradeComposition.map((grade, index) => (
                        <div className={styles.col} key={index}>
                            {/* <div className={styles.lifetime}> */}
                            {/* <div className={styles.flex}>
                                <div>10</div>
                            </div> */}
                            {/* <Balance
                                className={styles.balance}
                                value={item.balance}
                            /> */}
                            {/* </div> */}
                        </div>
                    ))}
                
                <div className={styles.col}>
                    <div className={styles.flex}>
                        <div 
                            style={{ 
                                fontWeight: "bold", 
                                color: totalScore === "" ? "inherit" : (parseFloat(totalScore) >= 5.0 ? "#22c55e" : "#ef4444") 
                            }}
                        >
                            {totalScore !== "" ? totalScore : "-"}
                        </div>
                    </div>
                </div>

                {/* <div className={styles.col}>{item.comments}</div>
                <div className={styles.col}>{item.likes}</div> */}
            </div>
        </>
    );
};

export default Row;
