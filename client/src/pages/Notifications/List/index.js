import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./List.module.sass";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Actions from "../../../components/Actions";
import Loader from "../../../components/Loader";
import Item from "./Item";
import { useAuth } from "../../../hooks/useAuth";
import { NotificationServices } from "../../../services/NotificationServices";
import { initSocket } from "../../../utils/socket";

const intervals = ["Recent", "New", "This year"];

const List = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);

  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await NotificationServices.getNotifications(user.token);
      if (response && response.status) {
        let dataArray = response.data || [];
        // Filter out accepted class invitation notifications
        const filteredData = dataArray.filter(
          (noti) => !(noti?.type === 'class_invitation' && noti?.accepted === true)
        );
        setNotifications(filteredData);
      }
    };
    fetchNotifications();

    const socket = initSocket(user.token);
    socket.on("new_notification", (newNoti) => {
      setNotifications((prev) => {
        const newData = [newNoti, ...prev];
        const filteredData = newData.filter(
          (noti) => !(noti?.type === 'class_invitation' && noti?.accepted === true)
        );
        return filteredData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user.token]);

  const handleReadNotification = async (notiId) => {
    // notiId là trường id được lưu trong object notification
    const response = await NotificationServices.markAsRead(notiId, user.token);
    if (response && response.status) {
      setNotifications((prev) =>
        prev.map((noti) =>
          noti.id === notiId ? { ...noti, isRead: true } : noti
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await NotificationServices.markAllAsRead(user.token);
    if (response && response.status) {
      setNotifications((prev) =>
        prev.map((noti) => ({ ...noti, isRead: true }))
      );
    }
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Danh sách thông báo"
      classTitle={cn("title-red", styles.title)}
      classCardHead={styles.head}
      head={
        <>
          {notifications.some((noti) => !noti.isRead) && (
            <button
              className={styles.markAllRead}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </>
      }
    >
      <div className={styles.notifications}>
        <div className={styles.list}>
          {notifications.length > 0
            ? notifications.map((x, index) => (
                <Item
                  className={cn(styles.item, className)}
                  item={x}
                  key={index}
                  handleReadNotification={() => handleReadNotification(x.id)}
                />
              ))
            : (
              <div className={styles.text}>Bạn không có thông báo nào</div>
            )}
        </div>
        {/* <div className={styles.foot}>
          <button className={cn("button-stroke button-small", styles.button)}>
            <Loader className={styles.loader} />
            <span>Load more</span>
          </button>
        </div> */}
      </div>
    </Card>
  );
};

export default List;
