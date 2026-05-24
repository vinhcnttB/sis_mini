import React, { useState } from "react";
import styles from "./StudentSubmissionList.module.sass";
// import cn from "classnames";
// import Checkbox from "../../../../components/Checkbox";
import Row from "./Row";
const StudentSubmissionList = ({ items }) => {
    // const [chooseAll, setСhooseAll] = useState(false);

    const [selectedFilters, setSelectedFilters] = useState([]);

    const handleChange = (id) => {
        if (selectedFilters.includes(id)) {
            setSelectedFilters(selectedFilters.filter((x) => x !== id));
        } else {
            setSelectedFilters((selectedFilters) => [...selectedFilters, id]);
        }
    };
    return (
        <div className={styles.market}>
            <div className={styles.table}>
                <div className={styles.row}>
                    <div className={styles.col}></div>
                    <div className={styles.col}>Họ và tên</div>
                    <div className={styles.col}>MSSV</div>
                    <div className={styles.col}>Email</div>
                    <div className={styles.col}>Thời gian nộp</div>
                    <div className={styles.col}>Điểm</div>
                </div>
                {items.map((x, index) => (
                    <Row
                        item={x}
                        key={index}
                        up={items.length - index <= 2}
                        value={selectedFilters.includes(x.id)}
                        onChange={() => handleChange(x.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default StudentSubmissionList;
