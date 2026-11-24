import { getApiUrl } from '../utils/urlUtils';

const API_URL = getApiUrl();

export const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    let data = {};
    const text = await response.text();
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }
    
    if (!response.ok) {
      const fallbackMsg = (response.status === 401 || response.status === 403)
        ? 'Identifiants ou privilèges incorrects. Vérifiez votre saisie.'
        : `Erreur serveur (${response.status})`;
      throw new Error(data.message || fallbackMsg);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

export const login = (username, password) => {
  return apiCall('/auth/login', 'POST', { username, password });
};

export const register = (usernameOrData, email, password, role = 'USER', fullName = '') => {
  if (typeof usernameOrData === 'object' && usernameOrData !== null) {
    return apiCall('/auth/register', 'POST', usernameOrData);
  }
  return apiCall('/auth/register', 'POST', { username: usernameOrData, email, password, role, fullName });
};

export const sendOtp = (email) => {
  return apiCall('/auth/send-otp', 'POST', { email });
};

export const registerWithOtp = (registrationData) => {
  return apiCall('/auth/register-with-otp', 'POST', registrationData);
};

export const socialLogin = (socialData) => {
  return apiCall('/auth/social-login', 'POST', socialData);
};

export const getProfile = (token) => {
  return apiCall('/users/me', 'GET', null, token);
};

// --- Articles ---
export const getArticles = (category = null, region = null, status = null, token = null) => {
  let query = [];
  if (category) query.push(`category=${encodeURIComponent(category)}`);
  if (region) query.push(`region=${encodeURIComponent(region)}`);
  if (status) query.push(`status=${encodeURIComponent(status)}`);
  const queryString = query.length > 0 ? '?' + query.join('&') : '';
  return apiCall(`/contents/articles${queryString}`, 'GET', null, token);
};

export const getArticle = (id, token = null) => {
  return apiCall(`/contents/articles/${id}`, 'GET', null, token);
};

export const getArticlesByAuthor = (username, token = null) => {
  return apiCall(`/contents/articles/author/${username}`, 'GET', null, token);
};

export const createArticle = (articleData, token) => {
  return apiCall('/contents/articles', 'POST', articleData, token);
};

export const updateArticle = (id, articleData, token) => {
  return apiCall(`/contents/articles/${id}`, 'PUT', articleData, token);
};

export const submitArticle = (id, token) => {
  return apiCall(`/contents/articles/${id}/submit`, 'POST', null, token);
};

export const publishArticleDirectly = (id, token) => {
  return apiCall(`/contents/articles/${id}/publish`, 'POST', null, token);
};

export const reviewArticle = (id, action, reviewerUsername, token, rejectionReason = null) => {
  let url = `/contents/articles/${id}/review?action=${action}&reviewerUsername=${reviewerUsername}`;
  if (rejectionReason) {
    url += `&rejectionReason=${encodeURIComponent(rejectionReason)}`;
  }
  return apiCall(url, 'POST', null, token);
};

// --- Medias ---
export const uploadMedia = async (file, articleId = null, token = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (articleId) {
    formData.append('articleId', articleId);
  }

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}/medias/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    let data = {};
    const text = await response.text();
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }
    if (!response.ok) {
      throw new Error(data.message || `Erreur lors de l'upload du média (${response.status})`);
    }
    return data;
  } catch (error) {
    console.error("Media Upload Error:", error);
    throw error;
  }
};

// --- Comments ---
export const getComments = (articleId) => {
  return apiCall(`/comments/article/${articleId}`, 'GET');
};

export const postComment = (commentData, token) => {
  return apiCall('/comments', 'POST', commentData, token);
};

export const deleteComment = (id, token) => {
  return apiCall(`/comments/${id}`, 'DELETE', null, token);
};

export const flagComment = (id, token) => {
  return apiCall(`/comments/${id}/flag`, 'POST', null, token);
};

export const likeComment = (id, token = null) => {
  return apiCall(`/comments/${id}/like`, 'POST', null, token);
};

export const getFlaggedComments = (token) => {
  return apiCall('/comments/moderation', 'GET', null, token);
};

export const moderateComment = (id, action, token) => {
  return apiCall(`/comments/${id}/moderate?action=${action}`, 'PUT', null, token);
};

export const searchArticles = (query = '', category = '', region = '') => {
  let params = [];
  if (query) params.push(`q=${encodeURIComponent(query)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (region) params.push(`region=${encodeURIComponent(region)}`);
  const queryString = params.length > 0 ? '?' + params.join('&') : '';
  return apiCall(`/search${queryString}`, 'GET');
};

// --- Podcasts ---
export const getEpisodes = (showTitle = '', category = '') => {
  let params = [];
  if (showTitle) params.push(`showTitle=${encodeURIComponent(showTitle)}`);
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  const queryString = params.length > 0 ? '?' + params.join('&') : '';
  return apiCall(`/podcasts/episodes${queryString}`, 'GET');
};

export const getEpisode = (id) => {
  return apiCall(`/podcasts/episodes/${id}`, 'GET');
};

export const createEpisode = (episodeData, token) => {
  return apiCall('/podcasts/episodes', 'POST', episodeData, token);
};

export const getShows = () => {
  return apiCall('/podcasts/shows', 'GET');
};

// --- Lives ---
export const getActiveLive = () => {
  return apiCall('/lives/active', 'GET');
};

export const getUpcomingLives = () => {
  return apiCall('/lives/upcoming', 'GET');
};

export const getAllLives = () => {
  return apiCall('/lives', 'GET');
};

export const scheduleLive = (liveData, token) => {
  return apiCall('/lives', 'POST', liveData, token);
};

export const updateLiveStatus = (id, status, token) => {
  return apiCall(`/lives/${id}/status?status=${status}`, 'PUT', null, token);
};

// --- Notifications ---
export const getNotifications = (username) => {
  return apiCall(`/notifications?username=${encodeURIComponent(username)}`, 'GET');
};

export const markNotifAsRead = (id, token) => {
  return apiCall(`/notifications/${id}/read`, 'PUT', null, token);
};

export const broadcastNotification = (payload, token) => {
  return apiCall('/notifications/broadcast', 'POST', payload, token);
};

// --- Messagerie Interne & Support Collaborateurs ---
export const getInternalMessages = (category = null, token = null) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiCall(`/notifications/messages${query}`, 'GET', null, token);
};

export const sendInternalMessage = (messageData, token) => {
  return apiCall('/notifications/messages', 'POST', messageData, token);
};

export const toggleResolveInternalMessage = (id, token) => {
  return apiCall(`/notifications/messages/${id}/resolve`, 'PUT', null, token);
};

// --- Analytics ---
export const trackPageView = (viewData) => {
  const payload = typeof viewData === 'object' && viewData !== null ? viewData : { articleId: viewData };
  return apiCall('/analytics/track', 'POST', payload).catch(() => {});
};

export const getPopularArticles = () => {
  return apiCall('/analytics/reports/popular', 'GET');
};

// --- Ads ---
export const getActiveAds = (placement) => {
  return apiCall(`/ads/active?placement=${encodeURIComponent(placement)}`, 'GET');
};

export const getAllAds = (token) => {
  return apiCall('/ads', 'GET', null, token);
};

export const createAd = (adData, token) => {
  return apiCall('/ads', 'POST', adData, token);
};

export const trackAdClick = (id) => {
  return apiCall(`/ads/${id}/click`, 'POST');
};

// --- User Management (Admin / Super Admin) ---
export const getUsers = (token) => {
  return apiCall('/users', 'GET', null, token);
};

export const updateUserActivation = (id, active, token) => {
  return apiCall(`/users/${id}/activate?active=${active}`, 'PUT', null, token);
};

export const updateUserRole = (id, role, token) => {
  return apiCall(`/users/${id}/role?role=${encodeURIComponent(role)}`, 'PUT', null, token);
};

export const deleteUser = (id, token) => {
  return apiCall(`/users/${id}`, 'DELETE', null, token);
};

// --- Notifications & Breaking News (Article 47) ---
export const publishBreakingNews = (data, token) => {
  return apiCall('/notifications/breaking', 'POST', data, token);
};

// --- Mobile Money & Régie Publicitaire (Article 48) ---
export const initiateAdPayment = (data, token = null) => {
  return apiCall('/ads/payments/initiate', 'POST', data, token);
};

export const confirmAdPayment = (paymentId, token = null) => {
  return apiCall(`/ads/payments/${paymentId}/confirm`, 'POST', null, token);
};

export const getAdPayments = (token = null) => {
  return apiCall('/ads/payments', 'GET', null, token);
};

// --- Traçabilité & Registre d'Audit Légal (Article 49) ---
export const getArticleAuditLogs = (articleId, token = null) => {
  return apiCall(`/contents/articles/${articleId}/audit`, 'GET', null, token);
};

export const getAllAuditLogs = (token = null) => {
  return apiCall('/contents/audit', 'GET', null, token);
};

