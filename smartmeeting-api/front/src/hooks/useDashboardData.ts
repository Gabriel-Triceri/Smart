import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/api';
import type { DashboardData } from '../types/dashboard';

interface UseDashboardDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // em milissegundos
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
}

export function useDashboardData(
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const { autoRefresh = true, refreshInterval = 5 * 60 * 1000 } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Aqui você pode substituir pela chamada real à API
      const dashboardData = await dashboardService.getDashboardCompleto();
      
      setData(dashboardData);
      setLastUpdate(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}

export default useDashboardData;
