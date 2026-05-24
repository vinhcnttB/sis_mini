import React from "react";
import { Outlet } from "react-router-dom";

import styles from "./ManageClass.module.sass";

const ManageClass = () => {
    return (
        <div className={styles.section}>
            <Outlet />
        </div>
    );
};

export default ManageClass;
