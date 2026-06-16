import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDashboard from "./pages/CompanyDashboard";
import Application from "./pages/Application";
import CreateCompany from "./pages/CreateCompany";
import Upload from "./pages/Upload";
import RatingsEditor from "./pages/RatingsEditor";
import AdminUsers from "./pages/AdminUsers";
import EditCompany from "./pages/EditCompany";
import Simulation from "./pages/Simulation";
import ScenarioComparison from "./pages/ScenarioComparison";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
          <Route path="/companies/new" element={<ProtectedRoute><CreateCompany /></ProtectedRoute>} />
          <Route path="/companies/:id/edit" element={<ProtectedRoute><EditCompany /></ProtectedRoute>} />
          <Route path="/companies/:id/simulate" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
          <Route path="/companies/:id/scenarios" element={<ProtectedRoute><ScenarioComparison /></ProtectedRoute>} />
          <Route path="/companies/:id" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/companies/:companyId/documents/:documentId/ratings" element={<ProtectedRoute><RatingsEditor /></ProtectedRoute>} />
          <Route path="/application" element={<ProtectedRoute><Application /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
