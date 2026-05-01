import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { type Permission } from "@/lib/authorization";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import FairsList from "./pages/FairsList";
import FairDetail from "./pages/FairDetail";
import BookingsList from "./pages/BookingsList";
import FairVersions from "./pages/FairVersions";
import FairUsers from "./pages/FairUsers";
import FairStands from "@/pages/FairStands";
import VenuesList from "./pages/VenuesList";
import VenueDetail from "./pages/VenueDetail";
import ExhibitorPortal from "./pages/ExhibitorPortal";
import UsersManagement from "./pages/UsersManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import UICatalog from "./pages/UICatalog";
// Fintech modules
import Accounts from "./pages/Accounts";
import Cards from "./pages/Cards";
import Transactions from "./pages/Transactions";
import Transfers from "./pages/Transfers";
import Markets from "./pages/Markets";
import Crypto from "./pages/Crypto";
import Lending from "./pages/Lending";
import Insurance from "./pages/Insurance";
import Goals from "./pages/Goals";

const STORAGE_KEY = "fairplan-active-user-id";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(!!storedUserId);
  }, []);

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequirePermission({ element, permission }: { element: JSX.Element; permission: Permission }) {
  const { can, homePath } = useProfile();

  if (!can(permission)) {
    return <Navigate to={homePath} replace />;
  }

  return element;
}

function RequireRoleExhibitor({ element }: { element: JSX.Element }) {
  const { isRole, homePath } = useProfile();

  if (!isRole("exhibitor")) {
    return <Navigate to={homePath} replace />;
  }

  return element;
}

function HomeRoute() {
  const { homePath } = useProfile();

  if (homePath !== "/") {
    return <Navigate to={homePath} replace />;
  }

  return <Dashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <ProfileProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/" element={<HomeRoute />} />

                {/* Investing — preserved from the previous concept */}
                <Route path="/fairs" element={<RequirePermission permission="view_fairs" element={<FairsList />} />} />
                <Route path="/fairs/:fairId" element={<RequirePermission permission="view_fairs" element={<FairDetail />} />}>
                  <Route path="stands"   element={<RequirePermission permission="view_fairs"          element={<FairStands />} />} />
                  <Route path="bookings" element={<RequirePermission permission="view_bookings"       element={<BookingsList />} />} />
                  <Route path="users"    element={<RequirePermission permission="view_fair_users"     element={<FairUsers />} />} />
                  <Route path="versions" element={<RequirePermission permission="view_fair_versions" element={<FairVersions />} />} />
                </Route>
                <Route path="/venues" element={<RequirePermission permission="view_venues" element={<VenuesList />} />} />
                <Route path="/venues/:venueId" element={<RequirePermission permission="view_venues" element={<VenueDetail />} />} />
                <Route path="/users" element={<RequirePermission permission="manage_users" element={<UsersManagement />} />} />
                <Route path="/exhibitor" element={<RequireRoleExhibitor element={<ExhibitorPortal />} />} />

                {/* Fintech modules */}
                <Route path="/accounts"     element={<Accounts />} />
                <Route path="/cards"        element={<Cards />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transfers"    element={<Transfers />} />
                <Route path="/markets"      element={<Markets />} />
                <Route path="/crypto"       element={<Crypto />} />
                <Route path="/lending"      element={<Lending />} />
                <Route path="/insurance"    element={<Insurance />} />
                <Route path="/goals"        element={<Goals />} />

                <Route path="/ui-catalog" element={<UICatalog />} />
              </Route>
              <Route path="*" element={<RequireAuth><NotFound /></RequireAuth>} />
            </Routes>
          </HashRouter>
        </ProfileProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
