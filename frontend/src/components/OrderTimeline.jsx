import { Timeline } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const ORDER_STEPS = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const stepColor = (step, currentStatus, isCancelled) => {
  if (isCancelled) return step === "Placed" ? "green" : "red";
  const currentIndex = ORDER_STEPS.indexOf(currentStatus);
  const stepIndex = ORDER_STEPS.indexOf(step);
  if (stepIndex < currentIndex) return "green";
  if (stepIndex === currentIndex) return "blue";
  return "gray";
};

const OrderTimeline = ({ statusHistory = [], currentStatus }) => {
  const isCancelled = currentStatus === "Cancelled";

  const historyMap = {};
  statusHistory.forEach((h) => {
    historyMap[h.status] = h.updatedAt;
  });

  const steps = isCancelled
    ? [...ORDER_STEPS.slice(0, 1), "Cancelled"]
    : ORDER_STEPS;

  const items = steps.map((step) => {
    const isDone =
      step === "Cancelled"
        ? isCancelled
        : ORDER_STEPS.indexOf(step) <= ORDER_STEPS.indexOf(currentStatus);

    const isActive = step === currentStatus;

    return {
      color: stepColor(step, currentStatus, isCancelled),
      dot: step === "Cancelled" ? (
        <CloseCircleOutlined style={{ fontSize: 16, color: "red" }} />
      ) : isDone ? (
        <CheckCircleOutlined style={{ fontSize: 16, color: isActive ? "#1677ff" : "green" }} />
      ) : (
        <ClockCircleOutlined style={{ fontSize: 16, color: "#d9d9d9" }} />
      ),
      children: (
        <div>
          <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#1677ff" : step === "Cancelled" ? "red" : isDone ? "#333" : "#bbb" }}>
            {step}
          </span>
          {historyMap[step] && (
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
              {new Date(historyMap[step]).toLocaleString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          )}
        </div>
      ),
    };
  });

  return <Timeline items={items} />;
};

export default OrderTimeline;
