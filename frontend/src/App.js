import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Owner_Dashboard from "./pages/Owner_Dashboard";
import Renter_Dashboard from "./pages/Renter_Dashboard";
import EditCar from "./components/Owner_Dashboard/EditCar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/peer-owner/dashboard" element={<Owner_Dashboard />} />
        <Route path="/renter/dashboard" element={<Renter_Dashboard />} />
        <Route path="/edit-car/:id" element={<EditCar />} />
      </Routes>
    </Router>
  );
}

export default App;