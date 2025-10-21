import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useReliefPackage } from "../context/ReliefPackageContext";
import { NotificationContext } from "./Notifications";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HomeIcon from "@mui/icons-material/Home";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import WaterIcon from "@mui/icons-material/Water";
import InventoryIcon from "@mui/icons-material/Inventory";

export default function ResourceCard({
  item,
  onRequest,
  onViewMap,
  onFeedback,
}) {
  const navigate = useNavigate();
  const {
    addResource,
    isInPackage,
    getResourceQuantity,
    updateQuantity,
    removeResource,
  } = useReliefPackage();
  const { show } = React.useContext(NotificationContext);

  // Map category to appropriate icon
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || "";

    if (categoryLower.includes("food") || categoryLower.includes("nutrition")) {
      return <RestaurantIcon sx={{ color: "#059669" }} />;
    }
    if (
      categoryLower.includes("water") ||
      categoryLower.includes("beverage") ||
      categoryLower.includes("drink")
    ) {
      return <WaterIcon sx={{ color: "#2563eb" }} />;
    }
    if (
      categoryLower.includes("medical") ||
      categoryLower.includes("health") ||
      categoryLower.includes("medicine")
    ) {
      return <LocalHospitalIcon sx={{ color: "#dc2626" }} />;
    }
    if (
      categoryLower.includes("shelter") ||
      categoryLower.includes("housing") ||
      categoryLower.includes("home") ||
      categoryLower.includes("accommodation")
    ) {
      return <HomeIcon sx={{ color: "#7c3aed" }} />;
    }
    if (
      categoryLower.includes("power") ||
      categoryLower.includes("battery") ||
      categoryLower.includes("charging") ||
      categoryLower.includes("electric")
    ) {
      return <BatteryChargingFullIcon sx={{ color: "#f59e0b" }} />;
    }
    if (
      categoryLower.includes("transport") ||
      categoryLower.includes("vehicle") ||
      categoryLower.includes("ride") ||
      categoryLower.includes("evacuation")
    ) {
      return <DirectionsCarIcon sx={{ color: "#059669" }} />;
    }
    // Default icon for general items
    return <InventoryIcon sx={{ color: "#6b7280" }} />;
  };

  // Get availability status based on quantity
  const getAvailabilityStatus = (quantity) => {
    if (quantity > 20) {
      return {
        label: "Available",
        color: "success",
      };
    } else {
      return {
        label: "Limited Supply",
        color: "warning",
      };
    }
  };

  // Get availability color for custom styling
  const getAvailabilityColor = (quantity) => {
    if (quantity > 20) {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    } else {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }
  };

  const handleViewMap = (item) => {
    // Open static map in new window
    const mapWindow = window.open("", "_blank");
    mapWindow.document.write(`
      <html>
        <head><title>Map - ${item.name}</title></head>
        <body style="margin:0; padding:20px; font-family: Arial, sans-serif;">
          <h2>📍 ${item.name}</h2>
          <p><strong>Category:</strong> ${item.category}</p>
          <p><strong>Quantity Available:</strong> ${item.quantity}</p>
          <div style="width:100%; height:400px; background:#f0f0f0; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; margin:20px 0;">
            <p style="color:#666;">Interactive map coming soon</p>
          </div>
          <p><em>This is a placeholder map. In a real implementation, this would show an interactive map with the exact location.</em></p>
        </body>
      </html>
    `);
  };

  const handleAddToPackage = () => {
    addResource(item);
    const quantity = getResourceQuantity(item.id || item.name); // Use name as fallback ID
    show(`${item.name} added to relief package (${quantity} total)`, "success");
  };

  const handleIncrement = () => {
    const currentQuantity = getResourceQuantity(item.id || item.name);
    if (currentQuantity === 0) {
      addResource(item);
    } else {
      updateQuantity(item.id || item.name, currentQuantity + 1);
    }
  };

  const handleDecrement = () => {
    const currentQuantity = getResourceQuantity(item.id || item.name);
    if (currentQuantity <= 1) {
      removeResource(item.id || item.name);
    } else {
      updateQuantity(item.id || item.name, currentQuantity - 1);
    }
  };

  const isItemInPackage = isInPackage(item.id || item.name);
  const quantity = getResourceQuantity(item.id || item.name);
  const availability = getAvailabilityStatus(item.quantity);

  return (
    <Card
      className="card-elevated"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        border: quantity > 0 ? "2px solid #10b981" : "1px solid #e2e8f0",
        backgroundColor: quantity > 0 ? "#f0fdf4" : "white",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header with icon and availability status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {getCategoryIcon(item.category)}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
              {item.name}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={item.quantity}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            />
            <Chip
              label={"$" + item.price}
              size="small"
              color="success"
              variant="filled"
              sx={{
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            />
            <Chip
              label={availability.label}
              size="small"
              color={availability.color}
              sx={{
                fontWeight: 500,
                fontSize: "0.75rem",
                ...getAvailabilityColor(item.quantity),
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: "#475569",
            lineHeight: 1.5,
            mb: 2,
          }}
        >
          {item.description}
        </Typography>
      </CardContent>

      {/* Action Buttons */}
      <Box
        sx={{
          p: 2,
          pt: 0,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: "100%" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box
              component="button"
              onClick={() => handleViewMap(item)}
              sx={{
                backgroundColor: "transparent",
                color: "#2563eb",
                border: "1px solid #2563eb",
                borderRadius: 1,
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#2563eb",
                  color: "white",
                },
              }}
            >
              View Map
            </Box>
            {quantity === 0 ? (
              <Box
                component="button"
                onClick={handleAddToPackage}
                sx={{
                  backgroundColor: "transparent",
                  color: "#059669",
                  border: "1px solid #059669",
                  borderRadius: 1,
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#059669",
                    color: "white",
                  },
                }}
              >
                Add to Package
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  component="button"
                  onClick={handleDecrement}
                  sx={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "4px 8px",
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                >
                  −
                </Box>
                <Typography
                  sx={{
                    minWidth: "2ch",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {quantity}
                </Typography>
                <Box
                  component="button"
                  onClick={handleIncrement}
                  sx={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "4px 8px",
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                >
                  +
                </Box>
              </Box>
            )}
          </Box>
          <Box
            component="button"
            onClick={() => onFeedback && onFeedback("not_helpful")}
            sx={{
              backgroundColor: "transparent",
              color: "#64748b",
              border: "none",
              borderRadius: 1,
              padding: "8px 12px",
              fontSize: "0.875rem",
              fontWeight: 400,
              cursor: "pointer",
              textDecoration: "underline",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                color: "#475569",
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            This isn't what I need
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
