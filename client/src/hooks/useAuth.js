import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [token, setToken] = useLocalStorage("token", null);
  // const [token, setToken] = useLocalStorage("token", null);
  const navigate = useNavigate();
  const login = async (data, token) => {
    setUser(data);
    setToken(token);
    const defaultPath = data.role === "admin" ? "/manage/users" : "/classes";
    navigate(defaultPath, { replace: true });
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  };
  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
