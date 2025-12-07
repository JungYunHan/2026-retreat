import { apiClient, ApiResponse } from './api-client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface HomeData {
  dDay: number;
  scheduleItems: ScheduleItem[];
  menu: Menu;
  latestNotices: SimpleNotice[];
}

export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
}

export interface Menu {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface SimpleNotice {
  id: number;
  title: string;
  createdAt: string;
}

export interface MyPageData {
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  teamName: string;
  position: string;
  role: string;
  roomName: string | null;
  roomLocation: string | null;
}

export const authApi = {
  /**
   * 로그인
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.accessToken);
      // 사용자명 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('username', credentials.username);
      }
    }
    
    return response;
  },

  /**
   * 로그아웃
   */
  logout: () => {
    apiClient.clearToken();
    // 로그아웃 시 저장된 정보 삭제
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
    }
  },
};

export const pageApi = {
  /**
   * 홈 데이터 조회
   */
  getHomeData: (): Promise<ApiResponse<HomeData>> => {
    return apiClient.get<HomeData>('/home');
  },

  /**
   * 마이페이지 데이터 조회
   */
  getMyPageData: (): Promise<ApiResponse<MyPageData>> => {
    return apiClient.get<MyPageData>('/mypage');
  },
};
