import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./CountdownTimer.module.sass";
import Icon from "../Icon";

const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false, // Dưới 24 giờ
  });

  useEffect(() => {
    if (!dueDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(dueDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isUrgent: false,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const isUrgent = difference < 24 * 60 * 60 * 1000; // Dưới 24 giờ

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isUrgent,
      });
    };

    // Tính toán ngay lập tức lần đầu
    calculateTimeLeft();

    // Chạy interval mỗi giây
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (!dueDate) return null;

  const { days, hours, minutes, seconds, isExpired, isUrgent } = timeLeft;

  // Format số có 2 chữ số (e.g. 05 thay vì 5)
  const formatNumber = (num) => String(num).padStart(2, "0");

  let containerClass = styles.normal;
  let iconName = "clock";
  let statusText = "Còn lại:";

  if (isExpired) {
    containerClass = styles.expired;
    iconName = "close-circle";
    statusText = "Đã hết hạn nộp bài";
  } else if (isUrgent) {
    containerClass = styles.warning;
    iconName = "notification";
    statusText = "Sắp hết hạn!";
  }

  return (
    <div className={cn(styles.container, containerClass)}>
      <div className={styles.iconWrapper}>
        <Icon name={iconName} size="16" />
      </div>
      <div className={styles.timerText}>
        <span className={styles.label}>{statusText}</span>
        {!isExpired && (
          <>
            {days > 0 && (
              <>
                <span className={styles.timeUnit}>{formatNumber(days)}</span>
                ngày
              </>
            )}
            <span className={styles.timeUnit}>{formatNumber(hours)}</span>
            giờ
            <span className={styles.timeUnit}>{formatNumber(minutes)}</span>
            phút
            <span className={styles.timeUnit}>{formatNumber(seconds)}</span>
            giây
          </>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
