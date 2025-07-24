# 🏥 Kenyan Pharmacy AI System

A comprehensive AI-enabled pharmacy services and inventory management system specifically designed for Kenyan pharmacies. This system integrates voice assistance, intelligent inventory management, and advanced analytics to modernize pharmacy operations.

## 🌟 Features

### 🎤 AI-Powered Voice Assistant
- **Natural Language Processing**: Ask questions in plain English or Swahili
- **Voice Commands**: "Check stock for Paracetamol", "Show me expiring products"
- **Intelligent Responses**: Context-aware answers with actionable insights
- **Integration**: Seamlessly integrated with all system modules

### 📊 Comprehensive Inventory Management
- **Real-time Stock Tracking**: Live inventory updates with automatic alerts
- **Expiry Management**: Automated tracking and notifications for expiring products
- **Low Stock Alerts**: Intelligent reordering suggestions
- **Batch Management**: Track products by batch numbers and expiry dates

### 💰 Advanced Sales & POS System
- **Point of Sale**: Modern, intuitive sales interface
- **Multiple Payment Methods**: Cash, M-Pesa, Card, Bank Transfer, Insurance
- **Receipt Generation**: Professional receipts with QR codes
- **Sales Analytics**: Detailed sales reports and trends

### 📈 Business Intelligence & Analytics
- **Real-time Dashboards**: Key performance indicators and metrics
- **Sales Trends**: Historical analysis and forecasting
- **Inventory Reports**: Stock levels, turnover rates, and optimization
- **Financial Analytics**: Revenue tracking and profitability analysis

### 🔒 Security & Compliance
- **Role-based Access Control**: Granular permissions system
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: Secure data storage and transmission
- **Regulatory Compliance**: Meets Kenyan pharmacy regulations

### 🌐 Modern Technology Stack
- **Backend**: Node.js + Express + PostgreSQL + Prisma
- **Frontend**: React + Tailwind CSS + Vite
- **AI**: OpenAI GPT-4 + LangChain + Vector Database
- **Real-time**: WebSocket integration for live updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Git

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/your-repo/kenyan-pharmacy-ai-system.git
cd kenyan-pharmacy-ai-system
```

2. **Install Dependencies**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

5. **Start the Application**
```bash
# Development mode (runs both server and client)
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs

### Default Login Credentials
```
Email: admin@pharmacy.co.ke
Password: admin123
Role: ADMIN
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│   Express API    │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   AI Services    │    │   Vector DB     │
│   (Real-time)   │    │   (OpenAI/LC)    │    │   (ChromaDB)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📱 User Roles & Permissions

### 👑 Admin
- Full system access
- User management
- System configuration
- All reports and analytics

### 💊 Pharmacist
- Complete inventory management
- Sales processing
- Order management
- Knowledge base access
- Report generation

### 🔬 Pharmacy Technician
- Inventory management
- Product handling
- Sales assistance
- Basic reporting

### 💰 Cashier
- Sales processing
- Basic inventory viewing
- Customer transactions

### 📦 Inventory Manager
- Advanced inventory control
- Supplier management
- Purchase orders
- Stock optimization

## 🎯 Key Modules

### Dashboard
- **Real-time Metrics**: Sales, inventory, alerts
- **Quick Actions**: Common tasks and shortcuts
- **AI Insights**: Intelligent recommendations
- **Recent Activity**: Latest system activities

### Inventory Management
- **Product Catalog**: Complete product database
- **Stock Control**: Add, update, transfer inventory
- **Batch Tracking**: Expiry and batch management
- **Automated Alerts**: Low stock and expiry warnings

### Sales & POS
- **Transaction Processing**: Complete sales workflow
- **Customer Management**: Customer profiles and history
- **Payment Integration**: Multiple payment methods
- **Receipt Management**: Digital and print receipts

### AI Assistant
- **Voice Commands**: Natural language interaction
- **Knowledge Base**: Pharmaceutical information
- **Query Processing**: Intelligent data retrieval
- **Contextual Help**: System navigation assistance

## 🛠️ Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pharmacy_db"

# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret

# AI Services
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# External Services
AFRICAS_TALKING_API_KEY=your-sms-api-key
```

### Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:
- **Users**: System users with role-based access
- **Products**: Pharmaceutical products and medications
- **Inventory**: Stock levels and locations
- **Sales**: Transaction records and payments
- **Orders**: Purchase orders and suppliers
- **Audit Logs**: Complete activity tracking

## 🔧 API Documentation

### Authentication Endpoints
```bash
POST /api/auth/login        # User login
POST /api/auth/register     # User registration
POST /api/auth/logout       # User logout
GET  /api/auth/me          # Get current user
```

### AI Endpoints
```bash
POST /api/ai/query         # Process text query
POST /api/ai/voice         # Process voice query
GET  /api/ai/suggestions   # Get AI suggestions
POST /api/ai/chat          # Interactive chat
```

### Inventory Endpoints
```bash
GET    /api/inventory      # Get inventory items
POST   /api/inventory      # Add inventory item
PUT    /api/inventory/:id  # Update inventory item
DELETE /api/inventory/:id  # Delete inventory item
```

## 🧪 Testing

```bash
# Run server tests
npm test

# Run client tests
cd client && npm test

# Run integration tests
npm run test:integration

# Check test coverage
npm run test:coverage
```

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Build client
cd client && npm run build

# Start production server
npm start
```

## 📊 Monitoring & Analytics

### Health Checks
- **API Health**: `/health` endpoint for system status
- **Database**: Connection and query performance
- **AI Services**: OpenAI and vector database status
- **Real-time**: WebSocket connection status

### Logging
- **Application Logs**: Winston-based logging
- **Audit Logs**: User activity tracking
- **Error Logs**: Comprehensive error tracking
- **Performance Logs**: API response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@pharmacy-ai.co.ke or join our Slack channel.

### Common Issues

**Database Connection Issues**
```bash
# Reset database
npx prisma migrate reset
npx prisma generate
npm run seed
```

**AI Service Issues**
- Verify OpenAI API key
- Check ChromaDB connection
- Review vector database status

**Frontend Build Issues**
```bash
# Clear cache and rebuild
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🗺️ Roadmap

### Q1 2024
- [ ] Mobile application (React Native)
- [ ] WhatsApp integration for orders
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Swahili)

### Q2 2024
- [ ] KEMSA integration
- [ ] Automated ordering system
- [ ] Customer mobile app
- [ ] Prescription management

### Q3 2024
- [ ] IoT integration for temperature monitoring
- [ ] Blockchain for supply chain tracking
- [ ] Advanced AI features
- [ ] Telemedicine integration

---

**Made with ❤️ for Kenyan Pharmacies**

Transform your pharmacy operations with AI-powered intelligence and modern technology.