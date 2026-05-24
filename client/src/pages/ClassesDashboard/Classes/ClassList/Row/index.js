import React, { useState } from "react";
import styles from "./Row.module.sass";
import cn from "classnames";
// import Checkbox from "../../../../../components/Checkbox";
import Balance from "../../../../../components/Balance";
import ModalProduct from "../../../../../components/ModalProduct";
import Control from "../../Control";

import { numberWithCommas } from "../../../../../utils.js";

const Row = ({ item, value, onChange, up }) => {
  const [visibleModalProduct, setVisibleModalProduct] = useState(false);

  return (
    <>
      <div className={styles.row} onClick={() => setVisibleModalProduct(true)}>
        <div className={styles.col}></div>
        <div className={styles.col}>{item.name}</div>
        <div className={styles.col}>{item.uniqueCode}</div>
        <div className={styles.col}>{item.maximumStudents}</div>
        <div className={styles.col}>
          {!item.isDisabled ? (
            <div className={cn("status-green", styles.status)}>Hoạt động</div>
          ) : (
            <div className={cn("status-red", styles.status)}>
              Không hoạt động
            </div>
          )}
        </div>
      </div>
      <ModalProduct
        item={item}
        classDetail={item}
        visible={visibleModalProduct}
        onClose={() => setVisibleModalProduct(false)}
      />
    </>
  );
};

export default Row;
