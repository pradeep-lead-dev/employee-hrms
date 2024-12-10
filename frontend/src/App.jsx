import React,{ useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Login from './pages/Login/Login'
import { AuthContext } from './context/AuthContext'
import { Box, CircularProgress } from '@mui/material'
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  const [isLogin, setIsLogin] = useState(false)

  const { token, loading, user } = React.useContext(AuthContext);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return token ? (
    <>
      <Navbar />
    </>
  ) : (
    <Login />
  );
}

export default App
