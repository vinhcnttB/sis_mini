import React, { useState } from "react";
import cn from "classnames";
import styles from "./UserCard.module.sass";
import Modal from "../Modal";
import EditProfileForm from "../EditProfileForm/EditProfileForm";
import { useAuth } from "../../hooks/useAuth";
import { userServices } from "../../services/UserServices";
import { errorToast, successToast } from "../../utils/toast";

const UserCard = ({
  uniqueId,
  email,
  firstName,
  lastName,
  image,
  status,
  role,
  isBan,
  onBanChange,
}) => {
  const [visibleModal, setVisibleModal] = useState(false);
  const { token } = useAuth();
  
  const [userProfile, setUserProfile] = useState({
    firstName,
    lastName,
    email,
    image,
    uniqueId,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleClick = () => {
    setVisibleModal(true);
  };
  
  const handleCLickBanUser = async () => {
    const response = await userServices.update(
      email,
      {
        isBan: !isBan,
      },
      token
    );
    if (response.status) {
      successToast(isBan ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công");
      if (onBanChange) {
        onBanChange(!isBan);
      } else {
        window.location.reload();
      }
    } else {
      errorToast(response.message || "Có lỗi xảy ra");
    }
  };

  const fullName = `${firstName || ""} ${lastName || ""}`;

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
    <>
      <div className={styles.userCard}>
        <div className={styles.cardHeader}>
          <div className={styles.avatarWrapper}>
            <img className={styles.avatar} src={image} alt={fullName} />
            <span
              className={cn(styles.statusDot, {
                [styles.online]: status === "Online",
                [styles.offline]: status === "Offline",
              })}
            ></span>
          </div>
          {getRoleBadge(role)}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.name}>{fullName}</div>
          <div className={styles.email} title={email}>{email}</div>
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Mã sinh viên:</span>
            {uniqueId ? (
              <span className={styles.infoValue}>{uniqueId}</span>
            ) : (
              <span className={cn(styles.infoValue, styles.noValue)}>Chưa liên kết</span>
            )}
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tài khoản:</span>
            {!isBan ? (
              <span className={cn("status-green", styles.statusBadge)}>Hoạt động</span>
            ) : (
              <span className={cn("status-red", styles.statusBadge)}>Đã khóa</span>
            )}
          </div>

          <div className={styles.actions}>
            <button onClick={handleClick} className={cn("button-stroke button-small", styles.actionBtn)}>
              Xem TK
            </button>
            <button
              onClick={handleCLickBanUser}
              className={cn("button-small", styles.actionBtn)}
              style={{
                backgroundColor: isBan ? "#10b981" : "#ef4444",
                color: "white",
                border: "none"
              }}
            >
              {isBan ? "Mở khóa" : "Khóa TK"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        outerClassName={styles.outer}
        visible={visibleModal}
        onClose={() => setVisibleModal(false)}
      >
        <EditProfileForm
          user={{
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            image: userProfile.image,
            uniqueId: userProfile.uniqueId,
            role,
          }}
          token={token}
          isEditing={isEditing}
          isAdminView={true}
          editProfile={(value) => {
            setUserProfile(value);
            // Reload local state to match saved edits
            if (onBanChange) {
              onBanChange(isBan);
            }
          }}
          toggleEdit={(value) => setIsEditing(value)}
          isShow={true}
          isShowInputStudentId={role === "student"}
        />
      </Modal>
    </>
  );
};

export default UserCard;
