import { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Typography,
  Empty,
  Skeleton,
  Divider,
  Row,
  Col,
  Button,
  Modal,
  Input,
  message,
} from "antd";
import {
  ShoppingOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  EyeOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyOrders, cancelOrder } from "../api/orderApi";
import { socket } from "../socket";

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColor = {
  Placed: "blue",
  Confirmed: "cyan",
  Packed: "purple",
  Shipped: "orange",
  "Out for Delivery": "gold",
  Delivered: "green",
  Cancelled: "red",
};

const paymentLabel = { cod: "Cash on Delivery", upi: "UPI" };

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    orderId: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleOrderUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(updatedOrder._id) ? updatedOrder : o,
        ),
      );
    };
    socket.on("orderUpdated", handleOrderUpdated);
    return () => socket.off("orderUpdated", handleOrderUpdated);
  }, []);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await cancelOrder(cancelModal.orderId, cancelReason);
      message.success("Order cancelled successfully");
      setCancelModal({ open: false, orderId: null });
      setCancelReason("");
      fetchOrders();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (status) =>
    !["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(status);

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
        <Title level={3} style={{ marginBottom: 24 }}>
          My Orders
        </Title>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} style={{ marginBottom: 16, borderRadius: 12 }}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
        <Title level={3} style={{ marginBottom: 24 }}>
          My Orders
        </Title>
        <Card style={{ borderRadius: 12 }}>
          <Empty
            image={
              <ShoppingOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            imageStyle={{ height: 80 }}
            description={
              <Text type="secondary" style={{ fontSize: 15 }}>
                You haven't placed any orders yet.
              </Text>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        My Orders
        <Text
          type="secondary"
          style={{ fontSize: 14, fontWeight: 400, marginLeft: 12 }}
        >
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </Text>
      </Title>

      {orders.map((order) => (
        <Card key={order._id} style={{ marginBottom: 16, borderRadius: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ORDER ID
              </Text>
              <br />
              <Text
                style={{ fontFamily: "monospace", fontSize: 13, color: "#555" }}
              >
                {order._id}
              </Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Tag
                color={statusColor[order.status] || "default"}
                style={{ fontSize: 13, padding: "3px 10px" }}
              >
                {order.status}
              </Tag>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div style={{ marginBottom: 16 }}>
            {order.products.map((item, index) => (
              <Row
                key={index}
                align="middle"
                style={{
                  padding: "8px 0",
                  borderBottom:
                    index < order.products.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                {item.image && (
                  <Col flex="60px">
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "contain",
                        borderRadius: 6,
                        background: "#f5f5f5",
                      }}
                    />
                  </Col>
                )}
                <Col flex="auto" style={{ paddingLeft: 8 }}>
                  <Text style={{ fontWeight: 500 }}>{item.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                  </Text>
                </Col>
                <Col>
                  <Text strong>
                    ₹ {(item.price * item.quantity).toLocaleString()}
                  </Text>
                </Col>
              </Row>
            ))}
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <Row justify="space-between" align="bottom" gutter={[16, 12]}>
            <Col xs={24} sm={14}>
              {order.address && (
                <div style={{ marginBottom: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    DELIVERY TO
                  </Text>
                  <br />
                  <Text style={{ fontSize: 13 }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    {[
                      order.address.name,
                      order.address.address,
                      order.address.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                  {order.address.mobile && (
                    <>
                      <br />
                      <Text style={{ fontSize: 13 }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {order.address.mobile}
                      </Text>
                    </>
                  )}
                </div>
              )}
              <Text type="secondary" style={{ fontSize: 13 }}>
                Payment: {paymentLabel[order.paymentMode] || order.paymentMode}
                {" · "}
                <span
                  style={{
                    color: order.paymentStatus === "paid" ? "green" : "orange",
                    fontWeight: 500,
                  }}
                >
                  {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                </span>
              </Text>
            </Col>

            <Col xs={24} sm={10}>
              <div style={{ textAlign: "right", marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Total Amount
                </Text>
                <br />
                <Text strong style={{ fontSize: 22, color: "#ff6a00" }}>
                  ₹ {order.totalAmount?.toLocaleString()}
                </Text>
              </div>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Details
                </Button>
                {canCancel(order.status) && (
                  <Button
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() =>
                      setCancelModal({ open: true, orderId: order._id })
                    }
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      ))}

      <Modal
        title="Cancel Order"
        open={cancelModal.open}
        onCancel={() => {
          setCancelModal({ open: false, orderId: null });
          setCancelReason("");
        }}
        onOk={handleCancel}
        okText="Cancel Order"
        okButtonProps={{ danger: true, loading: cancelling }}
      >
        <p style={{ marginBottom: 12 }}>
          Are you sure you want to cancel this order? Stock will be restored.
        </p>
        <TextArea
          rows={3}
          placeholder="Reason for cancellation (optional)"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default OrdersPage;
