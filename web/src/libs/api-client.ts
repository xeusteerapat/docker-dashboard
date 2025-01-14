// src/lib/api-client.ts
const API_BASE_URL = 'http://localhost:3001/api';

export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'exited';
  ports: string[];
  created: string;
}

export interface Image {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface VolumeContainer {
  id: string;
  name: string;
  state: string;
}

export interface Volume {
  id: string;
  name: string;
  driver: string;
  mountpoint: string;
  usedBy: VolumeContainer[];
  size: string;
  createdAt: string;
}

export const dockerApi = {
  containers: {
    list: async (): Promise<Container[]> => {
      const response = await fetch(`${API_BASE_URL}/containers`);
      if (!response.ok) throw new Error('Failed to fetch containers');
      return response.json();
    },
    start: async (
      containerId: string
    ): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(
        `${API_BASE_URL}/containers/${containerId}/start`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to start container');
      return response.json();
    },
    stop: async (
      containerId: string
    ): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(
        `${API_BASE_URL}/containers/${containerId}/stop`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to stop container');
      return response.json();
    },
  },
  images: {
    list: async (): Promise<Image[]> => {
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      return response.json();
    },
  },
  volumes: {
    list: async (): Promise<Volume[]> => {
      const response = await fetch(`${API_BASE_URL}/volumes`);
      if (!response.ok) throw new Error('Failed to fetch volumes');
      return response.json();
    },
  },
};
