// src/services/docker.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Container,
  ContainerState,
  Image,
  Volume,
  DockerContainerResponse,
  DockerImageResponse,
  DockerVolumesResponse,
  DockerApiError,
} from '../types/docker';

interface DockerApiOptions {
  socketPath: string;
  timeout?: number;
}

export class DockerService {
  private client: AxiosInstance;

  constructor(
    options: DockerApiOptions = {
      socketPath: process.env.DOCKER_SOCKET_PATH as string,
    }
  ) {
    this.client = axios.create({
      socketPath: options.socketPath,
      baseURL: 'http://localhost/v1.41', // Docker API version
      timeout: options.timeout || 10000, // Default 10s timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add error interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message: string }>) => {
        const apiError: DockerApiError = {
          message: error.message,
          response: {
            statusCode: error.response?.status || 500,
            body: {
              message:
                error.response?.data?.message || 'Unknown error occurred',
            },
          },
        };
        return Promise.reject(apiError);
      }
    );
  }

  async listContainers(): Promise<Container[]> {
    try {
      const { data } = await this.client.get<DockerContainerResponse[]>(
        '/containers/json?all=true'
      );
      return data.map((container) => this.transformContainer(container));
    } catch (error) {
      throw this.handleError(error, 'Failed to list containers');
    }
  }

  async startContainer(
    containerId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.client.post(`/containers/${containerId}/start`);
      return { success: true, message: 'Container started successfully' };
    } catch (error) {
      throw this.handleError(error, 'Failed to start container');
    }
  }

  async stopContainer(
    containerId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.client.post(`/containers/${containerId}/stop`);
      return { success: true, message: 'Container stopped successfully' };
    } catch (error) {
      throw this.handleError(error, 'Failed to stop container');
    }
  }

  async listImages(): Promise<Image[]> {
    try {
      const { data } = await this.client.get<DockerImageResponse[]>(
        '/images/json'
      );
      return data.map((image) => this.transformImage(image));
    } catch (error) {
      throw this.handleError(error, 'Failed to list images');
    }
  }

  async listVolumes(): Promise<Volume[]> {
    try {
      // Get volumes
      const { data } = await this.client.get<DockerVolumesResponse>('/volumes');

      // Get containers to check volume usage
      const { data: containers } = await this.client.get<
        DockerContainerResponse[]
      >('/containers/json?all=true');

      return Promise.all(
        data.Volumes.map((volume) => this.transformVolume(volume, containers))
      );
    } catch (error) {
      throw this.handleError(error, 'Failed to list volumes');
    }
  }

  private transformContainer(container: DockerContainerResponse): Container {
    return {
      id: container.Id,
      name: container.Names[0].replace(/^\//, ''),
      image: container.Image,
      status: this.parseStatus(container.State),
      state: this.parseState(container.State),
      ports: this.parsePorts(container.Ports),
      created: new Date(container.Created * 1000).toISOString(),
      labels: container.Labels,
    };
  }

  private transformImage(image: DockerImageResponse): Image {
    return {
      id: image.Id.replace('sha256:', ''),
      repository: image.RepoTags?.[0]?.split(':')[0] || '<none>',
      tag: image.RepoTags?.[0]?.split(':')[1] || '<none>',
      size: this.formatBytes(image.Size),
      created: new Date(image.Created * 1000).toISOString(),
      labels: image.Labels || {},
    };
  }

  private async transformVolume(
    volume: DockerVolumesResponse['Volumes'][0],
    containers: DockerContainerResponse[]
  ): Promise<Volume> {
    const usedBy = containers
      .filter((container) => {
        const mounts = container.Mounts || [];
        return mounts.some(
          (mount) =>
            mount.Name === volume.Name || mount.Source === volume.Mountpoint
        );
      })
      .map((container) => ({
        id: container.Id,
        name: container.Names[0].replace(/^\//, ''),
        state: this.parseState(container.State),
      }));

    return {
      id: volume.Name,
      name: volume.Name,
      driver: volume.Driver,
      mountpoint: volume.Mountpoint,
      usedBy,
      size: volume.UsageData?.Size
        ? this.formatBytes(volume.UsageData.Size)
        : 'N/A',
      createdAt: volume.CreatedAt || 'N/A',
      labels: volume.Labels || {},
    };
  }

  private parseStatus(state: string): ContainerState {
    const normalizedState = state.toLowerCase();
    switch (normalizedState) {
      case 'running':
      case 'exited':
      case 'created':
      case 'paused':
      case 'restarting':
        return normalizedState;
      default:
        return 'stopped';
    }
  }

  private parseState(state: string): ContainerState {
    return this.parseStatus(state);
  }

  private parsePorts(ports: DockerContainerResponse['Ports']): string[] {
    return ports.map((port) => {
      const portString = port.PublicPort
        ? `${port.PublicPort}:${port.PrivatePort}/${port.Type}`
        : `${port.PrivatePort}/${port.Type}`;

      return port.IP ? `${port.IP}-${portString}` : portString;
    });
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  }

  private handleError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`${defaultMessage}: ${message}`);
    }
    throw error;
  }
}

// Export a singleton instance
export const dockerService = new DockerService();
