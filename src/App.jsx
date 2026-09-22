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
import Package from './pages/Admin/Package/Package';
import CreatePackage from './pages/Admin/Package/CreatePackage';
import EditPackage from './pages/Admin/Package/EditPackage';
import Vehicle from './pages/Admin/Vehicle/Vehicle';
import CreateVehicle from './pages/Admin/Vehicle/CreateVehicle';
import EditVehicle from './pages/Admin/Vehicle/EditVehicle';
import Heli from './pages/Admin/Heli/Heli';
import CreateHeli from './pages/Admin/Heli/CreateHeli';
import EditHeli from './pages/Admin/Heli/EditHeli';
import Inclusion from './pages/Admin/Inclusion/Inclusion';
import Exclusion from './pages/Admin/Exclusion/Exclusion';
import Restriction from './pages/Admin/Restriction/Restriction';
import WhatToBring from './pages/Admin/WhatToBring/WhatToBring'
import Faq from './pages/Admin/Faq/Faq'
import PricingTier from './pages/Admin/PricingTier/PricingTier';
import Itinerary from './pages/Admin/Itinerary/Itinerary';

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

        {/* HELLI */}
        <Route
          path="/helis"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Heli />
            </ProtectedRoute>
          }
        />

        <Route
          path="/helis/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateHeli />
            </ProtectedRoute>
          }
        />

        <Route
          path="/helis/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditHeli />
            </ProtectedRoute>
          }
        />

        {/* INCLUSIONS */}
        <Route
          path="/packages/inclusions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Inclusion />
            </ProtectedRoute>
          }
        />

        {/* EXCLUSION */}
        <Route
          path="/packages/exclusions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Exclusion />
            </ProtectedRoute>
          }
        />

        {/* Restriction */}
        <Route
          path="/packages/restrictions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Restriction />
            </ProtectedRoute>
          }
        />

        {/* WHAT TO BRING */}
        <Route
          path="/packages/what-to-bring"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <WhatToBring />
            </ProtectedRoute>
          }
        />

        {/* FAQ */}
        <Route
          path="/packages/faqs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Faq />
            </ProtectedRoute>
          }
        />

        {/* PRICING TIER */}

        <Route
          path="/packages/pricing-tiers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PricingTier />
            </ProtectedRoute>
          }
        />

        {/* ITINERARY */}

        <Route
          path="/packages/itineraries"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Itinerary />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
