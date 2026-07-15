import { useEffect, useState, useCallback } from "react";
import { Badge, Popover, List, Button, Typography, Empty } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { socket } from "../socket";
import {
  getMyNotifications,
  markAllRead,
  markOneRead,
} from "../api/notificationApi";

const { Text } = Typography;

const NotificationBell = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit("joinUserRoom", user.id);

    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("newNotification", handleNew);
    return () => socket.off("newNotification", handleNew);
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id) => {
    await markOneRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
  };

  const content = (
    <div style={{ width: 320 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            size="small"
            type="link"
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty description="No notifications" imageStyle={{ height: 40 }} />
      ) : (
        <List
          dataSource={notifications}
          style={{ maxHeight: 360, overflowY: "auto" }}
          renderItem={(item) => (
            <List.Item
              style={{
                background: item.isRead ? "transparent" : "#f0f7ff",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 4,
                cursor: "pointer",
                border: "1px solid",
                borderColor: item.isRead ? "transparent" : "#bae0ff",
              }}
              onClick={() => !item.isRead && handleMarkOne(item._id)}
            >
              <div style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text strong style={{ fontSize: 13 }}>
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#1677ff",
                        display: "inline-block",
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>
                <Text style={{ fontSize: 12, color: "#555" }}>
                  {item.message}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  if (!user) return null;

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <Button
          icon={<BellOutlined />}
          style={{ border: "1px solid #d9d9d9" }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
