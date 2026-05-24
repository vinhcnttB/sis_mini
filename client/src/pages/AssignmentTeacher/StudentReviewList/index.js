import React, { useState } from "react";
import styles from "./StudentReviewList.module.sass";
// import cn from "classnames";
// import Checkbox from "../../../../components/Checkbox";
import Row from "./Row";
const StudentReviewList = ({ items }) => {
  return (
    <div className={styles.market}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}></div>
          <div className={styles.col}>Họ và tên</div>
          <div className={styles.col}>MSSV</div>
          <div className={styles.col}>Số điểm mong muốn</div>
          <div className={styles.col}>Trạng thái</div>
        </div>
        {items.map((x, index) => (
          <Row item={x} key={index} up={items.length - index <= 2} />
        ))}
      </div>
    </div>
  );
};

export default StudentReviewList;
