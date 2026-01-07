# Deployment Setup Guide

## Frontend Configuration

### Step 1: Set Environment Variable

Create a `.env` file in the `car-db-frontend/` directory:

```env
VITE_API_URL=https://your-backend-api-url.com
```

**Examples:**
- Local: `VITE_API_URL=http://localhost:3000`
- Staging: `VITE_API_URL=https://staging-api.yourapp.com`
- Production: `VITE_API_URL=https://api.yourapp.com`

### Step 2: Build for Production

```bash
cd car-db-frontend
npm run build
```

### Step 3: Deploy

The built files will be in the `dist/` directory. Deploy these to your hosting service.

## Popular Hosting Platforms

### Vercel
1. Connect your GitHub repository
2. Set environment variable: `VITE_API_URL=your-backend-url`
3. Deploy

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variable: `VITE_API_URL=your-backend-url`

### AWS S3 + CloudFront
1. Build the app
2. Upload `dist/` contents to S3 bucket
3. Configure CloudFront distribution
4. Set environment variable before build

## Backend Configuration

Ensure your backend allows CORS from your frontend domain:

```javascript
// In your backend (e.g., Express)
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

## Important Notes

1. **Environment Variables**: Always set `VITE_API_URL` before building
2. **Credentials**: The axios instance includes `withCredentials: true` for cookies
3. **CORS**: Backend must allow credentials and specify allowed origins
4. **HTTPS**: In production, both frontend and backend should use HTTPS

## Troubleshooting

### Issue: API calls return 404
**Solution**: Verify `VITE_API_URL` is set correctly and includes protocol (http/https)

### Issue: CORS errors
**Solution**: Check backend CORS configuration allows your frontend domain

### Issue: Authentication fails
**Solution**: Ensure backend accepts credentials and cookies are not blocked

## Testing Deployment

1. Test in production mode locally first:
```bash
npm run build
npm run preview
```

2. Check browser console for API errors
3. Verify network tab shows correct API URL
4. Test authentication flow completely
