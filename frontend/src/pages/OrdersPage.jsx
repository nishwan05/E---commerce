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
} from "antd";
import {
  ShoppingOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { getMyOrders } from "../api/orderApi";

const { Title, Text } = Typography;

const statusColor = {
  Placed: "blue",
  Shipped: "orange",
  Delivered: "green",
  Cancelled: "red",
};

const paymentLabel = {
  cod: "Cash on Delivery",
  upi: "UPI",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
        <Title level={3} style={{ marginBottom: 24 }}>My Orders</Title>
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
        <Title level={3} style={{ marginBottom: 24 }}>My Orders</Title>
        <Card style={{ borderRadius: 12 }}>
          <Empty
            image={<ShoppingOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
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
        <Card
          key={order._id}
          style={{ marginBottom: 16, borderRadius: 12 }}
          styles={{ body: { padding: "20px 24px" } }}
        >
          {/* Order Header */}
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
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#555",
                }}
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

          {/* Products */}
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
                <Col flex="auto">
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

          {/* Footer */}
          <Row justify="space-between" align="bottom" gutter={[16, 12]}>
            <Col xs={24} sm={14}>
              {order.address && (
                <div>
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
              <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: "block" }}>
                Payment: {paymentLabel[order.paymentMode] || order.paymentMode}
              </Text>
            </Col>

            <Col xs={24} sm={10} style={{ textAlign: "right" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Total Amount
              </Text>
              <br />
              <Text
                strong
                style={{ fontSize: 22, color: "#ff6a00" }}
              >
                ₹ {order.totalAmount?.toLocaleString()}
              </Text>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );
};

export default OrdersPage;