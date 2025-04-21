#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Opening Sistema de Cobrança in your browser...${NC}"

# Open the main application
open http://localhost

echo -e "${YELLOW}Available pages:${NC}"
echo -e "  Main application: ${GREEN}http://localhost${NC}"
echo -e "  Test login page: ${GREEN}http://localhost/test-login${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "  API Documentation: ${GREEN}http://localhost:8000/docs${NC}"

echo -e "\n${YELLOW}Default users:${NC}"
echo -e "  Admin: ${GREEN}admin@sistema.com / admin123${NC}"
echo -e "  Supervisor: ${GREEN}supervisor@sistema.com / supervisor123${NC}"
echo -e "  Collector: ${GREEN}operador@sistema.com / operador123${NC}"
echo -e "  Seller: ${GREEN}vendedor@sistema.com / vendedor123${NC}"

echo -e "\n${YELLOW}To manage the application:${NC}"
echo -e "  Start: ${GREEN}./start-local.sh start${NC}"
echo -e "  Stop: ${GREEN}./start-local.sh stop${NC}"
echo -e "  View logs: ${GREEN}./start-local.sh logs${NC}"
echo -e "  More options: ${GREEN}./start-local.sh${NC} (without arguments)"
