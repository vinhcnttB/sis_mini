import React, { useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { classServices } from "../../services/ClassServices";
import { errorToast, successToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";

const EmailInvite = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get user info from URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  useEffect(() => {
    const acceptInvite = async () => {
      if (user) {
        // User tồn tại: Gọi API
        const response = await classServices.acceptEmailInvite(token);
        if (response.status) {
          successToast("Vào lớp thành công!");
          navigate("/classes");
        } else {
          return errorToast("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      }
    };
    acceptInvite();
  }, []);
  return (
    <div>
      <LoadingSpinner />
    </div>
  );
};

export default EmailInvite;
