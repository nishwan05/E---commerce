import { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Input, Typography, message, Table, Checkbox, Space, Popconfirm } from "antd";
import { getPages, createPage } from "../api/pageApi";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getRoles, createRole, updateRole, deleteRole } from "../api/roleApi";
import { useAccess } from "../context/AccessContext";

const { Title } = Typography;

const SuperAdminPage = () => {
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [pages, setPages] = useState([]);
  const [form] = Form.useForm();
  const { permissions, updatePermission } = useAccess();
  const [pageOpen, setPageOpen] = useState(false);
  const [pageForm] = Form.useForm();

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data.data);
    } catch {
      message.error("Failed to fetch roles");
    }
  };

  const fetchPages = async () => {
    try {
      const res = await getPages();
      setPages(res.data.data);
    } catch {
      message.error("Failed to fetch pages");
    }
  };

  useEffect(() => { fetchRoles(); fetchPages(); }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const roleName = values.role.trim().toLowerCase();
      const roleExists = roles.some((role) => role.name.toLowerCase() === roleName && role._id !== editingRole?._id);
      if (roleExists) { message.error("Role already exists"); return; }
      if (editingRole) {
        await updateRole(editingRole._id, { name: roleName });
        message.success("Role updated successfully");
      } else {
        await createRole({ name: roleName });
        message.success("Role added successfully");
      }
      await fetchRoles();
      form.resetFields();
      setEditingRole(null);
      setOpen(false);
    } catch {
      message.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRole(id);
      message.success("Role deleted successfully");
      fetchRoles();
    } catch {
      message.error("Failed to delete role");
    }
  };

  const handlePageSubmit = async () => {
    try {
      const values = await pageForm.validateFields();
      await createPage(values);
      message.success("Page created");
      await fetchPages();
      setPageOpen(false);
      pageForm.resetFields();
    } catch {
      message.error("Operation failed");
    }
  };

  const roleColumns = [
    {
      title: "Role Name",
      dataIndex: "name",
      render: (name) => name.charAt(0).toUpperCase() + name.slice(1),
    },
    {
      title: "Actions",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditingRole(record); form.setFieldsValue({ role: record.name }); setOpen(true); }}
          />
          <Popconfirm
            title="Delete Role"
            description="Are you sure you want to delete this role?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const permissionColumns = [
    {
      title: "Routes",
      dataIndex: "label",
      fixed: "left",
      width: 240,
      render: (label) => <span className="permission-route-name">+ {label}</span>,
    },
    ...roles.map((role) => ({
      title: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      align: "center",
      width: 150,
      render: (_, page) => (
        <Checkbox
          checked={permissions[role.name.toLowerCase()]?.includes(page.key)}
          onChange={(e) => updatePermission(role.name, page.key, e.target.checked)}
        />
      ),
    })),
  ];

  return (
    <div className="super-admin-page">
      <Title level={4} className="super-admin-title">Roles & Permissions</Title>

      <div className="access-control-layout">
        <Card
          className="access-panel roles-panel"
          title="Roles"
          extra={
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); form.resetFields(); setOpen(true); }}>
              Add Role
            </Button>
          }
        >
          <Table rowKey="_id" columns={roleColumns} dataSource={roles} pagination={false} size="small" />
        </Card>

        <Card
          className="access-panel permissions-panel"
          title="Permissions"
          extra={
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { pageForm.resetFields(); setPageOpen(true); }}>
              Add Page
            </Button>
          }
        >
          <Table rowKey="_id" columns={permissionColumns} dataSource={pages} pagination={false} size="small" scroll={{ x: "max-content" }} />
        </Card>
      </div>

      <Modal title="Add Page" open={pageOpen} onCancel={() => setPageOpen(false)} onOk={handlePageSubmit}>
        <Form form={pageForm} layout="vertical">
          <Form.Item label="Key" name="key" rules={[{ required: true }]}><Input placeholder="Key" /></Form.Item>
          <Form.Item label="Label" name="label" rules={[{ required: true }]}><Input placeholder="Name" /></Form.Item>
          <Form.Item label="Path" name="path" rules={[{ required: true }]}><Input placeholder="/" /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRole ? "Edit Role" : "Add Role"}
        open={open}
        onCancel={() => { form.resetFields(); setEditingRole(null); setOpen(false); }}
        onOk={handleSubmit}
        okText={editingRole ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Role Name" name="role" rules={[{ required: true, message: "Please enter a role name" }, { min: 3, message: "Role must be at least 3 characters" }]}>
            <Input placeholder="Enter role name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminPage;
