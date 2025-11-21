import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AlertTriangleIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { getOrders, createIssue, updateTicketStatus } from "../services/api";
import { useAuth } from "../utils/authContext";
import { mockOrders } from "../data/mockOrders";
import AIResponseActionCard from "./AIResponseActionCard";

const issueTypes = [
  "Delivery Delay",
  "Product Defect",
  "Payment Issue",
  "Wrong Item Received",
  "Damaged Package",
  "Other",
];

// Expected backend response shape for orders:
// {
//   orders: [
//     {
//       id: string,
//       date: string (ISO format),
//       status: "Delivered" | "In Transit" | "Processing" | "Pending",
//       items: string[],
//       total: string (currency format),
//       orderId?: string (alternative field name),
//       ...other fields
//     }
//   ]
// }

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [issueData, setIssueData] = useState({
    description: "",
    issueType: "",
    images: [],
  });
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {auth}=useAuth();
  const[issueSubmitted, setIssueSubmitted]=useState(false);
  const[aIResponse,setAIResponse]=useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // TODO: Integrate with backend - Fetch orders from API
  // Replace this useEffect with actual API call when backend is ready
  // Use auth context to get user token: const token = auth?.token;
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await getOrders({ offline: false });
        // setOrders(response.orders || []);

        // Using mock data for now - remove when backend is ready
        const response = await getOrders(auth.userid,{ offline: false });
        setOrders(response|| []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders");
        setSnackbarMessage(err.message || "Failed to load orders");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        // Fallback to mock data on error for testing
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleRaiseIssue = (order) => {
    setSelectedOrder(order);
    setIssueModalOpen(true);
    setIssueData({
      description: "",
      issueType: "",
      images: [],
    });
  };

  const handleCloseModal = () => {
    // Clean up object URLs to prevent memory leaks
    issueData.images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });
    setIssueModalOpen(false);
    setSelectedOrder(null);
    setIssueData({
      description: "",
      issueType: "",
      images: [],
    });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setIssueData({
      ...issueData,
      images: [...issueData.images, ...newImages],
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = issueData.images.filter((_, i) => i !== index);
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(issueData.images[index].preview);
    setIssueData({
      ...issueData,
      images: newImages,
    });
  };

  // Form data structure ready for backend submission:
  // {
  //   orderId: string,
  //   issueType: string,
  //   description: string,
  //   images: File[] (multipart/form-data)
  // }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

  // TODO: Integrate with backend - Submit issue to API
  // Replace this handler with actual API call when backend is ready
const handleSubmitIssue = async () => {
  if (!selectedOrder || !issueData.issueType || !issueData.description) {
    return;
  }

  setSubmittingIssue(true);

  try {
    // Convert all uploaded images to Base64 strings
    const base64Images = await Promise.all(
      issueData.images.map(async (img) => {
        const base64full = await fileToBase64(img.file);  // read file
        return base64full.split(",")[1];                  // remove prefix
      })
    );

    const report = {
      order: selectedOrder,
      orderProblem: issueData.description,
      issueType: issueData.issueType,
      images: base64Images,   // only base64 strings!
    };

    console.log("Sending:", report);

    const response = await createIssue(report, { offline: false });
    setAIResponse(response);
    setIssueSubmitted(true);
    setIssueModalOpen(false);
    setAiModalOpen(true);   // <-- show second modal

    console.log(response);

    if (response) {
      console.log(response);
      console.log(issueSubmitted)
      setSnackbarMessage(response.message || "Issue submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setIssueModalOpen(false);
      //handleCloseModal();
    }

  } catch (err) {
    console.error("Error submitting issue:", err);
    setSnackbarMessage(err.message || "Failed to submit issue");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setSubmittingIssue(false);
  }
};


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in-transit":
        return "info";
      case "processing":
        return "warning";
      default:
        return "default";
    }
  };

  
  function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;

  if (diff < 60) return `${Math.floor(diff)} sec ago`;
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hrs ago`;
  
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

async function closeTicket(){
    console.log(selectedOrder);
    const ticketStatus={
        ticketId:aIResponse.ticketId,
        status:"closed",
    };
    await updateTicketStatus(ticketStatus);
    setIssueSubmitted(false);
    handleCloseModal();
  }

  async function esclateTicket(){
    const ticketStatus={
      ticketId:aIResponse.ticketId,
      status:"review",
    };
    await updateTicketStatus(ticketStatus);
    setIssueSubmitted(false);
    handleCloseModal();
  }



  // Mobile card view
  const OrderCard = ({ order }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {order.id}
          </Typography>
          <Chip
            label={order.status}
            color={getStatusColor(order.status)}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Date: {timeAgo(order.timestamp)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Items: {order.items.map((item)=><div className="view-order-item-tags" key={item.id}>{item.name}</div>)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total: {order.payment.amount}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AlertTriangleIcon />}
          onClick={() => handleRaiseIssue(order)}
          sx={{
            borderColor: "primary.main",
            color: "primary.main",
            "&:hover": {
              borderColor: "primary.dark",
              backgroundColor: "rgba(37, 99, 235, 0.04)",
            },
          }}
        >
          Raise Issue
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          View Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all your relief orders
        </Typography>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
              }}
            >
              <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading orders...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : error && orders.length === 0 ? (
        // Error State (only show if no orders loaded)
        <Card>
          <CardContent>
            <Alert severity="error">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Error Loading Orders
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        // Empty State
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No orders found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't placed any orders yet
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile card view
        <Box>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      ) : (
        // Desktop table view
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "white" : "grey.50",
                      "&:hover": {
                        backgroundColor: "grey.100",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{timeAgo(order.timestamp)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items.map((item)=><div className="view-order-item-tags" key={item.id}>{item.name}</div>)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${order.payment.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AlertTriangleIcon />}
                        onClick={() => handleRaiseIssue(order)}
                        sx={{
                          borderColor: "primary.main",
                          color: "primary.main",
                          "&:hover": {
                            borderColor: "primary.dark",
                            backgroundColor: "rgba(37, 99, 235, 0.04)",
                          },
                        }}
                      >
                        Raise Issue
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Raise Issue Modal */}
      <Dialog
        open={issueModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: "500px",
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AlertTriangleIcon sx={{ color: "warning.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Raise Issue
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseModal}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              {/* Order Details Section */}
              <Card
                sx={{
                  mb: 3,
                  backgroundColor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Order Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Order ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedOrder.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ml:0.5}}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5}}
                      >
                        Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {timeAgo(selectedOrder.timestamp)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Total
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ${selectedOrder.payment.amount}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Issue Type Dropdown */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={issueData.issueType}
                  onChange={(e) =>
                    setIssueData({ ...issueData, issueType: e.target.value })
                  }
                  label="Issue Type"
                >
                  {issueTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Description Textarea */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe the Problem"
                placeholder="Please provide details about the issue you're experiencing..."
                value={issueData.description}
                onChange={(e) =>
                  setIssueData({ ...issueData, description: e.target.value })
                }
                sx={{ mb: 3 }}
              />

              {/* Image Upload Section */}
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      py: 2,
                      borderStyle: "dashed",
                      borderColor: "grey.300",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "rgba(37, 99, 235, 0.04)",
                      },
                    }}
                  >
                    Choose Image
                  </Button>
                </label>
              </Box>

              {/* Image Preview Grid */}
              {issueData.images.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {issueData.images.map((image, index) => (
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
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} disabled={submittingIssue}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitIssue}
            disabled={
              !issueData.issueType || !issueData.description || submittingIssue
            }
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            {submittingIssue ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: "white" }} />
                Submitting...
              </>
            ) : (
              "Submit Issue"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar for issue submission */}
      <Dialog open={aiModalOpen} onClose={() => setAiModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Decision</DialogTitle>
        <DialogContent>
          <AIResponseActionCard
            aiData={aIResponse}
            action1Label="Approve"
            action2Label="Reject"
            onAction1={() => { closeTicket(); setAiModalOpen(false); }}
            onAction2={() => { esclateTicket(); setAiModalOpen(false); }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
