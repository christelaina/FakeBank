import { getRepositories } from "@/lib/api";
import type { ProfilePictureUploadInput } from "@/types/banking";

export async function listDocuments() {
  return getRepositories().documents.listDocuments();
}

export async function uploadProfilePicture(input: ProfilePictureUploadInput) {
  return getRepositories().documents.uploadProfilePicture(input);
}
