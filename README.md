# 🎉 ASEGO Travel Insurance - Complete Setup

## ✅ Everything is Ready!

This app now includes:
- ✅ Payment gateway (Razorpay) integration
- ✅ CORS fix with proxy server
- ✅ Encryption API working
- ✅ Policy creation flow
- ✅ Success page with payment details

---

## 🚀 Quick Start (30 Seconds)

### Option 1: Easy Way (Windows)
Just double-click: **`START_APP.bat`**

This will automatically start both servers!

### Option 2: Manual Way

**Terminal 1 - Proxy Server:**
```bash
cd server
npm install  # First time only
npm start
```

**Terminal 2 - React App:**
```bash
cd Frone
npm install  # First time only
npm run dev
```

---

## ⚙️ Configuration Needed

### 1. Environment Variables Setup

Copy the example file and configure your credentials:
```bash
cd Frone
cp .env.example .env
```

Edit: `Frone/.env`
```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE

# ASEGO API Credentials
VITE_ASEGO_PARTNER_ID=your_partner_id_here
VITE_ASEGO_SIGN=your_sign_here
VITE_ASEGO_REFERENCE=your_reference_here
VITE_ASEGO_ENCRYPTION_KEY=your_encryption_key_here
VITE_ASEGO_INIT_VECTOR=your_init_vector_here
```

**Get your Razorpay key:**
1. Sign up: https://dashboard.razorpay.com/
2. Settings → API Keys
3. Generate Test Key
4. Copy Key ID

**Get your ASEGO credentials:**
- Contact ASEGO support for:
  - Partner ID
  - Sign
  - Reference
  - Encryption Key
  - Init Vector

### 2. Restart After Config Change

After updating `.env`, restart the React server:
- Stop: Ctrl + C
- Start: `npm run dev`

---

## 🎯 Complete User Flow

```
1. Category Selection → Select travel destination type
2. Choose Plan → Pick insurance plan
3. Add-ons Selection → Add riders (optional)
4. Traveler Details → Fill personal info
5. Review Summary → Verify all details
   ↓
6. Proceed to Payment → Razorpay checkout opens
   ↓
7. Enter Payment Details → Card/UPI/Netbanking
   ↓
8. Payment Success → Auto creates policy
   ↓
9. Success Page → Shows policy number + payment ID
```

---

## 🧪 Test Payment

Use Razorpay test cards:

| Purpose | Card Number | CVV | Expiry |
|---------|-------------|-----|--------|
| ✅ Success | 4111 1111 1111 1111 | Any | Future |
| ❌ Failure | 4000 0000 0000 0002 | Any | Future |

---

## 📁 Project Structure

```
asego/
├── Frone/                    # React Frontend
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Helper functions
│   ├── .env                 # Environment variables
│   └── package.json
│
├── server/                   # Proxy Server
│   ├── server.js            # Express proxy
│   └── package.json
│
├── START_APP.bat            # Easy startup script
├── CORS_FIX_GUIDE.md        # CORS solution guide
├── RAZORPAY_SETUP.md        # Payment setup guide
└── README.md                # This file
```

---

## 🔧 How It Works

### Payment Flow
```
User clicks "Proceed to Payment"
    ↓
Razorpay checkout opens (₹ amount shown)
    ↓
User enters payment details
    ↓
Payment processed by Razorpay
    ↓
On success: Auto-create policy
    ↓
Show success page with policy + payment details
```

### API Flow (CORS Fixed)
```
React App (localhost:5173)
    ↓
Proxy Server (localhost:3001)
    ↓
ASEGO API (dolphin.asego.in)
    ↓
Response back through proxy
    ↓
React App receives data
```

---

## ✅ Features

### Payment Integration
- ✅ Razorpay checkout integration
- ✅ Pre-filled customer details
- ✅ Multiple payment methods (Card, UPI, Netbanking)
- ✅ Payment success handling
- ✅ Payment failure retry
- ✅ Auto policy creation after payment
- ✅ Payment details on success page

### Insurance Features
- ✅ Multi-step form flow
- ✅ Plan selection with pricing
- ✅ Add-on/Rider selection
- ✅ Traveler details collection
- ✅ Review before payment
- ✅ Policy PDF download

### Technical Features
- ✅ CORS handling with proxy
- ✅ Encryption API integration
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Form validations

---

## 🚨 Troubleshooting

### Issue: CORS Error
**Solution**: Make sure proxy server is running on port 3001
```bash
cd server
npm start
```

### Issue: Payment not opening
**Solution**: 
1. Check Razorpay key in `.env` file
2. Restart React server after updating `.env`
3. Check browser console for errors

### Issue: "ECONNREFUSED localhost:3001"
**Solution**: Proxy server not running. Start it first!

### Issue: Policy creation fails after payment
**Solution**: Check console logs for encryption API errors

---

## 📊 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| React App | 5173 | http://localhost:5173 |
| Proxy Server | 3001 | http://localhost:3001 |
| ASEGO API | - | https://dolphin.asego.in |

---

## 🔐 Security Notes

- ✅ All credentials stored in `.env` file
- ✅ `.env` file in `.gitignore` (not committed to git)
- ✅ `.env.example` provided for reference
- ✅ Never commit API keys or credentials
- ✅ Use test keys in development
- ✅ Switch to live keys in production
- ✅ Proxy server handles CORS securely

---

## 📚 Documentation Files

- **`START_HERE.md`** - Quick Razorpay setup
- **`RAZORPAY_SETUP.md`** - Detailed payment guide
- **`RAZORPAY_INTEGRATION.md`** - Technical integration docs
- **`PAYMENT_FLOW.md`** - Visual flow diagrams
- **`CORS_FIX_GUIDE.md`** - CORS solution explained

---

## 🎯 Production Deployment

### 1. Deploy Proxy Server
- Deploy `server/` folder to Heroku/AWS/Vercel
- Get production URL (e.g., `https://your-api.herokuapp.com`)

### 2. Update React App
Update environment variables in `Frone/.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
VITE_ASEGO_API_BASE_URL=https://your-api.herokuapp.com/api
```

### 3. Deploy React App
Deploy `Frone/` folder to Vercel/Netlify

---

## ✨ You're All Set!

1. **Copy** `.env.example` to `.env` in `Frone/` folder
2. **Configure** all credentials in `.env` file
3. **Double-click** `START_APP.bat` to start both servers
4. **Open browser** to http://localhost:5173
5. **Test the flow** with test payment card
6. **See the magic** happen! 🎉

---

## 📞 Need Help?

Check these files for detailed guides:
- Payment setup: `START_HERE.md`
- CORS issues: `CORS_FIX_GUIDE.md`
- Flow diagrams: `PAYMENT_FLOW.md`

---

**Happy Testing! 🚀**
