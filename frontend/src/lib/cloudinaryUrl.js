/**
 * Basic Cloudinary URL generator
 */
export function getCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return "";

  // If it's already a full URL, return it
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error("VITE_CLOUDINARY_CLOUD_NAME is missing");
    return "";
  }

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  let transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.length > 0 ? transformations.join(",") + "/" : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}
