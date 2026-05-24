import React, { useState } from "react";
import styles from "./Table.module.sass";
import cn from "classnames";
import Checkbox from "../../../../components/Checkbox";
import Loader from "../../../../components/Loader";
import Row from "./Row";

// data
import { customers } from "../../../../mocks/customers";

const Table = ({
    className,
    activeTable,
    setActiveTable,
    teachers,
    students,
    onActive,
    isTeacher,
    onRemoveStudent,
}) => {
    const [chooseAll, setСhooseAll] = useState(false);
    const [activeId, setActiveId] = useState(customers[0].id);

    const [selectedFilters, setSelectedFilters] = useState([]);

    const handleChange = (id) => {
        if (selectedFilters.includes(id)) {
            setSelectedFilters(selectedFilters.filter((x) => x !== id));
        } else {
            setSelectedFilters((selectedFilters) => [...selectedFilters, id]);
        }
    };

    return (
        <div className={cn(styles.wrapper, className)}>
            <div className={cn(styles.table)}>
                <div
                    className={cn(styles.row, { [styles.active]: activeTable })}
                >
                    {/* <div className={styles.col}>
                        <Checkbox
                            className={styles.checkbox}
                            value={chooseAll}
                            onChange={() => setСhooseAll(!chooseAll)}
                        />
                    </div> */}
                    <div className={styles.col}>Họ và tên</div>
                    <div className={styles.col}>Email</div>
                    <div className={styles.col}>Ngày tham gia</div>
                    <div className={styles.col}>Vai trò</div>
                    {isTeacher && <div className={styles.col}></div>}
                </div>
                {teachers.map((x, index) => (
                    <Row
                        item={x}
                        onChoose={onActive}
                        key={index}
                        activeTable={activeTable}
                        setActiveTable={setActiveTable}
                        activeId={activeId}
                        setActiveId={setActiveId}
                        value={selectedFilters.includes(x.id)}
                        onChange={() => handleChange(x.id)}
                        isTeacher={isTeacher}
                        onRemoveStudent={onRemoveStudent}
                    />
                ))}
                {students.map((x, index) => (
                    <Row
                        item={x}
                        key={index}
                        onChoose={onActive}
                        activeTable={activeTable}
                        setActiveTable={setActiveTable}
                        activeId={activeId}
                        setActiveId={setActiveId}
                        value={selectedFilters.includes(x.id)}
                        onChange={() => handleChange(x.id)}
                        isTeacher={isTeacher}
                        onRemoveStudent={onRemoveStudent}
                    />
                ))}
            </div>
            {/* <div className={styles.foot}>
                <button
                    className={cn("button-stroke button-small", styles.button)}
                >
                    <Loader className={styles.loader} />
                    <span>Load more</span>
                </button>
            </div> */}
        </div>
    );
};

export default Table;
