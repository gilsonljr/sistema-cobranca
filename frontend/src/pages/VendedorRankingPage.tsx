import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Avatar, Chip, CircularProgress, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Button, LinearProgress, Badge, Tooltip, IconButton, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import DiamondIcon from '@mui/icons-material/Diamond';
import ReplayIcon from '@mui/icons-material/Replay';
import { formatCurrency } from '../utils/formatters';
import UserStore from '../services/UserStore';
import OrderService from '../services/OrderService';

// Define types for our ranking data
interface VendedorRanking {
  id: string;
  full_name: string;
  totalSales: number;
  totalValue: number;
  conversionRate: number;
  averageTicket: number;
  previousRank?: number;
  achievements?: string[];
  streak?: number;
  improvementPercentage?: number;
}

// Define user info type based on what's stored in localStorage
interface StoredUserInfo {
  id: string;
  full_name: string;
  role: string;
}

// Achievement badges
const ACHIEVEMENTS = {
  TOP_SELLER: "Vendedor Top",
  MOST_IMPROVED: "Maior Evolução",
  HIGHEST_VALUE: "Maior Ticket Médio",
  HOT_STREAK: "Em Chamas",
  NEW_RECORD: "Novo Recorde",
  PERFECT_SCORE: "100% Conversão"
};

// Rank tiers
const RANK_TIERS = [
  { name: "Bronze", threshold: 0, color: "#CD7F32" },
  { name: "Prata", threshold: 5000, color: "#C0C0C0" },
  { name: "Ouro", threshold: 15000, color: "#FFD700" },
  { name: "Platina", threshold: 30000, color: "#E5E4E2" },
  { name: "Diamante", threshold: 50000, color: "#B9F2FF" }
];

// Get tier based on sales value
const getTierByValue = (value: number) => {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (value >= RANK_TIERS[i].threshold) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
};

// Get progress to next tier
const getProgressToNextTier = (value: number) => {
  const currentTier = getTierByValue(value);
  const currentIndex = RANK_TIERS.findIndex(tier => tier.name === currentTier.name);
  if (currentIndex === RANK_TIERS.length - 1) {
    return 100; // Already at max tier
  }
  
  const nextTier = RANK_TIERS[currentIndex + 1];
  const range = nextTier.threshold - currentTier.threshold;
  const progress = ((value - currentTier.threshold) / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

const VendedorRankingPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [rankings, setRankings] = useState<VendedorRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [previousRankings, setPreviousRankings] = useState<VendedorRanking[]>([]);
  const [showRankImprovement, setShowRankImprovement] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Handle period selection change
  const handlePeriodChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedPeriod(value);
    if (value !== 'custom') {
      setTimeRange(value);
    }
  };
  
  // Apply custom date filters
  const applyCustomDateFilter = () => {
    if (startDate && endDate) {
      fetchRankingData();
    }
  };

  // Calculate improvements and assign achievements
  const calculateImprovements = (current: VendedorRanking[], previous: VendedorRanking[]): VendedorRanking[] => {
    return current.map(vendor => {
      const previousData = previous.find(p => p.id === vendor.id);
      const achievements: string[] = [];
      const updatedVendor = { ...vendor };
      
      // Determine previous rank
      if (previousData) {
        const previousRank = previous.findIndex(p => p.id === vendor.id) + 1;
        updatedVendor.previousRank = previousRank;
        
        // Calculate improvement percentage
        if (previousData.totalValue > 0) {
          const improvementPercentage = ((vendor.totalValue - previousData.totalValue) / previousData.totalValue) * 100;
          updatedVendor.improvementPercentage = improvementPercentage;
          
          // Most improved award
          if (improvementPercentage > 30) {
            achievements.push(ACHIEVEMENTS.MOST_IMPROVED);
          }
        }
      }
      
      // Assign fixed streak for now (in a real app, you'd track this over time)
      updatedVendor.streak = Math.floor(Math.random() * 10);
      
      // Top seller badge for top 3
      if (current.indexOf(vendor) < 3) {
        achievements.push(ACHIEVEMENTS.TOP_SELLER);
      }
      
      // Highest value sale
      if (vendor.averageTicket > 1000) {
        achievements.push(ACHIEVEMENTS.HIGHEST_VALUE);
      }
      
      // Hot streak if random streak is high enough
      if (updatedVendor.streak >= 5) {
        achievements.push(ACHIEVEMENTS.HOT_STREAK);
      }
      
      // Perfect conversion
      if (vendor.conversionRate >= 95) {
        achievements.push(ACHIEVEMENTS.PERFECT_SCORE);
      }
      
      updatedVendor.achievements = achievements;
      return updatedVendor;
    });
  };
  
  const fetchRankingData = async () => {
    setLoading(true);
    try {
      const orders = await OrderService.getOrders();
      const users = UserStore.getInstance().getUsers();
      
      // Save previous rankings before updating
      setPreviousRankings([...rankings]);
      
      // Apply time filter to orders
      let filteredOrders;
      if (selectedPeriod === 'custom' && startDate && endDate) {
        filteredOrders = filterOrdersByCustomDateRange(orders, startDate, endDate);
      } else {
        filteredOrders = filterOrdersByTimeRange(orders, timeRange);
      }
      
      // Group orders by vendedor
      const vendedorStats = calculateVendedorStats(filteredOrders, users);
      
      // Sort by total value
      const sortedRankings = vendedorStats.sort((a, b) => b.totalValue - a.totalValue);
      
      // Calculate improvements and assign achievements
      const enhancedRankings = calculateImprovements(sortedRankings, rankings);
      
      setRankings(enhancedRankings);
      
      // Find current user rank if user is logged in
      const userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString) as StoredUserInfo;
        if (userInfo && userInfo.id) {
          const userRankIndex = enhancedRankings.findIndex(r => r.id === userInfo.id);
          
          const newRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
          // If improved rank, show rank improvement notification
          if (currentUserRank && newRank && newRank < currentUserRank) {
            setShowRankImprovement(true);
            setTimeout(() => setShowRankImprovement(false), 5000);
          }
          
          setCurrentUserRank(newRank);
        }
      }
    } catch (err) {
      setError('Erro ao carregar os dados do ranking');
      console.error('Error fetching ranking data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRankingData();
  }, [timeRange]);
  
  // Helper functions
  const filterOrdersByTimeRange = (orders: any[], range: string) => {
    const now = new Date();
    const startDate = new Date();
    
    switch(range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0); // Start of today
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });
  };
  
  // Helper for custom date filtering
  const filterOrdersByCustomDateRange = (orders: any[], start: Date, end: Date) => {
    // Set to start of day for start date and end of day for end date
    const startDateTime = new Date(start);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(end);
    endDateTime.setHours(23, 59, 59, 999);
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDateTime && orderDate <= endDateTime;
    });
  };
  
  const calculateVendedorStats = (orders: any[], users: any[]): VendedorRanking[] => {
    // Create a map to store vendedor stats
    const vendedorMap = new Map<string, any>();
    
    // Initialize map with users who have role 'vendedor'
    users.forEach(user => {
      if (user.role === 'vendedor') {
        vendedorMap.set(user.id, {
          id: user.id,
          full_name: user.full_name,
          totalSales: 0,
          totalValue: 0,
          leads: 0,
          conversions: 0
        });
      }
    });
    
    // Process orders to calculate stats
    orders.forEach(order => {
      const vendedorId = order.vendedorId;
      if (vendedorMap.has(vendedorId)) {
        const vendedor = vendedorMap.get(vendedorId);
        vendedor.totalSales += 1;
        vendedor.totalValue += parseFloat(order.valorVenda) || 0;
        
        // Count leads and conversions (assuming order.status can tell us if it's converted)
        vendedor.leads += 1;
        if (order.status === 'APROVADO' || order.status === 'PAGO') {
          vendedor.conversions += 1;
        }
        
        vendedorMap.set(vendedorId, vendedor);
      }
    });
    
    // Convert map to array and calculate rates
    return Array.from(vendedorMap.values()).map(vendedor => ({
      id: vendedor.id,
      full_name: vendedor.full_name,
      totalSales: vendedor.totalSales,
      totalValue: vendedor.totalValue,
      conversionRate: vendedor.leads > 0 ? (vendedor.conversions / vendedor.leads) * 100 : 0,
      averageTicket: vendedor.totalSales > 0 ? vendedor.totalValue / vendedor.totalSales : 0
    }));
  };
  
  // Render medals for top 3
  const getMedalColor = (index: number) => {
    switch(index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return 'transparent';
    }
  };

  // Helper to get current user info from localStorage
  const getCurrentUserInfo = (): StoredUserInfo | null => {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) return null;
    
    try {
      return JSON.parse(userInfoString) as StoredUserInfo;
    } catch (e) {
      console.error('Error parsing user info:', e);
      return null;
    }
  };
  
  // Get achievement icon
  const getAchievementIcon = (achievement: string) => {
    switch(achievement) {
      case ACHIEVEMENTS.TOP_SELLER:
        return <EmojiEventsIcon sx={{ color: '#FFD700' }} />;
      case ACHIEVEMENTS.MOST_IMPROVED:
        return <ArrowUpwardIcon sx={{ color: '#4CAF50' }} />;
      case ACHIEVEMENTS.HIGHEST_VALUE:
        return <DiamondIcon sx={{ color: '#3F51B5' }} />;
      case ACHIEVEMENTS.HOT_STREAK:
        return <LocalFireDepartmentIcon sx={{ color: '#FF5722' }} />;
      case ACHIEVEMENTS.NEW_RECORD:
        return <NewReleasesIcon sx={{ color: '#9C27B0' }} />;
      case ACHIEVEMENTS.PERFECT_SCORE:
        return <WorkspacePremiumIcon sx={{ color: '#2196F3' }} />;
      default:
        return <WorkspacePremiumIcon />;
    }
  };
  
  const currentUser = getCurrentUserInfo();

  // Get current ranking info safely
  const getCurrentRankingInfo = () => {
    if (currentUserRank === null || currentUserRank <= 0 || rankings.length === 0) {
      return null;
    }
    
    const index = currentUserRank - 1;
    if (index < 0 || index >= rankings.length) {
      return null;
    }
    
    return rankings[index];
  };
  
  const currentRankInfo = getCurrentRankingInfo();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Show a visual notification instead of confetti */}
      {showRankImprovement && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: '#4caf50', 
            color: 'white',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.8 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.8 }
            }
          }}
        >
          <Typography variant="h6" align="center">
            🎉 Parabéns! Você subiu no ranking! 🎉
          </Typography>
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Ranking de Vendedores
        </Typography>
        <IconButton onClick={() => fetchRankingData()} color="primary" title="Atualizar Ranking">
          <ReplayIcon />
        </IconButton>
      </Box>
      
      {/* Enhanced Date Filtering */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="period-select-label">Período</InputLabel>
              <Select
                labelId="period-select-label"
                value={selectedPeriod}
                label="Período"
                onChange={handlePeriodChange}
              >
                <MenuItem value="today">Hoje</MenuItem>
                <MenuItem value="week">Essa Semana</MenuItem>
                <MenuItem value="month">Esse Mês</MenuItem>
                <MenuItem value="quarter">Último Trimestre</MenuItem>
                <MenuItem value="year">Último Ano</MenuItem>
                <MenuItem value="custom">Período Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {selectedPeriod === 'custom' && (
            <>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ height: '56px' }}
                  onClick={applyCustomDateFilter}
                  disabled={!startDate || !endDate}
                >
                  Aplicar
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Current user rank card - highlighted and prominent */}
      {currentUserRank !== null && currentRankInfo && (
        <Box sx={{ mb: 4 }}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mr: 2,
                      bgcolor: '#4caf50',
                      fontSize: '1.5rem'
                    }}
                  >
                    {currentUserRank}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {currentUser?.full_name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Sua posição no ranking: <strong>{currentUserRank}º lugar</strong>
                      {currentRankInfo.previousRank && currentRankInfo.previousRank !== currentUserRank && (
                        <Chip 
                          size="small" 
                          color={currentRankInfo.previousRank > currentUserRank ? "success" : "error"}
                          icon={currentRankInfo.previousRank > currentUserRank ? <ArrowUpwardIcon /> : undefined}
                          label={currentRankInfo.previousRank > currentUserRank 
                            ? `+${currentRankInfo.previousRank - currentUserRank} posições` 
                            : `-${currentUserRank - currentRankInfo.previousRank} posições`} 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Progresso para próximo nível: {getTierByValue(currentRankInfo.totalValue).name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressToNextTier(currentRankInfo.totalValue)} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(getProgressToNextTier(currentRankInfo.totalValue))}%
                    </Typography>
                  </Box>
                  
                  {/* Display badges */}
                  {currentRankInfo.achievements && currentRankInfo.achievements.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Suas conquistas:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {currentRankInfo.achievements.map((achievement, index) => (
                          <Tooltip key={index} title={achievement}>
                            <Chip
                              icon={getAchievementIcon(achievement)}
                              label={achievement}
                              size="small"
                              sx={{ borderRadius: '16px' }}
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
      
      {/* Top 3 Podium */}
      {!loading && rankings.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Pódio dos Campeões
          </Typography>
          <Grid container spacing={2} justifyContent="center" alignItems="flex-end">
            {rankings.slice(0, 3).map((vendedor, index) => (
              <Grid item xs={12} sm={4} key={vendedor.id}>
                <Card 
                  sx={{ 
                    height: `${300 - index * 30}px`, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: currentUser && vendedor.id === currentUser.id ? '3px solid #4caf50' : 'none',
                    background: index === 0 
                      ? 'linear-gradient(135deg, #f5f7fa 0%, #ffe9c2 100%)' 
                      : index === 1 
                        ? 'linear-gradient(135deg, #f5f7fa 0%, #e0e0e0 100%)' 
                        : 'linear-gradient(135deg, #f5f7fa 0%, #eacda3 100%)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    bgcolor: getMedalColor(index), 
                    p: 1,
                    borderBottomLeftRadius: 8 
                  }}>
                    <EmojiEventsIcon />
                  </Box>
                  
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mb: 2,
                      bgcolor: getMedalColor(index),
                      border: '4px solid white',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      fontSize: '1.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  
                  <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                    {vendedor.full_name}
                  </Typography>
                  
                  <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="bold">
                    {formatCurrency(vendedor.totalValue)}
                  </Typography>
                  
                  <Typography variant="body2">
                    {vendedor.totalSales} vendas • {vendedor.conversionRate.toFixed(1)}% conversão
                  </Typography>
                  
                  {/* Display achievements/badges */}
                  {vendedor.achievements && vendedor.achievements.length > 0 && (
                    <Box sx={{ display: 'flex', mt: 2, gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {vendedor.achievements.slice(0, 2).map((achievement, badgeIndex) => (
                        <Tooltip key={badgeIndex} title={achievement}>
                          <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.5)' }}>
                            {getAchievementIcon(achievement)}
                          </IconButton>
                        </Tooltip>
                      ))}
                      {vendedor.achievements.length > 2 && (
                        <Tooltip title={`+${vendedor.achievements.length - 2} conquistas`}>
                          <Chip 
                            size="small" 
                            label={`+${vendedor.achievements.length - 2}`} 
                          />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                  
                  {/* Show improvement indicator */}
                  {vendedor.previousRank !== undefined && vendedor.previousRank !== index + 1 && (
                    <Chip 
                      size="small" 
                      color={vendedor.previousRank > index + 1 ? "success" : "error"}
                      icon={vendedor.previousRank > index + 1 ? <ArrowUpwardIcon /> : undefined}
                      label={vendedor.previousRank > index + 1 
                        ? `+${vendedor.previousRank - (index + 1)}` 
                        : `-${(index + 1) - vendedor.previousRank}`} 
                      sx={{ position: 'absolute', bottom: 10, right: 10 }}
                    />
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Rankings table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6">Classificação Completa</Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell width={70} align="center">Posição</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell align="right">Vendas</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                  <TableCell align="right">Ticket Médio</TableCell>
                  <TableCell align="right">Taxa de Conversão</TableCell>
                  <TableCell align="right">Nível</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((vendedor, index) => {
                  const isCurrentUser = currentUser && vendedor.id === currentUser.id;
                  const tier = getTierByValue(vendedor.totalValue);
                  
                  return (
                    <TableRow 
                      hover 
                      key={vendedor.id}
                      sx={{ 
                        bgcolor: isCurrentUser ? 'rgba(76, 175, 80, 0.08)' : 'inherit',
                        '&:nth-of-type(odd)': {
                          bgcolor: isCurrentUser ? 'rgba(76, 175, 80, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                            {index + 1}
                          </Typography>
                          {index < 3 && (
                            <EmojiEventsIcon 
                              sx={{ 
                                ml: 1, 
                                color: getMedalColor(index),
                                verticalAlign: 'middle'
                              }} 
                              fontSize="small"
                            />
                          )}
                          {vendedor.previousRank !== undefined && vendedor.previousRank !== index + 1 && (
                            <Box 
                              component="span" 
                              sx={{ 
                                ml: 0.5, 
                                color: vendedor.previousRank > index + 1 ? 'success.main' : 'error.main',
                                fontSize: '0.75rem'
                              }}
                            >
                              {vendedor.previousRank > index + 1 ? (
                                <Tooltip title={`De ${vendedor.previousRank}º para ${index + 1}º`}>
                                  <Box component="span">
                                    <ArrowUpwardIcon fontSize="inherit" /> 
                                    {vendedor.previousRank - (index + 1)}
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Tooltip title={`De ${vendedor.previousRank}º para ${index + 1}º`}>
                                  <Box component="span">↓{(index + 1) - vendedor.previousRank}</Box>
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: isCurrentUser ? '#4caf50' : undefined }}>
                            {vendedor.full_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                              {vendedor.full_name}
                              {isCurrentUser && (
                                <Chip 
                                  label="Você" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            
                            {/* Display achievements as small icons */}
                            {vendedor.achievements && vendedor.achievements.length > 0 && (
                              <Box sx={{ display: 'flex', mt: 0.5, gap: 0.5 }}>
                                {vendedor.achievements.slice(0, 3).map((achievement, badgeIndex) => (
                                  <Tooltip key={badgeIndex} title={achievement}>
                                    <Box sx={{ color: 'text.secondary' }}>
                                      {getAchievementIcon(achievement)}
                                    </Box>
                                  </Tooltip>
                                ))}
                                {vendedor.achievements.length > 3 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{vendedor.achievements.length - 3}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{vendedor.totalSales}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                        {formatCurrency(vendedor.totalValue)}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(vendedor.averageTicket)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <LinearProgress
                            variant="determinate"
                            value={vendedor.conversionRate}
                            sx={{ flexGrow: 1, mr: 1, maxWidth: 60 }}
                          />
                          {vendedor.conversionRate.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={tier.name} 
                          size="small"
                          sx={{ 
                            bgcolor: tier.color,
                            color: tier.name === 'Diamante' ? 'black' : (tier.name === 'Ouro' ? 'black' : 'white'),
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Achievements Legend */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Conquistas do Ranking</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Object.values(ACHIEVEMENTS).map((achievement, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getAchievementIcon(achievement)}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {achievement}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default VendedorRankingPage; 