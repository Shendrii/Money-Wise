"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { expenseService } from "@/app/services/expenseService";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import ExpenseDialog from "./components/ExpenseDialog";
import ExpenseFilters from "./components/ExpenseFilters";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { auth } from "@/app/firebase/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FirebaseError } from "firebase/app";

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

const headerStyle = {
  color: "green",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  fontWeight: "bold",
};

export default function ExpensesPage() {
  const { user, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const expensesData = await expenseService.getExpenses(user.uid);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchExpenses();
    }
  }, [user, authLoading, fetchExpenses]);

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      await fetchExpenses();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Handle sign-in
  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Error signing in:", error);
        setError(error.message || "An error occurred during sign in");
      }
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              borderRadius: 2,
              backgroundColor: "#f5f5f5",
              maxWidth: 500,
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              Welcome to MoneyWise
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please sign in to view and manage your expenses.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleSignIn}>
              Sign In with Google
            </Button>
          </Paper>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleErrorClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleErrorClose}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      !filters.category || expense.category === filters.category;
    const matchesDateFrom =
      !filters.dateFrom || expense.date >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || expense.date <= filters.dateTo;
    const matchesSearch =
      !filters.searchTerm ||
      expense.description
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());

    return matchesCategory && matchesDateFrom && matchesDateTo && matchesSearch;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={headerStyle}>
          Expenses
        </Typography>

        <ExpenseFilters filters={filters} setFilters={setFilters} />

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">
                      ₱{expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => {
                          setSelectedExpense(expense);
                          setOpenDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedExpense(expense);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <ExpenseDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        expense={selectedExpense || undefined}
        onSave={fetchExpenses}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => selectedExpense && handleDelete(selectedExpense.id)}
      />
    </Container>
  );
}
