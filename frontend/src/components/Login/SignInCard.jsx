import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import axios from 'axios'
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import './login.css'
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_URI
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard({ isLogin, theme }) {
  const [emailError, setEmailError] = React.useState(false);
  const [loginPage, setLoginPage] = React.useState(isLogin);
  const [nameError, setNameError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const { login, homePage } = React.useContext(AuthContext);
  const navigate = useNavigate()

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const name = document.getElementById('name');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!loginPage) {

      if (!name.value || name.value.length < 3) {
        setNameError(true);
        setNameErrorMessage('Name must be at least 3 characters long.');
        isValid = false;
      } else if (!/^[a-zA-Z\s]+$/.test(name.value.trim())) {
        setNameError(true);
        setNameErrorMessage('Name must contain only letters.');
        isValid = false;
      } else {
        setNameError(false);
        setNameErrorMessage('');
      }

    }

    return isValid;
  };


  const loginSubmitHandler = async () => {

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let emailVal = email.value;
    let passwordVal = password.value;
    let isValid = validateInputs();
    if (isValid) {
      try {

        const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/auth/login`, { email: emailVal, password: passwordVal });
        if (response?.data.status=='success') {
          toast.success('Login Successfully')
          navigate(homePage)
          login(response?.data?.token)
        }
      } catch (error) {
        setPasswordError(true)
        
        toast.error((error?.response?.data?.message) || error?.message)
      }
    }

  }

  const signUpSubmitHandler = async () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const name = document.getElementById('name');
    let emailVal = email.value;
    let passwordVal = password.value;
    let nameVal = name.value;

    let isValid = validateInputs();
    if (isValid) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/user-auth/register`, { email: emailVal, password: passwordVal, name: nameVal });
        if (response?.data?.success) {
          toast.success('Registered Successfully')
        }
      } catch (error) {
        setPasswordError(true)
        toast.error((error?.response?.data?.msg) || error?.message)
      }
    }

  }

  return (
    <>
      {loginPage && <Card variant="outlined">
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <img className={theme != 'dark' && 'img-invert'} src='https://dotsito.s3.ap-south-1.amazonaws.com/dotspot_v2__white_new-removebg-preview.png' width={150}></img>
        </Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
              sx={{ ariaLabel: 'email' }}
            />
          </FormControl>
          <FormControl>


            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'baseline' }}
            >
              Forgot your password?
            </Link>
          </Box> */}
            <FormLabel htmlFor="password">Password</FormLabel>

            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <ForgotPassword open={open} handleClose={handleClose} />
          <Button type="submit" fullWidth variant="contained" onClick={loginSubmitHandler}   >
            Sign in
          </Button>

        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>


        </Box>
      </Card>}

      {!loginPage && <Card variant="outlined">
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <img className={theme != 'dark' && 'img-invert'} src='https://dotsito.s3.ap-south-1.amazonaws.com/Dotspot.png' width={150}></img>
        </Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
        >

          <FormControl>
            <FormLabel htmlFor="name">Name</FormLabel>
            <TextField
              error={nameError}
              helperText={nameErrorMessage}
              id="name"
              type="name"
              name="name"
              placeholder="John"
              autoComplete="name"
              // autoFocus
              required
              fullWidth
              variant="outlined"
              color={nameError ? 'error' : 'primary'}
              sx={{ ariaLabel: 'name' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              // autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
              sx={{ ariaLabel: 'email' }}
            />
          </FormControl>
          <FormControl>


            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'baseline' }}
            >
              Forgot your password?
            </Link>
          </Box> */}

            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>





          <Button type="submit" fullWidth variant="contained" onClick={signUpSubmitHandler}   >
            Sign Up
          </Button>

        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>


        </Box>
      </Card>}



    </>

  );
}
