# Tomo Split - Full-Stack Expense Splitting App

## 🚀 Features

- **Real-time Updates**: See expenses added by other group members instantly
- **User Management**: No sign-up required - just enter your name
- **Encrypted Payloads**: All data is encrypted for security
- **Group Management**: Create groups and invite friends via links
- **Mobile Responsive**: Works perfectly on desktop and mobile
- **Yellow & Black Theme**: Beautiful, modern design

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-neondb-connection-string"

# Encryption Key (change this in production)
ENCRYPTION_KEY="tomo-split-secure-key-2024-change-this"

# Base URL for invite links
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

## 🔐 Security Features

- **Payload Encryption**: All API requests/responses are encrypted
- **User ID Generation**: Unique IDs generated for each user
- **No Authentication Required**: Simple name-based system
- **Real-time Security**: Encrypted real-time updates

## 📱 How It Works

1. **Create Group**: Enter group name and your name
2. **Share Invite Link**: Get a unique link to share with friends
3. **Add Expenses**: Enter expense details and your name
4. **Real-time Updates**: See expenses instantly across all devices
5. **Track Balances**: View who owes what in real-time

## 🌐 Deployment

For production deployment:

1. Update `NEXT_PUBLIC_BASE_URL` to your domain
2. Change `ENCRYPTION_KEY` to a secure random string
3. Deploy to Vercel, Netlify, or your preferred platform

## 🔧 API Endpoints

- `POST /api/users` - Create/find user (encrypted)
- `POST /api/groups` - Create group (encrypted)
- `POST /api/expenses` - Add expense (encrypted)
- `GET /api/realtime/[groupId]` - Real-time updates

## 📊 Database Schema

- **Users**: Name, email, unique ID
- **Groups**: Name, description, members
- **Expenses**: Title, amount, paid by, splits
- **Splits**: User, amount, paid status

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Real-time Indicators**: Live connection status
- **Smooth Animations**: Framer Motion animations
- **Dark Mode**: Automatic theme switching
- **Toast Notifications**: Real-time expense alerts
