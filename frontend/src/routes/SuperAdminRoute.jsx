import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Result, Spin } from "antd";
const SuperAdminRoute = ({ children }) => {
  const { user, authLoading } = useSelector((state) => state.auth);
  if (authLoading) return <Spin fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "superadmin")
    return (
      <Result
        status="403"
        title="403"
        subTitle="You are not authorised to access this page."
      />
    );
  return children;
};
export default SuperAdminRoute;
