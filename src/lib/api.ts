/**
 * InvestOre Analytics - API Client
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
  PeerSet,
  PeerSetCreate,
  ValuationComparison,
  EVResourceChart,
  ResourceSummary,
  MapData,
  LineageInfo,
  ApiError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const tokens = await this.refreshToken(refreshToken);
              this.setTokens(tokens);
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${tokens.access_token}`;
                return this.client.request(error.config);
              }
            } catch {
              // Refresh failed, clear tokens
              this.clearTokens();
            }
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from storage on init
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  // Token management
  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async register(data: RegisterData): Promise<User> {
    const response = await this.client.post<User>('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>('/auth/login', credentials);
    this.setTokens(response.data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearTokens();
  }

  // ============================================================================
  // Peer Sets
  // ============================================================================

  async createPeerSet(data: PeerSetCreate): Promise<PeerSet> {
    const response = await this.client.post<PeerSet>('/peers', data);
    return response.data;
  }

  async getPeerSets(includePublic = false): Promise<{ items: PeerSet[]; total: number }> {
    const response = await this.client.get('/peers', {
      params: { include_public: includePublic },
    });
    return response.data;
  }

  async getPeerSet(id: number): Promise<PeerSet> {
    const response = await this.client.get<PeerSet>(`/peers/${id}`);
    return response.data;
  }

  async getSharedPeerSet(shareToken: string): Promise<PeerSet> {
    const response = await this.client.get<PeerSet>(`/peers/shared/${shareToken}`);
    return response.data;
  }

  async updatePeerSet(id: number, data: Partial<PeerSetCreate>): Promise<PeerSet> {
    const response = await this.client.put<PeerSet>(`/peers/${id}`, data);
    return response.data;
  }

  async deletePeerSet(id: number): Promise<void> {
    await this.client.delete(`/peers/${id}`);
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  async getValuationComparison(
    peerId: number,
    asOfDate?: string
  ): Promise<ValuationComparison> {
    const response = await this.client.get<ValuationComparison>('/analytics/valuation', {
      params: { peer_id: peerId, as_of_date: asOfDate },
    });
    return response.data;
  }

  async getEVResourceChart(
    peerId: number,
    commodity = 'Au',
    equivalent = 'AuEq'
  ): Promise<EVResourceChart> {
    const response = await this.client.get<EVResourceChart>('/analytics/ev-resource-chart', {
      params: { peer_id: peerId, commodity, equivalent },
    });
    return response.data;
  }

  async getResourceSummary(peerId: number, commodity?: string): Promise<ResourceSummary[]> {
    const response = await this.client.get<ResourceSummary[]>('/analytics/resources/summary', {
      params: { peer_id: peerId, commodity },
    });
    return response.data;
  }

  // ============================================================================
  // Map
  // ============================================================================

  async getMapProjects(
    peerId?: number,
    commodities?: string[],
    stages?: string[],
    jurisdictions?: string[]
  ): Promise<MapData> {
    const response = await this.client.get<MapData>('/map/projects', {
      params: { peer_id: peerId, commodities, stages, jurisdictions },
    });
    return response.data;
  }

  // ============================================================================
  // Lineage
  // ============================================================================

  async getSourceInfo(sourceId: number): Promise<LineageInfo> {
    const response = await this.client.get<LineageInfo>(`/lineage/source/${sourceId}`);
    return response.data;
  }

  async getDataSources(): Promise<LineageInfo[]> {
    const response = await this.client.get<LineageInfo[]>('/lineage/sources');
    return response.data;
  }

  // ============================================================================
  // Export
  // ============================================================================

  async exportCSV(peerId: number, includeResources = true, includeMetrics = true): Promise<Blob> {
    const response = await this.client.get('/export/csv', {
      params: { peer_id: peerId, include_resources: includeResources, include_metrics: includeMetrics },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportJSON(peerId: number): Promise<unknown> {
    const response = await this.client.get('/export/json', {
      params: { peer_id: peerId },
    });
    return response.data;
  }

  // ============================================================================
  // Generic HTTP Methods
  // ============================================================================

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }
}

// Singleton instance
export const api = new ApiClient();
