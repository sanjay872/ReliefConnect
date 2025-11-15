import axios from "axios";
import { getAuthToken } from "../utils/auth";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 15000,
});

// TODO: Add axios interceptor for token refresh on 401 errors
// Example implementation:
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       // Refresh token logic here
//       // Then retry original request
//     }
//     return Promise.reject(error);
//   }
// );

// Axios interceptor to attach auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// helper: exponential backoff
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function withRetries(
  fn,
  { retries = 3, delays = [1000, 2000, 4000] } = {}
) {
  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = delays[attempt] ?? delays[delays.length - 1];
      // small wait before retrying
      await wait(delay);
      attempt += 1;
    }
  }
  throw lastError;
}

// If offlineMode true, callers should pass { offline: true } to use the mock fallback
export const recommend = async (query, options = {}) => {
  const { offline = false } = options;
  if (offline) {
    // dynamic import of the mock to keep bundle small
    const mock = await import("../mocks/recommendations.json");
    return mock.default;
  }

  return withRetries(async () => {
    const res = await api.post("/api/products/recommend", { query });
    if (res) {
      return res.data;
    }
    return {};
  });
};

export const createOrder = async (order, options = {}) => {
  const { offline = false } = options;
  if (offline) {
    const mock = await import("../mocks/order_response.json").catch(() => null);
    // create a fake response to simulate an order id
    return (
      mock?.default || {
        orderId: `offline-${Date.now()}`,
        status: "created",
        ...order,
      }
    );
  }

  return withRetries(async () => {
    const res = await api.post("/api/order", order);
    return res;
  });
};

export const getOrder = async (id, options = {}) => {
  const { offline = false } = options;
  if (offline) return { orderId: id, status: "offline" };
  const res = await api.get(`/order/${id}`);
  return res.data;
};

export const login = async (user) => {
  const res = await api.post("/api/user/login", user);
  return res;
};

export const signup = async (user) => {
  const res = await api.post("/api/user/signup", user);
  return res;
};

// TODO: Integrate with backend - Search products (aid kits) by filters
// Expected endpoint: POST /api/products/search
// Expected request body: { page: number, size: number, category?: string, priority?: 'urgent' | 'preparedness' }
// Expected response: { result: { products: [{ id, name, description, price, category, priority, utility, image, quantity, inStock }], total: number } }
// Headers: Authorization: Bearer ${token} (optional - can work without auth for browsing)
export const searchProduct = async (data, options = {}) => {
  const { offline = false } = options;

  if (offline) {
    // Mock data for testing - remove when backend is ready
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

    // Dynamically import mockKits
    const { mockKits } = await import("../data/mockKits");

    let filtered = [...mockKits];
    const { category, priority } = data || {};

    // Apply filters
    if (priority) {
      filtered = filtered.filter((kit) => kit.priority === priority);
    }
    if (category && category !== "All") {
      filtered = filtered.filter((kit) => kit.category === category);
    }

    // Return mock response structure matching expected backend format
    return {
      data: {
        result: {
          products: filtered,
          total: filtered.length,
        },
      },
    };
  }

  try {
    const res = await api.post("/api/products/search", data);
    if (res) {
      return res;
    }
    return { data: { result: { products: [], total: 0 } } };
  } catch (error) {
    console.error("Error searching products:", error);
    // Fallback to offline mode on error
    return searchProduct(data, { offline: true });
  }
};

// TODO: Integrate with backend - Get all orders for the authenticated user
// Expected endpoint: GET /api/orders
// Expected response: { orders: [{ id, date, status, items: [], total, ... }] }
// Headers: Authorization: Bearer ${token} (from auth context)
export const getOrders = async (options = {}) => {
  const { offline = false } = options;
  if (offline) {
    // Mock data for testing - remove when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      orders: [
        {
          id: "ORD-001",
          date: "2024-01-15",
          status: "Delivered",
          items: ["Food Kit", "Water Bottles", "First Aid Kit"],
          total: "$150.00",
        },
        {
          id: "ORD-002",
          date: "2024-01-16",
          status: "In Transit",
          items: ["Shelter Tent", "Blankets", "Flashlight"],
          total: "$200.00",
        },
        {
          id: "ORD-003",
          date: "2024-01-17",
          status: "Processing",
          items: ["Medicine Kit", "Sanitizer"],
          total: "$75.00",
        },
        {
          id: "ORD-004",
          date: "2024-01-18",
          status: "Delivered",
          items: ["Food Kit", "Water Bottles"],
          total: "$100.00",
        },
        {
          id: "ORD-005",
          date: "2024-01-19",
          status: "In Transit",
          items: ["Emergency Kit", "Radio"],
          total: "$125.00",
        },
      ],
    };
  }

  // TODO: Replace with actual API call
  // const res = await api.get("/api/orders", {
  //   headers: {
  //     Authorization: `Bearer ${getAuthToken()}`, // Get token from auth context
  //   },
  // });
  // return res.data;

  throw new Error("Backend integration pending - use offline mode for testing");
};

// TODO: Integrate with backend - Create a new issue/ticket for an order
// Expected endpoint: POST /api/issues or POST /api/tickets
// Expected request body: { orderId, issueType, description, images: File[] }
// Headers: Authorization: Bearer ${token}, Content-Type: multipart/form-data
// Expected response: { success: true, ticketId: "...", message: "..." }
export const createIssue = async (issueData, options = {}) => {
  const { offline = false } = options;
  if (offline) {
    // Mock response for testing - remove when backend is ready
    return {
      success: true,
      ticketId: `TICK-${Date.now()}`,
      message: "Issue created successfully (mock)",
    };
  }

  // TODO: Replace with actual API call
  // const formData = new FormData();
  // formData.append("orderId", issueData.orderId);
  // formData.append("issueType", issueData.issueType);
  // formData.append("description", issueData.description);
  // issueData.images.forEach((image, index) => {
  //   formData.append(`images`, image.file);
  // });
  //
  // const res = await api.post("/api/issues", formData, {
  //   headers: {
  //     Authorization: `Bearer ${getAuthToken()}`,
  //     "Content-Type": "multipart/form-data",
  //   },
  // });
  // return res.data;

  throw new Error("Backend integration pending - use offline mode for testing");
};

// TODO: Integrate with backend - Get all tickets for the authenticated user
// Expected endpoint: GET /api/tickets?status=${statusFilter}&sort=${sortField}&direction=${sortDirection}
// Expected response: { tickets: [{ id, orderId, issueType, status, createdDate, description, ... }] }
// Headers: Authorization: Bearer ${token}
export const getTickets = async (filters = {}, options = {}) => {
  const { offline = false } = options;
  const { status, sortField, sortDirection } = filters;

  if (offline) {
    // Mock data for testing - remove when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockTickets = [
      {
        id: "TICK-001",
        orderId: "ORD-001",
        issueType: "Delivery Delay",
        status: "Open",
        createdDate: "2024-01-15",
        description: "Order has not been delivered after 5 days",
      },
      {
        id: "TICK-002",
        orderId: "ORD-002",
        issueType: "Product Defect",
        status: "In Progress",
        createdDate: "2024-01-16",
        description: "Received damaged items in the package",
      },
      {
        id: "TICK-003",
        orderId: "ORD-003",
        issueType: "Payment Issue",
        status: "Resolved",
        createdDate: "2024-01-17",
        description: "Charged twice for the same order",
      },
      {
        id: "TICK-004",
        orderId: "ORD-004",
        issueType: "Other",
        status: "Open",
        createdDate: "2024-01-18",
        description: "Need to update delivery address",
      },
      {
        id: "TICK-005",
        orderId: "ORD-005",
        issueType: "Delivery Delay",
        status: "In Progress",
        createdDate: "2024-01-19",
        description: "Order delayed due to weather conditions",
      },
    ];

    // Apply client-side filtering for mock data (backend will handle this)
    let filtered = mockTickets;
    if (status && status !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === status);
    }

    // Apply client-side sorting for mock data (backend will handle this)
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortField || "createdDate"];
      let bValue = b[sortField || "createdDate"];

      if (sortField === "createdDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if ((sortDirection || "desc") === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return { tickets: sorted };
  }

  // TODO: Replace with actual API call
  // const params = new URLSearchParams();
  // if (status && status !== "All") params.append("status", status);
  // if (sortField) params.append("sort", sortField);
  // if (sortDirection) params.append("direction", sortDirection);
  //
  // const res = await api.get(`/api/tickets?${params.toString()}`, {
  //   headers: {
  //     Authorization: `Bearer ${getAuthToken()}`,
  //   },
  // });
  // return res.data;

  throw new Error("Backend integration pending - use offline mode for testing");
};

// TODO: Integrate with backend - Send chat message to AI agents
// Expected endpoint: POST /api/chat
// Alternative: POST /api/[activeAgent]-agent (e.g., /api/recommendation-agent, /api/order-agent, /api/fraud-agent, /api/general-agent)
// Expected request body: FormData with { message, type, images: File[], orderId? }
// Headers: Authorization: Bearer ${token}, Content-Type: multipart/form-data
// Expected response: { message: string, requiresAction?: boolean, orderId?: string, escalateToHuman?: boolean }
// Note: Supports streaming response for real-time AI agent responses
// Tab-based routing: Type parameter determines which agent handles the request (Product Recommendation, Order Status, Report Fraud, General Inquiry)
export const sendChatMessage = async (chatData, options = {}) => {
  const { offline = false } = options;

  if (offline) {
    // Mock AI response for testing - remove when backend is ready
    // Simulate AI agent decision based on message content
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = chatData.message.toLowerCase();
    const chatType = chatData.type || "General";

    // Simulate Product Recommendation AI Agent (Aid Kits)
    if (
      chatType === "Product Recommendation" ||
      message.includes("aid kit") ||
      message.includes("recommend") ||
      message.includes("shelter") ||
      message.includes("food") ||
      message.includes("medical") ||
      message.includes("need")
    ) {
      // Check if it's a hybrid query (recommendation + order status)
      const orderId = extractOrderIdFromMessage(message);
      if (
        orderId &&
        (message.includes("order") || message.includes("damaged"))
      ) {
        // Hybrid flow: recommendation for specific order
        const recommendationResult = await simulateRecommendation(
          message,
          {},
          { offline: true }
        );
        return {
          message: `I see you need aid kits for your order ${orderId}. ${recommendationResult.message} I can also help you check the status of order ${orderId} if needed.`,
          requiresAction: true,
          orderId: orderId,
          recommendedKits: recommendationResult.products,
        };
      }

      // Regular recommendation flow
      const recommendationResult = await simulateRecommendation(
        message,
        {},
        { offline: true }
      );
      return {
        message: recommendationResult.message,
        requiresAction: recommendationResult.products.length > 0,
        recommendedKits: recommendationResult.products,
      };
    }

    // Simulate Order Status AI Agent
    if (
      chatType === "Order Status" ||
      message.includes("order status") ||
      message.includes("track")
    ) {
      const orderId = chatData.orderId || extractOrderIdFromMessage(message);
      return {
        message: orderId
          ? `I found your order ${orderId}. Your order is currently "In Transit" and expected to arrive by January 25, 2024. Would you like more details or to raise an issue?`
          : "I'd be happy to help you check your order status. Could you please provide your order ID? (e.g., ORD-001)",
        requiresAction: false,
        orderId: orderId,
      };
    }

    // Simulate Fraud AI Agent
    if (
      chatType === "Report Fraud" ||
      message.includes("fraud") ||
      message.includes("scam")
    ) {
      if (chatData.images && chatData.images.length > 0) {
        // Simulate OCR/Image analysis
        return {
          message:
            "Thank you for reporting this. I've analyzed the images you provided using OCR and fraud detection algorithms. This appears to be a fraudulent transaction. I've processed a refund and escalated this to our fraud prevention team. A human agent will contact you within 24 hours. Would you like to create a ticket for tracking?",
          requiresAction: true,
          escalateToHuman: true,
        };
      } else {
        return {
          message:
            "I can help you report fraud. Please describe the incident and upload any relevant images (receipts, screenshots, etc.) so I can analyze them using our fraud detection system.",
          requiresAction: false,
        };
      }
    }

    // General AI responses
    if (message.includes("hello") || message.includes("hi")) {
      return {
        message:
          "Hello! I'm your virtual customer service agent powered by AI. I can help you with order status, fraud reports, or general inquiries. How can I assist you today?",
        requiresAction: false,
      };
    }

    if (message.includes("help")) {
      return {
        message:
          "I can help you with:\n1. Check order status - Just mention your order ID\n2. Report fraud - Describe the issue and upload images\n3. General inquiries - Ask me anything!\n\nWould you like to view your orders or tickets for more details?",
        requiresAction: false,
      };
    }

    // Default response
    return {
      message:
        "I understand. Let me help you with that. Could you provide more details? For order-related queries, please include your order ID (e.g., ORD-001). For fraud reports, please describe the issue and upload any relevant images.",
      requiresAction: false,
    };
  }

  // TODO: Replace with actual API call
  // const formData = new FormData();
  // formData.append("message", chatData.message);
  // formData.append("type", chatData.type || "General");
  // if (chatData.images && chatData.images.length > 0) {
  //   chatData.images.forEach((img) => {
  //     formData.append("images", img);
  //   });
  // }
  // if (chatData.orderId) {
  //   formData.append("orderId", chatData.orderId);
  // }
  //
  // // Handle streaming response if supported
  // const res = await api.post("/api/chat", formData, {
  //   headers: {
  //     Authorization: `Bearer ${getAuthToken()}`,
  //     "Content-Type": "multipart/form-data",
  //   },
  //   // For streaming: responseType: 'stream' or handle SSE
  // });
  // return res.data;

  throw new Error("Backend integration pending - use offline mode for testing");
};

// Helper function to extract order ID from message
const extractOrderIdFromMessage = (message) => {
  const orderIdMatch = message.match(/ord-?\d{3,}/i);
  return orderIdMatch ? orderIdMatch[0].toUpperCase() : null;
};

// TODO: Integrate with backend - Get product recommendations (aid kits) based on query and filters
// Expected endpoint: POST /api/recommendation-agent or GET /api/products/recommend
// Expected request body: { query: string, filters?: { category?: string, priority?: 'urgent' | 'preparedness' }, orderId?: string }
// Expected response: { products: [{ id, name, description, price, category, priority, utility, image, quantity }], message: string, filters: { category, priority } }
// Headers: Authorization: Bearer ${token} (optional - can work without auth for browsing)
export const simulateRecommendation = async (
  query,
  filters = {},
  options = {}
) => {
  const { offline = false } = options;
  const { category, priority } = filters;

  if (offline) {
    // Mock recommendation with delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-2s delay

    // Dynamically import mockKits
    const { mockKits } = await import("../data/mockKits");

    let filtered = [...mockKits];
    const queryLower = query.toLowerCase();

    // Parse query for keywords if no explicit filters
    if (!category && !priority) {
      // Keyword matching for category
      if (
        queryLower.includes("shelter") ||
        queryLower.includes("housing") ||
        queryLower.includes("accommodation")
      ) {
        filtered = filtered.filter(
          (kit) =>
            kit.category === "Shelter" ||
            kit.name.toLowerCase().includes("shelter")
        );
      } else if (
        queryLower.includes("medical") ||
        queryLower.includes("first aid") ||
        queryLower.includes("health")
      ) {
        filtered = filtered.filter(
          (kit) =>
            kit.category === "Medical" ||
            kit.name.toLowerCase().includes("medical")
        );
      } else if (
        queryLower.includes("food") ||
        queryLower.includes("water") ||
        queryLower.includes("nutrition")
      ) {
        filtered = filtered.filter(
          (kit) =>
            kit.category === "Food & Water" ||
            kit.name.toLowerCase().includes("food") ||
            kit.name.toLowerCase().includes("water")
        );
      } else if (
        queryLower.includes("infant") ||
        queryLower.includes("baby") ||
        queryLower.includes("child")
      ) {
        filtered = filtered.filter(
          (kit) =>
            kit.category === "Infant Care" ||
            kit.name.toLowerCase().includes("infant") ||
            kit.name.toLowerCase().includes("child")
        );
      } else if (
        queryLower.includes("pet") ||
        queryLower.includes("dog") ||
        queryLower.includes("cat")
      ) {
        filtered = filtered.filter(
          (kit) =>
            kit.category === "Pet Care" ||
            kit.name.toLowerCase().includes("pet")
        );
      } else if (
        queryLower.includes("urgent") ||
        queryLower.includes("emergency") ||
        queryLower.includes("immediate")
      ) {
        filtered = filtered.filter((kit) => kit.priority === "urgent");
      } else if (
        queryLower.includes("preparedness") ||
        queryLower.includes("prepared") ||
        queryLower.includes("long-term")
      ) {
        filtered = filtered.filter((kit) => kit.priority === "preparedness");
      }
    } else {
      // Apply explicit filters
      if (category && category !== "All") {
        filtered = filtered.filter((kit) => kit.category === category);
      }
      if (priority) {
        filtered = filtered.filter((kit) => kit.priority === priority);
      }
    }

    // Return 3-5 matching kits, prioritizing those that match better
    const recommended = filtered.slice(0, 5).map((kit) => ({
      id: kit.id,
      name: kit.name,
      description: kit.description,
      price: kit.price,
      category: kit.category,
      priority: kit.priority,
      utility: kit.utility,
      image: kit.image,
      quantity: kit.quantity,
      inStock: kit.inStock,
    }));

    // Generate personalized message
    const userName =
      queryLower.includes("my") || queryLower.includes("i need")
        ? "you"
        : "your situation";
    let message = `Based on your query "${query}", here are ${recommended.length} recommended aid kits that match ${userName}.`;

    if (recommended.length === 0) {
      message = `I couldn't find specific aid kits matching "${query}". Would you like to browse all available kits or refine your search?`;
    } else if (recommended.length === 1) {
      message = `I found the perfect aid kit for you: ${
        recommended[0].name
      }. This ${recommended[0].utility.toLowerCase()}. Add it to your relief package?`;
    } else if (recommended.length <= 3) {
      message = `Here are ${
        recommended.length
      } recommended aid kits for you: ${recommended
        .map((k) => k.name)
        .join(", ")}. Add any to your relief package?`;
    }

    return {
      products: recommended,
      message: message,
      filters: { category: category || null, priority: priority || null },
      timestamp: new Date().toISOString(),
    };
  }

  throw new Error("Backend integration pending - use offline mode for testing");
};

export default api;
