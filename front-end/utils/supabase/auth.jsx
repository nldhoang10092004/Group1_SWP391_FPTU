import { projectId, publicAnonKey } from './info';

class AuthService {
  baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-180a3e95`;
  token = null;
  user = null;
  profile = null;
  demoMode = false;

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('emt_auth_token');
      const userStr = localStorage.getItem('emt_user');
      const profileStr = localStorage.getItem('emt_profile');
      
      // Check if we're in demo mode
      if (this.token && this.token.startsWith('demo-token-')) {
        this.demoMode = true;
      }
      
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      
      if (profileStr) {
        try {
          this.profile = JSON.parse(profileStr);
        } catch (e) {
          console.error('Failed to parse stored profile:', e);
        }
      }
    }
  }

  saveToStorage() {
    if (typeof window !== 'undefined') {
      if (this.token) {
        localStorage.setItem('emt_auth_token', this.token);
      } else {
        localStorage.removeItem('emt_auth_token');
      }
      
      if (this.user) {
        localStorage.setItem('emt_user', JSON.stringify(this.user));
      } else {
        localStorage.removeItem('emt_user');
      }
      
      if (this.profile) {
        localStorage.setItem('emt_profile', JSON.stringify(this.profile));
      } else {
        localStorage.removeItem('emt_profile');
      }
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : `Bearer ${publicAnonKey}`
    };
  }

  async signIn(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signin`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        if (response.status === 0 || !response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
        }
        
        const data = await response.json();
        throw new Error(data.error || 'Sign in failed');
      }

      const data = await response.json();

      this.token = data.session.access_token;
      this.user = data.user;
      this.profile = data.profile;
      this.saveToStorage();

      return { user: this.user, profile: this.profile };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Fallback to demo mode
        return this.signInDemo(email, password);
      }
      throw error;
    }
  }

  signInDemo(email, password) {
    // Check for temporary accounts created during demo signup
    const tempAccountKey = `temp_account_${email}`;
    const tempAccountData = localStorage.getItem(tempAccountKey);
    
    if (tempAccountData) {
      try {
        const account = JSON.parse(tempAccountData);
        if (account.password === password) {
          this.token = 'demo-token-' + Date.now();
          this.user = account.user;
          this.profile = account.profile;
          this.demoMode = true;
          this.saveToStorage();
          
          // Remove temp account after successful sign-in
          localStorage.removeItem(tempAccountKey);
          
          return { user: this.user, profile: this.profile };
        }
      } catch (e) {
        console.error('Error parsing temp account:', e);
      }
    }
    
    const demoAccounts = {
      'student@emt.com': {
        password: 'password123',
        user: {
          id: 'demo-student-1',
          email: 'student@emt.com',
          fullName: 'Demo Student',
          userType: 'student'
        },
        profile: {
          id: 'demo-student-1',
          email: 'student@emt.com',
          fullName: 'Demo Student',
          userType: 'student',
          currentLevel: 3,
          totalXP: 850,
          streak: 5,
          hasActiveSubscription: true,
          subscriptionType: '3month',
          subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          enrolledCourses: [
            { id: 'course1', enrolledAt: new Date().toISOString(), progress: 65 },
            { id: 'course2', enrolledAt: new Date().toISOString(), progress: 30 },
            { id: 'course3', enrolledAt: new Date().toISOString(), progress: 15 },
            { id: 'course4', enrolledAt: new Date().toISOString(), progress: 0 }
          ],
          avatar: undefined,
          bio: 'Học viên đam mê tiếng Anh',
          learningGoals: 'Nâng cao kỹ năng giao tiếp tiếng Anh để phát triển sự nghiệp',
          targetLevel: 7,
          profile: {
            avatar: undefined,
            bio: 'Học viên đam mê tiếng Anh',
            country: 'Vietnam',
            languages: ['Vietnamese', 'English']
          },
          createdAt: new Date().toISOString()
        }
      },
      'teacher@emt.com': {
        password: 'password123',
        user: {
          id: 'demo-teacher-1',
          email: 'teacher@emt.com',
          fullName: 'Demo Teacher',
          userType: 'teacher'
        },
        profile: {
          id: 'demo-teacher-1',
          email: 'teacher@emt.com',
          fullName: 'Demo Teacher',
          userType: 'teacher',
          teachingCourses: ['course1', 'course2'],
          avatar: undefined,
          bio: 'Giảng viên tiếng Anh có kinh nghiệm',
          learningGoals: 'Chia sẻ kiến thức và giúp học viên đạt được mục tiêu học tập',
          targetLevel: 10,
          profile: {
            avatar: undefined,
            bio: 'Giảng viên tiếng Anh có kinh nghiệm',
            country: 'Vietnam',
            languages: ['Vietnamese', 'English'],
            specialties: ['Grammar', 'Speaking'],
            hourlyRate: 25,
            experience: '5 năm kinh nghiệm giảng dạy'
          },
          createdAt: new Date().toISOString()
        }
      },
      'admin@emt.com': {
        password: 'admin123',
        user: {
          id: 'demo-admin-1',
          email: 'admin@emt.com',
          fullName: 'System Admin',
          userType: 'admin'
        },
        profile: {
          id: 'demo-admin-1',
          email: 'admin@emt.com',
          fullName: 'System Admin',
          userType: 'admin',
          avatar: undefined,
          bio: 'Quản trị viên hệ thống',
          profile: {
            avatar: undefined,
            bio: 'Quản trị viên hệ thống',
            country: 'Vietnam',
            languages: ['Vietnamese', 'English']
          },
          createdAt: new Date().toISOString()
        }
      }
    };

    const account = demoAccounts[email];
    
    if (!account || account.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    this.token = 'demo-token-' + Date.now();
    this.user = account.user;
    this.profile = account.profile;
    this.demoMode = true;
    this.saveToStorage();

    return { user: this.user, profile: this.profile };
  }

  async signUp(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        if (response.status === 0 || !response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
        }
        
        const data = await response.json();
        throw new Error(data.error || 'Sign up failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // In demo mode, create a temporary account in memory for sign-in
        const tempUser = {
          id: 'demo-user-' + Date.now(),
          email: userData.email,
          fullName: userData.fullName,
          userType: userData.userType
        };
        
        const tempProfile = {
          id: tempUser.id,
          email: userData.email,
          fullName: userData.fullName,
          userType: userData.userType,
          currentLevel: 1,
          totalXP: 0,
          streak: 0,
          hasActiveSubscription: false,
          enrolledCourses: [],
          teachingCourses: userData.userType === 'teacher' ? [] : undefined,
          avatar: undefined,
          bio: userData.userType === 'teacher' ? 'Giảng viên mới' : 'Học viên mới',
          learningGoals: userData.userType === 'teacher' ? 'Chia sẻ kiến thức' : 'Học tiếng Anh hiệu quả',
          targetLevel: userData.userType === 'teacher' ? 10 : 5,
          profile: {
            avatar: undefined,
            bio: userData.userType === 'teacher' ? 'Giảng viên mới' : 'Học viên mới',
            country: 'Vietnam',
            languages: ['Vietnamese'],
            specialties: userData.userType === 'teacher' ? [] : undefined,
            hourlyRate: userData.userType === 'teacher' ? 20 : undefined,
            experience: userData.userType === 'teacher' ? 'Mới bắt đầu' : undefined
          },
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage temporarily so user can sign in
        const tempAccountKey = `temp_account_${userData.email}`;
        localStorage.setItem(tempAccountKey, JSON.stringify({
          email: userData.email,
          password: userData.password,
          user: tempUser,
          profile: tempProfile
        }));
        
        return { 
          message: 'Tài khoản đã được tạo thành công (Demo mode)',
          user: tempUser
        };
      }
      throw error;
    }
  }

  async signOut() {
    this.token = null;
    this.user = null;
    this.profile = null;
    this.demoMode = false;
    this.saveToStorage();
  }

  async updateProfile(updates) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode && this.profile) {
      // Simulate profile update in demo mode
      this.profile = {
        ...this.profile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
      return this.profile;
    }

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      this.profile = data.profile;
      this.saveToStorage();

      return data.profile;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Fallback to demo mode for profile update
        if (this.profile) {
          this.profile = {
            ...this.profile,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          this.saveToStorage();
          return this.profile;
        }
      }
      throw error;
    }
  }

  async getProfile() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode) {
      return this.profile;
    }

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      this.profile = data.profile;
      this.saveToStorage();

      return data.profile;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Return cached profile in demo mode
        return this.profile;
      }
      throw error;
    }
  }

  async enrollInCourse(courseId) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode && this.profile) {
      // Simulate enrollment in demo mode
      const isAlreadyEnrolled = this.profile.enrolledCourses?.some(c => c.id === courseId);
      if (isAlreadyEnrolled) {
        throw new Error('Đã đăng ký khóa học này');
      }

      const enrollment = {
        id: courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0
      };

      this.profile = {
        ...this.profile,
        enrolledCourses: [...(this.profile.enrolledCourses || []), enrollment],
        hasActiveSubscription: true // Set subscription status when enrolling
      };
      console.log('Enrolling in course - updated profile:', this.profile);
      this.saveToStorage();

      return enrollment;
    }

    try {
      const response = await fetch(`${this.baseUrl}/enroll`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ courseId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Enrollment failed');
      }

      // Refresh profile to get updated enrollment
      await this.getProfile();

      return data.enrollment;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server để đăng ký khóa học');
      }
      throw error;
    }
  }

  async activateSubscription(planId) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode && this.profile) {
      // Simulate subscription activation in demo mode
      this.profile = {
        ...this.profile,
        hasActiveSubscription: true,
        subscriptionPlan: planId,
        subscriptionActivatedAt: new Date().toISOString()
      };
      this.saveToStorage();

      return {
        message: 'Subscription activated successfully (Demo mode)',
        subscription: {
          planId,
          activatedAt: new Date().toISOString(),
          status: 'active'
        }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/subscription/activate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ planId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Subscription activation failed');
      }

      // Refresh profile to get updated subscription status
      await this.getProfile();

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server để kích hoạt subscription');
      }
      throw error;
    }
  }

  async saveProgress(progressData) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode && this.profile) {
      // Simulate progress saving in demo mode
      const xpGained = progressData.completed ? (progressData.score || 0) : Math.floor((progressData.score || 0) / 2);
      
      this.profile = {
        ...this.profile,
        totalXP: (this.profile.totalXP || 0) + xpGained,
        streak: (this.profile.streak || 0) + (progressData.completed ? 1 : 0)
      };
      this.saveToStorage();

      return {
        message: 'Progress saved successfully (Demo mode)',
        xpGained
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/progress/lesson`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(progressData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save progress');
      }

      // Refresh profile to get updated stats
      await this.getProfile();

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server để lưu tiến độ');
      }
      throw error;
    }
  }

  async getCourseProgress(courseId) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/progress/course/${courseId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch progress');
    }

    return data.progress;
  }

  async submitWriting(taskId, content, wordCount) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode) {
      // Generate demo submission ID
      return `demo_submission_${Date.now()}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/writing/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ taskId, content, wordCount })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit writing');
      }

      return data.submissionId;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server để nộp bài viết');
      }
      throw error;
    }
  }

  async getWritingFeedback(submissionId) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/writing/${submissionId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch feedback');
    }

    return data.submission;
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getCurrentUser() {
    return this.user;
  }

  getCurrentProfile() {
    return this.profile;
  }

  getToken() {
    return this.token;
  }

  // Request System Methods
  async submitRequest(requestData) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode) {
      return {
        id: 'demo_request_' + Date.now(),
        ...requestData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        userId: this.user?.id
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/requests`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      return data.request;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server để gửi yêu cầu');
      }
      throw error;
    }
  }

  async getMyRequests() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    if (this.demoMode) {
      return [
        {
          id: 'demo_request_1',
          type: 'bug_report',
          title: 'Lỗi video không phát được',
          description: 'Video bài học không thể phát trên browser Chrome',
          priority: 'medium',
          status: 'in_progress',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: this.user?.id
        }
      ];
    }

    try {
      const response = await fetch(`${this.baseUrl}/requests/my`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch requests');
      }

      return data.requests;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return [];
      }
      throw error;
    }
  }

  // Admin Methods
  async getAllRequests() {
    if (!this.token || this.user?.userType !== 'admin') {
      throw new Error('Admin access required');
    }

    if (this.demoMode) {
      return [
        {
          id: 'demo_request_1',
          type: 'bug_report',
          title: 'Lỗi video không phát được',
          description: 'Video bài học không thể phát trên browser Chrome',
          priority: 'medium',
          status: 'in_progress',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'demo-student-1',
          userName: 'Demo Student'
        },
        {
          id: 'demo_request_2',
          type: 'feature_request',
          title: 'Thêm tính năng lưu từ vựng',
          description: 'Muốn có notebook để lưu các từ vựng quan trọng',
          priority: 'low',
          status: 'pending',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'demo-teacher-1',
          userName: 'Demo Teacher'
        }
      ];
    }

    try {
      const response = await fetch(`${this.baseUrl}/admin/requests`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch requests');
      }

      return data.requests;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return [];
      }
      throw error;
    }
  }

  async getAdminStats() {
    if (!this.token || this.user?.userType !== 'admin') {
      throw new Error('Admin access required');
    }

    if (this.demoMode) {
      return {
        totalUsers: 1247,
        activeSubscriptions: 423,
        totalRevenue: 125900000,
        monthlyRevenue: 18750000,
        newUsersThisMonth: 89,
        totalCourses: 4,
        totalLessons: 156,
        avgUserProgress: 67
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/admin/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch admin stats');
      }

      return data.stats;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server để lấy thống kê');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
