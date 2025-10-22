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
export const recommend = async (query, options = {}) => {
  const { offline = false } = options;
  if (offline) {
    // dynamic import of the mock to keep bundle small
    const mock = await import("../mocks/recommendations.json");
    return mock.default;
  }

  return withRetries(async () => {
    const res = await api.post("/api/products/recommend", { query });
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

export default api;
