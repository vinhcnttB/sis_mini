import React from "react";
import cn from "classnames";
import styles from "./Panel.module.sass";
import { useNavigate } from "react-router-dom";

const Panel = ({ onCreateClass }) => {
  const navigate = useNavigate();
  return (
    <div className={cn("panel", styles.panel)}>
      <div className={styles.info}>
        {/* <Icon name="check-all" size="24" />
        Last saved <span>Oct 4, 2021 - 23:32</span> */}
      </div>
      <div className={styles.btns}>
        <button onClick={onCreateClass} className={cn("button", styles.button)}>
          Tạo lớp
        </button>
        <button
          onClick={() => {
            navigate("/classes", { replace: true });
          }}
          className={cn("button-stroke", styles.button)}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default Panel;
