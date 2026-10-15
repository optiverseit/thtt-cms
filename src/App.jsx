
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
import Highlight from './pages/Admin/Highlight/Highlight';
import Booking from './pages/Admin/Booking/Booking';
import WorkPermit from './pages/Admin/WorkPermit/WorkPermit';
import Country from './pages/Admin/Country/Country';
import FeeTier from './pages/Admin/FeeTier/FeeTier';
import PermitDocumentRequirement from './pages/Admin/PermitDocumentRequirement/PermitDocumentRequirement';
import WorkPermitInformation from './pages/Admin/WorkPermitInformation/WorkPermitInformation';
import User from './pages/Admin/User/User';
import CreateUser from './pages/Admin/User/CreateUser';
import EditUser from './pages/Admin/User/EditUser';
import VisaApplicationIndex from './pages/Admin/Visa/VisaApplicationIndex';
import VisaCategory from './pages/Admin/Visa/VisaCategory';
import VisaPricingTier from './pages/Admin/Visa/VisaPricingTier';
import VisaDocumentRequirement from './pages/Admin/Visa/VisaDocumentRequirement';
import VisaInformation from './pages/Admin/Visa/VisaInformation';
import InsuranceApplication from './pages/Admin/Insurance/InsuranceApplication';
import InsurancePlan from './pages/Admin/Insurance/InsurancePlan';
import InsuranceDocumentRequirement from './pages/Admin/Insurance/InsuranceDocumentRequirement';
import InsuranceInformation from './pages/Admin/Insurance/InsuranceInformation';
import InsuranceDynamicFields from './pages/Admin/Insurance/InsuranceDynamicFields';
import InsurancePricingTier from './pages/Admin/Insurance/InsurancePricingTier';
import HotelBooking from './pages/Admin/Hotel/HotelBooking';
import HotelPricingTier from './pages/Admin/Hotel/HotelPricingTier';
import HotelInformation from './pages/Admin/Hotel/HotelInformation';
import HotelPolicy from './pages/Admin/Hotel/HotelPolicy';
import HotelTestimonial from './pages/Admin/Hotel/HotelTestimonial';
import HotelFaq from './pages/Admin/Hotel/HotelFaq';
import Hotel from './pages/Admin/Hotel/Hotel';
import Document from './pages/Admin/Document/Document';
import TravelGuide from './pages/Admin/TravelGuide/TravelGuide';
import PackageTestimonial from './pages/Admin/PackageTestimonial/PackageTestimonial';
import PackageGallery from './pages/Admin/PackageGallery/PackageGallery';
import PackagePolicy from './pages/Admin/PackagePolicy/PackagePolicy';
import WorkPermitHighlights from './pages/Admin/WorkPermitHighlights/WorkPermitHighlights';
import Role from './pages/Admin/Role/Role';
import Permission from './pages/Admin/Permission/Permission';

const ALL_ROLES = ["admin", "cms-admin", "booking-admin"];
const CMS_ROLES = ["admin", "cms-admin"];
const BOOKING_ROLES = ["admin", "booking-admin"];
const ADMIN_ONLY = ["admin"];

function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <Dashboard />
          </ProtectedRoute>} />

        {/* CATEGORIES */}
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={CMS_ROLES}>
            <Category />
          </ProtectedRoute>} />

        <Route
          path="/categories/create"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <CreateCategory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories/edit/:id"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <EditCategory />
            </ProtectedRoute>
          }
        />

        {/* PACKAGES */}
        <Route
          path="/packages"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Package />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages/create"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <CreatePackage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages/edit/:id"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <EditPackage />
            </ProtectedRoute>
          }
        />

        {/* Vehicles */}
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Vehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/create"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <CreateVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/edit/:id"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <EditVehicle />
            </ProtectedRoute>
          }
        />

        {/* HELLI */}
        <Route
          path="/helis"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Heli />
            </ProtectedRoute>
          }
        />

        <Route
          path="/helis/create"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <CreateHeli />
            </ProtectedRoute>
          }
        />

        <Route
          path="/helis/edit/:id"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <EditHeli />
            </ProtectedRoute>
          }
        />

        {/* INCLUSIONS */}
        <Route
          path="/packages/inclusions"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Inclusion />
            </ProtectedRoute>
          }
        />

        {/* EXCLUSION */}
        <Route
          path="/packages/exclusions"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Exclusion />
            </ProtectedRoute>
          }
        />

        {/* Restriction */}
        <Route
          path="/packages/restrictions"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Restriction />
            </ProtectedRoute>
          }
        />

        {/* WHAT TO BRING */}
        <Route
          path="/packages/what-to-bring"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <WhatToBring />
            </ProtectedRoute>
          }
        />

        {/* FAQ */}
        <Route
          path="/packages/faqs"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Faq />
            </ProtectedRoute>
          }
        />

        {/* PRICING TIER */}

        <Route
          path="/packages/pricing-tiers"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <PricingTier />
            </ProtectedRoute>
          }
        />

        {/* ITINERARY */}

        <Route
          path="/packages/itineraries"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Itinerary />
            </ProtectedRoute>
          }
        />

        {/* TESTIMONIAL */}
        <Route
          path="/packages/testimonials"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <PackageTestimonial />
            </ProtectedRoute>
          }
        />

        {/* GALLERY */}
        <Route
          path="/packages/gallery"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <PackageGallery />
            </ProtectedRoute>
          }
        />

        {/* POLICIES */}
        <Route
          path="/packages/policy"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <PackagePolicy />
            </ProtectedRoute>
          }
        />

        {/* HIGHLIGHT */}

        <Route
          path="/packages/highlights"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Highlight />
            </ProtectedRoute>
          }
        />

        {/* BOOKINGS */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={BOOKING_ROLES}>
              <Booking />
            </ProtectedRoute>
          }
        />

        {/* WORK PERMITS */}
        <Route
          path="/work-permits"
          element={
            <ProtectedRoute allowedRoles={BOOKING_ROLES}>
              <WorkPermit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/country"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Country />
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permits/feetiers"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <FeeTier />
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permits/documents"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <PermitDocumentRequirement />
            </ProtectedRoute>
          }
        />



        <Route
          path="/work-permits/highlights"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <WorkPermitHighlights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permits/informations"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <WorkPermitInformation />
            </ProtectedRoute>
          }
        />

        {/* VISA */}

        <Route
          path="/visa-applications"
          element={
            <ProtectedRoute allowedRoles={BOOKING_ROLES}>
              <VisaApplicationIndex />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visa/category"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <VisaCategory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visa/pricing-tiers"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <VisaPricingTier />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visa/documents"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <VisaDocumentRequirement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visa/informations"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <VisaInformation />
            </ProtectedRoute>
          }
        />


        {/* INSURANCE */}

        <Route
          path="/insurance-applications"
          element={
            <ProtectedRoute allowedRoles={BOOKING_ROLES}>
              <InsuranceApplication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insurance/plan"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <InsurancePlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insurance/pricing-tiers"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <InsurancePricingTier />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insurance/documents"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <InsuranceDocumentRequirement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insurance/informations"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <InsuranceInformation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insurance/dynamic-fields"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <InsuranceDynamicFields />
            </ProtectedRoute>
          }
        />


        {/* HOTEL SERVICE */}
        <Route
          path="/hotel-bookings"
          element={
            <ProtectedRoute allowedRoles={BOOKING_ROLES}>
              <HotelBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotels"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Hotel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel/pricing-tiers"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <HotelPricingTier />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel/informations"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <HotelInformation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel/policies"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <HotelPolicy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel/testimonials"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <HotelTestimonial />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel/faqs"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <HotelFaq />
            </ProtectedRoute>
          }
        />


        {/* DOCUMENTS */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <Document />
            </ProtectedRoute>
          }
        />

        {/* TRAVEL GUIDE */}
        <Route
          path="/travel-guide"
          element={
            <ProtectedRoute allowedRoles={CMS_ROLES}>
              <TravelGuide />
            </ProtectedRoute>
          }
        />

        {/* USERS */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <User />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/create"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <CreateUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <EditUser />
            </ProtectedRoute>
          }
        />

        {/* ROLES */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <Role />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/permissions"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY}>
              <Permission />
            </ProtectedRoute>
          }
        /> */}

      </Routes>
    </BrowserRouter>
  )
}

export default App
