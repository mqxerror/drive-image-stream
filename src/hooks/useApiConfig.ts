import { useState, useEffect, useCallback } from 'react';

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    stats: string;
    projects: string;
    projectUpdate: string;
    projectImages: string;
    templates: string;
    trial: string;
    queue: string;
    history: string;
    trigger: string;
    process: string;
    redo: string;
    settings: string;
  };
}

const STORAGE_KEY = 'api-config';

export const defaultApiConfig: ApiConfig = {
  baseUrl: 'https://automator.pixelcraftedmedia.com/webhook/image-optimizer',
  endpoints: {
    stats: '/stats',
    projects: '/projects',
    projectUpdate: '/project-update',
    projectImages: '/project-images',
    templates: '/templates',
    trial: '/trial',
    queue: '/queue',
    history: '/history',
    trigger: '/trigger',
    process: '/process',
    redo: '/redo',
    settings: '/settings',
  },
};

// Singleton for accessing config outside of React components
let currentConfig: ApiConfig = defaultApiConfig;

export function getApiConfig(): ApiConfig {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        currentConfig = JSON.parse(stored);
      } catch {
        currentConfig = defaultApiConfig;
      }
    }
  }
  return currentConfig;
}

export function getEndpoint(name: keyof ApiConfig['endpoints']): string {
  const config = getApiConfig();
  return `${config.baseUrl}${config.endpoints[name]}`;
}

export function useApiConfig() {
  const [config, setConfig] = useState<ApiConfig>(defaultApiConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
        currentConfig = parsed;
      } catch {
        setConfig(defaultApiConfig);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = useCallback((newConfig: ApiConfig) => {
    setConfig(newConfig);
    currentConfig = newConfig;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(defaultApiConfig);
    currentConfig = defaultApiConfig;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getEndpointUrl = useCallback((name: keyof ApiConfig['endpoints']): string => {
    return `${config.baseUrl}${config.endpoints[name]}`;
  }, [config]);

  return {
    config,
    isLoaded,
    updateConfig,
    resetToDefaults,
    getEndpoint: getEndpointUrl,
  };
}
