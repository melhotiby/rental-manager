# 🏠 Rental Property Manager

A comprehensive Next.js application for managing rental properties, tracking monthly bills, analyzing cash flow, and calculating ROI. Built with TypeScript, Chakra UI, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Node](https://img.shields.io/badge/Node-24-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Key Features](#key-features)
- [Adding New Features](#adding-new-features)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### 📊 Financial Tracking

- **Monthly Cash Flow View**: Track income, expenses, and net cash flow month-by-month
- **Yearly Overview**: Annual financial performance with monthly breakdown
- **ROI Analysis**: Calculate return on investment for each rental property
- **Mortgage Impact Analysis**: See projected ROI after mortgage payoff

### 🏘️ Property Management

- Multiple property support with individual tracking
- Property valuation and performance metrics
- Distinction between rental properties and primary residence
- Management fee and expense tracking

### 💰 Bill Management

- Recurring bills (monthly, annual, quarterly, semi-annual)
- One-time expenses and repairs
- Payment tracking and status
- Property-specific bill assignment
- Mortgage escrow tracking (separate P&I from taxes/insurance)

### 📈 Analytics

- Net cash flow calculations
- Property performance ratings (Excellent, Good, Fair, Below Target, Loss)
- ROI benchmarking against CD rates
- Total asset valuation
- Profit margin analysis

## 🔧 Prerequisites

- **Node.js 24.x** (managed via nvm)
- **PostgreSQL** (any recent version)
- **npm, yarn, pnpm, or bun** (package manager)

## 📥 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rental-manager
```

### 2. Set Node Version

This project uses Node 24. Use nvm to automatically switch to the correct version:

```bash
# Install nvm if you haven't already
# https://github.com/nvm-sh/nvm

# Use the specified Node version
nvm use

# If Node 24 isn't installed yet:
nvm install 24
nvm use 24
```

The `.nvmrc` file in the project root will ensure you're always on the correct Node version.

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## 🗄️ Database Setup

### 1. Create Database

```bash
# Create the PostgreSQL database
createdb rental_manager
```

### 2. Initialize Database Schema

Run the initial schema creation:

```bash
npm run db:init
# or directly with psql:
psql rental_manager < scripts/init-db.sql
```

This creates all necessary tables:

- `properties` - Your rental properties and primary residence
- `recurring_bills` - Recurring expenses (monthly, annual, etc.)
- `property_expenses` - Property-specific expenses
- `payment_tracking` - Track which bills have been paid each month

### 3. Apply Migrations (if updating existing database)

If you're updating an existing database, run these migrations in order:

```bash
# Add ROI tracking fields (is_rental, purchase_price)
psql rental_manager < migration-add-roi-fields.sql

# Add escrow tracking for mortgages
psql rental_manager < migration-add-escrow-amount.sql
```

### 4. Configure Database Connection

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/rental_manager
```

Replace `username` and `password` with your PostgreSQL credentials.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

The page auto-reloads when you edit files.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Drop and recreate database (⚠️ DELETES ALL DATA)
dropdb rental_manager
createdb rental_manager
npm run db:init
```

## 📁 Project Structure

```
rental-manager/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main monthly view (dashboard)
│   │   ├── yearly/
│   │   │   └── page.tsx             # Yearly cash flow & ROI analysis
│   │   ├── layout.tsx               # Root layout with Chakra UI provider
│   │   └── api/
│   │       ├── properties/
│   │       │   └── route.ts         # Properties CRUD API
│   │       ├── recurring-bills/
│   │       │   └── route.ts         # Bills CRUD API
│   │       └── payment-tracking/
│   │           └── route.ts         # Payment tracking API
│   └── lib/
│       └── db.ts                    # PostgreSQL connection pool
├── scripts/
│   ├── init-db.sql                  # Initial database schema
│   ├── migration-add-roi-fields.sql # ROI feature migration
│   └── migration-add-escrow-amount.sql # Escrow tracking migration
├── .nvmrc                           # Node version specification
├── package.json
└── README.md
```

## 🛣️ Routes

### Main Routes

| Route     | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| `/`       | **Monthly Dashboard** - Track current month's income, bills, and payments |
| `/yearly` | **Yearly Overview** - Annual cash flow analysis and property ROI          |

### API Routes

| Endpoint                | Methods                  | Description                         |
| ----------------------- | ------------------------ | ----------------------------------- |
| `/api/properties`       | GET, POST, PATCH, DELETE | Manage rental properties            |
| `/api/recurring-bills`  | GET, POST, PATCH, DELETE | Manage recurring bills and expenses |
| `/api/payment-tracking` | GET, POST                | Track bill payment status by month  |

## 🎯 Key Features

### Monthly View (`/`)

**Header:**

- Current month navigator (previous/next)
- Net cash flow for the month
- "View Yearly" button

**Summary Cards:**

- Total rental income
- Management fees & expenses
- Total bills due
- Payment completion status

**Payment Checklist:**

- List of all bills due this month
- Checkbox to mark as paid
- Bill categorization and property assignment
- Payment links
- "Mark All as Paid" bulk action

**Property Management:**

- Add/edit properties
- Track monthly rent, management fees, HOA
- Mark properties as paid off or primary residence
- Set home value for ROI calculations

### Yearly View (`/yearly`)

**Annual Summary:**

- Total income, management, bills, and net for the year
- Average monthly net income
- Profit margin percentage

**Monthly Breakdown Table:**

- All 12 months with income/expenses/net
- Color-coded by profitability
- Annual totals row

**Property Performance & ROI:**

- **Rental Properties Section:**
  - Current ROI % (with mortgage)
  - ROI (No Mortgage) % - future potential
  - Performance rating
  - Annual income and expenses breakdown
- **Primary Residence Section:**
  - Home value
  - Annual bills
  - Marked as non-income-generating
- **Total Assets Summary:**
  - Combined property values
  - Number of properties
  - Paid-off property count

**ROI Calculation:**

```
Current ROI = (Annual Net Income ÷ Home Value) × 100

ROI (No Mortgage) = ((Annual Income - Expenses - Bills + P&I) ÷ Home Value) × 100
```

Where P&I is the principal & interest portion of mortgage payments (excludes taxes/insurance).

## 🔨 Adding New Features

### Adding a New Property Field

1. **Update Database:**

```sql
ALTER TABLE properties ADD COLUMN new_field VARCHAR(255);
```

2. **Update Interface** (`src/app/page.tsx`):

```typescript
interface Property {
  // ... existing fields
  new_field: string
}
```

3. **Add Form Field:**

```tsx
<Input
  value={newFieldValue}
  onChange={(e) => setNewFieldValue(e.target.value)}
/>
```

4. **Update API Route** (`src/app/api/properties/route.ts`):

```typescript
const { new_field } = body
// Add to INSERT/UPDATE queries
```

### Adding a New Bill Category

Edit `src/app/page.tsx`:

```tsx
<Select value={billCategory} onChange={(e) => setBillCategory(e.target.value)}>
  <option value="new_category">New Category</option>
</Select>
```

### Creating a New Page

1. Create folder in `src/app/`:

```bash
mkdir src/app/reports
```

2. Add `page.tsx`:

```tsx
export default function Reports() {
  return <div>Reports Page</div>
}
```

3. Route automatically available at `/reports`

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
4. Deploy

### Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://username:password@host:5432/rental_manager
NODE_ENV=production
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: `relation "properties" does not exist`**

```bash
# Run the database initialization
psql rental_manager < scripts/init-db.sql
```

**Error: `password authentication failed`**

- Check your `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running: `pg_isready`
- Check PostgreSQL user permissions

### Node Version Issues

**Error: Syntax errors or unexpected behavior**

```bash
# Ensure you're using Node 24
nvm use 24
node --version  # Should show v24.x.x
```

### Build Issues

**Error: Module not found**

```bash
# Clear cache and reinstall
rm -rf node_modules
rm -rf .next
npm install
```

### Migration Issues

**Error: `column already exists`**

- The migration was already applied
- Check current schema: `\d properties` in psql
- Skip to next migration if needed

## 📊 Database Schema Overview

### Properties Table

- Basic info (name, address)
- Financial data (rent, management %, HOA)
- ROI tracking (home value, is_rental, is_paid_off)

### Recurring Bills Table

- Bill details (name, amount, frequency)
- Property assignment
- Category (mortgage, taxes, insurance, etc.)
- Escrow tracking for mortgages
- One-time expense support

### Payment Tracking Table

- Monthly payment status
- Bill type and reference
- Payment date and amount
- Notes

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the database schema in `scripts/init-db.sql`
3. Check API routes in `src/app/api/`

---

**Built with ❤️ using Next.js, TypeScript, Chakra UI, and PostgreSQL**
