import React, { useEffect, useState } from "react";
import { attendanceServices } from "../../../../services/AttendanceServices";
import { successToast, errorToast } from "../../../../utils/toast";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import Icon from "../../../../components/Icon";
import cn from "classnames";
import styles from "./Attendance.module.sass";

const Attendance = ({ classId, isTeacher, students }) => {
  const [sessions, setSessions] = useState([]);
  const [studentHistory, setStudentHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("list"); // list, create, edit
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [checkInCode, setCheckInCode] = useState("");

  // Fetch danh sách các buổi điểm danh (Giáo viên)
  const fetchSessions = async () => {
    setIsLoading(true);
    const response = await attendanceServices.getAttendanceSessions(classId);
    if (response.status) {
      setSessions(response.data);
    } else {
      errorToast("Không thể tải danh sách điểm danh");
    }
    setIsLoading(false);
  };

  // Fetch lịch sử điểm danh của học sinh hiện tại
  const fetchStudentHistory = async () => {
    setIsLoading(true);
    const response = await attendanceServices.getStudentAttendance(classId);
    if (response.status) {
      setStudentHistory(response.data);
    } else {
      errorToast("Không thể tải lịch sử điểm danh");
    }
    setIsLoading(false);
  };

  // Fetch phiên điểm danh tự động đang mở
  const fetchActiveSession = async () => {
    const response = await attendanceServices.getActiveSession(classId);
    if (response.status) {
      setActiveSession(response.data);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchActiveSession();
      if (isTeacher) {
        fetchSessions();
      } else {
        fetchStudentHistory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, isTeacher]);

  // Giáo viên: Mở tự điểm danh cho sinh viên
  const handleOpenSelfAttendance = async () => {
    if (!attendanceDate) {
      return errorToast("Vui lòng chọn ngày");
    }
    setIsLoading(true);
    const response = await attendanceServices.openAttendance({
      classId,
      date: attendanceDate,
    });
    if (response.status) {
      successToast("Đã mở điểm danh tự động");
      setActiveSession(response.data);
      fetchSessions();
    } else {
      errorToast(response.message || "Không thể mở điểm danh tự động");
    }
    setIsLoading(false);
  };

  // Giáo viên: Đóng phiên tự điểm danh
  const handleCloseSelfAttendance = async (sessionId) => {
    setIsLoading(true);
    const response = await attendanceServices.closeAttendance(sessionId);
    if (response.status) {
      successToast("Đã đóng điểm danh tự động");
      setActiveSession(null);
      fetchSessions();
    } else {
      errorToast(response.message || "Không thể đóng điểm danh");
    }
    setIsLoading(false);
  };

  // Sinh viên: Gửi mã check-in
  const handleStudentCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInCode) {
      return errorToast("Vui lòng nhập mã code");
    }
    setIsLoading(true);
    const response = await attendanceServices.checkInAttendance({
      classId,
      code: checkInCode,
    });
    if (response.status) {
      successToast("Điểm danh thành công!");
      setCheckInCode("");
      setActiveSession(null);
      fetchStudentHistory();
    } else {
      errorToast(response.message || "Mã code không chính xác");
    }
    setIsLoading(false);
  };

  // Chuẩn bị dữ liệu cho việc tạo buổi điểm danh mới
  const handleInitCreate = () => {
    setAttendanceDate(new Date().toISOString().split("T")[0]);
    // Khởi tạo trạng thái mặc định cho toàn bộ học sinh là PRESENT
    const initData = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentUniqueId: s.uniqueId || "",
      studentEmail: s.email,
      status: "PRESENT",
      remark: "",
    }));
    setAttendanceData(initData);
    setMode("create");
  };

  // Load chi tiết phiên điểm danh để chỉnh sửa
  const handleInitEdit = async (sessionId) => {
    setIsLoading(true);
    const response = await attendanceServices.getAttendanceDetail(sessionId);
    if (response.status) {
      const data = response.data;
      setSelectedSessionId(sessionId);
      setAttendanceDate(data.session.date.split("T")[0]);
      setAttendanceData(data.details);
      setMode("edit");
    } else {
      errorToast("Không thể tải chi tiết điểm danh");
    }
    setIsLoading(false);
  };

  // Thay đổi trạng thái điểm danh của 1 học sinh
  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  // Thay đổi ghi chú của 1 học sinh
  const handleRemarkChange = (studentId, remark) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remark } : item))
    );
  };

  // Lưu điểm danh (cả Tạo mới & Cập nhật)
  const handleSaveAttendance = async () => {
    if (!attendanceDate) {
      return errorToast("Vui lòng chọn ngày điểm danh");
    }

    const payload = {
      classId,
      date: attendanceDate,
      details: attendanceData.map((item) => ({
        studentId: item.studentId,
        status: item.status,
        remark: item.remark,
      })),
    };

    setIsLoading(true);
    const response = await attendanceServices.saveAttendance(payload);
    if (response.status) {
      successToast(mode === "create" ? "Tạo buổi điểm danh thành công" : "Cập nhật thành công");
      setMode("list");
      fetchSessions();
    } else {
      errorToast(response.message || "Lưu điểm danh thất bại");
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PRESENT":
        return <span style={{ color: "#22c55e", background: "rgba(34, 197, 94, 0.1)", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>Có mặt</span>;
      case "ABSENT":
        return <span style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>Vắng</span>;
      case "LATE":
        return <span style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.1)", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>Muộn</span>;
      case "EXCUSED":
        return <span style={{ color: "#3b82f6", background: "rgba(59, 130, 246, 0.1)", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>Có phép</span>;
      default:
        return status;
    }
  };

  if (isLoading && mode === "list") {
    return <LoadingSpinner />;
  }

  // ==================== GIAO DIỆN HỌC SINH ====================
  if (!isTeacher) {
    const stats = studentHistory?.stats || { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    const history = studentHistory?.history || [];
    const hasCheckedInToday = activeSession && history.some(
      (row) => new Date(row.date).toDateString() === new Date(activeSession.date).toDateString()
    );

    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          Lịch sử điểm danh cá nhân
        </h3>

        {/* Mở điểm danh tự động (nếu có) */}
        {activeSession && (
          hasCheckedInToday ? (
            <div className={styles.activeSessionChecked}>
              <Icon name="check-circle" size="24" style={{ fill: "#22c55e", marginRight: "8px" }} />
              <span>Bạn đã điểm danh thành công buổi học ngày {new Date(activeSession.date).toLocaleDateString("vi-VN")}!</span>
            </div>
          ) : (
            <div className={styles.activeSessionCard}>
              <div className={styles.activeSessionHeader}>
                <Icon name="notification" size="24" style={{ fill: "#3b82f6", marginRight: "8px" }} />
                <h4>Phiên tự điểm danh đang mở</h4>
              </div>
              <p className={styles.activeSessionText}>
                Giáo viên đang mở tự điểm danh cho buổi học ngày <strong>{new Date(activeSession.date).toLocaleDateString("vi-VN")}</strong>. Vui lòng nhập mã Code 4 chữ số do giáo viên cung cấp để check-in:
              </p>
              <form onSubmit={handleStudentCheckIn} className={styles.checkInForm}>
                <input
                  type="text"
                  placeholder="Mã 4 số"
                  maxLength={4}
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value)}
                  className={styles.checkInInput}
                />
                <button type="submit" className="button-small">
                  Xác nhận điểm danh
                </button>
              </form>
            </div>
          )
        )}

        {/* Dashboard Thống kê */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>TỔNG SỐ BUỔI</div>
            <div className={styles.statValue}>{stats.total}</div>
          </div>
          <div className={styles.statCard} style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
            <div className={styles.statLabel} style={{ color: "#22c55e" }}>CÓ MẶT</div>
            <div className={styles.statValue} style={{ color: "#22c55e" }}>{stats.present}</div>
          </div>
          <div className={styles.statCard} style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div className={styles.statLabel} style={{ color: "#ef4444" }}>VẮNG MẶT</div>
            <div className={styles.statValue} style={{ color: "#ef4444" }}>{stats.absent}</div>
          </div>
          <div className={styles.statCard} style={{ background: "rgba(249, 115, 22, 0.05)", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
            <div className={styles.statLabel} style={{ color: "#f97316" }}>ĐI MUỘN</div>
            <div className={styles.statValue} style={{ color: "#f97316" }}>{stats.late}</div>
          </div>
          <div className={styles.statCard} style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div className={styles.statLabel} style={{ color: "#3b82f6" }}>CÓ PHÉP</div>
            <div className={styles.statValue} style={{ color: "#3b82f6" }}>{stats.excused}</div>
          </div>
        </div>

        {/* Danh sách các buổi */}
        {history.length === 0 ? (
          <div className={styles.empty}>
            Bạn chưa có dữ liệu điểm danh nào trong lớp này.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tr} style={{ textAlign: "left" }}>
                  <th className={styles.th}>Ngày học</th>
                  <th className={styles.th}>Trạng thái</th>
                  <th className={styles.th}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.tdBold}>
                      {new Date(row.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className={styles.td}>{getStatusBadge(row.status)}</td>
                    <td className={styles.td}>{row.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ==================== GIAO DIỆN GIÁO VIÊN ====================
  return (
    <div className={styles.container}>
      {/* 1. MÀN HÌNH DANH SÁCH PHIÊN ĐIỂM DANH */}
      {mode === "list" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 className={styles.title} style={{ marginBottom: 0 }}>
              Lịch sử điểm danh lớp học
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              {!activeSession && (
                <button className="button-small" onClick={handleOpenSelfAttendance} style={{ background: "#f59e0b" }}>
                  <Icon name="play" size="20" style={{ marginRight: "4px" }} />
                  Mở tự điểm danh hôm nay
                </button>
              )}
              <button className="button-small" onClick={handleInitCreate}>
                <Icon name="add" size="20" style={{ marginRight: "4px" }} />
                Điểm danh hôm nay
              </button>
            </div>
          </div>

          {/* Banner phiên tự điểm danh đang hoạt động dành cho Giáo viên */}
          {activeSession && (
            <div className={styles.activeSessionCard}>
              <div className={styles.activeSessionHeader}>
                <Icon name="check-circle" size="24" style={{ fill: "#22c55e", marginRight: "8px" }} />
                <h4>Điểm danh tự động đang mở</h4>
              </div>
              <p className={styles.activeSessionText}>
                Phiên tự điểm danh ngày <strong>{new Date(activeSession.date).toLocaleDateString("vi-VN")}</strong> đang mở. Sinh viên có thể nhập mã Code sau để check-in:
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#f59e0b", letterSpacing: "4px", background: "rgba(245, 158, 11, 0.1)", padding: "4px 16px", borderRadius: "8px" }}>
                  {activeSession.code}
                </div>
                <button
                  onClick={() => handleCloseSelfAttendance(activeSession.id)}
                  className="button-stroke button-small"
                  style={{ borderColor: "#ef4444", color: "#ef4444" }}
                >
                  Đóng điểm danh
                </button>
              </div>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className={styles.empty}>
              Lớp học chưa được điểm danh buổi nào. Hãy bấm "Điểm danh hôm nay" để bắt đầu!
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tr} style={{ textAlign: "left" }}>
                    <th className={styles.th}>Ngày học</th>
                    <th className={styles.th}>Có mặt</th>
                    <th className={styles.th}>Vắng</th>
                    <th className={styles.th}>Muộn</th>
                    <th className={styles.th}>Có phép</th>
                    <th className={styles.th}>Tổng số</th>
                    <th className={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className={styles.tr}>
                      <td className={styles.tdBold}>
                        {new Date(session.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className={styles.td} style={{ color: "#22c55e", fontWeight: "600" }}>{session.stats.present}</td>
                      <td className={styles.td} style={{ color: "#ef4444", fontWeight: "600" }}>{session.stats.absent}</td>
                      <td className={styles.td} style={{ color: "#f97316", fontWeight: "600" }}>{session.stats.late}</td>
                      <td className={styles.td} style={{ color: "#3b82f6", fontWeight: "600" }}>{session.stats.excused}</td>
                      <td className={styles.td}>{session.total}</td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <button
                          className="button-stroke button-small"
                          onClick={() => handleInitEdit(session.id)}
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 2. MÀN HÌNH TẠO MỚI / CHỈNH SỬA PHIÊN ĐIỂM DANH */}
      {(mode === "create" || mode === "edit") && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <button
                onClick={() => setMode("list")}
                className={styles.btnBack}
              >
                <Icon name="arrow-left" size="20" style={{ marginRight: "4px" }} />
                Quay lại danh sách
              </button>
              <h3 className={styles.title} style={{ marginTop: "8px" }}>
                {mode === "create" ? "Tạo buổi điểm danh" : "Cập nhật buổi điểm danh"}
              </h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600" }}>Chọn ngày: </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                disabled={mode === "edit"} // Khóa đổi ngày khi edit
                className={styles.dateInput}
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className={styles.cardWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tr} style={{ textAlign: "left" }}>
                    <th className={styles.th}>MSSV / Mã</th>
                    <th className={styles.th}>Họ & Tên</th>
                    <th className={styles.th}>Trạng thái điểm danh</th>
                    <th className={styles.th}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((row) => (
                    <tr key={row.studentId} className={styles.tr}>
                      <td className={styles.td}>
                        {row.studentUniqueId || "N/A"}
                      </td>
                      <td className={styles.tdBold}>
                        {row.studentName}
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {[
                            { value: "PRESENT", label: "Có mặt", color: "#22c55e" },
                            { value: "ABSENT", label: "Vắng", color: "#ef4444" },
                            { value: "LATE", label: "Muộn", color: "#f97316" },
                            { value: "EXCUSED", label: "Có phép", color: "#3b82f6" },
                          ].map((opt) => {
                            const isSelected = row.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleStatusChange(row.studentId, opt.value)}
                                className={styles.statusBtn}
                                style={isSelected ? {
                                  borderColor: opt.color,
                                  background: opt.color,
                                  color: "#ffffff",
                                  fontWeight: "600",
                                } : undefined}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <input
                          type="text"
                          placeholder="Ví dụ: Đi muộn 10p, Lý do..."
                          value={row.remark}
                          onChange={(e) => handleRemarkChange(row.studentId, e.target.value)}
                          className={styles.remarkInput}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button
                  className="button-stroke button-small"
                  onClick={() => setMode("list")}
                >
                  Hủy bỏ
                </button>
                <button
                  className="button-small"
                  onClick={handleSaveAttendance}
                >
                  {mode === "create" ? "Lưu điểm danh" : "Cập nhật điểm danh"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
