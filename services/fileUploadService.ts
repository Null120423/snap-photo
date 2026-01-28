/** @format */

import axios, { AxiosProgressEvent } from "axios";

export interface FileUploadMetadata {
  uploadedBy?: string;
  description?: string;
  expireDays?: number;
}

export interface FileUploadResponse {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  uploadedBy: string;
  description?: string;
  expireDate: string;
  status: "active" | "archived" | "expired";
  createdAt: string;
}

export type UploadProgressHandler = (progress: number) => void;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://photo-api.gitlabserver.id.vn";

class FileUploadService {
  private baseURL = `${API_BASE_URL}/upload`;
  private isApiAvailable: boolean | null = null;

  /**
   * Check if the upload API is available
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 3000,
      });
      this.isApiAvailable = response.status === 200;
      return this.isApiAvailable;
    } catch (error) {
      console.warn("Upload API is not available:", error);
      this.isApiAvailable = false;
      return false;
    }
  }

  async uploadSingleFile(
    file: File,
    metadata: FileUploadMetadata,
    onProgress?: UploadProgressHandler,
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", metadata.uploadedBy || "anonymous");

    if (metadata.description)
      formData.append("description", metadata.description);
    if (metadata.expireDays)
      formData.append("expireDays", metadata.expireDays.toString());

    try {
      const response: any = await axios.post<FileUploadResponse>(
        `${this.baseURL}/with-metadata`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 second timeout
          onUploadProgress: (evt: AxiosProgressEvent) => {
            if (evt.total && onProgress) {
              const pct = Math.round((evt.loaded * 100) / evt.total);
              onProgress(pct);
            }
          },
        },
      );

      console.log("Upload response:", response.data);

      if (!response.data || !response.data?.data?.url) {
        console.error("Invalid upload response:", response.data);
        throw new Error("API không trả về URL hợp lệ");
      }

      return response.data?.data;
    } catch (error) {
      console.error("Upload API error:", error);
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
          throw new Error(
            `Không thể kết nối với server upload tại ${this.baseURL}. Vui lòng kiểm tra server đã chạy chưa.`,
          );
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Không thể kết nối với server upload",
        );
      }
      throw error;
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = (
      import.meta.env.VITE_ALLOWED_FILE_TYPES ||
      "image/jpeg,image/png,image/webp,application/pdf"
    ).split(",");

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();

export default fileUploadService;
