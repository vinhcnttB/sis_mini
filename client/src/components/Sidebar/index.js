import React, { useState } from "react";
import styles from "./Sidebar.module.sass";
import { Link, NavLink } from "react-router-dom";
import cn from "classnames";
import Icon from "../Icon";
import Theme from "../Theme";
import Dropdown from "./Dropdown";
import Image from "../Image";
import { useAuth } from "../../hooks/useAuth";

let userNavigation = [
    // {
    //   title: "Home",
    //   icon: "home",
    //   url: "/home",
    // },
    // {
    //   title: "Người dùng",
    //   slug: "users",
    //   icon: "diamond",
    //   dropdown: [
    //     {
    //       title: "Stats",
    //       url: "/stats",
    //     },
    //   ],
    // },
    {
        title: "Lớp học",
        icon: "board",
        url: "/classes",
    },
    {
        title: "Thông báo",
        icon: "notification",
        url: "/notifications",
    },
];

let adminNavigation = [
    {
        title: "Quản lý",
        slug: "users",
        icon: "leaderboard",
        dropdown: [
            {
                title: "Quản lý người dùng",
                url: "manage/users",
            },
            {
                title: "Quản lý lớp học",
                url: "manage/classes",
            },
        ],
    },
];

const Sidebar = ({ className, onClose }) => {
    const [visible, setVisible] = useState(false);
    const { user } = useAuth();
    const { role } = user;
    let navigation;
    if (role === "admin") {
        navigation = adminNavigation;
    } else {
        navigation = userNavigation;
    }
    return (
        <>
            <div
                className={cn(styles.sidebar, className, {
                    [styles.active]: visible,
                })}
            >
                <button className={styles.close} onClick={onClose}>
                    <Icon name="close" size="24" />
                </button>
                <Link className={styles.logo} to="/" onClick={onClose}>
                    <Image
                        className={styles.pic}
                        src="/assets/logo-khtn.png"
                        srcDark="/assets/logo-khtn.png"
                        alt="Core"
                    />
                </Link>
                <div className={styles.menu}>
                    {navigation.map((x, index) =>
                        x.url ? (
                            <NavLink
                                className={({ isActive }) =>
                                    isActive
                                        ? `${styles.item} ${styles.active}`
                                        : styles.item
                                }
                                activeclassname={styles.active}
                                to={x.url}
                                key={index}
                                end
                                onClick={onClose}
                            >
                                <Icon name={x.icon} size="24" />
                                {x.title}
                            </NavLink>
                        ) : (
                            <Dropdown
                                className={styles.dropdown}
                                visibleSidebar={visible}
                                setValue={setVisible}
                                key={index}
                                item={x}
                                onClose={onClose}
                            />
                        )
                    )}
                </div>
                <button
                    className={styles.toggle}
                    onClick={() => setVisible(!visible)}
                >
                    <Icon name="arrow-right" size="24" />
                    <Icon name="close" size="24" />
                </button>
                <div className={styles.foot}>
                    <Theme className={styles.theme} visibleSidebar={visible} />
                </div>
            </div>

            <div
                className={cn(styles.overlay, { [styles.active]: visible })}
                onClick={() => setVisible(false)}
            ></div>
        </>
    );
};

export default Sidebar;
