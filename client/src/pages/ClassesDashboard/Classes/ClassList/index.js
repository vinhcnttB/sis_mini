import React, { useState } from "react";
import styles from "./ClassList.module.sass";
// import cn from "classnames";
// import Checkbox from "../../../../components/Checkbox";
import Row from "./Row";

const ClassList = ({ items }) => {
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
                    <div className={styles.col}>Lớp</div>
                    <div className={styles.col}>ID lớp</div>
                    <div className={styles.col}>Số lượng thành viên tối đa</div>
                    <div className={styles.col}>Mô tả</div>
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
            {/* <div className={styles.foot}>
                <button className={styles.arrow}>
                    <Icon name="arrow-left" size="20" />
                </button>
                <button className={styles.arrow}>
                    <Icon name="arrow-right" size="20" />
                </button>
            </div> */}
        </div>
    );
};

export default ClassList;
