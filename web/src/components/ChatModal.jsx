import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TicketIcon from "@mui/icons-material/ConfirmationNumber";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { sendChatMessage } from "../services/api";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useReliefPackage } from "../context/ReliefPackageContext";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { Card, CardContent, CardActions } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { mockChatHistory } from "../data/mockChatHistory";

export default function ChatModal({ open, onClose }) {
  const [chatType, setChatType] = useState("General");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockChatHistory);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const chatTypes = [
    {
      value: "Product Recommendation",
      label: "Product Recommendation (Aid Kits)",
    },
    { value: "Order Status", label: "Order Status" },
    { value: "Report Fraud", label: "Report Fraud" },
    { value: "General", label: "General Inquiry" },
  ];

  const { addResource } = useReliefPackage();
  const { setRecommendation } = useContext(AppContext);
  const [recommendedKits, setRecommendedKits] = useState([]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat when modal opens
  useEffect(() => {
    if (open) {
      setMessages(mockChatHistory);
      setMessage("");
      setImages([]);
      setChatType("General");
      setError("");
      setRecommendedKits([]);
    }
  }, [open]);

  const handleAddToPackage = (kit) => {
    addResource(kit);
    setSnackbarMessage(`${kit.name} added to relief package`);
    setError("");
    setSnackbarOpen(true);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    URL.revokeObjectURL(images[index].preview);
    setImages(newImages);
  };

  const handleSend = async () => {
    if (!message.trim() && images.length === 0) {
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: "user",
      message: message.trim(),
      images: images.map((img) => img.preview),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setError("");

    // Prepare form data for backend
    const formData = {
      message: message.trim(),
      type: chatType,
      images: images.map((img) => img.file),
      orderId: extractOrderId(message.trim()),
    };

    try {
      // TODO: Integrate with backend - POST /api/chat
      // const formDataToSend = new FormData();
      // formDataToSend.append("message", formData.message);
      // formDataToSend.append("type", formData.type);
      // formData.images.forEach((img) => {
      //   formDataToSend.append("images", img);
      // });
      // if (formData.orderId) {
      //   formDataToSend.append("orderId", formData.orderId);
      // }
      //
      // const response = await sendChatMessage(formDataToSend, { offline: false });
      // // Handle streaming response or single response
      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     id: Date.now() + 1,
      //     type: "ai",
      //     message: response.message,
      //     timestamp: new Date(),
      //     requiresAction: response.requiresAction,
      //     orderId: response.orderId,
      //   },
      // ]);

      // Mock AI response with delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockResponse = await sendChatMessage(formData, { offline: true });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai",
          message: mockResponse.message,
          timestamp: new Date(),
          requiresAction: mockResponse.requiresAction,
          orderId: mockResponse.orderId,
          recommendedKits: mockResponse.recommendedKits || [],
        },
      ]);

      // Store recommended kits for display
      if (
        mockResponse.recommendedKits &&
        mockResponse.recommendedKits.length > 0
      ) {
        setRecommendedKits(mockResponse.recommendedKits);
        // Also update AppContext for persistence
        setRecommendation({
          items: mockResponse.recommendedKits,
          message: mockResponse.message,
          timestamp: new Date().toISOString(),
        });
      }

      // Clean up image URLs
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
    } catch (err) {
      console.error("Error sending chat message:", err);
      setError(err.message || "Failed to send message");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Extract order ID from message (simple pattern matching)
  const extractOrderId = (text) => {
    const orderIdMatch =
      text.match(/ORD-?\d{3,}/i) || text.match(/order\s+(\w+)/i);
    return orderIdMatch ? orderIdMatch[0].toUpperCase() : null;
  };

  const handleViewOrders = () => {
    navigate("/orders");
    onClose();
  };

  const handleViewTickets = () => {
    navigate("/tickets");
    onClose();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            maxWidth: isMobile ? "100%" : 600,
            height: isMobile ? "100%" : "80vh",
            maxHeight: "80vh",
          },
        }}
        TransitionProps={{
          timeout: 300,
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SupportAgentIcon sx={{ color: "primary.main" }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Customer Support
              </Typography>
              {auth && (
                <Typography variant="body2" color="text.secondary">
                  How can we help you today?
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Quick Actions */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShoppingBagIcon />}
              onClick={handleViewOrders}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(37, 99, 235, 0.04)",
                },
              }}
            >
              View Orders
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TicketIcon />}
              onClick={handleViewTickets}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(37, 99, 235, 0.04)",
                },
              }}
            >
              View Tickets
            </Button>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "grey.50",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.type === "user" ? "flex-end" : "flex-start",
                  gap: 1,
                }}
              >
                {msg.type === "ai" && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: "primary.main",
                    }}
                  >
                    <SupportAgentIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor:
                        msg.type === "user" ? "primary.main" : "white",
                      color: msg.type === "user" ? "white" : "text.primary",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Typography variant="body2">{msg.message}</Typography>
                    {msg.images && msg.images.length > 0 && (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        {msg.images.map((img, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={img}
                            alt={`Attachment ${idx + 1}`}
                            sx={{
                              width: "100%",
                              height: "auto",
                              borderRadius: 1,
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    {/* Display recommended aid kits */}
                    {msg.recommendedKits && msg.recommendedKits.length > 0 && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Recommended Aid Kits:
                        </Typography>
                        {msg.recommendedKits.slice(0, 3).map((kit, idx) => (
                          <Card
                            key={kit.id || idx}
                            sx={{
                              maxWidth: "100%",
                              boxShadow: 1,
                              "&:hover": { boxShadow: 2 },
                            }}
                          >
                            <CardContent
                              sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {kit.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {kit.utility ||
                                      kit.description?.substring(0, 50)}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`$${kit.price}`}
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                              <CardActions
                                sx={{ p: 0, justifyContent: "flex-end" }}
                              >
                                <Button
                                  size="small"
                                  startIcon={<AddShoppingCartIcon />}
                                  onClick={() => handleAddToPackage(kit)}
                                  sx={{ textTransform: "none" }}
                                >
                                  Add to Package
                                </Button>
                              </CardActions>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ px: 1 }}
                  >
                    {formatTime(msg.timestamp)}
                  </Typography>
                  {msg.requiresAction && (
                    <Chip
                      label="Action Required"
                      color="warning"
                      size="small"
                      sx={{ mt: 0.5, alignSelf: "flex-start" }}
                    />
                  )}
                </Box>
                {msg.type === "user" && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: "grey.400",
                    }}
                  >
                    {auth?.userid ? auth.userid[0].toUpperCase() : "U"}
                  </Avatar>
                )}
              </Box>
            ))}

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "primary.main",
                  }}
                >
                  <SupportAgentIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography
                    variant="body2"
                    component="span"
                    color="text.secondary"
                  >
                    AI Agent responding...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Image Preview */}
          {images.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: 1,
              }}
            >
              {images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "100%",
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Box
                    component="img"
                    src={image.preview}
                    alt={image.name}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      width: 20,
                      height: 20,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              backgroundColor: "white",
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Query Type</InputLabel>
                  <Select
                    value={chatType}
                    onChange={(e) => setChatType(e.target.value)}
                    label="Query Type"
                  >
                    {chatTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="chat-image-upload"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="chat-image-upload">
                    <IconButton
                      component="span"
                      size="small"
                      sx={{
                        border: "1px solid",
                        borderColor: "grey.300",
                      }}
                    >
                      <CloudUploadIcon fontSize="small" />
                    </IconButton>
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    maxRows={3}
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={
                      (!message.trim() && images.length === 0) || loading
                    }
                    sx={{
                      backgroundColor: "primary.main",
                      minWidth: 48,
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for errors and success messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || snackbarMessage || "Failed to send message"}
        </Alert>
      </Snackbar>
    </>
  );
}
