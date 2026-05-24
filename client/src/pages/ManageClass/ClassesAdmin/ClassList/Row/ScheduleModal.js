import React, { useEffect, useState } from "react";
import Modal from "../../../../../components/Modal";
import { scheduleServices } from "../../../../../services/ScheduleServices";
import { successToast, errorToast } from "../../../../../utils/toast";
import Icon from "../../../../../components/Icon";
import TextInput from "../../../../../components/TextInput";
import Dropdown from "../../../../../components/Dropdown";
import styles from "./Row.module.sass";

const daysMap = {
  "Thứ Hai": 2,
  "Thứ Ba": 3,
  "Thứ Tư": 4,
  "Thứ Năm": 5,
  "Thứ Sáu": 6,
  "Thứ Bảy": 7,
  "Chủ Nhật": 1,
};
const daysList = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

const ScheduleModal = ({ visible, onClose, classDetail }) => {
  const [schedules, setSchedules] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState(2); // Mặc định là Thứ 2
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = async () => {
    if (!classDetail?.id) return;
    setIsLoading(true);
    const response = await scheduleServices.getSchedulesByClass(classDetail.id);
    if (response.status) {
      setSchedules(response.data);
    } else {
      errorToast("Không thể tải lịch học");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (visible && classDetail?.id) {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, classDetail?.id]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      return errorToast("Vui lòng chọn đầy đủ thời gian");
    }

    if (startTime >= endTime) {
      return errorToast("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
    }

    const payload = {
      classId: classDetail.id,
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      room: room.trim() || undefined,
    };

    const response = await scheduleServices.createSchedule(payload);
    if (response.status) {
      successToast("Thêm lịch học thành công");
      setRoom("");
      fetchSchedules();
    } else {
      errorToast(response.message || "Thêm lịch học thất bại");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch học này không?")) {
      const response = await scheduleServices.deleteSchedule(id);
      if (response.status) {
        successToast("Xóa lịch học thành công");
        fetchSchedules();
      } else {
        errorToast(response.message || "Xóa lịch học thất bại");
      }
    }
  };

  const getDayName = (dayNum) => {
    if (dayNum === 1) return "Chủ Nhật";
    return `Thứ ${dayNum}`;
  };

  const currentDayName = Object.keys(daysMap).find(key => daysMap[key] === dayOfWeek) || "Thứ Hai";

  return (
    <Modal visible={visible} onClose={onClose} outerClassName={styles.scheduleModalOuter}>
      <div>
        <h3 className={styles.modalTitle}>
          Lịch học - {classDetail?.name}
        </h3>
        <p className={styles.modalSub}>
          Quản lý lịch học của lớp (Mã: {classDetail?.uniqueCode})
        </p>

        {/* Danh sách lịch học hiện tại */}
        <div style={{ marginBottom: "24px" }}>
          <h4 className={styles.sectionTitle}>
            Lịch học hiện tại
          </h4>
          {isLoading ? (
            <p className={styles.emptyText}>Đang tải...</p>
          ) : schedules.length === 0 ? (
            <p className={styles.emptyText}>
              Lớp chưa có lịch học nào.
            </p>
          ) : (
            <div className={styles.listWrapper}>
              {schedules.map((schedule) => (
                <div key={schedule.id} className={styles.itemRow}>
                  <div>
                    <span className={styles.itemText}>
                      {getDayName(schedule.dayOfWeek)}
                    </span>
                    <span className={styles.timeText}>
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                    {schedule.room && (
                      <span className={styles.roomTag}>
                        Phòng: {schedule.room}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#FF6A55",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                    }}
                    title="Xóa lịch học"
                  >
                    <Icon name="trash" size="20" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form thêm mới lịch học */}
        <form onSubmit={handleAddSchedule} className={styles.form}>
          <h4 className={styles.sectionTitle}>
            Thêm lịch học mới
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <Dropdown
              label="Thứ trong tuần"
              value={currentDayName}
              setValue={(val) => setDayOfWeek(daysMap[val])}
              options={daysList}
            />

            <TextInput
              label="Phòng học"
              type="text"
              placeholder="Ví dụ: A201"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <TextInput
              label="Giờ bắt đầu"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />

            <TextInput
              label="Giờ kết thúc"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={onClose}
              className="button-stroke button-small"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="button-small"
            >
              Thêm lịch
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
