import React, { useState } from "react";
import cn from "classnames";
import styles from "./Notification.module.sass";
import List from "./List";

const Notification = () => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [visible, setVisible] = useState(0);

  return <List className={styles.card} />;
};

export default Notification;
