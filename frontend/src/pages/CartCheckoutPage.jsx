import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Radio, Button, Divider, Typography, Row, Col, Card, message, Table } from "antd";
import { ArrowLeftOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useCart } from "../features/cart/useCart";
import { placeCartOrder } from "../api/orderApi";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../features/cart/cartSlice";
import { updateCart } from "../api/cartApi";

const { Title, Text } = Typography;
const UPI_QR_IMAGE = new URL("../assets/UPI QR.jpeg", import.meta.url).href;

const CartCheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, totalPrice } = useCart();
  const user = useSelector((state) => state.auth.user);
  const [form] = Form.useForm();
  const [paymentMode, setPaymentMode] = useState("cod");
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  if (cartItems.length === 0 && !ordered && !loading) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <Text type="secondary">Your cart is empty.</Text><br />
        <Button type="link" onClick={() => navigate("/")}>Go back to Home</Button>
      </div>
    );
  }

  const handleOrder = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const items = cartItems.map((item) => ({ productId: item._id, name: item.name, quantity: item.quantity }));
      await placeCartOrder({ items, paymentMode, deliveryDetails: values });
      setOrdered(true);
      if (user) await updateCart([]);
      localStorage.removeItem("cart");
      dispatch(clearCart());
    } catch (error) {
      message.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <CheckCircleFilled style={{ fontSize: 72, color: "#52c41a", marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8 }}>Order Placed!</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>Your order has been placed successfully.</Text>
          <br /><br />
          <Button type="primary" size="large" onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const columns = [
    { title: "Product", dataIndex: "name" },
    { title: "Price", dataIndex: "price", render: (p) => `₹ ${p.toLocaleString()}` },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Subtotal", render: (_, item) => `₹ ${(item.price * item.quantity).toLocaleString()}` },
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 16px" }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24, paddingLeft: 0 }}>Back</Button>
      <Title level={3} style={{ marginBottom: 24 }}>Checkout</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={15}>
          <Form form={form} layout="vertical" requiredMark="optional">
            <Title level={5} style={{ marginBottom: 16 }}>Delivery Details</Title>
            <Form.Item label="Full Name" name="name" rules={[{ required: true, message: "Please enter your full name" }, { min: 3 }]}>
              <Input placeholder="Enter Name" size="large" />
            </Form.Item>
            <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: "Please enter your mobile number" }, { pattern: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" }]}>
              <Input placeholder="Enter Number" maxLength={10} size="large" />
            </Form.Item>
            <Form.Item label="Delivery Address" name="address" rules={[{ required: true, message: "Please enter your address" }, { min: 5 }]}>
              <Input.TextArea rows={3} placeholder="Enter Address" size="large" />
            </Form.Item>
            <Form.Item label="Pincode" name="pincode" rules={[{ required: true, message: "Please enter your pincode" }, { pattern: /^[1-9][0-9]{5}$/, message: "Enter a valid 6-digit pincode" }]}>
              <Input placeholder="Enter Pincode" maxLength={6} size="large" />
            </Form.Item>
            <Divider />
            <Title level={5} style={{ marginBottom: 16 }}>Payment Mode</Title>
            <Form.Item name="paymentMode" initialValue="cod" rules={[{ required: true }]}>
              <Radio.Group onChange={(e) => setPaymentMode(e.target.value)} value={paymentMode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Radio value="cod">Cash on Delivery</Radio>
                <Radio value="upi">UPI Payment</Radio>
              </Radio.Group>
            </Form.Item>
            {paymentMode === "upi" && (
              <Card style={{ marginBottom: 16, background: "#f9f9ff" }}>
                <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>Scan the QR code below to pay ₹ {totalPrice.toLocaleString()}</Text>
                <img src={UPI_QR_IMAGE} alt="UPI QR Code" width={180} style={{ borderRadius: 8, display: "block", margin: "0 auto" }} />
                <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 8, fontSize: 12 }}>After payment, click "Place Order" to confirm</Text>
              </Card>
            )}
            <Button type="primary" size="large" block loading={loading} onClick={handleOrder} style={{ marginTop: 8 }}>Place Order</Button>
          </Form>
        </Col>
        <Col xs={24} md={9}>
          <Card title="Order Summary" style={{ position: "sticky", top: 80 }}>
            <Table rowKey="_id" dataSource={cartItems} columns={columns} pagination={false} size="small" />
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}><Text type="secondary">Delivery</Text><Text style={{ color: "#52c41a" }}>Free</Text></div>
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Total</Text>
              <Text strong style={{ fontSize: 18, color: "#ff6a00" }}>₹ {totalPrice.toLocaleString()}</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartCheckoutPage;
