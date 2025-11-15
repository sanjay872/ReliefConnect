import React, { useState, useEffect } from "react";
import { Fab, Badge, useMediaQuery, useTheme } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ChatModal from "./ChatModal";
import { useAuth } from "../utils/authContext";

export default function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { auth } = useAuth();

  // Only show FAB when user is logged in
  useEffect(() => {
    // Show badge if there are unread messages (mock for now)
    // TODO: Integrate with backend - check for unread messages
    if (auth) {
      // Mock unread count - remove when backend is ready
      // setUnreadCount(3);
    }
  }, [auth]);

  // Don't show FAB if user is not logged in
  if (!auth) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0); // Clear unread count when opening
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="customer support chat"
        onClick={handleOpen}
        sx={{
          position: "fixed",
          bottom: isMobile ? 20 : 24,
          left: isMobile ? 16 : 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          backgroundColor: "primary.main",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          "&:hover": {
            backgroundColor: "primary.dark",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          invisible={unreadCount === 0}
        >
          <ChatBubbleOutlineIcon />
        </Badge>
      </Fab>
      <ChatModal open={open} onClose={handleClose} />
    </>
  );
}
