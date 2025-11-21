import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 15000,
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
export const recommend = async (query, userId, options = {}) => {
  const { offline = false } = options;
  if (offline) {
    // dynamic import of the mock to keep bundle small
    const mock = await import("../mocks/recommendations.json");
    return mock.default;
  }

  return withRetries(async () => {
    const res = await api.post("/api/products/recommend", { query:query,userId:userId});
    if(res){
      return res.data;
    }
    return {}
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

export const login = async (user)=>{
  const res=await api.post("/api/user/login",user);
  return res;
}

export const signup = async (user)=>{
  const res=await api.post("/api/user/signup",user);
  return res;
}

export const searchProduct = async (data)=>{
  const res=await api.post("/api/products/search",data);
  if(res){
    return res;
  }
  return [];
}

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
  const res = await api.post("/api/order/report", issueData);
  return res.data;

  //throw new Error("Backend integration pending - use offline mode for testing");
};

export const getOrders = async (userid,options = {}) => {
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

  //TODO: Replace with actual API call
  const res = await api.get("/api/order/all/"+userid);
  return res.data;
};

export const getTickets = async (userId) => {
  // const { offline = false } = options;
  // const { status, sortField, sortDirection } = filters;

  // if (offline) {
  //   // Mock data for testing - remove when backend is ready
  //   // Simulate API delay
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   const mockTickets = [
  //     {
  //       id: "TICK-001",
  //       orderId: "ORD-001",
  //       issueType: "Delivery Delay",
  //       status: "Open",
  //       createdDate: "2024-01-15",
  //       description: "Order has not been delivered after 5 days",
  //     },
  //     {
  //       id: "TICK-002",
  //       orderId: "ORD-002",
  //       issueType: "Product Defect",
  //       status: "In Progress",
  //       createdDate: "2024-01-16",
  //       description: "Received damaged items in the package",
  //     },
  //     {
  //       id: "TICK-003",
  //       orderId: "ORD-003",
  //       issueType: "Payment Issue",
  //       status: "Resolved",
  //       createdDate: "2024-01-17",
  //       description: "Charged twice for the same order",
  //     },
  //     {
  //       id: "TICK-004",
  //       orderId: "ORD-004",
  //       issueType: "Other",
  //       status: "Open",
  //       createdDate: "2024-01-18",
  //       description: "Need to update delivery address",
  //     },
  //     {
  //       id: "TICK-005",
  //       orderId: "ORD-005",
  //       issueType: "Delivery Delay",
  //       status: "In Progress",
  //       createdDate: "2024-01-19",
  //       description: "Order delayed due to weather conditions",
  //     },
  //   ];

  //   // Apply client-side filtering for mock data (backend will handle this)
  //   let filtered = mockTickets;
  //   if (status && status !== "All") {
  //     filtered = filtered.filter((ticket) => ticket.status === status);
  //   }

  //   // Apply client-side sorting for mock data (backend will handle this)
  //   const sorted = [...filtered].sort((a, b) => {
  //     let aValue = a[sortField || "createdDate"];
  //     let bValue = b[sortField || "createdDate"];

  //     if (sortField === "createdDate") {
  //       aValue = new Date(aValue);
  //       bValue = new Date(bValue);
  //     } else {
  //       aValue = String(aValue).toLowerCase();
  //       bValue = String(bValue).toLowerCase();
  //     }

  //     if ((sortDirection || "desc") === "asc") {
  //       return aValue > bValue ? 1 : -1;
  //     } else {
  //       return aValue < bValue ? 1 : -1;
  //     }
  //   });

  //   return { tickets: sorted };
  // }

  // TODO: Replace with actual API call
  // const params = new URLSearchParams();
  // if (status && status !== "All") params.append("status", status);
  // if (sortField) params.append("sort", sortField);
  // if (sortDirection) params.append("direction", sortDirection);
  
  const res = await api.get(`/api/ticket/${userId}`);
  console.log(res.data.tickets)
  return res.data.tickets
  //throw new Error("Backend integration pending - use offline mode for testing");
};

export const updateTicketStatus = async (data) => {
   await api.put(`/api/ticket`,data);
}

export default api;