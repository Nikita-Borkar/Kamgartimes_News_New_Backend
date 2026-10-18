const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload a raw Buffer (from multer memory storage) to Cloudinary.
// Returns the full Cloudinary result (public_id, secure_url, width,
// height, format, bytes, ...).
const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "kamgartimes",
        resource_type: "image",
        ...options,
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

// Remove an asset. A "not found" from Cloudinary is treated as success so
// database cleanup can proceed even if the asset is already gone.
const destroyAsset = async (publicId, resourceType = "image") => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    if (err && err.http_code === 404) return { result: "not found" };
    throw err;
  }
};

module.exports = { cloudinary, uploadBuffer, destroyAsset };
