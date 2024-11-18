"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
} from "@mui/material";
import {
  TrendingUp,
  SaveAlt,
  Timeline,
  LightbulbOutlined,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useAuth } from "@/app/context/AuthContext";
import { expenseService } from "@/app/services/expenseService";
import { format, addMonths } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const headerStyle = {
  color: "green",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  fontWeight: "bold",
};

export default function SavingsPage() {
  const { user } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(1500);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [expenseReduction, setExpenseReduction] = useState(0);
  const [timeframe, setTimeframe] = useState(12); // months
  const [projectedData, setProjectedData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }[];
  }>({
    labels: [],
    datasets: [],
  });

  const updateProjections = useCallback(() => {
    // Generate next N months
    const months = Array.from({ length: timeframe }, (_, i) =>
      format(addMonths(new Date(), i), "MMMM yyyy")
    );

    // Calculate monthly savings with expense reduction
    const adjustedMonthlySavings = currentSavings + expenseReduction;

    // Calculate projections
    const idealSavings = Array.from(
      { length: timeframe },
      (_, i) => monthlySavingsGoal * (i + 1)
    );
    const projectedSavings = Array.from(
      { length: timeframe },
      (_, i) => adjustedMonthlySavings * (i + 1)
    );

    setProjectedData({
      labels: months,
      datasets: [
        {
          label: "Projected Savings",
          data: projectedSavings,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.3,
        },
        {
          label: "Goal Savings",
          data: idealSavings,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.3,
        },
      ],
    });
  }, [currentSavings, expenseReduction, monthlySavingsGoal, timeframe]);

  const fetchSavingsData = useCallback(async () => {
    if (!user) return;

    try {
      const expenses = await expenseService.getExpenses(user.uid);

      // Calculate total expenses for the current month
      const currentMonth = new Date().getMonth();
      const currentMonthExpenses = expenses
        .filter((exp) => new Date(exp.date).getMonth() === currentMonth)
        .reduce((sum, exp) => sum + exp.amount, 0);

      setMonthlyExpenses(currentMonthExpenses);

      // Calculate current monthly savings (can be negative)
      const monthlySavings = monthlyIncome - currentMonthExpenses;
      setCurrentSavings(monthlySavings);

      updateProjections();
    } catch (error) {
      console.error("Error fetching savings data:", error);
    }
  }, [user, monthlyIncome, updateProjections]);

  useEffect(() => {
    if (user) {
      fetchSavingsData();
    }
  }, [user, fetchSavingsData]);

  useEffect(() => {
    updateProjections();
  }, [
    monthlyIncome,
    monthlySavingsGoal,
    currentSavings,
    expenseReduction,
    timeframe,
    updateProjections,
  ]);

  const handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setMonthlyIncome(value);
    // Recalculate savings when income changes
    const newSavings = value - monthlyExpenses;
    setCurrentSavings(newSavings);
  };

  const handleSavingsGoalChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(event.target.value);
    setMonthlySavingsGoal(value);
  };

  const handleExpenseReductionChange = (_: Event, value: number | number[]) => {
    setExpenseReduction(value as number);
  };

  const handleTimeframeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTimeframe(Number(event.target.value));
  };

  const savingsPercentage = ((currentSavings / monthlyIncome) * 100).toFixed(1);
  const monthsToGoal = Math.ceil(
    monthlySavingsGoal / (currentSavings + expenseReduction || 1)
  );
  const annualProjection = (currentSavings + expenseReduction) * 12;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Savings Projection vs Goal",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (tickValue: string | number) =>
            `₱${Number(tickValue).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={headerStyle}>
          Savings
        </Typography>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Current Monthly Savings
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: currentSavings < 0 ? "error.main" : "inherit" }}
                >
                  ₱{currentSavings.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">
                  {Math.abs(Number(savingsPercentage))}% of income
                  {currentSavings < 0 ? " (deficit)" : ""}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Income
                </Typography>
                <TextField
                  type="number"
                  value={monthlyIncome}
                  onChange={handleIncomeChange}
                  fullWidth
                  InputProps={{
                    startAdornment: "₱",
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Savings Goal
                </Typography>
                <TextField
                  type="number"
                  value={monthlySavingsGoal}
                  onChange={handleSavingsGoalChange}
                  fullWidth
                  InputProps={{
                    startAdornment: "₱",
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Projection Timeframe (Months)
                </Typography>
                <TextField
                  type="number"
                  value={timeframe}
                  onChange={handleTimeframeChange}
                  fullWidth
                  inputProps={{ min: 1, max: 60 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Expense Reduction Slider */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography gutterBottom>Monthly Expense Reduction</Typography>
              <Slider
                value={expenseReduction}
                onChange={handleExpenseReductionChange}
                min={0}
                max={1000}
                step={50}
                marks
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `₱${value}`}
              />
            </Paper>
          </Grid>

          {/* Projections Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Line options={chartOptions} data={projectedData} />
            </Paper>
          </Grid>

          {/* Savings Insights */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Savings Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Projected Annual Savings"
                    secondary={`₱${annualProjection.toFixed(
                      2
                    )} (with ₱${expenseReduction} monthly reduction)`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SaveAlt />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monthly Savings Gap"
                    secondary={`₱${Math.abs(
                      monthlySavingsGoal - (currentSavings + expenseReduction)
                    ).toFixed(2)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Timeline />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time to Goal"
                    secondary={`${monthsToGoal} months at current rate`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LightbulbOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recommendation"
                    secondary={
                      currentSavings + expenseReduction < monthlySavingsGoal
                        ? `Reduce monthly expenses by ₱${(
                            monthlySavingsGoal - currentSavings
                          ).toFixed(2)} to reach your goal`
                        : "You're on track to meet your savings goal!"
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
