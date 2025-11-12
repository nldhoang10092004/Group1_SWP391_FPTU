import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin/transactions`;

// Lấy token từ localStorage hoặc nơi bạn lưu trữ
const getAuthToken = () => {
  return localStorage.getItem('accessToken') || '';
};

// Cấu hình axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Lấy danh sách tất cả transactions
 * GET /api/admin/transactions/view
 */
export const getAllTransactions = async () => {
  try {
    const response = await apiClient.get('/view');
    return response.data;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};

/**
 * Tìm kiếm transactions theo keyword
 * GET /api/admin/transactions/search
 * @param {string} keyword - Từ khóa tìm kiếm
 */
export const searchTransactions = async (keyword) => {
  try {
    const response = await apiClient.get('/search', {
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching transactions:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết transaction theo orderId
 * GET /api/admin/transactions/detail/{orderId}
 * @param {number} orderId - ID của order
 */
export const getTransactionDetail = async (orderId) => {
  try {
    const response = await apiClient.get(`/detail/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    throw error;
  }
};

/**
 * Format currency VND
 * @param {number} amount - Số tiền
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format datetime
 * @param {string} dateString - Chuỗi ngày tháng
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Get status badge color
 * @param {string} status - Trạng thái (PAID, PENDING, etc.)
 */
export const getStatusColor = (status) => {
  const colors = {
    PAID: 'success',
    PENDING: 'warning',
    FAILED: 'danger',
    CANCELLED: 'secondary',
  };
  return colors[status] || 'secondary';
};

/**
 * Get status label
 * @param {string} status - Trạng thái
 */
export const getStatusLabel = (status) => {
  const labels = {
    PAID: 'Đã thanh toán',
    PENDING: 'Chờ thanh toán',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
  };
  return labels[status] || status;
};

export default {
  getAllTransactions,
  searchTransactions,
  getTransactionDetail,
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
};