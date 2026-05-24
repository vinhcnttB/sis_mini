import React from "react";
import styles from "./ClassesDashboard.module.sass";
import { Outlet } from "react-router-dom";

const ClassesDashboard = () => {
    return (
        <>
            <div className={styles.section}>
                <Outlet />
            </div>
        </>
    );
};

export default ClassesDashboard;
