import React, { useState } from "react";
import styles from "./Row.module.sass";
import cn from "classnames";
// import Checkbox from "../../../../../components/Checkbox";
import ModalProduct from "../../../../components/ModalProduct/index.js";
import MarkAssignmentModal from "../../MarkAssignmentModal/index.js";
import * as dayjs from "dayjs";

const Row = ({ item, value, onChange, up, reviews }) => {
  const [visibleModalProduct, setVisibleModalProduct] = useState(false);
  return (
    <>
      <div className={styles.row} onClick={() => setVisibleModalProduct(true)}>
        <div className={styles.col}></div>
        <div className={styles.col}>
          {item.students.lastName + " " + item.students.firstName}
        </div>
        <div className={styles.col}>{item.studentId}</div>
        <div className={styles.col}>{item.students.email}</div>
        <div className={styles.col}>
          {dayjs(item.createdAt).format("DD/MM/YYYY")}
        </div>
      </div>
      {/* <ModalProduct
        item={item}
        classDetail={item}
        visible={visibleModalProduct}
        onClose={() => setVisibleModalProduct(false)}
      /> */}
      <MarkAssignmentModal
        onClose={() => setVisibleModalProduct(false)}
        visible={visibleModalProduct}
        assignmentDetail={item}
        reviews={reviews}
      />
    </>
  );
};

export default Row;
