import { useState } from "react";

export function useApiNotification() {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  function showNotification(message, type = "success") {
    setNotification({ show: true, message, type });
  }

  function hideNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  return { notification, showNotification, hideNotification };
}
