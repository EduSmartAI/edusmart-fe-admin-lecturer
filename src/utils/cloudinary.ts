import axios, { AxiosResponse } from 'axios';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
  folder?: string;
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | 'raw' | string;
  duration?: number;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
}

function resolveConfig(): CloudinaryConfig {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;
  if (!cloudName) throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  return { cloudName, uploadPreset, folder };
}

export async function uploadToCloudinaryImage(file: File, overrides?: Partial<CloudinaryConfig>): Promise<CloudinaryUploadResult> {
  const cfg = { ...resolveConfig(), ...overrides };
  const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`;
  const form = new FormData();
  form.append('file', file);
  if (cfg.uploadPreset) form.append('upload_preset', cfg.uploadPreset);
  if (cfg.folder) form.append('folder', cfg.folder);
  const resp: AxiosResponse<CloudinaryUploadResult> = await axios.post(endpoint, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return resp.data as unknown as CloudinaryUploadResult;
}

export async function uploadToCloudinaryVideo(file: File, overrides?: Partial<CloudinaryConfig>): Promise<CloudinaryUploadResult> {
  const cfg = { ...resolveConfig(), ...overrides };
  const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/video/upload`;
  const form = new FormData();
  form.append('file', file);
  if (cfg.uploadPreset) form.append('upload_preset', cfg.uploadPreset);
  if (cfg.folder) form.append('folder', cfg.folder);
  const resp: AxiosResponse<CloudinaryUploadResult> = await axios.post(endpoint, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return resp.data as unknown as CloudinaryUploadResult;
}

export async function uploadToCloudinaryRaw(file: File, overrides?: Partial<CloudinaryConfig>): Promise<CloudinaryUploadResult> {
  const cfg = { ...resolveConfig(), ...overrides };
  const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/raw/upload`;
  const form = new FormData();
  form.append('file', file);
  if (cfg.uploadPreset) form.append('upload_preset', cfg.uploadPreset);
  if (cfg.folder) form.append('folder', cfg.folder);
  const resp: AxiosResponse<CloudinaryUploadResult> = await axios.post(endpoint, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return resp.data as unknown as CloudinaryUploadResult;
}


















