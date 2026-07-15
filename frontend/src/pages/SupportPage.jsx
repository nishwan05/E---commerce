import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, List, Typography, Input, Button, message } from "antd";
import { useSelector } from "react-redux";
import { socket } from "../socket";
import { getMessagesByTicket } from "../api/chatApi";
import { getTicketByTicketId } from "../api/ticketApi";

const { Text } = Typography;

const SupportChatPage = () => {
  const { ticketId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMessagesByTicket(ticketId);
      setMessages(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const loadTicket = useCallback(async () => {
    try {
      const res = await getTicketByTicketId(ticketId);
      setTicket(res.data?.data || null);
    } catch (error) {
      console.log(error);
    }
  }, [ticketId]);

  useEffect(() => {
    loadMessages();
    loadTicket();
    socket.emit("joinRoom", ticketId);
  }, [ticketId, loadMessages, loadTicket]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (String(message.ticketId) === String(ticketId)) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [ticketId]);

  useEffect(() => {
    const handleTicketUpdate = (updatedTicket) => {
      if (String(updatedTicket._id) === String(ticketId)) {
        setTicket(updatedTicket);
      }
    };
    socket.on("ticketUpdated", handleTicketUpdate);
    return () => socket.off("ticketUpdated", handleTicketUpdate);
  }, [ticketId]);

  const userId = user?.id || user?._id;
  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const isTicketOwner = String(ticket?.userId) === String(userId);
  const isAssignedAdmin =
    isAdmin && String(ticket?.claimedBy) === String(userId);

  const canReply =
    ticket?.status !== "closed" &&
    (isTicketOwner || (ticket?.status === "claimed" && isAssignedAdmin));

  const canClose =
    ticket?.status !== "closed" &&
    (isTicketOwner || (ticket?.status === "claimed" && isAssignedAdmin));

  const sendReply = () => {
    if (!text.trim()) return;
    if (!canReply) {
      message.warning("You cannot reply to this ticket");
      return;
    }
    socket.emit("sendMessage", {
      ticketId,
      adminId: isAdmin ? userId : undefined,
      userId: isTicketOwner ? userId : undefined,
      name: user?.name || "User",
      role: user?.role || "user",
      sender: isAdmin ? "admin" : "user",
      message: text,
    });
    setText("");
  };

  const handleCloseTicket = () => {
    socket.emit("closeTicket", { ticketId: ticket?._id, userId });
    message.success("Ticket closed");
  };

  return (
    <Card title={`Support Chat - ${ticket?.subject || ticketId}`}>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Status: </Text>
        <Text
          type={
            ticket?.status === "closed"
              ? "danger"
              : ticket?.status === "claimed"
                ? "warning"
                : "success"
          }
        >
          {ticket?.status?.toUpperCase() || "PENDING"}
        </Text>
      </div>

      {ticket?.claimedBy && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Claimed By: </Text>
          <Text>{ticket.claimedByName || "-"}</Text>
        </div>
      )}

      {canClose && (
        <Button danger onClick={handleCloseTicket} style={{ marginBottom: 16 }}>
          Close Ticket
        </Button>
      )}

      <div style={{ height: "60vh", overflowY: "auto", marginBottom: 20 }}>
        <List
          loading={loading}
          dataSource={messages}
          renderItem={(item) => {
            const isOwnMessage =
              (isAdmin && item.sender === "admin") ||
              (!isAdmin && item.sender === "user");
            return (
              <List.Item
                style={{
                  borderBlockEnd: "none",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  padding: "6px 0",
                }}
              >
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: isOwnMessage ? "#1677ff" : "#f0f0f0",
                    color: isOwnMessage ? "#fff" : "inherit",
                    textAlign: "left",
                  }}
                >
                  <Text
                    strong
                    style={{ color: isOwnMessage ? "#fff" : undefined }}
                  >
                    {item.name}
                  </Text>{" "}
                  <Text style={{ color: isOwnMessage ? "#fff" : undefined }}>
                    ({item.role})
                  </Text>
                  <br />
                  <Text style={{ color: isOwnMessage ? "#fff" : undefined }}>
                    {item.message}
                  </Text>
                  <br />
                  <Text
                    style={{
                      color: isOwnMessage
                        ? "rgba(255,255,255,0.75)"
                        : "rgba(0,0,0,0.45)",
                      fontSize: 12,
                    }}
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </div>
              </List.Item>
            );
          }}
        />
      </div>

      {ticket?.status === "closed" && (
        <Text type="danger">
          This ticket has been closed. No further messages can be sent.
        </Text>
      )}

      <Input.TextArea
        rows={3}
        value={text}
        disabled={!canReply}
        placeholder={
          ticket?.status === "closed"
            ? "This ticket is closed"
            : canReply
              ? "Type your message..."
              : "You cannot reply to this ticket"
        }
        onChange={(e) => setText(e.target.value)}
        style={{ marginTop: 10 }}
      />
      <Button
        type="primary"
        onClick={sendReply}
        disabled={!canReply}
        style={{ marginTop: 10 }}
      >
        Send Reply
      </Button>
    </Card>
  );
};

export default SupportChatPage;
