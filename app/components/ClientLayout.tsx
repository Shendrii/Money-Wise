"use client";

import { ThemeProvider, createTheme } from "@mui/material";
import Navbar from "./Navbar";
import { AuthProvider } from "../context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#003a8c",
    },
  },
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Navbar />
        <main
          style={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            padding: "20px",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          {children}
        </main>
        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            color: "gray",
          }}
        >
          © 2024 Expense Tracker
        </footer>
      </AuthProvider>
    </ThemeProvider>
  );
}
