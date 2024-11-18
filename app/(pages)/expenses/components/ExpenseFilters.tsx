"use client";

import { Box, TextField, MenuItem } from "@mui/material";

const categories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

interface ExpenseFiltersProps {
  filters: {
    category: string;
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
  };
  setFilters: (filters: ExpenseFiltersProps["filters"]) => void;
}

export default function ExpenseFilters({
  filters,
  setFilters,
}: ExpenseFiltersProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <TextField
        label="Category"
        select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="From Date"
        type="date"
        value={filters.dateFrom}
        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="To Date"
        type="date"
        value={filters.dateTo}
        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Search"
        value={filters.searchTerm}
        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        placeholder="Search expenses..."
      />
    </Box>
  );
}
