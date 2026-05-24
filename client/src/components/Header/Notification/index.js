import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Notification.module.sass";
import Icon from "../../Icon";
import Item from "./Item";
import { useAuth } from "../../../hooks/useAuth";
import { NotificationServices } from "../../../services/NotificationServices";
import { initSocket } from "../../../utils/socket";

const Notification = ({ className }) => {
  // Quản lý lấy thông báo

  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [existNotRead, setExistNotRead] = useState(false);

  const handleReadNotification = async (notiId) => {
    // notiId là trường id được lưu trong object notification
    const response = await NotificationServices.markAsRead(notiId, user.token);
    if (response && response.status) {
      setNotifications((prev) =>
        prev.map((noti) =>
          noti.id === notiId ? { ...noti, isRead: true } : noti
        )
      );
      // Re-evaluate unread
      setExistNotRead((prevUnread) => {
        return notifications.some((noti) => noti.id !== notiId && noti.isRead === false);
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await NotificationServices.markAllAsRead(user.token);
    if (response && response.status) {
      setNotifications((prev) =>
        prev.map((noti) => ({ ...noti, isRead: true }))
      );
      setExistNotRead(false);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await NotificationServices.getNotifications(user.token);
      if (response && response.status) {
        const dataArray = response.data || [];
        setNotifications(dataArray);
        const hasUnread = dataArray.some((noti) => noti?.isRead === false);
        setExistNotRead(hasUnread);
      }
    };
    fetchNotifications();

    const socket = initSocket(user.token);
    socket.on("new_notification", (newNoti) => {
      setNotifications((prev) => {
        const newData = [newNoti, ...prev];
        const hasUnread = newData.some((noti) => noti?.isRead === false);
        setExistNotRead(hasUnread);
        return newData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user.token]);

  const [visible, setVisible] = useState(false);

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div
        className={cn(styles.notification, className, {
          [styles.active]: visible,
        })}
      >
        <button
          className={
            existNotRead ? cn(styles.head, styles.active) : cn(styles.head)
          }
          onClick={() => setVisible(!visible)}
        >
          <Icon name="notification" size="24" />
        </button>
        <div className={styles.body}>
          <div className={styles.top}>
            <div className={styles.title}>Thông báo</div>
            {existNotRead && (
              <button
                className={styles.markAllRead}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className={styles.list}>
            {notifications.length > 0 ? (
              notifications.slice(0, 4).map((x, index) => (
                <Item
                  className={cn(styles.item, className)}
                  item={x}
                  key={index}
                  onClose={() => setVisible(false)}
                />
              ))
            ) : (
              <div style={{ padding: "12px" }} className={styles.text}>
                Bạn không có thông báo nào
              </div>
            )}
          </div>
          <Link
            className={cn("button", styles.button)}
            to="/notifications"
            onClick={() => setVisible(false)}
          >
            Xem toàn bộ thông báo
          </Link>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default Notification;
