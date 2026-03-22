import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";

export default function ErrorMessage({ message, severity, autoHideDuration }) {
  const [open, setOpen] = useState(false);

  const normalizedMessage =
    typeof message === "string"
      ? message
      : message?.message || message?.text || "";

  const normalizedSeverity =
    typeof message === "object" && message?.severity
      ? message.severity
      : severity;

  useEffect(() => {
    setOpen(Boolean(normalizedMessage));
  }, [normalizedMessage]);

  if (!normalizedMessage) {
    return null;
  }

  const handleClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar
      key={normalizedMessage}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={normalizedSeverity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {normalizedMessage}
      </Alert>
    </Snackbar>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      text: PropTypes.string,
      severity: PropTypes.oneOf(["error", "success", "warning", "info"]),
    }),
  ]),
  severity: PropTypes.oneOf(["error", "success", "warning", "info"]),
  autoHideDuration: PropTypes.number,
};

ErrorMessage.defaultProps = {
  message: "",
  severity: "error",
  autoHideDuration: 6000,
};
