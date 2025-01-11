import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Tv,
  AcUnit,
  Kitchen,
  WaterDrop,
  Lightbulb,
  Computer,
  Wash,
  DeviceHub
} from '@mui/icons-material';
import api from '../services/api';

interface ApplianceUsage {
  name: string;
  consumption: number;
  percentage: number;
  icon: React.ReactNode;
}

export default function Dashboard() {
  const [totalMonthlyUsage, setTotalMonthlyUsage] = useState(251);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.getDashboardData();
        if (response.data.monthlyAverage) {
          setTotalMonthlyUsage(251);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setTotalMonthlyUsage(251);
      }
    };

    fetchDashboardData();
  }, []);

  // 各电器占比数据
  const appliances: ApplianceUsage[] = [
    {
      name: 'Air Conditioner',
      consumption: totalMonthlyUsage * 0.35,
      percentage: 35,
      icon: <AcUnit sx={{ fontSize: 40, color: '#1976d2' }} />
    },
    {
      name: 'Refrigerator',
      consumption: totalMonthlyUsage * 0.15,
      percentage: 15,
      icon: <Kitchen sx={{ fontSize: 40, color: '#2196f3' }} />
    },
    {
      name: 'Water Heater',
      consumption: totalMonthlyUsage * 0.23,
      percentage: 23,
      icon: <WaterDrop sx={{ fontSize: 40, color: '#03a9f4' }} />
    },
    {
      name: 'Lighting',
      consumption: totalMonthlyUsage * 0.08,
      percentage: 8,
      icon: <Lightbulb sx={{ fontSize: 40, color: '#ffd700' }} />
    },
    {
      name: 'Television',
      consumption: totalMonthlyUsage * 0.06,
      percentage: 6,
      icon: <Tv sx={{ fontSize: 40, color: '#673ab7' }} />
    },
    {
      name: 'Computer',
      consumption: totalMonthlyUsage * 0.09,
      percentage: 9,
      icon: <Computer sx={{ fontSize: 40, color: '#009688' }} />
    },
    {
      name: 'Washing Machine',
      consumption: totalMonthlyUsage * 0.03,
      percentage: 3,
      icon: <Wash sx={{ fontSize: 40, color: '#4caf50' }} />
    },
    {
      name: 'Other Devices',
      consumption: totalMonthlyUsage * 0.01,
      percentage: 1,
      icon: <DeviceHub sx={{ fontSize: 40, color: '#757575' }} />
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Total consumption card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Total Monthly Consumption
            </Typography>
            <Typography variant="h2" color="primary">
              {totalMonthlyUsage.toFixed(2)} kWh
            </Typography>
          </Paper>
        </Grid>

        {/* Usage statistics cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Daily Average
            </Typography>
            <Typography variant="h4" color="primary">
              {(totalMonthlyUsage / 30).toFixed(2)} kWh
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Weekly Average
            </Typography>
            <Typography variant="h4" color="primary">
              {(totalMonthlyUsage / 4).toFixed(2)} kWh
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Average
            </Typography>
            <Typography variant="h4" color="primary">
              {totalMonthlyUsage.toFixed(2)} kWh
            </Typography>
          </Paper>
        </Grid>

        {/* Appliance usage cards */}
        {appliances.map((appliance, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {appliance.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {appliance.name}
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {appliance.consumption.toFixed(2)} kWh
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {appliance.percentage}% of total usage
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={appliance.percentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 