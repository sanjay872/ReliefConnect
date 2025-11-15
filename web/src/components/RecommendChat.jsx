import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Grid,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import RecommendIcon from "@mui/icons-material/Recommend";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarningIcon from "@mui/icons-material/Warning";
import HelpIcon from "@mui/icons-material/Help";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Collapse from "@mui/material/Collapse";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import TicketIcon from "@mui/icons-material/ConfirmationNumber";
import {
  recommend as recommendAPI,
  sendChatMessage,
  simulateRecommendation,
} from "../services/api";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import ResourceCard from "./ResourceCard";
import { useReliefPackage } from "../context/ReliefPackageContext";
import { NotificationContext } from "./Notifications";
import {
  mockKits,
  urgentSubCategories,
  preparednessSubCategories,
  mainCategories,
} from "../data/mockKits";
import KitCard from "./KitCard";

export default function RecommendChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activeAgent, setActiveAgent] = useState("recommendation"); // 'recommendation', 'order', 'fraud', 'general'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("urgent");
  const [showCatalog, setShowCatalog] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [fraudImages, setFraudImages] = useState([]);
  const [fraudDescription, setFraudDescription] = useState("");
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [tabAnnouncement, setTabAnnouncement] = useState("");
  const { setRecommendation, username, recommendation } =
    useContext(AppContext);
  const { addResource, getTotalItems, setDrawerOpen } = useReliefPackage();
  const { show } = useContext(NotificationContext);
  const liveRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [quickRepliesVisible, setQuickRepliesVisible] = useState(true);

  // Offline resource data for when API is unavailable
  const offlineResources = [
    {
      id: "emergency-food-kit",
      name: "Emergency Food Kit",
      qty: "3-day supply",
      price: 30,
      details:
        "Non-perishable food items including canned goods, energy bars, and water bottles. Suitable for families of 2-4 people.",
      status: "available",
      location: "Local Distribution Centers",
      contact: "Call 211 for nearest location",
    },
    {
      id: "basic-medical-supplies",
      name: "Basic Medical Supplies",
      qty: "First Aid Kit",
      price: 20,
      details:
        "Essential first aid supplies including bandages, antiseptic, pain relievers, and basic medical equipment.",
      status: "available",
      location: "Emergency Shelters & Medical Stations",
      contact: "Available at all designated shelters",
    },
    {
      id: "emergency-shelter",
      name: "Emergency Shelter",
      qty: "Temporary housing",
      price: 50,
      details:
        "Safe, temporary accommodation for displaced families. Includes basic amenities and security.",
      status: "limited",
      location: "Central High School, Community Center",
      contact: "Call 911 for immediate assistance",
    },
    {
      id: "water-supplies",
      name: "Clean Water Supplies",
      qty: "Multiple locations",
      price: 15,
      details:
        "Access to clean drinking water and water purification supplies. Boil water advisory in effect for some areas.",
      status: "available",
      location: "Water distribution points throughout city",
      contact: "Check local emergency broadcasts",
    },
  ];

  // Quick needs selection options
  const quickNeeds = [
    {
      id: "food-water",
      label: "Food & Water",
      icon: "🍞",
      prompt: "I need food and water for my family",
    },
    {
      id: "shelter",
      label: "Shelter",
      icon: "🏠",
      prompt: "I need temporary shelter or housing",
    },
    {
      id: "first-aid",
      label: "First Aid",
      icon: "🏥",
      prompt: "I need medical assistance or first aid supplies",
    },
    {
      id: "power",
      label: "Power/Charging",
      icon: "🔌",
      prompt: "I need power or charging for my devices",
    },
    {
      id: "transportation",
      label: "Transportation",
      icon: "🚗",
      prompt: "I need transportation or evacuation assistance",
    },
    {
      id: "communication",
      label: "Communication",
      icon: "📞",
      prompt: "I need to communicate with family or emergency services",
    },
  ];

  const pushMessage = (role, text) => {
    setMessages((m) => [...m, { role, text }]);
  };

  const handleQuickNeed = (need) => {
    setInput(need.prompt);
    setQuickRepliesVisible(false);
    // Auto-focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleRecommendationFeedback = (feedbackType) => {
    if (feedbackType === "not_helpful") {
      // Clear the current recommendation
      setRecommendation(null);
      // Add a helpful message to guide the user
      pushMessage(
        "agent",
        "I understand that recommendation wasn't quite right for your situation. Please tell me more about your specific needs so I can provide better assistance."
      );
      // Focus on the input field for the user to provide more details
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      if (liveRef.current) {
        liveRef.current.textContent =
          "Recommendation cleared, please provide more details";
      }
    }
  };

  const handleRequestAid = (item) => {
    // Navigate to order form with the selected item
    navigate("/order", { state: { recommendation: item } });
  };

  const handleViewMap = (item) => {
    // Open static map in new window
    const mapWindow = window.open("", "_blank");
    mapWindow.document.write(`
      <html>
        <head><title>Map - ${item.name}</title></head>
        <body style="margin:0; padding:20px; font-family: Arial, sans-serif;">
          <h2>📍 ${item.name}</h2>
          <p><strong>Location:</strong> ${
            item.location || "Check local emergency services"
          }</p>
          <p><strong>Contact:</strong> ${
            item.contact || "Call 911 for immediate assistance"
          }</p>
          <div style="width:100%; height:400px; background:#f0f0f0; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; margin:20px 0;">
            <p style="color:#666;">Interactive map coming soon</p>
          </div>
          <p><em>This is a placeholder map. In a real implementation, this would show an interactive map with the exact location.</em></p>
        </body>
      </html>
    `);
  };

  useEffect(() => {
    // focus the input on mount for keyboard users
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Handle tab change with announcements and pre-fill
  useEffect(() => {
    // Announce tab change for screen readers
    const announcements = {
      recommendation:
        "Switched to Product Recommendation tab—suggest aid kits for urgent needs",
      order: "Switched to Order Status tab—track relief packages and shipments",
      fraud:
        "Switched to Report Fraud tab—report damaged goods and fraudulent transactions",
      general:
        "Switched to General Inquiry tab—ask questions about ReliefConnect services",
    };
    setTabAnnouncement(announcements[activeAgent] || "");

    // Pre-fill input based on tab
    if (activeAgent === "order") {
      setInput("Enter order ID: ORD-");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (activeAgent === "fraud") {
      setInput("");
      setFraudDescription("");
      setFraudImages([]);
    } else if (activeAgent === "recommendation") {
      setInput("");
    } else if (activeAgent === "general") {
      setInput("");
    }

    // Clear prior content when switching tabs
    setRecommendation(null);
    setMessages([]);
  }, [activeAgent, setRecommendation]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input?.trim()) return;
    const userText = input.trim();
    setInput("");
    pushMessage("user", userText);
    setLoading(true);
    setIsOffline(false);

    try {
      // Route to appropriate agent based on activeAgent
      if (activeAgent === "recommendation") {
        // Use aid kits recommendation
        const res = await simulateRecommendation(
          userText,
          {
            category: selectedCategory !== "All" ? selectedCategory : undefined,
            priority: selectedPriority,
          },
          { offline: true }
        );

        const structuredRecommendation = {
          items: res.products || [],
          message: res.message || "Sorry, we couldn't find matching aid kits.",
          timestamp: new Date().toISOString(),
        };

        pushMessage("agent", structuredRecommendation.message);
        setRecommendation(structuredRecommendation);

        if (liveRef.current)
          liveRef.current.textContent = "Recommendation received";
      } else {
        // Use chat message for other agents (order, fraud, general)
        const chatType =
          activeAgent === "order"
            ? "Order Status"
            : activeAgent === "fraud"
            ? "Report Fraud"
            : "General";

        const chatResponse = await sendChatMessage(
          {
            message: userText,
            type: chatType,
            images: [], // Image upload not yet implemented in this component
          },
          { offline: true }
        );

        pushMessage("agent", chatResponse.message);

        if (liveRef.current) liveRef.current.textContent = "Response received";
      }
    } catch (err) {
      // Graceful offline fallback
      setIsOffline(true);
      if (activeAgent === "recommendation") {
        pushMessage(
          "agent",
          "The AI Agent is currently unavailable. Here are some general recommendations for your area."
        );

        const offlineRecommendation = {
          items: offlineResources,
          message:
            "The AI Agent is currently unavailable. Here are some general recommendations for your area.",
          timestamp: new Date().toISOString(),
          offline: true,
        };

        setRecommendation(offlineRecommendation);

        if (liveRef.current)
          liveRef.current.textContent = "Showing offline recommendations";
      } else {
        pushMessage(
          "agent",
          "I'm sorry, but I'm having trouble connecting right now. Please try again later or contact support."
        );
      }
    } finally {
      setLoading(false);
      setQuickRepliesVisible(true);
    }
  };

  const handleRetry = async () => {
    // re-run the last user message if available, with retry/backoff handled by api
    const last = messages
      .slice()
      .reverse()
      .find((m) => m.role === "user");
    if (!last) return;
    if (liveRef.current)
      liveRef.current.textContent = "Retrying to fetch recommendation";

    setLoading(true);
    try {
      const res = await recommendAPI(last.text);
      const structuredRecommendation = {
        items: res.products || [],
        message: res.response || "Sorry, we got no more stocks",
        timestamp: new Date().toISOString(),
      };

      pushMessage("agent", structuredRecommendation.message);
      setRecommendation(structuredRecommendation);

      if (liveRef.current)
        liveRef.current.textContent =
          "Connection restored—updated recommendation ready.";
    } catch (err) {
      // Fallback to offline recommendations
      setIsOffline(true);
      pushMessage(
        "agent",
        "The AI Agent is currently unavailable. Here are some general recommendations for your area."
      );

      const offlineRecommendation = {
        items: offlineResources,
        message:
          "The AI Agent is currently unavailable. Here are some general recommendations for your area.",
        timestamp: new Date().toISOString(),
        offline: true,
      };

      setRecommendation(offlineRecommendation);

      if (liveRef.current)
        liveRef.current.textContent =
          "Still offline — showing offline options.";
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (type) => {
    // Manage quick replies; ensure focus and keyboard-friendly behavior
    setQuickRepliesVisible(false);
    if (type === "order") {
      const totalItems = getTotalItems();
      if (totalItems > 0) {
        // Open the cart sidebar instead of navigating
        setDrawerOpen(true);
        if (liveRef.current)
          liveRef.current.textContent = "Opening relief package";
      } else {
        show("Your package is empty. Add items to proceed.", "warning");
        if (liveRef.current) liveRef.current.textContent = "Package is empty";
      }
    } else if (type === "refine") {
      // focus input and prefill a short prompt to help the user
      setInput((prev) => (prev ? prev : "Please refine: "));
      setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    } else if (type === "hotline") {
      const hotlineText =
        "Call local emergency hotline at +1-555-555-5555 or your country's emergency number. If immediate danger, please call emergency services.";
      pushMessage("agent", hotlineText);
      if (liveRef.current) liveRef.current.textContent = "Hotline provided";
      // keep focus on input for next action
      setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    }
  };

  // Filter mockKits for catalog display
  const filteredKits = mockKits.filter((kit) => {
    const matchesCategory =
      selectedCategory === "All" || kit.category === selectedCategory;
    const matchesPriority = kit.priority === selectedPriority;
    return matchesCategory && matchesPriority;
  });

  // Filtered kits based on current selection
  const currentSubCategories =
    selectedPriority === "urgent"
      ? urgentSubCategories
      : preparednessSubCategories;

  // Handle fraud image upload
  const handleFraudImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files
      .filter((file) => {
        // File size limit: 5MB
        if (file.size > 5 * 1024 * 1024) {
          show(
            `File ${file.name} exceeds 5MB limit. Please select a smaller file.`,
            "error"
          );
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));
    setFraudImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveFraudImage = (index) => {
    const newImages = fraudImages.filter((_, i) => i !== index);
    URL.revokeObjectURL(fraudImages[index].preview);
    setFraudImages(newImages);
  };

  // Handle order status check
  const handleCheckOrderStatus = async () => {
    if (!orderIdInput.trim()) {
      show("Please enter an order ID", "warning");
      return;
    }
    const orderId = orderIdInput.trim().toUpperCase();
    setInput(`Check status for order ${orderId}`);
    pushMessage("user", `Check status for order ${orderId}`);
    setLoading(true);

    try {
      const chatResponse = await sendChatMessage(
        {
          message: `Check status for order ${orderId}`,
          type: "Order Status",
          orderId: orderId,
          images: [],
        },
        { offline: true }
      );
      pushMessage("agent", chatResponse.message);
      if (liveRef.current)
        liveRef.current.textContent = "Order status retrieved";
    } catch (err) {
      pushMessage(
        "agent",
        "Unable to retrieve order status. Please try again later."
      );
    } finally {
      setLoading(false);
      setOrderIdInput("");
    }
  };

  // Handle fraud report submission
  const handleSubmitFraudReport = async () => {
    if (!fraudDescription.trim() && fraudImages.length === 0) {
      show("Please describe the issue or upload images", "warning");
      return;
    }
    const description = fraudDescription.trim() || "Fraud report with images";
    pushMessage("user", description);
    setLoading(true);

    try {
      const chatResponse = await sendChatMessage(
        {
          message: description,
          type: "Report Fraud",
          images: fraudImages.map((img) => img.file),
        },
        { offline: true }
      );
      pushMessage("agent", chatResponse.message);
      if (liveRef.current)
        liveRef.current.textContent = "Fraud report submitted";

      // Clear fraud form
      setFraudDescription("");
      fraudImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setFraudImages([]);
    } catch (err) {
      pushMessage(
        "agent",
        "Unable to submit fraud report. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle FAQ search with debounce
  const handleFaqSearch = (query) => {
    if (!query.trim()) {
      setFaqSearch("");
      return;
    }
    // Filter FAQ items and expand matching one
    const faqItems = [
      {
        id: "recommendations",
        keywords: ["recommend", "aid kits", "suggest", "product"],
        question: "How do I get recommendations for aid kits?",
      },
      {
        id: "order-status",
        keywords: ["order", "status", "track", "shipment"],
        question: "How do I check my order status?",
      },
      {
        id: "fraud",
        keywords: ["fraud", "damaged", "report", "refund"],
        question: "How do I report fraud or damaged goods?",
      },
    ];

    const queryLower = query.toLowerCase();
    const matched = faqItems.find((item) =>
      item.keywords.some((keyword) => queryLower.includes(keyword))
    );

    if (matched) {
      setExpandedFaq(matched.id);
      setInput(matched.question);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // Note: General queries are submitted via Enter key in the FAQ search field
  };

  // Handle quick need for recommendation tab
  const handleQuickNeedRecommendation = (need) => {
    if (activeAgent !== "recommendation") {
      setActiveAgent("recommendation");
    }
    setInput(`Recommend ${need.label.toLowerCase()} aid kits`);
    setQuickRepliesVisible(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <Box>
      {/* Tab Announcement for Screen Readers */}
      <Box
        component="div"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {tabAnnouncement}
      </Box>

      {/* Hero Section with Welcome and Tabs */}
      <Paper sx={{ p: 3, mb: 2 }} className="card-elevated">
        {/* Welcome Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            {username ? `Welcome back, ${username}` : "AI Relief Agent"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {activeAgent === "recommendation" &&
              "Describe your needs (include family size, location) and I'll suggest aid kits for urgent needs."}
            {activeAgent === "order" &&
              "Check your order status by providing your order ID. Track shipments and resolve order issues."}
            {activeAgent === "fraud" &&
              "Report fraud or damaged goods. Upload images for AI analysis and automatic refund processing."}
            {activeAgent === "general" &&
              "Ask questions about ReliefConnect services, available resources, or how to get help."}
          </Typography>
        </Box>

        {/* Agent Selector Tabs with Tooltips */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <Tabs
            value={activeAgent}
            onChange={(e, newValue) => setActiveAgent(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
              },
            }}
          >
            <Tab
              label="Product Recommendation"
              value="recommendation"
              icon={
                <Tooltip
                  title="Suggest aid kits for urgent needs"
                  arrow
                  placement="top"
                >
                  <LightbulbIcon />
                </Tooltip>
              }
              iconPosition="start"
              aria-label="Switch to Product Recommendation tab for aid kits suggestions"
              title="Suggest aid kits for urgent needs"
            />
            <Tab
              label="Order Status"
              value="order"
              icon={
                <Tooltip
                  title="Track relief packages and shipments"
                  arrow
                  placement="top"
                >
                  <LocalShippingIcon />
                </Tooltip>
              }
              iconPosition="start"
              aria-label="Switch to Order Status tab for tracking relief packages"
              title="Track relief packages and shipments"
            />
            <Tab
              label="Report Fraud"
              value="fraud"
              icon={
                <Tooltip
                  title="Report damaged goods and fraudulent transactions"
                  arrow
                  placement="top"
                >
                  <WarningIcon />
                </Tooltip>
              }
              iconPosition="start"
              aria-label="Switch to Report Fraud tab for reporting damaged goods"
              title="Report damaged goods and fraudulent transactions"
            />
            <Tab
              label="General Inquiry"
              value="general"
              icon={
                <Tooltip
                  title="Ask questions about ReliefConnect services"
                  arrow
                  placement="top"
                >
                  <HelpIcon />
                </Tooltip>
              }
              iconPosition="start"
              aria-label="Switch to General Inquiry tab for questions"
              title="Ask questions about ReliefConnect services"
            />
          </Tabs>
        </Box>

        {/* Quick Needs Selection - Only show for Recommendation tab */}
        {activeAgent === "recommendation" && (
          <Fade in={activeAgent === "recommendation"}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, fontWeight: 500, color: "text.primary" }}
              >
                Quick Needs Selection:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {quickNeeds.map((need) => (
                  <Button
                    key={need.id}
                    variant="outlined"
                    size="small"
                    startIcon={
                      <span style={{ fontSize: "1rem" }}>{need.icon}</span>
                    }
                    onClick={() => handleQuickNeedRecommendation(need)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {need.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Fade>
        )}

        {/* Input Form - Dynamic placeholder based on active tab */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 8, marginTop: 16 }}
          aria-label="Needs submission form"
        >
          <TextField
            inputRef={inputRef}
            aria-label={
              activeAgent === "recommendation"
                ? "Describe your needs for aid kits"
                : activeAgent === "order"
                ? "Enter order ID"
                : activeAgent === "fraud"
                ? "Describe fraud or damaged goods"
                : "Ask a question"
            }
            placeholder={
              activeAgent === "recommendation"
                ? "E.g. Flooded home, need shelter and food for family of 4"
                : activeAgent === "order"
                ? "Enter order ID (e.g., ORD-001)"
                : activeAgent === "fraud"
                ? "Describe the issue with damaged goods or fraud"
                : "E.g. How do I get help?"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              // Enter submits, Shift+Enter allows newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            aria-label={
              activeAgent === "recommendation"
                ? "Get recommendations"
                : activeAgent === "order"
                ? "Check order status"
                : activeAgent === "fraud"
                ? "Submit fraud report"
                : "Submit question"
            }
          >
            {loading ? (
              <CircularProgress size={18} />
            ) : activeAgent === "order" ? (
              "Check Status"
            ) : activeAgent === "fraud" ? (
              "Report"
            ) : (
              "Get Help"
            )}
          </Button>
        </form>
      </Paper>

      <Paper sx={{ p: 2, minHeight: 200 }} aria-live="polite">
        <List>
          {messages.length === 0 && (
            <ListItem>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Avatar sx={{ bgcolor: "#2563eb" }}>
                  <SmartToyIcon />
                </Avatar>
                <ListItemText primary="Welcome to ReliefConnect! Please describe your needs or use a quick selection above to get started." />
              </Box>
            </ListItem>
          )}
          {messages.map((m, i) => (
            <ListItem
              key={i}
              sx={{
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  maxWidth: "85%",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: m.role === "user" ? "#059669" : "#2563eb",
                    width: 32,
                    height: 32,
                    fontSize: "0.875rem",
                  }}
                >
                  {m.role === "user" ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper
                  sx={{
                    p: 1.5,
                    backgroundColor: m.role === "user" ? "#e7f3ff" : "#f1f8f4",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      color: "#475569",
                    }}
                  >
                    {m.role === "user" ? username || "You" : "AI Agent"}
                  </Typography>
                  <Box
                    sx={{
                      "& p": { marginBottom: 1 },
                      "& ul": { pl: 2, mb: 1 },
                      "& h3": { fontWeight: "bold", fontSize: "1rem", mb: 0.5 },
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({ node, ...props }) => (
                          <Typography
                            variant="subtitle1"
                            component="div" // ✅ ensures no nested <h6> inside <p>
                            fontWeight="bold"
                            gutterBottom
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <Typography
                            component="li"
                            variant="body2"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <Typography
                            variant="body2"
                            component="div" // ✅ replaces <p> tag with a <div>
                            gutterBottom
                            {...props}
                          />
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </Box>
                </Paper>
              </Box>
            </ListItem>
          ))}
          {loading && (
            <ListItem>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ bgcolor: "#2563eb" }}>
                  <SmartToyIcon />
                </Avatar>
                <Paper
                  sx={{ p: 1.5, backgroundColor: "#f1f8f4", borderRadius: 2 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      AI Agent is thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Dynamic Tab-Specific Content */}
      <Fade in={true} timeout={300}>
        <Box sx={{ mt: 2 }}>
          {/* Product Recommendation Tab: Catalog Filters and Quick Add */}
          {activeAgent === "recommendation" && (
            <Paper sx={{ p: 3, mb: 2 }} className="card-elevated">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Browse Aid Kits Catalog
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowCatalog(!showCatalog)}
                  sx={{ textTransform: "none" }}
                >
                  {showCatalog ? "Hide Catalog" : "Show Catalog"}
                </Button>
              </Box>

              {showCatalog && (
                <Fade in={showCatalog} timeout={300}>
                  <Box>
                    {/* Priority Filter */}
                    <Box sx={{ mb: 2 }}>
                      <Tabs
                        value={selectedPriority}
                        onChange={(e, newValue) => {
                          setSelectedPriority(newValue);
                          setSelectedCategory("All");
                        }}
                        sx={{ mb: 2 }}
                      >
                        <Tab label="Urgent Emergency Kits" value="urgent" />
                        <Tab label="Preparedness Kits" value="preparedness" />
                      </Tabs>

                      {/* Category Filter */}
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 2 }}
                      >
                        {currentSubCategories.map((category) => (
                          <Chip
                            key={category}
                            label={category}
                            onClick={async () => {
                              setSelectedCategory(category);
                              // Auto-trigger recommendation with filters
                              if (category !== "All") {
                                const query = `Recommend ${category.toLowerCase()} aid kits`;
                                setInput(query);
                                pushMessage("user", query);
                                setLoading(true);
                                try {
                                  const res = await simulateRecommendation(
                                    query,
                                    {
                                      category:
                                        category !== "All"
                                          ? category
                                          : undefined,
                                      priority: selectedPriority,
                                    },
                                    { offline: true }
                                  );
                                  const structuredRecommendation = {
                                    items: res.products || [],
                                    message:
                                      res.message ||
                                      "Sorry, we couldn't find matching aid kits.",
                                    timestamp: new Date().toISOString(),
                                  };
                                  pushMessage(
                                    "agent",
                                    structuredRecommendation.message
                                  );
                                  setRecommendation(structuredRecommendation);
                                  if (liveRef.current)
                                    liveRef.current.textContent =
                                      "Recommendation received";
                                } catch (err) {
                                  pushMessage(
                                    "agent",
                                    "Unable to get recommendations. Please try again."
                                  );
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            variant={
                              selectedCategory === category
                                ? "filled"
                                : "outlined"
                            }
                            color={
                              selectedCategory === category
                                ? "primary"
                                : "default"
                            }
                            clickable
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Kits Grid */}
                    {filteredKits.length > 0 ? (
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        {filteredKits.slice(0, 6).map((kit) => (
                          <Grid item xs={12} sm={6} md={4} key={kit.id}>
                            <KitCard kit={kit} />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No kits found in this category. Try selecting a
                        different category or priority.
                      </Alert>
                    )}

                    {filteredKits.length > 6 && (
                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate("/aid-kits")}
                          sx={{ textTransform: "none" }}
                        >
                          View All Aid Kits
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Fade>
              )}
            </Paper>
          )}

          {/* Order Status Tab: Quick Check Form */}
          {activeAgent === "order" && (
            <Paper sx={{ p: 3, mb: 2 }} className="card-elevated">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Check Order Status
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Order ID"
                  placeholder="ORD-001"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCheckOrderStatus();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleCheckOrderStatus}
                  disabled={loading || !orderIdInput.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={20} /> : "Check Status"}
                </Button>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShoppingBagIcon />}
                  onClick={() => navigate("/orders")}
                  sx={{ textTransform: "none" }}
                >
                  View All Orders
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TicketIcon />}
                  onClick={() => navigate("/tickets")}
                  sx={{ textTransform: "none" }}
                >
                  View Tickets
                </Button>
              </Box>
            </Paper>
          )}

          {/* Report Fraud Tab: Upload and Description */}
          {activeAgent === "fraud" && (
            <Paper sx={{ p: 3, mb: 2 }} className="card-elevated">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Report Fraud or Damaged Goods
              </Typography>

              {/* Image Upload Zone */}
              <Box
                sx={{
                  mb: 2,
                  p: 3,
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  textAlign: "center",
                  backgroundColor: "grey.50",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "grey.100",
                  },
                }}
                onClick={() =>
                  document.getElementById("fraud-image-upload")?.click()
                }
              >
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="fraud-image-upload"
                  type="file"
                  multiple
                  onChange={handleFraudImageUpload}
                />
                <CloudUploadIcon
                  sx={{ fontSize: 48, color: "grey.400", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Click or drag images here (max 5MB per file)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Upload receipts, damaged items, or suspicious transactions
                </Typography>
              </Box>

              {/* Image Preview Grid */}
              {fraudImages.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {fraudImages.map((image, index) => (
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
                        onClick={() => handleRemoveFraudImage(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Description Field */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                placeholder="Describe the issue with damaged goods or fraudulent transaction..."
                value={fraudDescription}
                onChange={(e) => setFraudDescription(e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Submit Button */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitFraudReport}
                  disabled={
                    loading ||
                    (fraudDescription.trim() === "" && fraudImages.length === 0)
                  }
                  startIcon={<SecurityIcon />}
                  sx={{ textTransform: "none" }}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Submit Fraud Report"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TicketIcon />}
                  onClick={() => navigate("/tickets")}
                  sx={{ textTransform: "none" }}
                >
                  View Tickets
                </Button>
              </Box>
            </Paper>
          )}

          {/* General Inquiry Tab: FAQ Search */}
          {activeAgent === "general" && (
            <Paper sx={{ p: 3, mb: 2 }} className="card-elevated">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Frequently Asked Questions
              </Typography>

              {/* FAQ Search Bar */}
              <TextField
                fullWidth
                placeholder="Search FAQs (e.g., 'how to get aid kits', 'order status', 'report fraud') or ask a question"
                value={faqSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setFaqSearch(value);
                  // Debounce FAQ matching
                  if (value.trim()) {
                    setTimeout(() => handleFaqSearch(value), 300);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && faqSearch.trim()) {
                    e.preventDefault();
                    // If no FAQ match, submit as general query
                    if (!expandedFaq) {
                      setInput(faqSearch);
                      setFaqSearch("");
                      handleSubmit();
                    } else {
                      handleFaqSearch(faqSearch);
                    }
                  }
                }}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <HelpIcon />
                    </IconButton>
                  ),
                }}
              />

              {/* FAQ Accordion */}
              <Box sx={{ mb: 2 }}>
                <Accordion
                  expanded={expandedFaq === "recommendations"}
                  onChange={(e, isExpanded) =>
                    setExpandedFaq(isExpanded ? "recommendations" : null)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      How do I get recommendations for aid kits?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      Select the "Product Recommendation" tab and describe your
                      needs (e.g., "I need shelter for my family of 4"). The AI
                      agent will suggest matching aid kits from our catalog. You
                      can also browse the catalog below to see all available
                      kits.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expandedFaq === "order-status"}
                  onChange={(e, isExpanded) =>
                    setExpandedFaq(isExpanded ? "order-status" : null)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      How do I check my order status?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      Select the "Order Status" tab and provide your order ID
                      (e.g., ORD-001). The AI agent will retrieve and display
                      your order details and shipping status.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expandedFaq === "fraud"}
                  onChange={(e, isExpanded) =>
                    setExpandedFaq(isExpanded ? "fraud" : null)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      How do I report fraud or damaged goods?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      Select the "Report Fraud" tab and describe the issue.
                      Upload images of receipts, damaged items, or suspicious
                      transactions. Our AI agent will analyze the images using
                      OCR and fraud detection algorithms to process your report.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Paper>
          )}
        </Box>
      </Fade>

      {/* Display Resource Cards if available */}
      {recommendation && recommendation.items && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
              Recommended Resources
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                recommendation.items.forEach((item) => addResource(item));
                show(
                  `Added ${recommendation.items.length} items to relief package`,
                  "success"
                );
              }}
              sx={{
                borderColor: "#059669",
                color: "#059669",
                "&:hover": {
                  backgroundColor: "#059669",
                  color: "white",
                },
              }}
            >
              Add All to Package
            </Button>
          </Box>
          {isOffline && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Showing offline recommendations. AI Agent is currently
              unavailable.
            </Alert>
          )}
          <Grid container spacing={2}>
            {recommendation.items.map((item, index) => (
              <Grid item xs={12} md={6} key={item.id || index}>
                <ResourceCard
                  item={item}
                  onRequest={handleRequestAid}
                  onViewMap={handleViewMap}
                  onFeedback={handleRecommendationFeedback}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Quick Action Buttons - Only show for Recommendation tab */}
      {activeAgent === "recommendation" && (
        <Box sx={{ mt: 2 }}>
          <Button onClick={handleRetry} variant="outlined" sx={{ mb: 1 }}>
            Retry recommendation
          </Button>
          {quickRepliesVisible && (
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip
                label="Proceed to Order for Urgent Aid"
                onClick={() => handleQuick("order")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleQuick("order");
                }}
                role="button"
                tabIndex={0}
                aria-label="Order recommended relief items"
                color="primary"
                clickable
              />
              <Chip
                label="Need to refine"
                onClick={() => handleQuick("refine")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleQuick("refine");
                }}
                role="button"
                tabIndex={0}
                aria-label="Refine recommendation"
                variant="outlined"
                clickable
              />
              <Chip
                label="Call hotline"
                onClick={() => handleQuick("hotline")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleQuick("hotline");
                }}
                role="button"
                tabIndex={0}
                aria-label="Call local emergency hotline"
                color="warning"
                clickable
              />
            </Stack>
          )}
        </Box>
      )}

      <div
        ref={liveRef}
        style={{
          position: "absolute",
          left: -9999,
          height: 1,
          width: 1,
          overflow: "hidden",
        }}
        aria-live="polite"
      ></div>
    </Box>
  );
}
