import React, { useState } from "react";
import styles from "./Header.module.sass";
import Notification from "./Notification";
import User from "./User";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ onOpen }) => {
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    onOpen();
    setVisible(false);
  };

  return (
    <header className={styles.header}>
      <button className={styles.burger} onClick={() => handleClick()}></button>

      <div className={styles.control} onClick={() => setVisible(false)}>
        {user?.role !== "admin" && (
          <Notification className={styles.notification} />
        )}
        <User className={styles.user} />
      </div>
    </header>
  );
};

export default Header;
