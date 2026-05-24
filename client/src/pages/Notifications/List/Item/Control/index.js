import React, { useState } from "react";
import styles from "./Control.module.sass";
import cn from "classnames";

const Control = ({ className, handleReadNotification, isRead }) => {
  return (
    <>
      {isRead === false ? (
        <div className={cn(styles.control, className)}>
          <button
            className={cn(styles.button, styles.favorite)}
            onClick={handleReadNotification}
          >
            Đánh dấu là đã xem
          </button>
        </div>
      ) : null}
    </>
  );
};

export default Control;
