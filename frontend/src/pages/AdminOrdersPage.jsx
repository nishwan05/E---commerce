import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Select, message, Typography, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../api/orderApi";
import { socket } from "../socket";

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;

const STATUS_OPTIONS = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusColor = {
  Placed: "blue",
  Confirmed: "cyan",
  Packed: "purple",
  Shipped: "orange",
  "Out for Delivery": "gold",
  Delivered: "green",
  Cancelled: "red",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (error) {
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleOrderCreated = (order) => {
      setOrders((prev) => {
        const exists = prev.some((o) => String(o._id) === String(order._id));
        return exists ? prev : [order, ...prev];
      });
    };

    const handleOrderUpdated = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(updatedOrder._id) ? updatedOrder : o,
        ),
      );
    };

    socket.on("orderCreated", handleOrderCreated);
    socket.on("orderUpdated", handleOrderUpdated);
    return () => {
      socket.off("orderCreated", handleOrderCreated);
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, []);

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      message.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update status");
    }
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "S.No",
        valueGetter: (p) => p.node.rowIndex + 1,
        width: 70,
        sortable: false,
        filter: false,
      },
      {
        headerName: "Order ID",
        field: "_id",
        width: 180,
        cellRenderer: (p) => (
          <span style={{ fontFamily: "monospace", fontSize: 12 }}>
            {String(p.value).slice(-10)}
          </span>
        ),
        filter: true,
      },
      {
        headerName: "Customer",
        field: "userId",
        flex: 1,
        filter: true,
        valueGetter: (p) => p.data.userId?.name || "N/A",
        cellRenderer: (p) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {p.data.userId?.name || "N/A"}
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>
              {p.data.userId?.email || ""}
            </div>
          </div>
        ),
      },
      {
        headerName: "Items",
        field: "products",
        width: 80,
        filter: false,
        valueGetter: (p) => p.data.products?.length || 0,
        cellRenderer: (p) => (
          <Tag>
            {p.data.products?.length || 0} item
            {p.data.products?.length !== 1 ? "s" : ""}
          </Tag>
        ),
      },
      {
        headerName: "Total",
        field: "totalAmount",
        width: 120,
        filter: true,
        valueFormatter: (p) => `₹ ${p.value?.toLocaleString()}`,
      },
      {
        headerName: "Payment",
        field: "paymentMode",
        width: 120,
        filter: true,
        cellRenderer: (p) => (
          <div>
            <div>{p.value === "cod" ? "COD" : "UPI"}</div>
            <Tag
              color={p.data.paymentStatus === "paid" ? "green" : "orange"}
              style={{ fontSize: 10 }}
            >
              {p.data.paymentStatus === "paid" ? "Paid" : "Pending"}
            </Tag>
          </div>
        ),
      },
      {
        headerName: "Status",
        field: "status",
        width: 200,
        filter: true,
        cellRenderer: (params) => (
          <Select
            value={params.value}
            style={{ width: 170 }}
            disabled={params.value === "Cancelled"}
            options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
            onChange={(newStatus) =>
              handleStatusChange(params.data._id, newStatus)
            }
          />
        ),
      },
      {
        headerName: "Date",
        field: "createdAt",
        width: 150,
        filter: true,
        valueFormatter: (p) =>
          new Date(p.value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
      },
      {
        headerName: "View",
        field: "view",
        width: 80,
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${params.data._id}`)}
          />
        ),
      },
    ],
    [handleStatusChange, navigate],
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, resizable: true }),
    [],
  );

  return (
    <div style={{ padding: "32px 24px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        All Orders
      </Title>
      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "gray" }}>
            Loading...
          </div>
        ) : (
          <div
            className="ag-theme-quartz"
            style={{ height: 560, width: "100%" }}
          >
            <AgGridReact
              rowData={orders}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowId={(p) => p.data._id}
              pagination={true}
              paginationPageSize={15}
              paginationPageSizeSelector={[15, 30, 50]}
              rowHeight={56}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminOrdersPage;
