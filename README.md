# eShop - Modern E-commerce Platform

A production-ready e-commerce platform built with Next.js, MongoDB, and Tailwind CSS. Complete shopping experience with authentication, payments, reviews, and powerful admin tools.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)

## ✨ Features

### Customer Experience
- **Authentication** - Email verification, OAuth (Google, GitHub), profile with photo upload
- **Shopping** - Product search, filters, categories, mega menu, wishlist, compare products
- **Cart & Checkout** - Multi-step checkout, PayPal payment, order tracking
- **Reviews** - Rate products, write reviews, helpful votes
- **Discounts** - Welcome coupons, newsletter subscription with discount codes
- **Notifications** - Real-time stock alerts, email notifications
- **Multi-currency** - Live exchange rates, responsive design, dark mode

### Admin Dashboard
- **Analytics** - Sales charts, statistics, revenue tracking
- **Products** - CRUD operations, Cloudinary image uploads, category management
- **Orders** - Status updates, delivery tracking, payment management
- **Users** - User management, role-based access control
- **Marketing** - Coupon management, newsletter subscribers, review moderation
- **Settings** - Site-wide configuration, stock notification system

### Technical Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js, WebSocket
- **Database**: MongoDB with Mongoose
- **Services**: Cloudinary (images), PayPal (payments), Nodemailer (emails)
- **Features**: Real-time updates, SEO optimized, skeleton loaders, security best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (optional)
- PayPal Developer account (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/aklilumengesha/eshop-ecommerce.git
cd eshop

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Environment Variables

| Variable | Description | Get From |
|----------|-------------|----------|
| `MONGODB_URL` | MongoDB connection string | [MongoDB Atlas](https://mongodb.com/cloud/atlas) |
| `NEXTAUTH_SECRET` | Auth secret key | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` (dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Console](https://console.cloud.google.com) |
| `GITHUB_ID` | GitHub OAuth | [GitHub Settings](https://github.com/settings/developers) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary name | [Cloudinary](https://cloudinary.com) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal ID | [PayPal Developer](https://developer.paypal.com) |
| `EMAIL_USER` | Email for notifications | Your Gmail |
| `EMAIL_PASSWORD` | Gmail app password | [Google App Passwords](https://myaccount.google.com/apppasswords) |

See `.env.local.example` for complete list.

## � Deployment

Detailed deployment guide available in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Quick Deploy to Vercel:**
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## 📂 Project Structure

```
eshop/
├── components/      # React components (Layout, ProductItem, etc.)
├── models/          # MongoDB schemas (User, Product, Order, etc.)
├── pages/
│   ├── api/        # API endpoints
│   ├── admin/      # Admin dashboard pages
│   └── ...         # Customer pages
├── utils/           # Helper functions (db, email, etc.)
├── public/          # Static assets
└── styles/          # Global CSS
```

## 🛠️ Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📸 Screenshots

- **Homepage**: Product showcase, categories, testimonials
- **Product Page**: Details, reviews, similar products
- **Cart & Checkout**: Multi-step process with payment
- **Admin Dashboard**: Analytics, product/order management
- **Profile**: User info, order history, photo upload

## 🔒 Security

- Password hashing with bcrypt
- JWT tokens for authentication
- CSRF protection
- Input validation and sanitization
- Secure environment variables
- Rate limiting on API routes

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Developer

**Aklilu Mengesha**

## 📧 Contact Developer

For questions, support, or collaboration:
- Email: [aklilumengesha57@gmail.com](mailto:aklilumengesha57@gmail.com)
- GitHub: [@aklilumengesha](https://github.com/aklilumengesha)

---

⭐ Star this repo if you find it helpful!
