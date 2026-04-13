import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import HomePage from './pages/Home/HomePage';
import FilmListPage from './pages/FilmList/FilmListPage';
import FilmDetailPage from './pages/FilmDetail/FilmDetailPage';
import BranchListPage from './pages/Branch/BranchListPage';
import BranchDetailPage from './pages/Branch/BranchDetailPage';
import MyBookingsPage from './pages/MyBookings/MyBookingsPage';
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentResultPage from './pages/Payment/PaymentResultPage';
import { lazy, Suspense } from 'react';
import NotFoundPage from './pages/NotFound/NotFoundPage';

// Admin Pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import FilmManagement from './pages/Admin/FilmManagement';
import ShowtimeManagement from './pages/Admin/ShowtimeManagement';
import BranchManagement from './pages/Admin/BranchManagement';
import UserManagement from './pages/Admin/UserManagement';
import BookingManagement from './pages/Admin/BookingManagement';
import ProfilePage from './pages/Profile/ProfilePage';

const SeatSelectPage = lazy(() => import('./pages/SeatSelect/SeatSelectPage'));

// Animation variants
const pageVariants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.01 },
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: "easeInOut" }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth pages */}
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="films" element={<PageWrapper><FilmManagement /></PageWrapper>} />
          <Route path="showtimes" element={<PageWrapper><ShowtimeManagement /></PageWrapper>} />
          <Route path="branches" element={<PageWrapper><BranchManagement /></PageWrapper>} />
          <Route path="users" element={<PageWrapper><UserManagement /></PageWrapper>} />
          <Route path="bookings" element={<PageWrapper><BookingManagement /></PageWrapper>} />
        </Route>

        {/* Main pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/films" element={<PageWrapper><FilmListPage /></PageWrapper>} />
          <Route path="/film/:id" element={<PageWrapper><FilmDetailPage /></PageWrapper>} />
          <Route path="/branches" element={<PageWrapper><BranchListPage /></PageWrapper>} />
          <Route path="/branch/:branchId" element={<PageWrapper><BranchDetailPage /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/my-bookings" element={<PageWrapper><MyBookingsPage /></PageWrapper>} />
          <Route path="/booking/:bookingId/payment" element={<PageWrapper><PaymentPage /></PageWrapper>} />
          <Route path="/payment/vnpay-return" element={<PageWrapper><PaymentResultPage /></PageWrapper>} />
          <Route
            path="/showtime/:showtimeId/seats"
            element={
              <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
                <PageWrapper><SeatSelectPage /></PageWrapper>
              </Suspense>
            }
          />
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
