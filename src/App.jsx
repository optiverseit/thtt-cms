import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Login from './pages/Login/Login'
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';
import Category from './pages/Admin/Category/Category';

function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
          <Dashboard />
        </ProtectedRoute>} />

         <Route path="/categories" element={
          <ProtectedRoute allowedRoles={["admin"]}>
          <Category />
        </ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
