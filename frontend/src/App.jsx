import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import FilmDetail from './pages/FilmDetail';
import BookingShowtimes from './pages/BookingShowtimes';
import BookingSeat from './pages/BookingSeat';
import Checkout from './pages/Checkout';
import PaymentReturn from './pages/PaymentReturn';
import PaymentConfirmation from './pages/PaymentConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFilms from './pages/admin/AdminFilms';
import AdminRooms from './pages/admin/AdminRooms';
import AdminShowtimes from './pages/admin/AdminShowtimes';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLogin from './pages/admin/AdminLogin';
import AdminGenres from './pages/admin/AdminGenres';
import AdminSeatTypePrices from './pages/admin/AdminSeatTypePrices';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="film/:id" element={<FilmDetail />} />
          <Route path="booking/film/:filmId" element={<BookingShowtimes />} />
          <Route path="booking/seat/:showtimeId" element={<BookingSeat />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="v1/vnpay/return" element={<PaymentReturn />} />
          <Route path="payment/confirmation" element={<PaymentConfirmation />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="films" element={<AdminFilms />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="seat-type-prices" element={<AdminSeatTypePrices />} />
          <Route path="showtimes" element={<AdminShowtimes />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="genres" element={<AdminGenres />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
