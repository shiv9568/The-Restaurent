# Google Maps Integration Setup Guide

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for map display)
   - **Places API** (for address autocomplete)
   - **Directions API** (for route display)
   - **Geocoding API** (for address to coordinates conversion)

4. Create API credentials:
   - Go to "Credentials" section
   - Click "Create Credentials" → "API Key"
   - Copy your API key

5. Restrict your API key (recommended):
   - Click on your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add: `localhost:*` and your production domain
   - Under "API restrictions", select "Restrict key" and choose the APIs above

## Step 2: Add API Key to Environment Variables

Create/update your `.env` file in the root directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Create/update your `server/.env` file:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** Add `.env` to `.gitignore` to keep your API key secure!

## Step 3: Install Required Packages

```bash
# Install Google Maps React library
npm install @vis.gl/react-google-maps

# Or if using alternative
npm install @react-google-maps/api
```

## Step 4: Update HTML (Optional)

If you need to load Google Maps script directly, add to `index.html`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry"></script>
```

## Features Implemented

### 1. **Address Picker with Map**
- Interactive map for selecting delivery address
- Drag marker to precise location
- Reverse geocoding to get address from coordinates
- Integrated in Profile page address management

### 2. **Live Delivery Tracking**
- Real-time order tracking with map
- Shows restaurant and delivery locations
- Displays route between restaurant and customer
- Animated delivery person marker

### 3. **Google Places Autocomplete**
- Smart address suggestions as you type
- Automatic form filling with selected address
- Validates addresses before saving

### 4. **Restaurant Location Display**
- Shows restaurant location on map
- Get directions link
- Distance calculation

## Usage Examples

### In Profile Page
When adding an address, users can:
- Type address (with autocomplete)
- Click on map to select location
- Drag marker to adjust
- See live coordinates

### In Order Tracking
Users see:
- Restaurant location (blue marker)
- Delivery location (red marker)
- Delivery route (blue line)
- Estimated delivery time
- Live driver location (animated)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all keys
3. **Restrict API key** by domain and API type
4. **Monitor usage** in Google Cloud Console
5. **Set billing alerts** to avoid unexpected charges

## Free Tier Limits

Google Maps provides free tier:
- **$200 free credit per month**
- Enough for ~28,000 map loads
- ~17,000 autocomplete requests
- Perfect for small to medium apps

## Troubleshooting

### Map not showing?
- Check if API key is correct in `.env`
- Ensure Maps JavaScript API is enabled
- Check browser console for errors
- Verify billing is enabled in Google Cloud

### Autocomplete not working?
- Enable Places API in Google Cloud
- Check `libraries=places` parameter
- Verify API key restrictions

### "RefererNotAllowedMapError"?
- Add your domain to API key restrictions
- For localhost: add `localhost:*` and `http://localhost:*`

## Cost Optimization Tips

1. **Enable caching** for map tiles
2. **Use static maps** where possible
3. **Limit autocomplete** requests with debouncing
4. **Disable unused features** (Street View, etc.)
5. **Monitor usage** regularly

## Support

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)

