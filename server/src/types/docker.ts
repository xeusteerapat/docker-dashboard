// src/types/docker.ts

// API Response Types
export type DockerContainerResponse = {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  State: string;
  Status: string;
  Ports: DockerPort[];
  Labels: { [key: string]: string };
  Mounts: DockerMount[];
};

export type DockerPort = {
  IP?: string;
  PrivatePort: number;
  PublicPort?: number;
  Type: string;
};

export type DockerMount = {
  Type: string;
  Name?: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
};

export type DockerImageResponse = {
  Id: string;
  ParentId: string;
  RepoTags: string[];
  RepoDigests: string[];
  Created: number;
  Size: number;
  VirtualSize: number;
  SharedSize: number;
  Labels: { [key: string]: string };
  Containers: number;
};

export type DockerVolumeResponse = {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt: string;
  Status?: { [key: string]: string };
  Labels: { [key: string]: string };
  Scope: string;
  Options: { [key: string]: string };
  UsageData?: {
    Size: number;
    RefCount: number;
  };
};

export type DockerVolumesResponse = {
  Volumes: DockerVolumeResponse[];
  Warnings: string[];
};

// Frontend Types
export type Container = {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  state: ContainerState;
  ports: string[];
  created: string;
  labels: { [key: string]: string };
};

export type ContainerStatus =
  | 'running'
  | 'stopped'
  | 'exited'
  | 'created'
  | 'paused'
  | 'restarting';
export type ContainerState =
  | 'running'
  | 'stopped'
  | 'exited'
  | 'created'
  | 'paused'
  | 'restarting';

export type Image = {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
  labels: { [key: string]: string };
};

export type VolumeContainer = {
  id: string;
  name: string;
  state: ContainerState;
};

export type Volume = {
  id: string;
  name: string;
  driver: string;
  mountpoint: string;
  usedBy: VolumeContainer[];
  size: string;
  createdAt: string;
  labels: { [key: string]: string };
};

// API Error Types
export type DockerApiError = {
  message: string;
  response?: {
    statusCode: number;
    body?: {
      message?: string;
    };
  };
};
