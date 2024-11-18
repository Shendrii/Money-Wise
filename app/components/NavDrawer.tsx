"use client";

import { Box, Drawer, IconButton, List, ListItem, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  const menuItems = [
    { text: "Dashboard", href: "/" },
    { text: "expenses", href: "/expenses" },
    { text: "Savings", href: "/savings" },
  ];

  return (
    <Box sx={{ display: { xs: "block", md: "none" } }}>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" open={isOpen} onClose={() => setIsOpen(false)}>
        <Box
          sx={{ width: 250, padding: 2 }}
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} sx={{ padding: "8px 0" }}>
                <Link
                  href={item.href}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <Button
                    fullWidth
                    variant={currentPath === item.href ? "contained" : "text"}
                    color="primary"
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.text}
                  </Button>
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
