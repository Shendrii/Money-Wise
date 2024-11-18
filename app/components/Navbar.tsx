"use client";

import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavDrawer from "./NavDrawer";
import AuthButton from "./AuthButton";

export default function Navbar() {
  const currentPath = usePathname();

  return (
    <AppBar
      position="static"
      sx={{
        background: "transparent",
        boxShadow: "none",
        width: "100%",
        padding: { xs: "5px", sm: "10px", md: "20px" },
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          <span style={{ color: "green" }}>MoneyWise</span>
 
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              alignItems: "center",
            }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button
                variant={currentPath === "/" ? "contained" : "text"}
                color="primary"
                sx={{
                  textTransform: "capitalize",
                }}
              >
                Dashboard
              </Button>
            </Link>

            <Link href="/expenses" style={{ textDecoration: "none" }}>
              <Button
                variant={currentPath === "/expenses" ? "contained" : "text"}
                color="primary"
                sx={{
                  textTransform: "capitalize",
                }}
              >
                Expenses
              </Button>
            </Link>

            <Link href="/savings" style={{ textDecoration: "none" }}>
              <Button
                variant={currentPath === "/savings" ? "contained" : "text"}
                color="primary"
                sx={{
                  textTransform: "capitalize",
                }}
              >
                Savings
              </Button>
            </Link>
          </Box>

          {/* Auth Button */}
          <AuthButton />

          {/* Mobile Navigation Drawer */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <NavDrawer />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
