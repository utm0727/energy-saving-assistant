import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Divider
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

interface ApplianceUsage {
  name: string;
  consumption: number;
  percentage: number;
  icon: React.ReactNode;
}

export default function Dashboard() {
  // 模拟电器用电数据
  const appliances: ApplianceUsage[] = [
    {
      name: '空调',
      consumption: 450,
      percentage: 35,
      icon: <AcUnit sx={{ fontSize: 40, color: '#1976d2' }} />
    },
    {
      name: '冰箱',
      consumption: 200,
      percentage: 15,
      icon: <Kitchen sx={{ fontSize: 40, color: '#2196f3' }} />
    },
    {
      name: '热水器',
      consumption: 300,
      percentage: 23,
      icon: <WaterDrop sx={{ fontSize: 40, color: '#03a9f4' }} />
    },
    {
      name: '照明',
      consumption: 100,
      percentage: 8,
      icon: <Lightbulb sx={{ fontSize: 40, color: '#ffd700' }} />
    },
    {
      name: '电视',
      consumption: 80,
      percentage: 6,
      icon: <Tv sx={{ fontSize: 40, color: '#673ab7' }} />
    },
    {
      name: '电脑',
      consumption: 120,
      percentage: 9,
      icon: <Computer sx={{ fontSize: 40, color: '#009688' }} />
    },
    {
      name: '洗衣机',
      consumption: 40,
      percentage: 3,
      icon: <Wash sx={{ fontSize: 40, color: '#4caf50' }} />
    },
    {
      name: '其他设备',
      consumption: 15,
      percentage: 1,
      icon: <DeviceHub sx={{ fontSize: 40, color: '#757575' }} />
    },
  ];

  const totalConsumption = appliances.reduce((sum, appliance) => sum + appliance.consumption, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* 总用电量卡片 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
              本月总用电量
            </Typography>
            <Typography variant="h2" color="primary">
              {totalConsumption} kWh
            </Typography>
          </Paper>
        </Grid>

        {/* 各电器用电量卡片 */}
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
                  {appliance.consumption} kWh
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  占总用电量的 {appliance.percentage}%
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