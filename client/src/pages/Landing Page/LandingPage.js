import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./style.css";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === "admin") {
    return <Navigate to="/manage/users" replace />;
  } else if (
    user?.role === "teacher" ||
    user?.role === "student" ||
    user?.role === "user"
  ) {
    return <Navigate to="/classes" replace />;
  } else
    return (
      <main className="landingPage">
        <div className="landingPageContext">
          <p className="landingPageText">
            Chào mừng bạn đến với nhóm thuộc lớp Web Nâng Cao! Chúng tôi là các
            chuyên gia về phát triển và tối ưu hóa website. Với kinh nghiệm lâu
            năm và kiến thức chuyên sâu, chúng tôi cam kết mang đến cho bạn
            những giải pháp tối ưu nhất để nâng cao sự hiệu quả cho trang web
            của bạn.
          </p>
          <button
            className="button"
            onClick={() => {
              navigate("/auth/sign-in");
            }}
          >
            Tham gia ngay
          </button>
        </div>
      </main>
    );
};

export default LandingPage;
