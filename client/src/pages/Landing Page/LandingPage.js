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
