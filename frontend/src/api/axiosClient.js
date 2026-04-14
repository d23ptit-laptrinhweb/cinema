import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api', // via Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Các biến lưu trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptors
axiosClient.interceptors.request.use(
  (config) => {
    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Return just the data part if the backend returns ApiResponse
    if (response.data && response.data.result !== undefined) {
      return response.data.result;
    }
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    // Nếu mã lỗi là 401 Unauthorized và chưa thử qua refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // Nếu có tác vụ refresh đang chạy, xin vào hàng đợi
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Đánh dấu request này đang thử lại
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      // Nếu không có refreshToken, force đăng xuất
      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error.response?.data || error);
      }

      // Gọi API refresh (dùng axios cơ bản, không dùng axiosClient để tránh vòng lặp)
      return new Promise(function (resolve, reject) {
        axios
          .post('/api/auth/refresh', { refreshToken: refreshToken })
          .then(({ data }) => {
            const result = data.result || data;
            const newAccessToken = result.accessToken;
            const newRefreshToken = result.refreshToken;

            if (!newAccessToken || !newRefreshToken) {
              throw new Error('Refresh token response is invalid');
            }
            
            // Cập nhật local storage
            localStorage.setItem('token', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Cập nhật Authorization header
            axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            
            // Chạy lại các request đang đợi trong failedQueue
            processQueue(null, newAccessToken);
            
            // Thực hiện lại request ban đầu
            resolve(axiosClient(originalRequest));
          })
          .catch((err) => {
            // Nếu refresh lỗi => force đăng xuất
            processQueue(err, null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Handle error formatting generally for other errors
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
