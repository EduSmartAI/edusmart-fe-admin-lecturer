// src/utils/uploadUtils.ts
import type { UploadFile } from "antd";
import type { Area } from "react-easy-crop";
import labels from "EduSmart/locales/vi.json";
import { FileType } from "EduSmart/components/BaseControl/BaseControlUploadImage";

export function mapUrlsToUploadFiles<T = unknown>(
  urls: string[],
  status: UploadFile<T>["status"] = "done",
): UploadFile<T>[] {
  return urls.map((url, idx) => {
    const name = url.split("/").pop() ?? `file-${idx}`;
    return {
      uid: `${idx}`,
      name,
      status,
      url,
      thumbUrl: url,
    } as UploadFile<T>;
  });
}

export function getBase64(file: FileType): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file as Blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  try {
    const img = new window.Image();
    if (!imageSrc.startsWith("data:")) img.crossOrigin = "anonymous";
    img.src = imageSrc;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Image load failed"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    ctx.drawImage(
      img,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );
    return canvas.toDataURL("image/jpeg");
  } catch (err) {
    console.warn("Crop failed, returning original image:", err);
    return imageSrc;
  }
}

export async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function enumToOptions(
  e: Record<string, string | number>,
): { label: string; value: string }[] {
  return Object.keys(e)
    .filter((key) => isNaN(Number(key)))
    .map((key) => {
      const v = e[key];
      return {
        label: key,
        value: String(v),
      };
    });
}

export function enumToTranslatedOptions<
  E extends Record<string, string | number>,
>(e: E, namespace: keyof typeof labels): { label: string; value: string }[] {
  return Object.keys(e)
    .filter((key) => isNaN(Number(key)))
    .map((key) => {
      const val = e[key as keyof E] as string | number;
      // @ts-expect-error: chúng ta biết labels[namespace][key] tồn tại hoặc fallback về key
      const text = labels[namespace][key] || key;
      return {
        value: String(val),
        label: text,
      };
    });
}

export function safeDecodeJwt(token?: string | null) {
  try {
    if (!token) return null;
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
