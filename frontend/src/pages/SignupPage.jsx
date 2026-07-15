import { Form, Input, Button, Typography, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";

const { Title, Text } = Typography;

const SignupPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await registerUser(values);
      message.success("Account created! Please log in.", 3);
      navigate("/login");
    } catch (error) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message, 3);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
        padding: 16,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 440, borderRadius: 12 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Create Account
        </Title>

        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Please enter your name" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter Name" size="large" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="example.com" size="large" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter a password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              placeholder="Minimum 6 characters"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" size="large" block onClick={handleSubmit}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center" }}
        >
          Already have an account? <Link to="/login">Log in</Link>
        </Text>
      </Card>
    </div>
  );
};

export default SignupPage;
