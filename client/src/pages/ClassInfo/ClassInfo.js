import React from "react";
import styles from "./ClassInfo.module.sass";
import CustomerList from "./CustomerList";
import { useParams } from "react-router-dom";

const ClassInfo = () => {
  const { classId } = useParams();
  return (
    <>
      <div className={styles.section}>
        <CustomerList classId={classId} />
      </div>
    </>
  );
};

export default ClassInfo;
