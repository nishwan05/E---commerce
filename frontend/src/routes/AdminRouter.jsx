import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Result, Button, Spin } from "antd";
const AdminRoute = ({ children }) => {
  const { user, authLoading } = useSelector((state) => state.auth);
  if (authLoading) return <Spin fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!["admin", "superadmin"].includes(user.role))
    return (
      <Result
        status="403"
        title="403"
        subTitle="You are not authorised to this page!"
        extra={
          <Button type="primary" href="/">
            Back Home
          </Button>
        }
      />
    );
  return children;
};
export default AdminRoute;
