import React, { useEffect, useState } from "react";
import "./style.css";
import UserCard from "../../components/UserCard/UserCard";
import { successToast, errorToast } from "../../utils/toast";
import { userServices } from "../../services/UserServices";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Home.module.sass";
import { useAuth } from "../../hooks/useAuth";
import cn from "classnames";
import TextInput from "../../components/TextInput";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import EditProfileForm from "../../components/EditProfileForm/EditProfileForm";

const statusArr = ["Online", "Offline"];
const avatarArr = ["/assets/male-avatar.jpg", "/assets/female-avatar.jpg"];

const randomStatus = () => statusArr[Math.floor(Math.random() * statusArr.length)];
const randomAvatar = () => avatarArr[Math.floor(Math.random() * avatarArr.length)];

const Home = () => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & State quản lý view
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' hoặc 'grid'
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal xem & sửa thông tin tài khoản dùng chung
  const [selectedUser, setSelectedUser] = useState(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await userServices.getAll(token);
      const responseData = response.data || response;
      const loadUsers = [];
      for (const key in responseData) {
        loadUsers.push({
          key: key,
          id: responseData[key].id,
          firstName: responseData[key].firstName,
          lastName: responseData[key].lastName,
          email: responseData[key].email,
          uniqueId: responseData[key]?.uniqueId,
          role: responseData[key].role,
          isBan: responseData[key].isBan,
          // Gán cố định một lần để tránh random liên tục khi re-render
          avatar: responseData[key].avatar || randomAvatar(),
          status: randomStatus(),
        });
      }
      setUsers(loadUsers);
    } catch (error) {
      errorToast("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Reset trang về 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await userServices.updateStudentIdByFile(formData);
        if (response.status) {
          fetchData();
          setFile(null);
          // Reset file input
          const fileInput = document.getElementById("file");
          if (fileInput) fileInput.value = "";
          return successToast("Upload mã số sinh viên thành công!");
        }
      } catch (error) {
        errorToast("Upload thất bại, vui lòng thử lại");
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await userServices.downloadSampleTemplate();
      if (response.status) {
        const link = document.createElement("a");
        link.href = response.data;
        link.download = `Sample_StudentId_Template_${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        successToast("Tải tệp Excel mẫu thành công!");
      } else {
        errorToast(response.message || "Tải mẫu Excel thất bại");
      }
    } catch (error) {
      errorToast("Có lỗi xảy ra khi tải tệp mẫu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (email, isBan) => {
    const response = await userServices.update(
      email,
      {
        isBan: !isBan,
      },
      token
    );
    if (response.status) {
      successToast(isBan ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công");
      // Cập nhật state trực tiếp không cần reload trang
      setUsers((prev) =>
        prev.map((u) => (u.email === email ? { ...u, isBan: !isBan } : u))
      );
      if (selectedUser && selectedUser.email === email) {
        setSelectedUser(prev => ({ ...prev, isBan: !isBan }));
      }
    } else {
      errorToast(response.message || "Có lỗi xảy ra");
    }
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setIsEditing(false);
    setVisibleModal(true);
  };

  // Lọc danh sách người dùng
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const uniqueId = (user.uniqueId || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) ||
      email.includes(query) ||
      uniqueId.includes(query);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = !user.isBan;
    } else if (statusFilter === "banned") {
      matchesStatus = user.isBan;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className={cn(styles.badge, styles.badgeAdmin)}>Admin</span>;
      case "teacher":
        return <span className={cn(styles.badge, styles.badgeTeacher)}>Giáo viên</span>;
      default:
        return <span className={cn(styles.badge, styles.badgeStudent)}>Học sinh</span>;
    }
  };

  return (
    <div className={styles.homeScreen}>
      {isLoading && <LoadingSpinner />}
      
      {/* File Upload Section */}
      <div className={styles.uploadCard}>
        <div className={styles.uploadHeader}>
          <Icon name="upload" size="20" />
          <span className={styles.uploadTitle}>Nhập mã số sinh viên hàng loạt</span>
        </div>
        <div className={styles.uploadBody}>
          <label htmlFor="file" className={styles.fileLabel}>
            Chọn tệp Excel danh sách mã số sinh viên (.xlsx, .xls)
          </label>
          <div className={styles.fileInputWrapper}>
            <input id="file" type="file" onChange={handleFileChange} accept=".xlsx,.xls" className={styles.fileInput} />
            {file && (
              <button className={cn("button", styles.uploadBtn)} onClick={handleUpload}>
                <Icon name="check" size="18" />
                <span>Bắt đầu Upload</span>
              </button>
            )}
            <button className={cn("button-stroke", styles.downloadBtn)} onClick={handleDownloadTemplate}>
              <Icon name="download" size="18" />
              <span>Tải Excel mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control bar: Search, Filters, View Modes */}
      <div className={styles.controlBar}>
        <div className={styles.searchBox}>
          <TextInput
            placeholder="Tìm theo tên, email hoặc mã số..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="search"
          />
        </div>
        
        <div className={styles.filters}>
          <div className={styles.selectWrapper}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="teacher">Giáo viên</option>
              <option value="student">Học sinh</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Bình thường</option>
              <option value="banned">Đã khóa (Banned)</option>
            </select>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={cn(styles.toggleBtn, { [styles.active]: viewMode === "table" })}
              onClick={() => setViewMode("table")}
              title="Xem dạng bảng"
            >
              <Icon name="list" size="20" />
            </button>
            <button
              className={cn(styles.toggleBtn, { [styles.active]: viewMode === "grid" })}
              onClick={() => setViewMode("grid")}
              title="Xem dạng lưới"
            >
              <Icon name="grid" size="20" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Header */}
      <div className={styles.listHeader}>
        <div className={styles.listTitle}>
          Danh sách người dùng ({filteredUsers.length})
        </div>
        <button className={cn("button-stroke button-small")} onClick={fetchData}>
          <Icon name="repeat" size="14" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* User Display Grid or Table */}
      {filteredUsers.length === 0 ? (
        <div className={styles.noData}>Không tìm thấy người dùng phù hợp</div>
      ) : viewMode === "table" ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Người dùng</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Mã sinh viên</th>
                <th className={styles.th}>Vai trò</th>
                <th className={styles.th}>Hoạt động</th>
                <th className={styles.th}>Tài khoản</th>
                <th className={styles.th} style={{ textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`;
                return (
                  <tr key={user.email} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <div className={styles.tableAvatar}>
                          <img src={user.avatar} alt={fullName} />
                          <span
                            className={cn(styles.statusDot, {
                              [styles.online]: user.status === "Online",
                              [styles.offline]: user.status === "Offline",
                            })}
                          ></span>
                        </div>
                        <span className={styles.userName}>{fullName}</span>
                      </div>
                    </td>
                    <td className={styles.td}>{user.email}</td>
                    <td className={styles.td}>
                      {user.uniqueId ? (
                        <span className={styles.studentId}>{user.uniqueId}</span>
                      ) : (
                        <span className={styles.noStudentId}>Chưa liên kết</span>
                      )}
                    </td>
                    <td className={styles.td}>{getRoleBadge(user.role)}</td>
                    <td className={styles.td}>
                      <span
                        className={cn(styles.statusText, {
                          [styles.onlineText]: user.status === "Online",
                          [styles.offlineText]: user.status === "Offline",
                        })}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {!user.isBan ? (
                        <span className={cn("status-green", styles.statusBadge)}>Bình thường</span>
                      ) : (
                        <span className={cn("status-red", styles.statusBadge)}>Đã khóa</span>
                      )}
                    </td>
                    <td className={styles.td} style={{ textAlign: "center" }}>
                      <div className={styles.actions}>
                        <button
                          className={cn("button-stroke button-small", styles.actionBtn)}
                          onClick={() => handleOpenDetail(user)}
                        >
                          Xem
                        </button>
                        <button
                          className={cn(
                            "button-small",
                            user.isBan ? "button" : "button-stroke-red",
                            styles.actionBtn
                          )}
                          style={user.isBan ? { backgroundColor: "#10b981", color: "white" } : {}}
                          onClick={() => handleBanUser(user.email, user.isBan)}
                        >
                          {user.isBan ? "Mở khóa" : "Khóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.userContainer}>
          {displayedUsers.map((user) => (
            <UserCard
              key={user.email}
              firstName={user.firstName}
              lastName={user.lastName}
              status={user.status}
              email={user.email}
              image={user.avatar}
              uniqueId={user.uniqueId}
              role={user.role}
              isBan={user.isBan}
              onBanChange={(isBan) => {
                setUsers(prev => prev.map(u => u.email === user.email ? { ...u, isBan } : u));
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {filteredUsers.length > 0 && (
        <div className={styles.pagination}>
          <button
            className={cn(styles.pageBtn, { [styles.disabled]: currentPage === 1 })}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <Icon name="arrow-left" size="16" />
            <span>Trang trước</span>
          </button>
          
          <span className={styles.pageInfo}>
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>
          
          <button
            className={cn(styles.pageBtn, { [styles.disabled]: currentPage === totalPages })}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <span>Trang sau</span>
            <Icon name="arrow-right" size="16" />
          </button>
        </div>
      )}

      {/* Shared Modal for viewing and editing User Details */}
      {selectedUser && (
        <Modal
          outerClassName={styles.outer}
          visible={visibleModal}
          onClose={() => setVisibleModal(false)}
        >
          <EditProfileForm
            user={{
              firstName: selectedUser.firstName,
              lastName: selectedUser.lastName,
              email: selectedUser.email,
              image: selectedUser.avatar,
              uniqueId: selectedUser.uniqueId,
              role: selectedUser.role,
            }}
            token={token}
            isEditing={isEditing}
            isAdminView={true}
            editProfile={(value) => {
              // Cập nhật lại thông tin user trong danh sách sau khi lưu
              setUsers((prev) =>
                prev.map((u) =>
                  u.email === selectedUser.email
                    ? { ...u, firstName: value.firstName, lastName: value.lastName, uniqueId: value.uniqueId }
                    : u
                )
              );
              setSelectedUser(prev => ({
                ...prev,
                firstName: value.firstName,
                lastName: value.lastName,
                uniqueId: value.uniqueId
              }));
            }}
            toggleEdit={(value) => setIsEditing(value)}
            isShow={true}
            isShowInputStudentId={selectedUser.role === "student"}
          />
        </Modal>
      )}
    </div>
  );
};

export default Home;
