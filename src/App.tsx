import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "src/integrations/supabase/client.ts";

// Pages
import HomePage from "./pages/HomePage";
import EventDetails from "./pages/EventDetails";
import ExploreEvents from "./pages/ExploreEvents";
import CheckoutPage from "src/pages/CheckoutPage.tsx";
import UserProfile from "./pages/UserProfile";
import VenueViewer from "./pages/VenueViewer";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminEventCreate from "./pages/AdminEventCreate";
import AdminEventEdit from "./pages/AdminEventEdit";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import PaymentPage from "./pages/payment"; // Optional - if you have a Payment Page

// Components
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/sonner";

// React Query Client
const queryClient = new QueryClient();

function App() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      setIsLoading(true);
      const adminAuth = localStorage.getItem("adminAuth");

      if (adminAuth === "true") {
        setIsAdminAuth(true);
      } else {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (profile?.is_admin) {
            localStorage.setItem("adminAuth", "true");
            setIsAdminAuth(true);
          } else {
            setIsAdminAuth(false);
          }
        } else {
          setIsAdminAuth(false);
        }
      }
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  // Admin Route Protection
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }
    if (!isAdminAuth) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="theme-preference">
        <Router>
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="events" element={<ExploreEvents />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="checkout/:eventId" element={<CheckoutPage />} />

             <Route path="profile" element={<UserProfile />} />
              <Route path="venue/:id" element={<VenueViewer />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="checkout" element={<CheckoutPage />} /> // Only if you want to support manual /checkout


              {/* Optional Payment Route */}
              <Route path="payment" element={<PaymentPage />} />

              {/* Catch-all NotFound */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={<AdminRoute><AdminDashboard /></AdminRoute>}
            />
            <Route
              path="/admin/events"
              element={<AdminRoute><AdminEvents /></AdminRoute>}
            />
            <Route
              path="/admin/events/new"
              element={<AdminRoute><AdminEventCreate /></AdminRoute>}
            />
            <Route
              path="/admin/events/:id/edit"
              element={<AdminRoute><AdminEventEdit /></AdminRoute>}
            />
            <Route
              path="/admin/analytics"
              element={<AdminRoute><AdminAnalytics /></AdminRoute>}
            />

          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
