"use client";
import { db } from "@/firebase";
import {
  Close,
  DeleteOutlineOutlined,
  Edit,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  Search,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  MenuItem, 
  Select,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { theme } from "../theme";
import { auth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, } from "firebase/auth";
import { getAuth, sendEmailVerification } from "firebase/auth";
import LandingPage from "@/components/LandingPage";
import Link from 'next/link';

export default function Home() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pantryData, setPantryData] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updateData, setUpdateData] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("");
  const categories = ["Dairy", "Fruits", "Vegetables", "Meat", "Grains", "Beverages"];
  const [showLandingPage, setShowLandingPage] = useState(true);
 
  
      
  useEffect(() => {
    

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setEmailVerificationSent(false); // Reset the email verification state
      setShowLandingPage(!currentUser); // Show LandingPage if no user is logged in
      if (currentUser) {
        fetchCollection(currentUser.uid, selectedCategory);
      }
    });

    return () => unsubscribe();
    
  }, [ selectedCategory,pantryData]);

  

  
  const resendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setEmailVerificationSent(true);
      } catch (error) {
        console.error("Error resending verification email: ", error);
      }
    }
  };

  const fetchCollection = async (userId: string, category: string) => {
    try {
      const queryRef = category === "ALL" 
      ? collection(db, "users", userId, "pantry")
      : query(collection(db, "users", userId, "pantry"), where("category", "==", category));
      
    const querySnapShot = await getDocs(queryRef);
    const data: any = querySnapShot.docs.map((doc) => ({
      name: doc.id,
      ...doc.data(),
      }));
      
      setPantryData(data);
    } catch (error) {
      console.log("Error fetching collection: ", error);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    return "";
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setEmailVerificationSent(false); // Reset the email verification state
      const result = await signInWithPopup(auth, provider);
      fetchCollection(result.user.uid, selectedCategory);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setEmailVerificationSent(false); // Reset the email verification state
      const result = await signInAnonymously(auth);
      fetchCollection(result.user.uid, selectedCategory);
    } catch (error) {
      console.error("Error signing in anonymously: ", error);
    }
  };  

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setPantryData([]);
      setEmailVerificationSent(false); // Reset the email verification state
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  const handleSubmit = async () => {
    if (name === "" || quantity === 0 || !user|| !category) {
      console.log("Please enter valid data");
      return;
    }

    const docRef = doc(db, "users", user.uid, "pantry", name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await setDoc(docRef, { quantity, category });
      console.log("Document successfully updated!");
    } else {
      await setDoc(docRef, { quantity, category  });
      console.log("Document successfully created!");
    }

    fetchCollection(user.uid, selectedCategory);
    setName("");
    setQuantity(1);
    setCategory("");
    setOpen(false);
    setUpdateData(false);
  };



const handleEmailSignUp = async () => {
  const validationError = validatePassword(password);
  if (validationError) {
    setPasswordError(validationError);
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user); // Send verification email
    fetchCollection(result.user.uid, selectedCategory);
    setEmail("");
    setPassword("");
    setPasswordError("");
    setIsSignUp(false);
  } catch (error) {
    console.error("Error signing up: ", error);
    setPasswordError("An error occurred during sign-up.");
  }
};

const handleEmailSignIn = async () => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      setPasswordError("Please verify your email before signing in.");
      await signOut(auth); // Sign out the user if email is not verified
      return;
    }
    fetchCollection(result.user.uid, selectedCategory);
    setEmail("");
    setPassword("");
    setPasswordError("");
  } catch (error) {
    console.error("Error signing in: ", error);
    setPasswordError("Invalid email or password.");
  }
};



  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          pt: 10,
        }}
      >
        {showLandingPage ? (
          <LandingPage />
        ) : (
        <Container
          sx={{
            bgcolor: "background.default",
            height: "80vh",
            width: "80%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: "1rem",
            p: 5,
            borderRadius: 5,
            boxShadow: 5,
          }}
        >
          <Typography variant="h2" sx={{ color: "primary.main" }}>
            Welcome to the Pantry!
          </Typography>
          {user ? (
             <>
             {user.email && !user.emailVerified && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="error">
                  Your email is not verified. Please check your inbox for a verification email.
                </Typography>
                {emailVerificationSent ? (
                  <Typography variant="body1">Verification email sent again.</Typography>
                ) : (
                  <Button onClick={resendVerificationEmail} variant="contained">
                    Resend Verification Email
                  </Button>
                )}
              </Box>
            )}
             <Button onClick={handleSignOut} variant="contained">
               Sign Out
             </Button>
              <div
                style={{
                  display: "flex",
                }}
              >
            <FormControl sx={{ width: "25ch", mx: 2 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-password">
                Search
              </InputLabel>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="standard-adornment-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility">
                      <Search />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Button
              onClick={() => {
                setOpen(!open);
                fetchCollection(user.uid, selectedCategory);
              }}
              variant="outlined"
            >
              Add new item
            </Button>
          </div>
          {open && (
            <Dialog
              open={open}
              sx={{
                backgroundColor: "#21212192",
                height: "100%",
              }}
            >
              <Card
                name={name}
                quantity={quantity}
                setName={setName}
                setQuantity={setQuantity}
                setCategory={setCategory}
                selectedCategory={category}
                category={category} // Pass category
                categories={categories} // Pass categories
                open={open}
                setOpen={setOpen}
                updateData={updateData}
                setUpdateData={setUpdateData}
                fetchCollection={fetchCollection}
                user={user}
              />
            </Dialog>
          )}

          <Stack
            spacing={2}
            sx={{
              width: "80%",
              overflow: "auto",
            }}
          >
            

            {pantryData &&
              pantryData

                .filter((item: { name: string }) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item: { name: string; quantity: number; category: string }) => (
                  
                  <Container
                    key={item.name}
                    
                    sx={{
                      display: "flex",
                      background: "",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      p: 2,
                      borderRadius: 5,
                      boxShadow: "0 0 8px rgba(0, 0, 0, 0.094)",
                      cursor: "pointer",
                      transitionDuration: 1000,
                     
                      "&:hover": {
                        backgroundColor: "#304a3529",
                      },
                    }}
                  >
                    <Stack
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "1rem",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "40%",
                      }}
                    >
                      <Box sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}>
                        <Typography variant="h4">{item.name}</Typography>
                        <Typography variant="h4">{item.quantity}</Typography>
                        <Typography variant="h4" >{item.category}</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{
                        display: "flex",
                        gap: "1rem"
                      }}>

                    <Stack
                      sx={{
                        height: "50px",
                        gap: "2px"
                      }}
                    >
                      <Button
                        variant="text"
                        sx={{
                          backgroundColor: "#304a3529",
                          fontWeight: "bold",
                          color: "#9fedd0",
                          height: "48%",
                          "&:hover": {
                            backgroundColor: "#21212192",
                          },
                        }}
                        onClick={async () => {
                          await updateDoc(doc(db, "users", user.uid, "pantry", item.name), {
                            quantity: item.quantity + 1,
                          });
                          fetchCollection(user.uid, selectedCategory);
                        }}
                      >
                        <KeyboardArrowUpOutlined />
                      </Button>
                      <Button
                        sx={{
                          backgroundColor: "#304a3529",
                          fontWeight: "bold",
                          color: "#9fedd0",
                          height: "48%",
                          "&:hover": {
                            backgroundColor: "#21212192",
                          },
                        }}
                        variant="text"
                        onClick={async () => {
                          await updateDoc(doc(db, "users", user.uid, "pantry", item.name), {
                            quantity: item.quantity - 1,
                          });
                          fetchCollection(user.uid, selectedCategory);
                        }}
                      >
                        <KeyboardArrowDownOutlined />
                      </Button>
                    </Stack>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#098243",
                        fontWeight: "bold",
                        color: "#9fedd0",
                        "&:hover": {
                          backgroundColor: "#024e26",
                        },
                      }}
                      onClick={() => {
                        setName(item.name);
                        setQuantity(item.quantity);
                        setCategory(item.category); // Add this line to set the category
                        setUpdateData(true);
                        setOpen(true);
                      }}
                    >
                      <Edit />
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#9c0707",
                        fontWeight: "bold",
                        color: "#9fedd0",
                        "&:hover": {
                          backgroundColor: "#a50c0c",
                        },
                      }}
                      onClick={async () => {
                        await deleteDoc(doc(db, "users", user.uid, "pantry", item.name));
                        fetchCollection(user.uid, selectedCategory);
                      }}
                    >
                      <DeleteOutlineOutlined />
                    </Button>
                    </Box>
                  </Container>
                ))}
          </Stack>
          </>
          ) : (
            <>
            <Button onClick={handleSignIn} variant="contained">
              Sign In with Google
            </Button>
            <Button onClick={handleAnonymousSignIn} variant="contained">
                Continue as Guest
              </Button>
              {isSignUp ? (
              <>
                <TextField
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
                <FormHelperText error>{passwordError}</FormHelperText>
                <Button onClick={handleEmailSignUp} variant="contained">
                  Sign Up
                </Button>
                <Button onClick={() => setIsSignUp(false)} variant="outlined">
                  Already have an account? Sign In
                </Button>
              </>
            ) : (
              <>
                <TextField
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
                <FormHelperText error>{passwordError}</FormHelperText>
                <Button onClick={handleEmailSignIn} variant="contained">
                  Sign In
                </Button>
                <Button onClick={() => setIsSignUp(true)} variant="outlined">
                  Don't have an account? Sign Up
                </Button>
              </>
            )}
            </>
          )}
        </Container>
        )}
      </Box>
    </ThemeProvider>
  );

}

type Props = {
  name: any;
  quantity: number;
  setName: any;
  setQuantity: any;
  setCategory: any;
  selectedCategory: any;
  category: string;
  categories: string[];
  open: boolean;
  setOpen: any;
  updateData: any;
  setUpdateData: any;
  fetchCollection: any;
  user:any;
};

const Card = ({
  name,
  quantity,
  setName,
  setQuantity,
  setCategory,
  selectedCategory,
  category,
  categories,
  open,
  setOpen,
  updateData,
  setUpdateData,
  fetchCollection,
  user,
}: Props) => {
  const handleSubmit = async () => {
    if (name === "" || quantity === 0 || !user || !selectedCategory) {
      console.log("Please enter valid data");
      return;
    }

    const docRef = doc(db, "users", user.uid, "pantry", name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await setDoc(docRef, { quantity, category: selectedCategory }); // Use selectedCategory
      console.log("Document successfully updated!");
    } else {
      await setDoc(docRef, { quantity, category: selectedCategory }); // Use selectedCategory
      console.log("Document successfully created!");
    }

    fetchCollection(user.uid, selectedCategory); // Fetch with selectedCategory
    setName("");
    setQuantity(1);
    setCategory("");
    setOpen(false);
    setUpdateData(false);
  };

  return (
    <Container
      sx={{
        backgroundColor: "#D6BD98",
        width: "100%",
        height: "50vh",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexDirection: "column",
      }}
    >
      <div
        onClick={() => {
          setUpdateData(false);
          setOpen(!open);
          setName("");
          setQuantity(1);
          setCategory("");
        }}
        style={{
          position: "absolute",
          top: 20,
          right: 10,
          cursor: "pointer",
          padding: "5px",
        }}
      >
        <Close />
      </div>
      <Typography variant="h3" sx={{ color: "primary.main", pt: 4 }}>
        {updateData ? "Update Inventory" : "Add Inventory"}
      </Typography>
      {updateData ? (
        <TextField
          id="outlined-basic"
          label="Enter item name"
          variant="outlined"
          type="text"
          placeholder="Enter item name"
          value={name}
          required
          aria-readonly
        />
      ) : (
        <TextField
          id="outlined-basic"
          label="Enter item name"
          variant="outlined"
          type="text"
          placeholder="Enter item name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
      )}
      <TextField
        id="outlined-basic"
        variant="outlined"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <FormControl sx={{ width: "25ch", mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
            value={category}
            onChange={(event) => setCategory(event.target.value as string)}
            label="Category"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>

      </FormControl>

      <Button
        variant="outlined"
        onClick={handleSubmit}
        sx={{
          width: "100%",
          marginTop: "1rem",
        }}
      >
        {updateData ? "Update" : "Add"}
      </Button>
    </Container>
  );
};
