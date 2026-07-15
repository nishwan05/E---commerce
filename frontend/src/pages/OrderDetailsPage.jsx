import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Typography,
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
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getOrderById, cancelOrder } from "../api/orderApi";
import { socket } from "../socket";
import OrderTimeline from "../components/OrderTimeline";

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

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const handleOrderUpdated = (updatedOrder) => {
      if (String(updatedOrder._id) === String(id)) {
        setOrder(updatedOrder);
      }
    };
    socket.on("orderUpdated", handleOrderUpdated);
    return () => socket.off("orderUpdated", handleOrderUpdated);
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await cancelOrder(id, cancelReason);
      message.success("Order cancelled successfully");
      setCancelModal(false);
      fetchOrder();
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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "60px 16px",
          textAlign: "center",
        }}
      >
        <Text type="secondary">Order not found.</Text>
        <br />
        <Button type="link" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/orders")}
        style={{ marginBottom: 24, paddingLeft: 0 }}
      >
        Back to Orders
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Order Details
        </Title>
        {canCancel(order.status) && (
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => setCancelModal(true)}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={15}>
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ORDER ID
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace", fontSize: 13 }}>
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
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>
            </div>
          </Card>

          <Card
            title="Items Ordered"
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            {order.products.map((item, index) => (
              <Row
                key={index}
                align="middle"
                style={{
                  padding: "10px 0",
                  borderBottom:
                    index < order.products.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                }}
              >
                {item.image && (
                  <Col flex="70px">
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                        borderRadius: 8,
                        background: "#f5f5f5",
                      }}
                    />
                  </Col>
                )}
                <Col flex="auto" style={{ paddingLeft: 12 }}>
                  <Text style={{ fontWeight: 500, fontSize: 15 }}>
                    {item.name}
                  </Text>
                  <br />
                  <Text type="secondary">
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                  </Text>
                </Col>
                <Col>
                  <Text strong style={{ fontSize: 15 }}>
                    ₹ {(item.price * item.quantity).toLocaleString()}
                  </Text>
                </Col>
              </Row>
            ))}

            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <Text type="secondary">Total Amount</Text>
                <br />
                <Text strong style={{ fontSize: 22, color: "#ff6a00" }}>
                  ₹ {order.totalAmount?.toLocaleString()}
                </Text>
              </div>
            </div>
          </Card>

          <Card title="Delivery Details" style={{ borderRadius: 12 }}>
            {order.address && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14 }}>
                  <EnvironmentOutlined style={{ marginRight: 6 }} />
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
                    <Text style={{ fontSize: 14 }}>
                      <PhoneOutlined style={{ marginRight: 6 }} />
                      {order.address.mobile}
                    </Text>
                  </>
                )}
              </div>
            )}
            <Divider style={{ margin: "10px 0" }} />
            <Text>
              Payment:{" "}
              <strong>
                {paymentLabel[order.paymentMode] || order.paymentMode}
              </strong>
              {" · "}
              <Tag color={order.paymentStatus === "paid" ? "green" : "orange"}>
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </Tag>
            </Text>

            {order.cancellationReason && (
              <>
                <Divider style={{ margin: "10px 0" }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Cancellation reason: {order.cancellationReason}
                </Text>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} md={9}>
          <Card
            title="Order Timeline"
            style={{ borderRadius: 12, position: "sticky", top: 80 }}
          >
            <OrderTimeline
              statusHistory={order.statusHistory || []}
              currentStatus={order.status}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Cancel Order"
        open={cancelModal}
        onCancel={() => {
          setCancelModal(false);
          setCancelReason("");
        }}
        onOk={handleCancel}
        okText="Cancel Order"
        okButtonProps={{ danger: true, loading: cancelling }}
      >
        <p style={{ marginBottom: 12 }}>
          Are you sure you want to cancel this order? Stock will be restored
          automatically.
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

export default OrderDetailPage;
