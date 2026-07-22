import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";

const AuthRoute = ({ children }) => {
  const { user, authLoading } = useSelector((state) => state.auth);
  if (authLoading) return <Spin fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default AuthRoute;
