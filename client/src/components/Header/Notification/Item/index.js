import React from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./Item.module.sass";
import dayjs from "dayjs";
const Item = ({ className, item, onClose }) => {
  return (
    <div
      className={cn(styles.item, { [styles.new]: !item?.isRead }, className)}
      to={item.url}
      onClick={onClose}
    >
      {/* <div className={styles.avatar}>
        <img src={item.avatar} alt="Avatar" />
        <div className={styles.icon} style={{ backgroundColor: item.color }}>
          <img src={item.icon} alt="Status" />
        </div>
      </div> */}
      <div className={styles.details}>
        <div className={styles.line}>
          <div className={styles.subtitle}>{item.title}</div>
          <div className={styles.login}></div>
          <div className={styles.time}>
            {dayjs(item.createdAt).format("DD/MM/YYYY")}
          </div>
        </div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: item.content }}
        ></div>
      </div>
    </div>
  );
};

export default Item;
