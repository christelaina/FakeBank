import { apiRequest } from "@/lib/api/client";
import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import { ApiError } from "@/types/api";
import type {
  DocumentMeta,
  DocumentUploadInput,
  ProfilePictureUploadInput,
  ProfilePictureUploadResult,
} from "@/types/banking";

export async function listDocuments(): Promise<DocumentMeta[]> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<DocumentMeta[]>("/api/documents", { sameOrigin: true });
  }
  return getRepositories().documents.listDocuments();
}

export async function uploadDocument(input: DocumentUploadInput): Promise<DocumentMeta> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<DocumentMeta>("/api/documents", {
      method: "POST",
      body: input,
      sameOrigin: true,
    });
  }
  throw new ApiError("Document upload needs live data mode.", {
    status: 501,
    requestId: "",
    code: "MOCK_MODE",
  });
}

export async function uploadProfilePicture(input: ProfilePictureUploadInput) {
  if (getEnvironment().isLiveMode) {
    return apiRequest<ProfilePictureUploadResult>("/api/profile/picture", {
      method: "POST",
      body: input,
      sameOrigin: true,
    });
  }
  return getRepositories().documents.uploadProfilePicture(input);
}
