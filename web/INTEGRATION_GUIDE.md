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

## Notes for Integration:

- All components are fully functional with mock data
- Responsive design ready for all devices
- Accessibility features implemented
- Error handling and loading states included
