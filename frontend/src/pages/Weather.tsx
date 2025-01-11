import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
  useTheme,
} from '@mui/material';
import {
  WbSunny,
  Opacity,
  Thermostat,
  Warning,
  TrendingUp,
  BoltOutlined,
} from '@mui/icons-material';

interface WeatherForecast {
  location: {
    location_id: string;
    location_name: string;
  };
  date: string;
  morning_forecast: string;
  afternoon_forecast: string;
  night_forecast: string;
  summary_forecast: string;
  summary_when: string;
  min_temp: number;
  max_temp: number;
}

export default function Weather() {
  const theme = useTheme();
  
  // Weather data
  const weatherData: WeatherForecast = {
    location: {
      location_id: "St001",
      location_name: "Kuala Lumpur"
    },
    date: "2025-01-13",
    morning_forecast: "Sunny and hot",
    afternoon_forecast: "Extremely hot",
    night_forecast: "Warm and clear",
    summary_forecast: "High temperature",
    summary_when: "Afternoon",
    min_temp: 28,
    max_temp: 35
  };

  // Weather-based energy suggestions
  const energySuggestions = [
    {
      title: "Temperature Management",
      content: "Extreme temperature of 35°C expected. Recommended AC settings:",
      suggestions: [
        "Set AC temperature to 25°C for optimal energy efficiency",
        "Use fans in conjunction with AC to improve air circulation",
        "Expected increase in AC usage: 25-30% during peak heat"
      ],
      icon: <Thermostat sx={{ fontSize: 40, color: '#ff9800' }} />
    },
    {
      title: "Heat Impact",
      content: "High temperature forecasted throughout the day:",
      suggestions: [
        "Close curtains and blinds during peak sunlight hours",
        "Use light-colored curtains to reflect sunlight",
        "Consider using window tinting or solar films"
      ],
      icon: <Warning sx={{ fontSize: 40, color: '#f44336' }} />
    },
    {
      title: "Energy Usage Prediction",
      content: "Based on high temperature forecast:",
      suggestions: [
        "Expected 20-25% increase in cooling-related energy consumption",
        "Peak usage likely between 1 PM - 4 PM",
        "Consider pre-cooling rooms before peak temperature hours"
      ],
      icon: <TrendingUp sx={{ fontSize: 40, color: '#2196f3' }} />
    },
    {
      title: "Energy Saving Tips",
      content: "Hot weather specific recommendations:",
      suggestions: [
        "Use natural ventilation during early morning hours",
        "Avoid using heat-generating appliances during afternoon",
        "Potential savings of 15-20% by following heat management tips"
      ],
      icon: <BoltOutlined sx={{ fontSize: 40, color: '#4caf50' }} />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Weather Overview */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'linear-gradient(120deg, #ffffff 0%, #f3f9ff 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <WbSunny sx={{ fontSize: 48, color: '#ff9800', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Weather Forecast - {weatherData.location.location_name}
              </Typography>
            </Box>
            <Divider sx={{ my: 2, opacity: 0.6 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Date</Typography>
                <Typography variant="h5">{weatherData.date}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Temperature</Typography>
                <Typography variant="h5">
                  {weatherData.min_temp}°C - {weatherData.max_temp}°C
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Summary</Typography>
                <Typography variant="h5">{weatherData.summary_forecast}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Peak Time</Typography>
                <Typography variant="h5">{weatherData.summary_when}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Daily Forecast */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(120deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
              Daily Forecast
            </Typography>
            <Grid container spacing={3}>
              {[
                { time: 'Morning', forecast: weatherData.morning_forecast, gradient: 'linear-gradient(120deg, #fff1d4 0%, #ffe4bc 100%)' },
                { time: 'Afternoon', forecast: weatherData.afternoon_forecast, gradient: 'linear-gradient(120deg, #ffebcd 0%, #ffd7a8 100%)' },
                { time: 'Night', forecast: weatherData.night_forecast, gradient: 'linear-gradient(120deg, #e8eaf6 0%, #c5cae9 100%)' }
              ].map((period, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    sx={{ 
                      background: period.gradient,
                      borderRadius: 2,
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        {period.time}
                      </Typography>
                      <Typography variant="h5" sx={{ mt: 1 }}>
                        {period.forecast}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Energy Usage Analysis */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>
            Weather-Based Energy Analysis
          </Typography>
          <Grid container spacing={3}>
            {energySuggestions.map((suggestion, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    background: 'linear-gradient(120deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      {React.cloneElement(suggestion.icon, {
                        sx: { 
                          fontSize: 48,
                          mr: 2,
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }
                      })}
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        {suggestion.title}
                      </Typography>
                    </Box>
                    <Typography 
                      sx={{ 
                        color: 'text.secondary',
                        mb: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      {suggestion.content}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {suggestion.suggestions.map((item, i) => (
                        <Typography 
                          key={i} 
                          sx={{ 
                            mb: 1,
                            pl: 2,
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                            py: 0.5
                          }}
                        >
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
} 