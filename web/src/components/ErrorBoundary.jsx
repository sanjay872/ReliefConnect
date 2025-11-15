import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            backgroundColor: "grey.50",
          }}
        >
          <Card sx={{ maxWidth: 600, width: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  py: 4,
                }}
              >
                <ErrorOutlineIcon
                  sx={{ fontSize: 64, color: "error.main", mb: 2 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Something went wrong
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  An unexpected error occurred. Please try refreshing the page
                  or contact support if the problem persists.
                </Typography>
                <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {this.state.error?.message || "Unknown error"}
                  </Typography>
                </Alert>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={this.handleReset}
                    sx={{ backgroundColor: "primary.main" }}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    sx={{ borderColor: "primary.main", color: "primary.main" }}
                  >
                    Reload Page
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
