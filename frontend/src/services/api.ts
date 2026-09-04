import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CostSummary {
  total_monthly_spend: number;
  projected_savings: number;
  active_resources_count: number;
  spend_change_percentage: number;
  daily_trends: Array<{ date: string; spend: number }>;
  service_breakdown: Array<{ service: string; amount: number; percentage: number }>;
  regional_breakdown: Array<{ region: string; count: number; estimated_cost: number }>;
}

export interface CloudResource {
  id: number;
  resource_id: string;
  name: string;
  provider: string;
  type: string;
  region: string;
  status: string;
  estimated_monthly_cost: number;
  details?: Record<string, any>;
  created_at: string;
}

export interface Recommendation {
  id: number;
  resource_id: string;
  resource_name?: string;
  service_type: string;
  action_type: string;
  current_state: string;
  recommended_state: string;
  estimated_savings: number;
  ai_explanation: string;
  risk_assessment: string;
  confidence_score: number;
  status: string;
  remediated_at?: string;
  remediation_log?: string;
  created_at: string;
}

export interface AWSStatus {
  connected: boolean;
  account_id?: string;
  region: string;
  identity_arn?: string;
  mode: string;
  resource_counts: Record<string, number>;
  last_synced_at?: string;
}

export const fetchCostSummary = async (): Promise<CostSummary> => {
  const { data } = await apiClient.get<CostSummary>('/costs/summary');
  return data;
};

export const fetchCloudResources = async (type?: string, status?: string): Promise<CloudResource[]> => {
  const params: Record<string, string> = {};
  if (type && type !== 'all') params.resource_type = type;
  if (status && status !== 'all') params.status = status;
  const { data } = await apiClient.get<CloudResource[]>('/costs/explorer', { params });
  return data;
};

export const fetchRecommendations = async (status?: string): Promise<Recommendation[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await apiClient.get<Recommendation[]>('/optimizations/', { params });
  return data;
};

export const triggerCloudScan = async (): Promise<Recommendation[]> => {
  const { data } = await apiClient.post<Recommendation[]>('/optimizations/scan');
  return data;
};

export const remediateRecommendation = async (id: number, createBackup: boolean = true) => {
  const { data } = await apiClient.post(`/optimizations/${id}/remediate`, { create_backup: createBackup });
  return data;
};

export const askFinOpsCopilot = async (message: string) => {
  const { data } = await apiClient.post<{ response: string; sources?: any[] }>('/chat/', { message });
  return data;
};

export const fetchAWSStatus = async (): Promise<AWSStatus> => {
  const { data } = await apiClient.get<AWSStatus>('/aws/status');
  return data;
};

export const updateAWSCredentials = async (creds: {
  aws_access_key_id: string;
  aws_secret_access_key: string;
  aws_default_region: string;
  aws_session_token?: string;
}) => {
  const { data } = await apiClient.post('/aws/credentials', creds);
  return data;
};

export const syncAWSNow = async () => {
  const { data } = await apiClient.post('/aws/sync');
  return data;
};
