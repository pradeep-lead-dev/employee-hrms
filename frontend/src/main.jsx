import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { NextUIProvider } from "@nextui-org/react";
import Favicon from "react-favicon";


createRoot(document.getElementById('root')).render(
  <>
    <Favicon url='https://dotsito.s3.ap-south-1.amazonaws.com/dotspot/dotspot_v2__white_new-removebg-preview.png' />
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </>
)
