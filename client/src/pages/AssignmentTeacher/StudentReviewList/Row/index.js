import React, { useState } from "react";
import styles from "./Row.module.sass";
import cn from "classnames";
// import Checkbox from "../../../../../components/Checkbox";
import ModalProduct from "../../../../components/ModalProduct/index.js";
import MarkAssignmentModal from "../../MarkAssignmentModal/index.js";
import * as dayjs from "dayjs";
import ReviewModal from "../../ReviewModal/ReviewModal.js";

const Row = ({ item, up }) => {
  const [visibleModalProduct, setVisibleModalProduct] = useState(false);
  return (
    <>
      <div className={styles.row} onClick={() => setVisibleModalProduct(true)}>
        <div className={styles.col}></div>
        <div className={styles.col}>
          {item?.lastName + " " + item?.firstName}
        </div>
        <div className={styles.col}>{item?.uniqueId}</div>
        <div className={styles.col}>{item?.expectedScore}</div>
        <div className={styles.col}>
          {item?.status === "ACCEPT" ? (
            <div className={cn("status-green-dark", styles.purchase)}>
              Đã chấp nhận
            </div>
          ) : item?.status === "DENIED" ? (
            <div className={cn("status-green-dark", styles.purchase)}>
              Không chấp nhận
            </div>
          ) : (
            <div className={cn("status-green-dark", styles.purchase)}>
              Đang mở
            </div>
          )}
        </div>
      </div>
      {/* <ModalProduct
        item={item}
        classDetail={item}
        visible={visibleModalProduct}
        onClose={() => setVisibleModalProduct(false)}
      /> */}
      <ReviewModal
        onClose={() => setVisibleModalProduct(false)}
        visible={visibleModalProduct}
        item={item}
      />
    </>
  );
};

export default Row;
