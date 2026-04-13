import axiosClient from './axiosClient';

// ==================== AUTH ====================
export const authApi = {
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => {
    const token = localStorage.getItem('accessToken');
    return axiosClient.post('/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  refresh: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),
  changePassword: (data) => axiosClient.post('/auth/change-password', data),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),
};

// ==================== USER ====================
export const userApi = {
  create: (data) => axiosClient.post('/sign-up', data),
  getAll: () => axiosClient.get('/users'),
  getById: (id) => axiosClient.get(`/users/${id}`),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
  getMyInfo: () => axiosClient.get('/my-info'),
  updateMyInfo: (data) => axiosClient.put('/my-info', data),
};

// ==================== FILM ====================
export const filmApi = {
  create: (data) => axiosClient.post('/film', data),
  getAll: () => axiosClient.get('/film'),
  getNowShowing: () => axiosClient.get('/film/now-showing'),
  getUpcoming: () => axiosClient.get('/film/upcoming'),
  getById: (id) => axiosClient.get(`/film/${id}`),
  update: (id, data) => axiosClient.put(`/film/${id}`, data),
  delete: (id) => axiosClient.delete(`/film/${id}`),
};

// ==================== GENRE ====================
export const genreApi = {
  create: (data) => axiosClient.post('/genre', data),
  getAll: () => axiosClient.get('/genre'),
  update: (id, data) => axiosClient.put(`/genre/${id}`, data),
  delete: (id) => axiosClient.delete(`/genre/${id}`),
};

// ==================== BRANCH ====================
export const branchApi = {
  create: (data) => axiosClient.post('/branch', data),
  getAll: () => axiosClient.get('/branch'),
  getById: (id) => axiosClient.get(`/branch/${id}`),
  update: (id, data) => axiosClient.put(`/branch/${id}`, data),
  delete: (id) => axiosClient.delete(`/branch/${id}`),
};

// ==================== ROOM ====================
export const roomApi = {
  create: (data) => axiosClient.post('/room', data),
  getAll: () => axiosClient.get('/room'),
  getById: (id) => axiosClient.get(`/room/${id}`),
  update: (id, data) => axiosClient.put(`/room/${id}`, data),
  delete: (id) => axiosClient.delete(`/room/${id}`),
};

// ==================== SHOWTIME ====================
export const showtimeApi = {
  getAll: () => axiosClient.get('/showtime'),
  create: (data) => axiosClient.post('/showtime', data),
  getById: (id) => axiosClient.get(`/showtime/${id}`),
  getByFilm: (filmId) => axiosClient.get(`/showtime/film/${filmId}`),
  getByRoom: (roomId) => axiosClient.get(`/showtime/room/${roomId}`),
  getByBranch: (branchId, date) => axiosClient.get(`/showtime/branch/${branchId}`, { params: { date } }),
  update: (id, data) => axiosClient.put(`/showtime/${id}`, data),
  delete: (id) => axiosClient.delete(`/showtime/${id}`),
};

// ==================== TICKET ====================
export const ticketApi = {
  getAll: () => axiosClient.get('/ticket'),
  getById: (id) => axiosClient.get(`/ticket/${id}`),
  getByShowtimeId: (showtimeId) => axiosClient.get(`/ticket/showtime/${showtimeId}`),
  update: (id, data) => axiosClient.put(`/ticket/${id}`, data),
};

// ==================== BOOKING ====================
export const bookingApi = {
  create: (data) => axiosClient.post('/booking', data),
  getAll: () => axiosClient.get('/booking'),
  getById: (id) => axiosClient.get(`/booking/${id}`),
  getMyBookings: () => axiosClient.get('/booking/my-bookings/list'),
  getMyBookingById: (id) => axiosClient.get(`/booking/my-bookings/${id}`),
  update: (id, data) => axiosClient.put(`/booking/${id}`, data),
  cancel: (id) => axiosClient.delete(`/booking/${id}`),
};

// ==================== VNPAY ====================
export const vnpayApi = {
  createPaymentUrl: (data) => axiosClient.post('/v1/vnpay/payment-url', data),
  handleReturn: (params) => axiosClient.get('/v1/vnpay/return', { params }),
  queryTransaction: (data) => axiosClient.post('/v1/vnpay/querydr', data),
  refund: (data) => axiosClient.post('/v1/vnpay/refund', data),
};

export default axiosClient;
