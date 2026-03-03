# CTO Dashboard

A comprehensive executive-level monitoring and analytics platform that provides real-time visibility into organizational technology performance, operational efficiency, and business impact.

## ✨ Features

### Core Dashboards
- **Infrastructure Monitoring**: Real-time server health, CPU, memory, disk, and network metrics
- **API Performance Tracking**: Success rates, latency monitoring, and error categorization
- **Application Performance**: Crash rates, page load times, and device-specific analytics
- **Business Cost Analysis**: Cost per order tracking and optimization recommendations
- **AI Department Metrics**: Model performance, training costs, and deployment success rates
- **QA Department Tracking**: Test coverage, defect rates, and release quality metrics
- **Business Analytics**: Data pipeline health and reporting performance
- **Data Integration**: Multi-vendor integration management with 10+ supported platforms

### Advanced Features
- **Real-time Alerting**: Customizable thresholds and multi-severity notifications
- **Interactive Visualizations**: Drill-down capabilities with Chart.js
- **Vendor Integrations**: Support for Prometheus, Datadog, New Relic, AWS CloudWatch, and more
- **User Authentication**: Secure login with Supabase (optional)
- **Multi-tenant Support**: Row-level security and data isolation
- **Real-time Updates**: WebSocket-based live data synchronization
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile, tablet, and desktop optimized

## 🚀 Quick Start

### Option 1: Demo Mode (No Setup Required)

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Open http://localhost:3000 - The app runs with mock data and localStorage.

### Option 2: Production Mode (With Supabase)

1. Create a Supabase project at https://supabase.com
2. Run the database schema from `supabase/schema.sql`
3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Add your Supabase credentials to `.env.local`
5. Start the server:
   ```bash
   yarn dev
   ```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running quickly
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Complete database configuration
- **[Data Integration Guide](./DATA_INTEGRATION_GUIDE.md)** - Vendor integration details
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical architecture
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[Changes Summary](./CHANGES_SUMMARY.md)** - Recent updates

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React Chart.js 2
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Package Manager**: Yarn
- **Testing**: Vitest with fast-check

## 📦 Project Structure

```
cto-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Home/Overview
│   │   ├── infrastructure-performance/
│   │   ├── api-performance/
│   │   ├── app-performance/
│   │   ├── business-cost/
│   │   ├── ai-performance/
│   │   ├── qa-performance/
│   │   ├── business-analytics/
│   │   ├── data-integration/
│   │   ├── alerts/
│   │   └── settings/
│   ├── components/            # React components
│   │   ├── layout/           # Navbar, Layout
│   │   ├── infrastructure/   # Infrastructure widgets
│   │   ├── api/             # API widgets
│   │   ├── app/             # App widgets
│   │   ├── business/        # Business widgets
│   │   ├── ai/              # AI widgets
│   │   ├── qa/              # QA widgets
│   │   ├── analytics/       # Analytics widgets
│   │   ├── alerts/          # Alert components
│   │   └── integration/     # Integration components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Library code
│   │   └── supabase/       # Supabase client
│   ├── mock/                # Mock data generators
│   ├── services/            # Business logic
│   └── types/               # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
├── .env.local.example       # Environment template
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server

# Code Quality
yarn lint             # Run ESLint
yarn type-check       # TypeScript type checking
yarn format           # Format with Prettier

# Testing
yarn test             # Run tests
yarn test:watch       # Run tests in watch mode
yarn test:ui          # Run tests with UI
```

## 🔌 Supported Integrations

- **Prometheus** - Open-source monitoring
- **New Relic** - Full-stack observability
- **Datadog** - Monitoring and analytics
- **Grafana** - Analytics and monitoring
- **Splunk** - Data platform
- **Elasticsearch** - Search and analytics
- **AWS CloudWatch** - AWS monitoring
- **Azure Monitor** - Azure monitoring
- **Google Cloud Monitoring** - GCP monitoring
- **Custom API** - Custom REST API integration

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level data isolation
- **User Authentication**: Secure login with Supabase Auth
- **Multi-tenant Architecture**: Complete data separation between users
- **Encrypted Credentials**: Secure storage of vendor API keys
- **Audit Logging**: Track all user actions
- **Session Management**: Automatic token refresh and expiration

## 🎨 Features by Mode

### Demo Mode (Default)
✅ Full UI functionality
✅ Mock data generation
✅ localStorage persistence
✅ No authentication required
✅ Perfect for testing

### Production Mode (Supabase)
✅ User authentication
✅ Database storage
✅ Real-time updates
✅ Multi-tenant support
✅ Secure credentials
✅ Audit logging
✅ Row-level security

## 🧪 Testing

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# With UI
yarn test:ui
```

Test coverage includes:
- Unit tests for services
- Component tests
- Property-based tests
- Integration tests

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t cto-dashboard .
docker run -p 3000:3000 cto-dashboard
```

### Manual

```bash
yarn build
yarn start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

Private project - All rights reserved

## 🆘 Support

For issues and questions:
- Check the [documentation](./QUICK_START.md)
- Review [troubleshooting guide](./SUPABASE_SETUP.md#troubleshooting)
- Open an issue with details

## 🎯 Roadmap

- [ ] Authentication UI (login/signup pages)
- [ ] Real vendor API integrations
- [ ] Email/SMS alert notifications
- [ ] Custom dashboard builder
- [ ] Data export functionality
- [ ] Team and organization management
- [ ] Advanced analytics and reporting
- [ ] Mobile app
- [ ] Webhook integrations

## 📊 Screenshots

*Coming soon*

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [Heroicons](https://heroicons.com/)