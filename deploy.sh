#!/bin/bash

# Kenyan Pharmacy AI System Deployment Script
# This script sets up and deploys the complete pharmacy management system

set -e

echo "🏥 Kenyan Pharmacy AI System Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not be available."
    fi
    
    print_success "System requirements check complete"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before continuing"
        read -p "Press enter to continue after editing .env file..."
    fi
    
    print_success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    print_status "Installing server dependencies..."
    npm install
    
    print_status "Installing client dependencies..."
    cd client && npm install && cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    print_status "Running database migrations..."
    npx prisma migrate dev --name init
    
    # Seed database
    print_status "Seeding database with initial data..."
    npm run seed
    
    print_success "Database setup complete"
}

# Build application
build_application() {
    print_status "Building client application..."
    cd client && npm run build && cd ..
    
    print_success "Application built successfully"
}

# Setup Docker (optional)
setup_docker() {
    if command -v docker &> /dev/null; then
        print_status "Setting up Docker containers..."
        
        read -p "Do you want to use Docker for deployment? (y/N): " use_docker
        
        if [[ $use_docker =~ ^[Yy]$ ]]; then
            print_status "Building Docker containers..."
            docker-compose build
            
            print_status "Starting Docker containers..."
            docker-compose up -d
            
            print_success "Docker containers are running"
            
            # Wait for services to be ready
            print_status "Waiting for services to be ready..."
            sleep 30
            
            return 0
        fi
    fi
    
    return 1
}

# Start application (non-Docker)
start_application() {
    print_status "Starting the application..."
    
    print_status "Starting in development mode..."
    print_warning "For production, use: npm start"
    
    # Start the application
    npm run dev &
    APP_PID=$!
    
    print_success "Application started with PID: $APP_PID"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
    print_status "Health Check: http://localhost:5000/health"
    
    # Wait a bit and check if the application is running
    sleep 5
    if ps -p $APP_PID > /dev/null; then
        print_success "Application is running successfully!"
    else
        print_error "Application failed to start. Check the logs for errors."
        exit 1
    fi
}

# Main deployment function
deploy() {
    print_status "Starting deployment process..."
    
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    build_application
    
    if ! setup_docker; then
        start_application
    fi
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "🎉 Your Kenyan Pharmacy AI System is now running!"
    echo ""
    echo "📋 Quick Start Guide:"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend API: http://localhost:5000"
    echo "  • Default login: admin@pharmacy.co.ke / admin123"
    echo ""
    echo "📖 Documentation:"
    echo "  • README.md - Complete setup guide"
    echo "  • API Documentation: http://localhost:5000/api/docs"
    echo ""
    echo "🆘 Support:"
    echo "  • Check logs in ./logs/ directory"
    echo "  • Run 'npm run dev' to start in development mode"
    echo "  • Use 'docker-compose logs' for Docker deployments"
    echo ""
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "dev")
        print_status "Starting in development mode..."
        check_requirements
        setup_environment
        install_dependencies
        npm run dev
        ;;
    "build")
        print_status "Building application..."
        install_dependencies
        build_application
        print_success "Build complete!"
        ;;
    "docker")
        print_status "Starting with Docker..."
        check_requirements
        setup_environment
        setup_docker
        ;;
    "help")
        echo "Kenyan Pharmacy AI System Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    Full deployment (default)"
        echo "  dev       Development mode"
        echo "  build     Build application only"
        echo "  docker    Docker deployment"
        echo "  help      Show this help"
        echo ""
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac