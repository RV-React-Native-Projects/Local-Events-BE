# 🔗 LocalEve Backend - Frontend Integration Guide

## 📋 Quick Integration Summary

**Copy this entire document to share with your frontend development context (TypeScript & JavaScript compatible)**

---

## 🌐 API Base Configuration

### TypeScript Version

```typescript
// TypeScript API Configuration
interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

const API_CONFIG: ApiConfig = {
  baseURL: "http://localhost:3080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Authentication Headers (add to requests that need auth)
const authHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  image?: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizerId: string;
  interests: string[];
  createdAt: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
```

### JavaScript Version

```javascript
// JavaScript API Configuration
const API_CONFIG = {
  baseURL: "http://localhost:3080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Authentication Headers (add to requests that need auth)
const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});
```

---

## 🔐 Authentication System

### Token Management

#### TypeScript Version

```typescript
// Token storage utilities with TypeScript
class TokenManager {
  private static AUTH_TOKEN_KEY = "auth_token";
  private static REFRESH_TOKEN_KEY = "refresh_token";
  private static USER_DATA_KEY = "user_data";

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  static setUserData(userData: User): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  static getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}
```

#### JavaScript Version

```javascript
// Token storage utilities
const TokenManager = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("auth_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  },

  getAccessToken: () => localStorage.getItem("auth_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),

  clearTokens: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  },

  isAuthenticated: () => !!localStorage.getItem("auth_token"),
};
```

### Authentication Endpoints

#### TypeScript Version

```typescript
// 1. LOGIN (Password-based)
const login = async (
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify({ email, password }),
  });

  const data: ApiResponse<AuthResponse> = await response.json();
  if (data.success && data.data) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    TokenManager.setUserData(data.data.user);
  }
  return data;
};

// 2. REGISTER
const register = async (userData: {
  name: string;
  email: string;
  password: string;
  username?: string;
  bio?: string;
}): Promise<ApiResponse<AuthResponse>> => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify(userData),
  });

  const data: ApiResponse<AuthResponse> = await response.json();
  if (data.success && data.data) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    TokenManager.setUserData(data.data.user);
  }
  return data;
};

// 3. GET CURRENT USER (requires token)
const getCurrentUser = async (): Promise<ApiResponse<{ user: User }>> => {
  const token = TokenManager.getAccessToken();
  if (!token) throw new Error("No access token found");

  const response = await fetch(`${API_CONFIG.baseURL}/auth/me`, {
    headers: authHeaders(token),
  });
  return await response.json();
};

// 4. LOGOUT
const logout = async (): Promise<void> => {
  const token = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  if (token) {
    await fetch(`${API_CONFIG.baseURL}/auth/logout`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ refreshToken }),
    });
  }

  TokenManager.clearTokens();
};

// 5. REFRESH TOKEN
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_CONFIG.baseURL}/auth/refresh`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify({ refreshToken }),
  });

  const data: ApiResponse<AuthResponse> = await response.json();
  if (data.success && data.data) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  }
  return null;
};
```

#### JavaScript Version

```javascript
// 1. LOGIN (Password-based)
const login = async (email, password) => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    localStorage.setItem("user_data", JSON.stringify(data.data.user));
  }
  return data;
};

// 2. REGISTER
const register = async (userData) => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (data.success) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    localStorage.setItem("user_data", JSON.stringify(data.data.user));
  }
  return data;
};

// 3. OAUTH LOGIN
const oauthLogin = async (provider, providerData) => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/oauth`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify({
      provider,
      providerAccountId: providerData.id,
      name: providerData.name,
      email: providerData.email,
      image: providerData.picture || providerData.avatar_url,
    }),
  });

  const data = await response.json();
  if (data.success) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
    localStorage.setItem("user_data", JSON.stringify(data.data.user));
  }
  return data;
};

// 4. GET CURRENT USER
const getCurrentUser = async () => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/auth/me`, {
    headers: authHeaders(token),
  });
  return await response.json();
};

// 5. LOGOUT
const logout = async () => {
  const token = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  await fetch(`${API_CONFIG.baseURL}/auth/logout`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ refreshToken }),
  });

  TokenManager.clearTokens();
};

// 6. REFRESH TOKEN
const refreshToken = async () => {
  const refreshToken = TokenManager.getRefreshToken();
  const response = await fetch(`${API_CONFIG.baseURL}/auth/refresh`, {
    method: "POST",
    headers: API_CONFIG.headers,
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (data.success) {
    TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
  }
  return data;
};
```

---

## 📅 Events API

### Core Event Operations

```javascript
// 1. GET ALL EVENTS (with pagination)
const getEvents = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/events?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 2. SEARCH EVENTS
const searchEvents = async (query, page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/events/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 3. GET EVENT BY ID
const getEventById = async (eventId) => {
  const response = await fetch(`${API_CONFIG.baseURL}/events/${eventId}`);
  return await response.json();
};

// 4. CREATE EVENT (Protected)
const createEvent = async (eventData) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/events`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      ...eventData,
      date: new Date(eventData.date).toISOString(),
    }),
  });
  return await response.json();
};

// 5. UPDATE EVENT (Protected)
const updateEvent = async (eventId, eventData) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/events/${eventId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      ...eventData,
      date: eventData.date ? new Date(eventData.date).toISOString() : undefined,
    }),
  });
  return await response.json();
};

// 6. DELETE EVENT (Protected)
const deleteEvent = async (eventId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return await response.json();
};

// 7. JOIN EVENT (Protected)
const joinEvent = async (eventId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/events/${eventId}/join`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return await response.json();
};

// 8. LEAVE EVENT (Protected)
const leaveEvent = async (eventId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.baseURL}/events/${eventId}/leave`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );
  return await response.json();
};

// 9. GET EVENTS BY INTEREST
const getEventsByInterest = async (interest, page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/events/interest/${encodeURIComponent(interest)}?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 10. GET UPCOMING EVENTS
const getUpcomingEvents = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/events/upcoming?page=${page}&limit=${limit}`
  );
  return await response.json();
};
```

---

## 👥 Users API

```javascript
// 1. GET ALL USERS
const getUsers = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/users?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 2. SEARCH USERS
const searchUsers = async (query, page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 3. GET USER PROFILE
const getUserProfile = async (userId) => {
  const response = await fetch(`${API_CONFIG.baseURL}/users/${userId}/profile`);
  return await response.json();
};

// 4. GET USER EVENTS
const getUserEvents = async (userId, page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/users/${userId}/events?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 5. UPDATE USER (Protected)
const updateUser = async (userId, userData) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(userData),
  });
  return await response.json();
};
```

---

## 🤝 Social Features

```javascript
// 1. FOLLOW USER (Protected)
const followUser = async (followingId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/social/follow`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ followingId }),
  });
  return await response.json();
};

// 2. UNFOLLOW USER (Protected)
const unfollowUser = async (followingId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/social/unfollow`, {
    method: "DELETE",
    headers: authHeaders(token),
    body: JSON.stringify({ followingId }),
  });
  return await response.json();
};

// 3. GET FOLLOWERS
const getFollowers = async (userId, page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/social/followers/${userId}?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 4. GET FOLLOWING
const getFollowing = async (userId, page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/social/following/${userId}?page=${page}&limit=${limit}`
  );
  return await response.json();
};
```

---

## 👫 Groups API

```javascript
// 1. GET ALL GROUPS
const getGroups = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${API_CONFIG.baseURL}/groups?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// 2. CREATE GROUP (Protected)
const createGroup = async (groupData) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/groups`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(groupData),
  });
  return await response.json();
};

// 3. JOIN GROUP (Protected)
const joinGroup = async (groupId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${API_CONFIG.baseURL}/groups/${groupId}/join`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return await response.json();
};

// 4. LEAVE GROUP (Protected)
const leaveGroup = async (groupId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.baseURL}/groups/${groupId}/leave`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );
  return await response.json();
};
```

---

## 🔔 Notifications API

```javascript
// 1. GET USER NOTIFICATIONS (Protected)
const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.baseURL}/notifications/user/${userId}?page=${page}&limit=${limit}`,
    {
      headers: authHeaders(token),
    }
  );
  return await response.json();
};

// 2. MARK NOTIFICATION AS READ (Protected)
const markNotificationRead = async (notificationId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.baseURL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: authHeaders(token),
    }
  );
  return await response.json();
};

// 3. MARK ALL NOTIFICATIONS AS READ (Protected)
const markAllNotificationsRead = async (userId) => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.baseURL}/notifications/user/${userId}/read-all`,
    {
      method: "PUT",
      headers: authHeaders(token),
    }
  );
  return await response.json();
};
```

---

## 🛡️ Error Handling & Interceptors

```javascript
// API Client with automatic token refresh
class APIClient {
  static async request(url, options = {}) {
    let response = await fetch(url, options);

    // Handle token expiration
    if (response.status === 401) {
      const refreshResult = await refreshToken();
      if (refreshResult.success) {
        // Retry original request with new token
        const newToken = TokenManager.getAccessToken();
        const newHeaders = {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(url, { ...options, headers: newHeaders });
      } else {
        // Refresh failed, redirect to login
        TokenManager.clearTokens();
        window.location.href = "/login";
        return;
      }
    }

    return await response.json();
  }
}

// Global error handler
const handleAPIError = (error) => {
  if (error.status === 401) {
    TokenManager.clearTokens();
    window.location.href = "/login";
  } else if (error.status === 403) {
    alert("You do not have permission to perform this action");
  } else if (error.status >= 500) {
    alert("Server error. Please try again later.");
  }
  console.error("API Error:", error);
};
```

---

## 📊 Data Models & Types

```javascript
// TypeScript interfaces (or PropTypes for React)

// User Model
const UserModel = {
  id: "string",
  name: "string",
  email: "string",
  username: "string?",
  bio: "string?",
  image: "string?",
  createdAt: "string",
};

// Event Model
const EventModel = {
  id: "string",
  title: "string",
  description: "string",
  date: "string", // ISO date string
  location: "string",
  organizerId: "string",
  interests: "string[]",
  createdAt: "string",
};

// Group Model
const GroupModel = {
  id: "string",
  name: "string",
  createdBy: "string",
  createdAt: "string",
};

// Notification Model
const NotificationModel = {
  id: "string",
  userId: "string",
  content: "string",
  read: "boolean",
  createdAt: "string",
};
```

---

## 🎯 Interest Categories

```javascript
// Available interest categories for events
const INTEREST_CATEGORIES = [
  "Music & Audio",
  "Coffee & Chat",
  "Arts & Crafts",
  "Photography",
  "Books & Poetry",
  "Games & Sports",
  "Food & Cooking",
  "Tech & Innovation",
  "Fitness & Wellness",
  "Social Impact",
  "Music Production",
  "Business & Career",
  "Learning & Education",
  "Outdoor Adventures",
  "Nightlife & Entertainment",
  "Community Building",
];
```

---

## 🧪 Test Credentials

```javascript
// For testing purposes
const TEST_CREDENTIALS = {
  user1: {
    email: "john@example.com",
    password: "password123",
  },
  user2: {
    email: "jane@example.com",
    password: "password123",
  },
};
```

---

## 🚀 Quick Setup Checklist

1. **✅ Set API Base URL** → `http://localhost:3080/api`
2. **✅ Implement Token Management** → Use localStorage for tokens
3. **✅ Add Authentication Headers** → `Authorization: Bearer <token>`
4. **✅ Handle Token Refresh** → Auto-refresh on 401 errors
5. **✅ Implement Error Handling** → Global error handlers
6. **✅ Add Loading States** → Show spinners during API calls
7. **✅ Test Authentication Flow** → Login → Protected Route → Logout

---

## 🔧 Common Implementation Patterns

### React Hook Example

```javascript
// useAuth hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = TokenManager.getAccessToken();
    if (token) {
      getCurrentUser().then((response) => {
        if (response.success) {
          setUser(response.data.user);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
```

### Vue.js Store Example

```javascript
// Vuex store
const authStore = {
  state: {
    user: null,
    isAuthenticated: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await login(credentials.email, credentials.password);
      if (response.success) {
        commit("SET_USER", response.data.user);
      }
      return response;
    },
  },
};
```

---

## 📱 Complete Backend Integration Summary

**🌐 API Base:** `http://localhost:3080/api`  
**🔐 Auth Method:** JWT Bearer tokens  
**📊 Total Endpoints:** 66  
**💾 Database:** PostgreSQL with Drizzle ORM  
**🔒 Security:** PBKDF2 password hashing, token blacklisting

**Key Features Available:**

- ✅ User authentication (password + OAuth)
- ✅ Event CRUD operations with interests
- ✅ Social features (follow/unfollow)
- ✅ Group management
- ✅ Real-time notifications
- ✅ User verification system
- ✅ Search and filtering
- ✅ Pagination support

**Ready to integrate!** Copy this guide and use the provided functions to connect your frontend to the LocalEve backend.
