import React, { useState, useEffect, useMemo } from "react";
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import SearchIcon from "@mui/icons-material/Search";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
// import { useSearchParams } from "react-router-dom"; // TODO: Uncomment when using URL params
import { getTickets } from "../services/api";
import { useAuth } from "../utils/authContext";
import { mockTickets } from "../data/mockTickets";

// Expected backend response shape for tickets:
// {
//   tickets: [
//     {
//       id: string,
//       orderId: string,
//       issueType: string,
//       status: "Open" | "In Progress" | "Resolved",
//       createdDate: string (ISO format),
//       description: string,
//       ...other fields
//     }
//   ]
// }

export default function ViewTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  // URL params for shareable state (commented for backend sync)
  // TODO: Integrate with backend - Use URL params for shareable filter/sort state
  // const [searchParams, setSearchParams] = useSearchParams();
  // const statusFilter = searchParams.get("status") || "All";
  // const sortField = searchParams.get("sort") || "createdDate";
  // const sortDirection = searchParams.get("direction") || "desc";

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState("desc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { auth } = useAuth();

  // TODO: Integrate with backend - Fetch tickets from API
  // Replace this useEffect with actual API call when backend is ready
  // Use auth context to get user token: const token = auth?.token;
  // Debounce filter changes for efficiency (optional)
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");

      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await getTickets(
        //   {
        //     status: statusFilter !== "All" ? statusFilter : undefined,
        //     sortField,
        //     sortDirection,
        //   },
        //   { offline: false }
        // );
        // setTickets(response.tickets || []);

        // Using mock data for now - remove when backend is ready
        const response = await getTickets(
          {
            status: statusFilter,
            sortField,
            sortDirection,
          },
          { offline: true }
        );
        setTickets(response.tickets || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(err.message || "Failed to load tickets");
        setSnackbarMessage(err.message || "Failed to load tickets");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        // Fallback to mock data on error for testing
        setTickets(mockTickets);
      } finally {
        setLoading(false);
      }
    };

    // Debounce filter changes (optional - remove if backend handles efficiently)
    // Note: Remove debounce when using real API, backend should handle efficiently
    const timeoutId = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, sortField, sortDirection]);

  // TODO: Update URL params when filters change (for shareable state)
  // useEffect(() => {
  //   const params = new URLSearchParams();
  //   if (statusFilter !== "All") params.set("status", statusFilter);
  //   if (sortField) params.set("sort", sortField);
  //   if (sortDirection) params.set("direction", sortDirection);
  //   setSearchParams(params);
  // }, [statusFilter, sortField, sortDirection, setSearchParams]);

  // Note: Client-side filtering/sorting removed since API service handles it
  // When backend is integrated, API will handle filtering and sorting
  // For now, API service (offline mode) handles filtering/sorting
  const filteredAndSortedTickets = tickets; // API service already returns filtered/sorted data

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // TODO: Update URL params when sort changes (for shareable state)
    // const params = new URLSearchParams(searchParams);
    // params.set("sort", field);
    // params.set("direction", sortField === field && sortDirection === "asc" ? "desc" : "asc");
    // setSearchParams(params);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "success";
      case "In Progress":
        return "warning";
      case "Open":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Resolved: { bg: "#10b981", text: "white" },
      "In Progress": { bg: "#f59e0b", text: "white" },
      Open: { bg: "#dc2626", text: "white" },
    };
    const color = colors[status] || { bg: "#64748b", text: "white" };
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          backgroundColor: color.bg,
          color: color.text,
          fontWeight: 500,
          borderRadius: "16px",
          height: "24px",
        }}
      />
    );
  };

  // Empty state component
  const EmptyState = () => (
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
          <FolderIcon
            sx={{
              fontSize: 64,
              color: "grey.400",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No tickets available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create one via Orders page by raising an issue for an order
          </Typography>
          <Button
            variant="outlined"
            href="/orders"
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
            }}
          >
            View Orders
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Mobile card view
  const TicketCard = ({ ticket }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {ticket.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order: {ticket.orderId}
            </Typography>
          </Box>
          {getStatusBadge(ticket.status)}
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Issue Type
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {ticket.issueType}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Created Date
          </Typography>
          <Typography variant="body1">{ticket.createdDate}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Description
          </Typography>
          <Typography variant="body2">{ticket.description}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          View Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage all your support tickets
        </Typography>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
            startAdornment={
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            }
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
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
                Loading tickets...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : error && tickets.length === 0 ? (
        // Error State (only show if no tickets loaded)
        <Card>
          <CardContent>
            <Alert severity="error">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Error Loading Tickets
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          </CardContent>
        </Card>
      ) : filteredAndSortedTickets.length === 0 ? (
        <EmptyState />
      ) : isMobile ? (
        // Mobile card view
        <Box>
          {filteredAndSortedTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </Box>
      ) : (
        // Desktop table view
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <TableSortLabel
                      active={sortField === "id"}
                      direction={sortField === "id" ? sortDirection : "asc"}
                      onClick={() => handleSort("id")}
                    >
                      Ticket ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issue Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <TableSortLabel
                      active={sortField === "status"}
                      direction={sortField === "status" ? sortDirection : "asc"}
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <TableSortLabel
                      active={sortField === "createdDate"}
                      direction={
                        sortField === "createdDate" ? sortDirection : "asc"
                      }
                      onClick={() => handleSort("createdDate")}
                    >
                      Created Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedTickets.map((ticket, index) => (
                  <TableRow
                    key={ticket.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "white" : "grey.50",
                      "&:hover": {
                        backgroundColor: "grey.100",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ticket.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ticket.orderId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.issueType}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.createdDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ticket.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Error/Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
