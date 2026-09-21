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
import CreateCategory from './pages/Admin/Category/CreateCategory';
import EditCategory from './pages/Admin/Category/EditCategory';
import Package from './pages/Admin/Package/package';
import CreatePackage from './pages/Admin/Package/CreatePackage';
import EditPackage from './pages/Admin/Package/EditPackage';
import Vehicle from './pages/Admin/Vehicle/Vehicle';
import CreateVehicle from './pages/Admin/Vehicle/CreateVehicle';
import EditVehicle from './pages/Admin/Vehicle/EditVehicle';

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

        {/* CATEGORIES */}
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Category />
          </ProtectedRoute>} />

        <Route
          path="/categories/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateCategory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditCategory />
            </ProtectedRoute>
          }
        />

        {/* PACKAGES */}
        <Route
          path="/packages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Package />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreatePackage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditPackage />
            </ProtectedRoute>
          }
        />

        {/* Vehicles */}
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Vehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditVehicle />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
