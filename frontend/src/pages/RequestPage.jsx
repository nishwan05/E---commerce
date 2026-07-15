import { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Modal, Checkbox, Form, Input, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { createTicket, getMyTickets } from "../api/ticketApi";
import { socket } from "../socket";

ModuleRegistry.registerModules([AllCommunityModule]);

const predefinedIssues = [
  "Payment Issue",
  "Refund Request",
  "Order Not Delivered",
  "Wrong Product Received",
  "Damaged Product",
  "Others",
];

const RequestPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [form] = Form.useForm();

  const normalizedRole = user?.role?.toLowerCase();
  const canRaiseRequest = !["admin", "superadmin"].includes(normalizedRole);

  const loadTickets = async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data.data);
    } catch {
      message.error("Failed to load requests");
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const userId = String(user?.id || user?._id || "");

    const handleTicketCreated = (ticket) => {
      if (String(ticket.userId) !== userId) return;
      setTickets((prev) => {
        const exists = prev.some(
          (item) => String(item._id) === String(ticket._id),
        );
        return exists ? prev : [ticket, ...prev];
      });
    };

    const handleTicketUpdate = (updatedTicket) => {
      if (String(updatedTicket.userId) !== userId) return;
      setTickets((prev) =>
        prev.map((ticket) =>
          String(ticket._id) === String(updatedTicket._id)
            ? updatedTicket
            : ticket,
        ),
      );
    };

    socket.on("ticketCreated", handleTicketCreated);
    socket.on("ticketUpdated", handleTicketUpdate);
    return () => {
      socket.off("ticketCreated", handleTicketCreated);
      socket.off("ticketUpdated", handleTicketUpdate);
    };
  }, [user?.id, user?._id]);

  const handleRaiseRequest = async () => {
    try {
      const values = await form.validateFields();
      const subject =
        selectedIssue === "Others" ? values.subject : selectedIssue;
      const description = values.description || "";
      const res = await createTicket({ subject, description });
      const ticket = res.data?.data;
      if (ticket) {
        setTickets((prev) => {
          const exists = prev.some(
            (item) => String(item._id) === String(ticket._id),
          );
          return exists ? prev : [ticket, ...prev];
        });
      }
      message.success("Request Raised");
      form.resetFields();
      setSelectedIssue(null);
      setOpen(false);
    } catch {
      message.error("Failed to raise request");
    }
  };

  const onRowClicked = useCallback(
    (params) => {
      navigate(`/support/${params.data._id}`);
    },
    [navigate],
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
      { headerName: "Issue Name", field: "subject", flex: 2, filter: true },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        filter: true,
        cellRenderer: (params) => {
          const config = {
            pending: { color: "#d46b08", bg: "#fff7e6", label: "Pending" },
            claimed: { color: "#096dd9", bg: "#e6f4ff", label: "Claimed" },
            closed: { color: "#389e0d", bg: "#f6ffed", label: "Solved" },
          };
          const c = config[params.value] || {
            color: "gray",
            bg: "#f0f0f0",
            label: params.value,
          };
          return (
            <span
              style={{
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.color}`,
                borderRadius: 999,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {c.label}
            </span>
          );
        },
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, resizable: true }),
    [],
  );

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {canRaiseRequest && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            Raise Request
          </Button>
        )}
      </Space>

      <div className="ag-theme-quartz" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          rowData={tickets}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(params) => params.data._id}
          onRowClicked={onRowClicked}
          rowStyle={{ cursor: "pointer" }}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
        />
      </div>

      <Modal
        title="Raise Request"
        open={canRaiseRequest && open}
        footer={null}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
          setSelectedIssue(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Select Issue" required>
            <Checkbox.Group
              value={selectedIssue ? [selectedIssue] : []}
              onChange={(checkedValues) => {
                setSelectedIssue(
                  checkedValues.length
                    ? checkedValues[checkedValues.length - 1]
                    : null,
                );
              }}
            >
              <Space direction="vertical">
                {predefinedIssues.map((issue) => (
                  <Checkbox key={issue} value={issue}>
                    {issue}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>

          {selectedIssue === "Others" && (
            <>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: "Enter subject" }]}
              >
                <Input placeholder="Subject" />
              </Form.Item>
              <Form.Item
                label="Problem Faced"
                name="description"
                rules={[{ required: true, message: "Enter description" }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}

          {selectedIssue && selectedIssue !== "Others" && (
            <Form.Item label="Problem Faced" name="description">
              <Input.TextArea rows={4} placeholder="Describe your issue" />
            </Form.Item>
          )}

          <Space>
            <Button type="primary" onClick={handleRaiseRequest}>
              Raise Request
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setSelectedIssue(null);
              }}
            >
              Clear
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default RequestPage;
