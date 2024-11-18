"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAuth } from "./context/AuthContext";
import { expenseService } from "./services/expenseService";
import { format } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  highestCategory: string;
  highestAmount: number;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    barPercentage: number;
    categoryPercentage: number;
  }[];
}

const headerStyle = {
  color: "green",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  fontWeight: "bold",
};

export default function Page() {
  const { user } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    highestCategory: "",
    highestAmount: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      const expenses: Expense[] = await expenseService.getExpenses(user.uid);

      // Calculate stats
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const currentMonth = new Date().getMonth();
      const monthlyTotal = expenses
        .filter((exp) => new Date(exp.date).getMonth() === currentMonth)
        .reduce((sum, exp) => sum + exp.amount, 0);

      // Get category totals
      const categoryTotals = expenses.reduce(
        (acc: { [key: string]: number }, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        },
        {}
      );

      // Find highest category
      const highestCategory = Object.entries(categoryTotals).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );

      // Set stats
      setStats({
        totalExpenses: total,
        monthlyExpenses: monthlyTotal,
        highestCategory: highestCategory[0],
        highestAmount: highestCategory[1],
      });

      // Set recent expenses
      setRecentExpenses(expenses.slice(0, 5));

      // Prepare chart data by category
      const categories = [
        "Food",
        "Transportation",
        "Entertainment",
        "Shopping",
        "Bills",
        "Other",
      ];

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return format(d, "MMM yyyy");
      }).reverse();

      // Create datasets for each category
      const datasets = categories.map((category, index) => {
        const monthlyTotals = last6Months.map((month) => {
          const total = expenses
            .filter(
              (exp) =>
                exp.category === category &&
                format(new Date(exp.date), "MMM yyyy") === month
            )
            .reduce((sum, exp) => sum + exp.amount, 0);
          return total;
        });

        // Generate a color based on index
        const hue = (index * 360) / categories.length;
        const color = `hsla(${hue}, 70%, 50%, 0.7)`;

        return {
          label: category,
          data: monthlyTotals,
          backgroundColor: color,
          borderColor: `hsla(${hue}, 70%, 40%, 1)`,
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 0.9,
        };
      });

      setMonthlyData({
        labels: last6Months,
        datasets: datasets,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Expenses by Category",
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            const value =
              typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={headerStyle}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h5">
                  ₱{stats.totalExpenses.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Expenses
                </Typography>
                <Typography variant="h5">
                  ₱{stats.monthlyExpenses.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Highest Spending Category
                </Typography>
                <Typography variant="h5">{stats.highestCategory}</Typography>
                <Typography color="textSecondary">
                  ₱{stats.highestAmount.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Bar options={chartOptions} data={monthlyData} />
            </Paper>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell align="right">
                          ₱{expense.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
