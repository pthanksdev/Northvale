import { api } from "./api";

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} authEndpoint - The endpoint to fetch the signature from (e.g. "/admin/cloudinary/auth")
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadToCloudinary(file, authEndpoint = "/admin/cloudinary/auth") {
  // 1. Get the signature from our backend
  const { data: authData } = await api.get(authEndpoint);

  // 2. Prepare FormData for Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", authData.apiKey);
  formData.append("timestamp", authData.timestamp);
  formData.append("signature", authData.signature);

  // 3. Upload to Cloudinary API
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${authData.cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Upload to Cloudinary failed");
  }

  const result = await response.json();

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}
