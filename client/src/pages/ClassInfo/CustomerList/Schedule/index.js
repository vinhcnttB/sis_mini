import React, { useEffect, useState } from "react";
import { scheduleServices } from "../../../../services/ScheduleServices";
import { errorToast } from "../../../../utils/toast";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Schedule.module.sass";

const Schedule = ({ classId }) => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = async () => {
    setIsLoading(true);
    const response = await scheduleServices.getSchedulesByClass(classId);
    if (response.status) {
      setSchedules(response.data);
    } else {
      errorToast("Không thể tải lịch học");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (classId) {
      fetchSchedules();
    }
  }, [classId]);

  const getDayName = (dayNum) => {
    if (dayNum === 1) return "Chủ Nhật";
    return `Thứ ${dayNum}`;
  };

  // Nhóm lịch học theo thứ
  const daysOfWeekOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedSchedules = [...schedules].sort((a, b) => {
    return daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
  });

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        Lịch học của lớp
      </h3>

      {isLoading ? (
        <LoadingSpinner />
      ) : sortedSchedules.length === 0 ? (
        <div className={styles.empty}>
          Lớp học này hiện tại chưa được xếp lịch học.
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedSchedules.map((schedule) => (
            <div key={schedule.id} className={styles.card}>
              {/* Decorative side bar */}
              <div
                className={styles.line}
                style={{
                  background: schedule.dayOfWeek === 1 ? "#FF6A55" : "#3B82F6",
                }}
              />
              <div style={{ marginBottom: "16px" }}>
                <span
                  className={styles.dayTag}
                  style={{
                    color: schedule.dayOfWeek === 1 ? "#FF6A55" : "#3B82F6",
                    background: schedule.dayOfWeek === 1 ? "rgba(255, 106, 85, 0.1)" : "rgba(59, 130, 246, 0.1)",
                  }}
                >
                  {getDayName(schedule.dayOfWeek)}
                </span>
              </div>
              <div className={styles.time}>
                {schedule.startTime} - {schedule.endTime}
              </div>
              <div className={styles.room}>
                <span>📍 Phòng học:</span>
                <span className={styles.roomVal}>
                  {schedule.room || "Chưa xếp phòng"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
