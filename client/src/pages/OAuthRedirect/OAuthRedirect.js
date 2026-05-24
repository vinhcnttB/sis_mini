import React, { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import RedirectModal from "./RedirectModal/index";
import Dropdown from "../../components/Dropdown";
import { getRoleIdFromRole, getRoleFromId } from "../../utils/Role";
import styles from "./RedirectModal/RedirectModal.module.sass";
import { userServices } from "../../services/UserServices";
import cn from "classnames";

const OAUthRedirect = () => {
  const { login } = useAuth();
  const [visibleModal, setVisibleModal] = useState(false);
  const roleList = ["Học sinh", "Giáo viên"];
  const [role, setRole] = useState(roleList[0]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Lấy thông tin
    const userInfo = {
      id: searchParams.get("id"),
      firstName: searchParams.get("firstName"),
      lastName: searchParams.get("lastName"),
      email: searchParams.get("email"),
      picture: searchParams.get("picture"),
      role: searchParams.get("role"),
    };
    const token = searchParams.get("accessToken");
    // Get user info from URL
    if (userInfo.picture === "undefined") {
      userInfo.picture = undefined;
    }
    // Nếu không có role: render màn hình yêu cầu nhập role
    console.log(userInfo);
    if (userInfo.role === "user") {
      setVisibleModal(true);
    } else {
      login(userInfo, token);
    }
  }, []);
  const handleUpdateRole = async () => {
    let userRole;
    // role=1: admin
    // role=2: user
    // role=3: student
    // role=4: teacher
    if (role === "Học sinh") {
      userRole = getRoleIdFromRole("student");
    } else if (role === "Giáo viên") {
      userRole = getRoleIdFromRole("teacher");
    }
    const userInfo = {
      id: searchParams.get("id"),
      firstName: searchParams.get("firstName"),
      lastName: searchParams.get("lastName"),
      email: searchParams.get("email"),
      picture: searchParams.get("picture"),
      role: searchParams.get("role"),
    };
    const token = searchParams.get("accessToken");
    // Gọi service để lấy role ở đây
    const response = await userServices.updateRole(
      userInfo.email,
      userInfo.firstName,
      userInfo.lastName,
      userRole,
      token
    );
    // Nếu thành công: update lên localStorage, cho vào trang đăng nhập
    if (response.status) {
      const updatedResponse = {
        user: {
          id: userInfo.id,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          role: getRoleFromId(userRole),
          picture: userInfo.picture,
        },
        token: token,
      };
      login(updatedResponse.user, updatedResponse.token);
    }
  };
  return (
    <div>
      <LoadingSpinner />
      <RedirectModal
        outerClassName={styles.outer}
        visible={visibleModal}
        onClose={() => setVisibleModal(false)}
      >
        <div>Chọn vai trò</div>
        <Dropdown
          className={styles.dropdown}
          classDropdownHead={styles.dropdownHead}
          value={role}
          setValue={setRole}
          options={roleList}
          small
        />
        <button
          style={{ marginTop: "10px" }}
          className={cn("button-small", styles.button)}
          onClick={handleUpdateRole}
        >
          Chọn
        </button>
      </RedirectModal>
    </div>
  );
};
export default OAUthRedirect;
