import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Switch,
} from "antd";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { getUsers, updateUser, deleteUser } from "../api/userApi";
import { getRoles } from "../api/roleApi";
import { useSelector } from "react-redux";
import { socket } from "../socket";

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;

const UserDetails = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      const filteredUsers = res.data.filter(
        (user) => user.email !== "superadmin@gmail.com",
      );
      setUsers(filteredUsers);
    } catch {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    getRoles().then((res) => setRoles(res.data.data));
  }, []);
  useEffect(() => {
    socket.on("userUpdated", fetchUsers);
    return () => socket.off("userUpdated", fetchUsers);
  }, []);

  const handleEdit = useCallback(
    (user) => {
      if (user?._id === currentUserId) {
        message.warning("You cannot edit your own account");
        return;
      }
      setSelectedUser(user);
      form.setFieldsValue(user);
      setEditOpen(true);
    },
    [currentUserId, form],
  );

  const handleEditSubmit = async () => {
    try {
      if (!selectedUser?._id) {
        message.error("No user selected");
        return;
      }
      const values = await form.validateFields();
      await updateUser(selectedUser._id, values);
      message.success("User updated successfully", 3);
      setEditOpen(false);
      fetchUsers();
    } catch {
      message.error("Failed to update user");
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      try {
        if (id === currentUserId) {
          message.warning("You cannot delete your own account");
          return;
        }
        await deleteUser(id);
        message.success("User deleted successfully", 3);
        fetchUsers();
      } catch {
        message.error("Failed to delete user");
      }
    },
    [currentUserId],
  );

  const handleRoleChange = useCallback(
    async (record, newRole) => {
      try {
        if (record._id === currentUserId) return;
        await updateUser(record._id, { role: newRole });
        message.success("Role updated successfully", 3);
        fetchUsers();
      } catch {
        message.error("Failed to update role");
      }
    },
    [currentUserId],
  );

  const handleActiveChange = useCallback(
    async (record, checked) => {
      try {
        if (record._id === currentUserId) return;
        await updateUser(record._id, { isActive: checked });
        message.success(`User ${checked ? "activated" : "deactivated"}`, 3);
        fetchUsers();
      } catch {
        message.error("Failed to update status");
      }
    },
    [currentUserId],
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "S.No",
        valueGetter: (p) => p.node.rowIndex + 1,
        width: 80,
        sortable: false,
        filter: false,
      },
      { headerName: "Name", field: "name", flex: 1, filter: true },
      { headerName: "Email", field: "email", flex: 1, filter: true },
      {
        headerName: "Role",
        field: "role",
        width: 160,
        filter: true,
        cellRenderer: (params) => (
          <Select
            value={params.value}
            style={{ width: 130 }}
            disabled={params.data._id === currentUserId}
            options={roles.map((r) => ({ label: r.name, value: r.name }))}
            onChange={(newRole) => handleRoleChange(params.data, newRole)}
          />
        ),
      },
      {
        headerName: "Active Status",
        field: "isActive",
        width: 150,
        filter: true,
        cellRenderer: (params) => (
          <Switch
            checked={params.value}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            disabled={params.data._id === currentUserId}
            onChange={(checked) => handleActiveChange(params.data, checked)}
          />
        ),
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 160,
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const isSelf = params.data._id === currentUserId;
          return (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                height: "100%",
              }}
            >
              <Button
                size="small"
                disabled={isSelf}
                onClick={() => handleEdit(params.data)}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete User"
                description="Are you sure you want to delete this user?"
                onConfirm={() => handleDelete(params.data._id)}
                okText="Yes"
                cancelText="No"
                disabled={isSelf}
              >
                <Button size="small" danger disabled={isSelf}>
                  Delete
                </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ],
    [
      currentUserId,
      roles,
      handleEdit,
      handleDelete,
      handleRoleChange,
      handleActiveChange,
    ],
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, resizable: true }),
    [],
  );

  return (
    <div style={{ padding: "32px 24px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        User Details
      </Title>

      <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          rowData={users}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(params) => params.data._id}
          loading={loading}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          rowHeight={50}
        />
      </div>

      <Modal
        open={editOpen}
        title="Edit User"
        onCancel={() => setEditOpen(false)}
        onOk={handleEditSubmit}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Name is required" },
              { min: 3 },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetails;
