# Frontend Integration Guide

## Quick Setup

```bash
npm install
npm run dev
```

## API Integration Points

### Required Backend Endpoints:

1. **POST /api/recommend** - AI-powered relief recommendations

   - Expected payload: `{ needs: string[] }`
   - Expected response: Array of recommendation objects

2. **POST /api/order** - Create new relief order

   - Expected payload: Order object with user details, items, location
   - Expected response: `{ orderId: string, status: string }`

3. **GET /api/order/:id** - Get order status

   - Expected response: Order object with current status

4. **GET /api/orders** - Get all orders for authenticated user

   - Headers: `Authorization: Bearer ${token}`
   - Expected response: `{ orders: [{ id, date, status, items: [], total, ... }] }`
   - Integration: See `web/src/pages/ViewOrders.jsx` - TODO comments in `useEffect`
   - Status: Mock data active, API placeholder ready

5. **POST /api/issues** or **POST /api/tickets** - Create issue/ticket for an order

   - Headers: `Authorization: Bearer ${token}`, `Content-Type: multipart/form-data`
   - Expected payload: `FormData` with `orderId`, `issueType`, `description`, `images: File[]`
   - Expected response: `{ success: true, ticketId: string, message: string }`
   - Integration: See `web/src/pages/ViewOrders.jsx` - TODO comments in `handleSubmitIssue`
   - Status: Mock submission active, FormData structure ready

6. **GET /api/tickets** - Get all tickets for authenticated user

   - Headers: `Authorization: Bearer ${token}`
   - Query params: `?status=${status}&sort=${sortField}&direction=${sortDirection}`
   - Expected response: `{ tickets: [{ id, orderId, issueType, status, createdDate, description, ... }] }`
   - Integration: See `web/src/pages/ViewTickets.jsx` - TODO comments in `useEffect`
   - Status: Mock data active, API placeholder ready with filter/sort support

7. **POST /api/chat** - Send chat message to AI agents (Order Status, Fraud Detection, Product Recommendation)

   - Headers: `Authorization: Bearer ${token}`, `Content-Type: multipart/form-data`
   - Expected payload: `FormData` with `message`, `type` (Order Status | Report Fraud | Product Recommendation | General), `images: File[]`, `orderId?`
   - Expected response: `{ message: string, requiresAction?: boolean, orderId?: string, escalateToHuman?: boolean, recommendedKits?: [{ id, name, price, description, category, priority, utility }] }`
   - Integration: See `web/src/components/ChatModal.jsx` - TODO comments in `handleSend`
   - Status: Mock AI responses active, FormData structure ready, supports streaming responses (commented)
   - Note: Routes to different AI agents based on `type` parameter (Order Status Agent, Fraud Detection Agent, Product Recommendation Agent)

8. **POST /api/recommendation-agent** or **GET /api/products/recommend** - Get product recommendations (aid kits)
   - Headers: `Authorization: Bearer ${token}` (optional - can work without auth for browsing)
   - Expected payload: `{ query: string, filters?: { category?: string, priority?: 'urgent' | 'preparedness' }, orderId?: string }`
   - Expected response: `{ products: [{ id, name, description, price, category, priority, utility, image, quantity, inStock }], message: string, filters: { category, priority }, timestamp: string }`
   - Integration: See `web/src/services/api.js` - `simulateRecommendation` function
   - Integration: See `web/src/components/ChatModal.jsx` and `web/src/components/RecommendChat.jsx`
   - Status: Mock data active, filters mockKits.js by category/priority, keyword parsing for natural language queries
   - Note: Supports hybrid queries (e.g., "recommend aid kits for my damaged order #123")

### Current Backend Port:

- Frontend proxy is configured for `localhost:5000`
- Update vite.config.js if backend runs on different port

### Offline Mode:

- Frontend includes offline fallbacks using mock data
- Set `{ offline: true }` in API calls to use mock responses

## Environment Variables:

- No .env file needed for frontend
- Backend integration will handle all API configurations

## Build Process:

```bash
npm run build    # Production build
npm run preview  # Preview production build
```

## Testing:

```bash
npm test         # Run test suite
npm run lint     # Check code quality
```

## Authentication Integration:

- Auth context available via `useAuth()` hook
- Token should be stored in auth context: `auth.token`
- **Auth Utilities** (`web/src/utils/auth.js`):
  - `getAuthToken()` - Retrieves token from localStorage (key: 'token')
  - `setAuthToken(token)` - Stores token in localStorage
  - `clearAuthToken()` - Removes token from localStorage
- **API Interceptor** (`web/src/services/api.js`):
  - Request interceptor automatically attaches `Authorization: Bearer ${token}` header to all API requests
  - Uses `getAuthToken()` from auth utilities
  - Token is read from localStorage 'token' key
- TODO: Add token refresh interceptor on 401 errors

## Orders & Tickets Integration:

### ViewOrders Component (`web/src/pages/ViewOrders.jsx`):

- **Loading States**: CircularProgress spinner with "Loading orders..." message
- **Error Handling**: Snackbar alerts for API errors, fallback to mock data
- **Empty State**: Card with message when no orders found
- **API Integration**:
  - `useEffect` hook fetches orders on mount (currently using mock data)
  - TODO: Replace `getOrders({ offline: true })` with `getOrders({ offline: false })`
  - Expected response shape documented in component comments

### Raise Issue Modal:

- **Form Data Structure**: `{ orderId, issueType, description, images: File[] }`
- **Image Upload**: Multiple file upload with preview grid, uses FormData for multipart
- **Submission**: `handleSubmitIssue` function ready for backend integration
- **Loading State**: Button shows spinner during submission
- **Success/Error**: Snackbar notifications for submission status
- TODO: Replace `createIssue(formData, { offline: true })` with `createIssue(formData, { offline: false })`

### ViewTickets Component (`web/src/pages/ViewTickets.jsx`):

- **Loading States**: CircularProgress spinner with "Loading tickets..." message
- **Error Handling**: Snackbar alerts for API errors, fallback to mock data
- **Empty State**: Card with message and link to Orders page
- **Filtering**: Status filter dropdown (All, Open, In Progress, Resolved)
- **Sorting**: Sortable columns (Ticket ID, Status, Created Date)
- **Debouncing**: 300ms debounce on filter changes (optional, can be removed if backend handles efficiently)
- **URL Params**: Placeholder for shareable filter/sort state (commented out)
- **API Integration**:
  - `useEffect` hook fetches tickets when filters/sort change
  - TODO: Replace `getTickets(filters, { offline: true })` with `getTickets(filters, { offline: false })`
  - Expected response shape documented in component comments

## FAB Chat (Phase 2):

### ChatFAB Component (`web/src/components/ChatFAB.jsx`):

- **Position**: Fixed FAB at bottom-left (20px on mobile, 24px on desktop)
- **Visibility**: Only shown when user is logged in (checks `auth` context)
- **Features**:
  - Blue FAB (56px circle) with chat icon
  - Optional unread badge (ready for backend integration)
  - Opens ChatModal on click
- **Status**: Integrated in App.jsx, visible post-login

### ChatModal Component (`web/src/components/ChatModal.jsx`):

- **Modal**: Responsive Dialog (max-width 600px desktop, full-screen mobile)
- **Header**: "Customer Support" with user greeting from AuthContext
- **Chat Area**:
  - Scrollable message bubbles (user: right/blue, AI: left/gray)
  - Mock chat history on open
  - Loading indicator during AI response ("AI Agent responding...")
  - Timestamp for each message
- **Input Features**:
  - Query type dropdown (Order Status, Report Fraud, General Inquiry)
  - Textarea for natural message input (Enter to send, Shift+Enter for new line)
  - Multi-file image upload with preview grid (similar to Raise Issue)
  - Submit button (disabled until input or images)
- **Quick Actions**:
  - "View Orders" button (routes to `/orders`)
  - "View Tickets" button (routes to `/tickets`)
- **AI Response Simulation**:
  - 1s delay to simulate API call
  - Parses message for orderId (e.g., ORD-001)
  - Simulates AI agent decision based on query type:
    - **Order Status Agent**: Provides order tracking info
    - **Fraud Detection Agent**: Analyzes images with OCR simulation, detects fraud, processes refunds
  - Returns action flags (`requiresAction`, `escalateToHuman`)
- **API Integration**:
  - FormData structure ready: `{ message, type, images: File[], orderId? }`
  - TODO: Replace `sendChatMessage(formData, { offline: true })` with `sendChatMessage(formData, { offline: false })`
  - Supports streaming responses (placeholder commented)
  - Expected response shape documented in component comments

### Chat API Service (`web/src/services/api.js`):

- **Function**: `sendChatMessage(chatData, options)`
- **Mock Responses**:
  - Order Status queries return tracking info
  - Fraud reports with images return OCR analysis simulation
  - Product Recommendation queries return aid kits suggestions
  - General inquiries return helpful responses
- **Integration**: See TODO comments for actual API call structure
- **Status**: Mock responses active, FormData ready for multipart upload

### Product Recommendation API Service (`web/src/services/api.js`):

- **Function**: `simulateRecommendation(query, filters, options)`
- **Features**:
  - Filters mockKits.js by category (Medical, Food & Water, Shelter, etc.) and priority (urgent/preparedness)
  - Keyword parsing for natural language queries (e.g., "shelter" → Shelter category, "urgent" → urgent priority)
  - Returns 3-5 matching aid kits with details (name, price, description, utility, etc.)
  - Hybrid flow support: Can combine with order status queries (e.g., "recommend aid kits for my damaged order #123")
- **Mock Data**: Uses `web/src/data/mockKits.js` with 22+ aid kits
- **Integration**: See TODO comments for actual API call structure
- **Status**: Mock recommendations active, filters and keyword parsing working

### Get Help Page (`web/src/components/RecommendChat.jsx`):

- **Dynamic Agent Selector Tabs**: Product Recommendation, Order Status, Report Fraud, General Inquiry
  - **Product Recommendation**: Lightbulb icon with tooltip "Suggest aid kits for urgent needs"
  - **Order Status**: Truck icon with tooltip "Track relief packages and shipments"
  - **Report Fraud**: Warning icon with tooltip "Report damaged goods and fraudulent transactions"
  - **General Inquiry**: Help icon with tooltip "Ask questions about ReliefConnect services"
- **Dynamic Tab-Specific Content**:
  - **Product Tab**: Quick needs buttons (only shown for recommendation), filterable Aid Kits Catalog with category/priority filters, auto-triggers recommendation on filter change
  - **Order Tab**: Quick check form with order ID input, "Check Status" button, links to View Orders/Tickets
  - **Fraud Tab**: Image upload zone (max 5MB per file), description field, "Submit Fraud Report" button, links to View Tickets
  - **General Tab**: FAQ search bar with debounce (300ms), searchable FAQ accordion with keyword matching, auto-expands matching FAQ
- **Smart Pre-filling**: On tab change, clears prior content and pre-fills input based on active tab (e.g., Order tab pre-fills "Enter order ID: ORD-")
- **Smooth Transitions**: MUI Fade transitions for tab content changes (300ms timeout)
- **Screen Reader Support**: aria-live announcements on tab change, dynamic aria-labels per tab
- **Multi-Agent Support**: Routes queries to appropriate agent based on selected tab
- **Integration**: Uses `simulateRecommendation` for aid kits, `sendChatMessage` for other agents
- **Status**: Streamlined unified interface active, all agents accessible from single page with dynamic content

## Error Boundary:

- **Component**: `web/src/components/ErrorBoundary.jsx`
- **Usage**: Integrated in `App.jsx` - wraps entire app for global error handling
- **Features**: Catches unhandled errors, displays user-friendly error message with "Try Again" and "Reload Page" options
- **Status**: ✅ Integrated and active

## Mock Data Organization:

- **Mock Orders**: `web/src/data/mockOrders.js` - Used by `ViewOrders.jsx` for fallback data
- **Mock Tickets**: `web/src/data/mockTickets.js` - Used by `ViewTickets.jsx` for fallback data
- **Mock Chat History**: `web/src/data/mockChatHistory.js` - Used by `ChatModal.jsx` for initial chat messages
- **Mock Kits**: `web/src/data/mockKits.js` - Aid kits catalog data (existing)
- All mock data files are imported where needed, keeping components clean

## Known Integration Points

The following table documents endpoint and payload format differences between frontend expectations and current backend implementation. These need to be coordinated during integration:

| Feature                 | Frontend Expectation                                                                                           | Backend Current                                                                             | Recommended Fix                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Get All Orders**      | `GET /api/orders` (no params, uses auth token from header)                                                     | `GET /api/order/all/:id` (requires user ID in URL)                                          | **Backend**: Accept user ID from auth token OR **Frontend**: Pass `auth.userid` to URL path                                                |
| **Get Tickets**         | `GET /api/tickets?status=...&sort=...&direction=...` (query params for filtering/sorting)                      | `GET /api/ticket/:id` (user ID in URL, no query params)                                     | **Backend**: Add query param support (`?status=...&sort=...&direction=...`) OR **Frontend**: Pass user ID and handle filtering client-side |
| **Create Issue/Ticket** | `POST /api/issues` or `POST /api/tickets` with `FormData` (multipart: orderId, issueType, description, images) | `POST /api/order/report` with JSON body (order, order_problem, issue_type, image as base64) | **Backend**: Add `/api/tickets` endpoint accepting FormData OR **Frontend**: Convert FormData to JSON with base64 images                   |
| **Chat Endpoint**       | `POST /api/chat` with `FormData` (message, type, images: File[], orderId?)                                     | `POST /api/chat` with JSON body (message, userId)                                           | **Backend**: Accept FormData and extract type/images OR **Frontend**: Convert FormData to JSON, extract userId from auth context           |

**Note**: All other endpoints (order creation, product search, product recommend, login, signup) are compatible. The frontend is ready with mock data fallbacks, so integration can proceed incrementally.

## Integration Checklist:

- [ ] Update `web/src/services/api.js`:

  - [x] ✅ Axios interceptor for token attachment (already implemented)
  - [ ] Add axios interceptor for token refresh on 401 errors
  - [x] ✅ `getAuthToken()` helper function implemented in `utils/auth.js`

- [ ] Update `web/src/pages/ViewOrders.jsx`:

  - [ ] Replace `getOrders({ offline: true })` with `getOrders({ offline: false })`
  - [ ] **Note**: See "Known Integration Points" - endpoint may need user ID in URL (`/api/order/all/:id`)
  - [ ] Replace `createIssue(formData, { offline: true })` with `createIssue(formData, { offline: false })`
  - [ ] **Note**: See "Known Integration Points" - endpoint is `/api/order/report` with JSON body, not FormData
  - [ ] Verify response structure matches expected shape
  - [ ] Test with real backend endpoints

- [ ] Update `web/src/pages/ViewTickets.jsx`:

  - [ ] Replace `getTickets(filters, { offline: true })` with `getTickets(filters, { offline: false })`
  - [ ] **Note**: See "Known Integration Points" - endpoint is `/api/ticket/:id` (user ID in URL), query params may not be supported
  - [ ] Uncomment URL params code for shareable state (optional)
  - [ ] Verify response structure matches expected shape
  - [ ] Test filtering and sorting with real backend

- [ ] Update `web/src/components/ChatModal.jsx`:

  - [ ] Replace `sendChatMessage(formData, { offline: true })` with `sendChatMessage(formData, { offline: false })`
  - [ ] **Note**: See "Known Integration Points" - backend expects JSON with `{ message, userId }`, not FormData
  - [ ] Implement streaming response handling if backend supports SSE/WebSocket
  - [ ] Verify AI agent routing works correctly (Order Status, Fraud Detection, Product Recommendation)
  - [ ] Test image upload and OCR analysis
  - [ ] Verify `escalateToHuman` flag triggers human agent handoff
  - [ ] Test aid kits recommendations and "Add to Package" functionality

- [ ] Update `web/src/components/RecommendChat.jsx`:

  - [ ] Replace `simulateRecommendation(query, filters, { offline: true })` with `simulateRecommendation(query, filters, { offline: false })`
  - [ ] Replace `sendChatMessage(chatData, { offline: true })` for other agents with real API calls
  - [ ] Verify dynamic tab switching and content rendering
  - [ ] Test tab-specific content (Product catalog filters, Order status form, Fraud upload, General FAQ search)
  - [ ] Verify tab change announcements for screen readers
  - [ ] Test debounced FAQ search (300ms) and keyword matching
  - [ ] Verify image upload validation (5MB limit) in Fraud tab
  - [ ] Test category filter auto-trigger for Product tab

- [ ] Update `web/src/services/api.js`:

  - [ ] Implement `simulateRecommendation` with real backend endpoint
  - [ ] Enhance `sendChatMessage` to handle Product Recommendation type
  - [ ] Verify keyword parsing and filtering logic matches backend expectations

- [ ] Update Auth Context (`web/src/utils/authContext.jsx`):

  - [ ] Store token in auth state: `{ userid, token }` (currently only stores `userid`)
  - [ ] Expose token via `auth.token` for API calls (currently token is in localStorage via `utils/auth.js`)
  - [ ] **Note**: Current implementation uses localStorage 'token' key via `getAuthToken()` - this works but token should also be in auth context for consistency

- [ ] Test Integration:
  - [ ] Verify orders load correctly
  - [ ] Verify issue submission works with images
  - [ ] Verify tickets load with filters
  - [ ] Verify chat FAB appears only when logged in
  - [ ] Verify chat messages send and receive AI responses
  - [ ] Verify order status queries work with order IDs
  - [ ] Verify fraud detection with image uploads
  - [ ] Verify product recommendations return aid kits correctly
  - [ ] Verify aid kits can be added to relief package from chat
  - [ ] Verify Get Help page agent selector tabs work correctly
  - [ ] Verify aid kits catalog filtering (category/priority) works
  - [ ] Verify hybrid queries (e.g., "recommend aid kits for order #123") work
  - [ ] Verify "View Orders" and "View Tickets" buttons navigate correctly
  - [ ] Verify error handling displays appropriate messages
  - [ ] Verify loading states appear during API calls

## Notes for Integration:

- All components are fully functional with mock data
- Loading states (CircularProgress) implemented for all API calls
- Error handling (Snackbar alerts) implemented for all API calls
- Empty states implemented with user-friendly messages
- Form data structures documented in component comments
- Expected backend response shapes documented in component comments
- Responsive design ready for all devices
- Accessibility features implemented
- Mock data remains active until backend integration is complete
- FAB Chat (Phase 2) implemented with Order Status, Fraud Detection, and Product Recommendation AI agents
- Chat FAB positioned bottom-left (opposite cart FAB on bottom-right)
- Modal chat interface with message bubbles, image upload, and AI response simulation
- Product Recommendation sync with Phase 1: Aid kits recommendations from mockKits.js
- Get Help page unified with agent selector tabs and aid kits catalog
- Hybrid queries supported: Can combine recommendation with order status (e.g., "recommend aid kits for my damaged order #123")
- All agents accessible from both Chat FAB modal and Get Help page (/recommend)
