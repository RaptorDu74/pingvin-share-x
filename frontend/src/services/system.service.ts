import api from "./api.service";

export interface SystemInfo {
  used: number;
  total: number;
}

export interface SystemStats {
  totalShares: number;
  activeShares: number;
  totalFiles: number;
  totalUsers: number;
  totalViews: number;
  totalSize: number;
  sharesLast7Days: number;
  sharesLast30Days: number;
}

const getSystemInfo = async (): Promise<SystemInfo | null> => {
  return (await api.get("system/info")).data;
};

const getStats = async (): Promise<SystemStats> => {
  return (await api.get("system/stats")).data;
};

export default { getSystemInfo, getStats };
