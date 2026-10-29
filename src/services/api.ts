const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('localhub_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; count?: number; unreadCount?: number }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }
}

export const api = {
  // Auth
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (body: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Businesses
  getBusinesses: (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/businesses${qs}`);
  },
  getBusinessById: (id: string) => apiRequest(`/businesses/${id}`),
  getBusinessBySlug: (slug: string) => apiRequest(`/businesses/slug/${slug}`),
  getMyBusiness: () => apiRequest('/businesses/owner/my-business'),
  createBusiness: (body: any) => apiRequest('/businesses', { method: 'POST', body: JSON.stringify(body) }),
  updateBusiness: (id: string, body: any) => apiRequest(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBusiness: (id: string) => apiRequest(`/businesses/${id}`, { method: 'DELETE' }),
  geocodeLocation: (params: { address?: string; city?: string; state?: string; postalCode?: string; country?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.append(k, v);
    });
    return apiRequest(`/businesses/geocode?${qs.toString()}`);
  },

  // Products
  getProductsByBusiness: (businessId: string) => apiRequest(`/products/business/${businessId}`),
  getProductById: (id: string) => apiRequest(`/products/${id}`),
  createProduct: (body: any) => apiRequest('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Services
  getServicesByBusiness: (businessId: string) => apiRequest(`/services/business/${businessId}`),
  createService: (body: any) => apiRequest('/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id: string, body: any) => apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteService: (id: string) => apiRequest(`/services/${id}`, { method: 'DELETE' }),

  // Offers
  getOffersByBusiness: (businessId: string) => apiRequest(`/offers/business/${businessId}`),
  createOffer: (body: any) => apiRequest('/offers', { method: 'POST', body: JSON.stringify(body) }),
  updateOffer: (id: string, body: any) => apiRequest(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOffer: (id: string) => apiRequest(`/offers/${id}`, { method: 'DELETE' }),
  validateCoupon: (businessId: string, couponCode: string, subtotal: number) =>
    apiRequest('/offers/validate', {
      method: 'POST',
      body: JSON.stringify({ businessId, couponCode, subtotal }),
    }),

  // Orders
  createOrder: (body: any) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => apiRequest('/orders/my-orders'),
  getBusinessOrders: (businessId: string, status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/orders/business/${businessId}${qs}`);
  },
  getOrderById: (id: string) => apiRequest(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Reviews
  getReviewsByBusiness: (businessId: string) => apiRequest(`/reviews/business/${businessId}`),
  createReview: (body: any) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  updateReview: (id: string, body: any) => apiRequest(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReview: (id: string) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  respondToReview: (id: string, response: string) =>
    apiRequest(`/reviews/${id}/respond`, { method: 'POST', body: JSON.stringify({ response }) }),

  // Favorites
  getFavorites: () => apiRequest('/favorites'),
  addFavorite: (businessId: string) => apiRequest(`/favorites/${businessId}`, { method: 'POST' }),
  removeFavorite: (businessId: string) => apiRequest(`/favorites/${businessId}`, { method: 'DELETE' }),

  // Analytics
  getBusinessAnalytics: (businessId: string) => apiRequest(`/analytics/business/${businessId}`),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),

  // Messages
  sendMessage: (body: any) => apiRequest('/messages', { method: 'POST', body: JSON.stringify(body) }),
  sendSupportMessage: (body: any) => apiRequest('/messages/support', { method: 'POST', body: JSON.stringify(body) }),
  getBusinessMessages: (businessId: string) => apiRequest(`/messages/business/${businessId}`),
  markMessageRead: (id: string) => apiRequest(`/messages/${id}/read`, { method: 'PUT' }),

  // Categories
  getCategories: (includeAll?: boolean) => apiRequest(includeAll ? '/categories?all=true' : '/categories'),
  createCategory: (body: any) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: any) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleCategory: (id: string) => apiRequest(`/categories/${id}/toggle`, { method: 'PATCH' }),
  deleteCategory: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Media Upload
  uploadImage: (image: string, folder?: string) =>
    apiRequest('/upload', { method: 'POST', body: JSON.stringify({ image, folder }) }),

  // Admin
  getAdminAnalytics: (range?: string) =>
    apiRequest(`/admin/analytics${range ? `?range=${encodeURIComponent(range)}` : ''}`),
  getAdminUsers: (params?: { q?: string; role?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.role) query.set('role', params.role);
    const qs = query.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  createAdminUser: (body: any) =>
    apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminUser: (id: string, body: any) =>
    apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminBusinesses: (params?: { q?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return apiRequest(`/admin/businesses${qs ? `?${qs}` : ''}`);
  },
  updateBusinessStatus: (id: string, status: string, reason?: string) =>
    apiRequest(`/admin/businesses/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),
  getAdminOrders: (params?: { q?: string; status?: string; range?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.range) query.set('range', params.range);
    const qs = query.toString();
    return apiRequest(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  getAdminReviews: (params?: { q?: string; status?: string; rating?: number | string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.rating !== undefined) query.set('rating', String(params.rating));
    const qs = query.toString();
    return apiRequest(`/admin/reviews${qs ? `?${qs}` : ''}`);
  },
  moderateAdminReview: (id: string, status: string, reason?: string) =>
    apiRequest(`/admin/reviews/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),
  deleteAdminReview: (id: string) =>
    apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),
};
