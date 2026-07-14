import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import { socket } from "../socket";
import { getAllTickets } from "../api/ticketApi";

ModuleRegistry.registerModules([AllCommunityModule]);

const formatTicket = (ticket) => ({
  ...ticket,
  _id: String(ticket._id),
  email: ticket.email,
  name: ticket.userName || ticket.name,
  role: ticket.role || "user",
  claimedBy: ticket.claimedBy ? String(ticket.claimedBy) : null,
  lastMessageAt: ticket.lastMessageAt || ticket.lastTime || ticket.createdAt,
});

export default function SupportTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const gridRef = useRef();

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllTickets();
      const tickets = res.data?.data || [];
      setData(tickets.map(formatTicket));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    const handleTicketCreated = (ticket) => {
      const formattedTicket = formatTicket(ticket);
      setData((prev) => {
        const exists = prev.some((item) => item._id === formattedTicket._id);
        if (exists) return prev;
        return [formattedTicket, ...prev];
      });
    };
    socket.on("ticketCreated", handleTicketCreated);
    return () => socket.off("ticketCreated", handleTicketCreated);
  }, []);

  useEffect(() => {
    const handleConversationUpdated = ({ message, ticket }) => {
      setData((prev) => {
        const messageTicketId = String(message.ticketId || "");
        const updatedConversation = {
          _id: messageTicketId,
          email: ticket?.email,
          name: ticket?.userName || message.name,
          role: ticket?.role || "user",
          lastMessage: message.message,
          lastMessageAt: message.createdAt,
        };
        const existingIndex = prev.findIndex((c) => String(c._id) === messageTicketId);
        if (existingIndex === -1) return [updatedConversation, ...prev];
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...(ticket ? formatTicket(ticket) : {}), ...updatedConversation };
        return next.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    };
    socket.on("conversationUpdated", handleConversationUpdated);
    return () => socket.off("conversationUpdated", handleConversationUpdated);
  }, []);

  useEffect(() => {
    const handleTicketUpdate = (updatedTicket) => {
      const updatedTicketId = String(updatedTicket._id);
      const formattedTicket = formatTicket(updatedTicket);
      setData((prev) =>
        prev.map((ticket) =>
          String(ticket._id) !== updatedTicketId ? ticket : { ...ticket, ...formattedTicket }
        )
      );
    };
    socket.on("ticketUpdated", handleTicketUpdate);
    return () => socket.off("ticketUpdated", handleTicketUpdate);
  }, []);

  const claimTicket = useCallback((ticketId) => {
    socket.emit("claimTicket", {
      ticketId,
      adminId: user?.id || user?._id,
      adminName: user?.name,
    });
  }, [user]);

  const columnDefs = useMemo(() => [
    {
      headerName: "S.No",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
      sortable: false,
      filter: false,
    },
    { headerName: "Name", field: "name", flex: 1, filter: true },
    { headerName: "Email", field: "email", flex: 1, filter: true },
    { headerName: "Role", field: "role", width: 120, filter: true },
    { headerName: "Last Message", field: "lastMessage", flex: 2, filter: true },
    {
      headerName: "Last Message Time",
      field: "lastMessageAt",
      flex: 1,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-",
      filter: true,
    },
    {
      headerName: "Claimed By",
      field: "claimedByName",
      flex: 1,
      valueFormatter: (params) => params.value || "-",
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      width: 110,
      cellRenderer: (params) => {
        const colors = { pending: "orange", claimed: "blue", closed: "green" };
        return (
          <span style={{ color: colors[params.value] || "gray", fontWeight: 500 }}>
            {params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : "-"}
          </span>
        );
      },
    },
    {
      headerName: "Action",
      field: "action",
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <Button
          size="small"
          disabled={params.data.status !== "pending" || !params.data._id}
          onClick={(e) => { e.stopPropagation(); claimTicket(params.data._id); }}
        >
          Claim
        </Button>
      ),
    },
  ], [claimTicket]);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true }), []);

  const onRowClicked = useCallback((params) => {
    navigate(`/support/${params.data._id}`);
  }, [navigate]);

  return (
    <Card title="Support Requests">
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "gray" }}>Loading...</div>
      ) : (
        <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={data}
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
      )}
    </Card>
  );
}
