import { NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

import styles from "./MainNavigation.module.sass";

const MainNavigation = () => {
    const { user, logout } = useAuth();
    const [userAccount, setUserAccount] = useState(user);
    return (
        <header className={styles.header}>
            <div>Chào mửng trở lại, {userAccount.firstName}</div>
            <nav>
                <ul className={styles.list}>
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive ? styles.active : styles.unactive
                            }
                            end
                        >
                            Trang chủ
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/dashboard/profile"
                            className={({ isActive }) =>
                                isActive ? styles.active : styles.unactive
                            }
                        >
                            Hồ sơ
                        </NavLink>
                    </li>
                    <li>
                        <div
                            onClick={() => {
                                setUserAccount({});
                                logout();
                            }}
                            className={styles.logOutButton}
                        >
                            Đăng xuất
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default MainNavigation;
