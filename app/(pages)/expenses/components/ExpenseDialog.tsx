"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { expenseService } from "@/app/services/expenseService";

const categories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
  onSave: () => void;
}

export default function ExpenseDialog({
  open,
  onClose,
  expense,
  onSave,
}: ExpenseDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: "",
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount.toString(),
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "",
        description: "",
        amount: "",
      });
    }
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: user.uid,
      };

      if (expense) {
        await expenseService.updateExpense(expense.id, expenseData);
      } else {
        await expenseService.addExpense(user.uid, expenseData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {expense ? "Edit Expense" : "Add New Expense"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Category"
              select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              fullWidth
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                inputProps: { min: 0, step: "0.01" },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
