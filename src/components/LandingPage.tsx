// src/components/LandingPage.tsx
"use client"
import { Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  return (
    <Container
      sx={{
        bgcolor: "background.default",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        textAlign: "center",
        p: 5,
      }}
    >
      <Typography variant="h2" sx={{ color: "primary.main" }}>
        Welcome to the Pantry Tracker!
      </Typography>
      <Typography variant="h5">
        Keep track of your pantry items easily and never run out of essentials.
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push("/home")}
        sx={{
          mt: 3,
          width: "200px",
        }}
      >
        Get Started
      </Button>
    </Container>
  );
}
