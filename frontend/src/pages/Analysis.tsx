import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TipsAndUpdates as TipIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';
import { Line as ChartJSLine } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartJSTooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
);

interface AnalysisData {
  trends: {
    daily_average: number;
    peak_usage: number;
    peak_time: string;
    weekly_pattern: Record<string, number>;
    monthly_trend: Record<string, number>;
    weekday_average: number;
    weekend_average: number;
    consumption_trend: number;
  };
  suggestions: string[];
  predictions: Array<{
    date: string;
    predicted_consumption: number;
  }>;
  savings_predictions: Array<{
    date: string;
    savings_prediction: number;
  }>;
}

export default function Analysis() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.getAnalysis();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const weeklyData = data?.trends.weekly_pattern
    ? Object.entries(data.trends.weekly_pattern).map(([day, value]) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
        consumption: value,
      }))
    : [];

  const predictionChartData = {
    labels: data?.predictions?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Current Trend Prediction',
        data: data?.predictions?.map(item => item.predicted_consumption) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'With AI Recommendations',
        data: data?.savings_predictions?.map(item => item.savings_prediction) || [],
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
        fill: false,
        borderDash: [5, 5]
      }
    ]
  };

  const monthlyPredictionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Next Month Consumption Prediction'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Consumption (kWh)'
        }
      },
      x: {
        type: 'timeseries' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  const savingsComparisonData = {
    labels: data?.predictions?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Without AI Recommendations',
        data: data?.predictions?.map(item => item.predicted_consumption) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1,
        fill: true
      },
      {
        label: 'With AI Recommendations',
        data: data?.savings_predictions?.map(item => item.savings_prediction) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const savingsComparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Consumption Comparison: With vs Without AI Recommendations'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Consumption (kWh)'
        }
      },
      x: {
        type: 'timeseries' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* 用电分析图表 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Usage Pattern
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="consumption" fill="#8884d8" name="Consumption (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* 用电统计 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usage Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Daily Average"
                  secondary={`${data?.trends.daily_average.toFixed(2)} kWh`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Weekday Average"
                  secondary={`${data?.trends.weekday_average.toFixed(2)} kWh`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Weekend Average"
                  secondary={`${data?.trends.weekend_average.toFixed(2)} kWh`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Peak Usage"
                  secondary={`${data?.trends.peak_usage.toFixed(2)} kWh (${data?.trends.peak_time})`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* 预测图表 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Next Month Prediction
            </Typography>
            <Box height={400}>
              <ChartJSLine data={predictionChartData} options={monthlyPredictionOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* 节能比较图表 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Savings Comparison
            </Typography>
            <Box height={400}>
              <ChartJSLine data={savingsComparisonData} options={savingsComparisonOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* 节能建议 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Personalized Energy Saving Tips
            </Typography>
            <List>
              {data?.suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TipIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion}
                    sx={{ whiteSpace: 'pre-line' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 