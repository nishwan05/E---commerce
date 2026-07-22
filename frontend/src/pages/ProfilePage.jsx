import { useEffect, useState } from "react";
import { Form, Input, Select, Button, Card, Avatar, Typography, Divider, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getProfile, updateProfile } from "../api/userApi";
import { getMediaUrl } from "../utils/media";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        setProfile(res.data);
        form.setFieldsValue(res.data);
      } catch { message.error("Failed to load profile"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [form]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      await updateProfile(values);
      message.success("Profile saved successfully");
    } catch { message.error("Failed to save profile"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px" }}>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar
            size={80}
            src={getMediaUrl(profile?.profilePicture)}
            icon={<UserOutlined />}
            style={{ background: "#1677ff" }}
          />
          <br />
          <Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>{profile?.name}</Title>
          <Text type="secondary">{profile?.email}</Text>
        </div>

        <Divider />

        <Form form={form} layout="vertical">
          <Form.Item label="Full Name" name="name">
            <Input placeholder="Enter your full name" size="large" />
          </Form.Item>

          <Form.Item label="Profile Picture URL" name="profilePicture">
            <Input placeholder="Paste image URL" size="large" />
          </Form.Item>

          <Form.Item label="Mobile Number" name="mobile">
            <Input placeholder="10-digit mobile number" maxLength={10} size="large" />
          </Form.Item>

          <Form.Item label="Date of Birth" name="dateOfBirth">
            <Input placeholder="DD/MM/YYYY" size="large" />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select
              size="large"
              placeholder="Select gender"
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={3} placeholder="Street, City, State" size="large" />
          </Form.Item>

          <Form.Item label="Pincode" name="pincode">
            <Input placeholder="6-digit pincode" maxLength={6} size="large" />
          </Form.Item>

          <Button type="primary" size="large" block loading={saving} onClick={handleSave}>
            Save Profile
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
