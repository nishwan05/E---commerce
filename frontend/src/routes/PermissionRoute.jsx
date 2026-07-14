import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Result, Button, Spin } from "antd";
import { useAccess } from "../context/AccessContext";
const PermissionRoute = ({ page, children }) => {
  const { user, authLoading } = useSelector((state) => state.auth);
  const { hasAccess, loading } = useAccess();
  if (authLoading || loading) return <Spin fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasAccess(user.role, page))
    return <Result status="403" title="403" subTitle="You're not authorized to access this page." extra={<Button type="primary" href="/">Back Home</Button>} />;
  return children;
};
export default PermissionRoute;
