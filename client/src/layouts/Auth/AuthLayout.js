import React from "react";
import { useOutlet } from "react-router-dom";
import "./style.css";
import "../../style.css";
const AuthLayout = () => {
  const outlet = useOutlet();

  return (
    <div className="authLayout d-flex justify-content-center align-items-center vh-100 bg-image">
      <div>{outlet}</div>
    </div>
  );
};

export default AuthLayout;
