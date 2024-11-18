"use client";

import {
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";

export default function AuthButton() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (typeof window === "undefined") return;
    try {
      setLoading(true);
      setError(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (typeof window === "undefined") return;
    try {
      setLoading(true);
      await signOut(auth);
      setAnchorEl(null);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Error signing out:", error);
        setError(error.message || "An error occurred during sign out");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleErrorClose = () => {
    setError(null);
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <>
      {!user ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSignIn}
          sx={{ textTransform: "capitalize" }}
          disabled={loading}
        >
          Sign In with Google
        </Button>
      ) : (
        <>
          <Button
            onClick={handleMenu}
            color="primary"
            sx={{
              textTransform: "capitalize",
              display: "flex",
              alignItems: "center",
            }}
          >
            {user.displayName || user.email}
            <AccountCircle sx={{ ml: 1 }} />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </Menu>
        </>
      )}

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
    </>
  );
}
