import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../../infrastructure/configs/cloudinary.config.js";

const buildPublicId = (userId: string, qrId: string): string => `linkforge/qrcodes/${userId}/${qrId}`;

const uploadQRImage = async (pngBuffer: Buffer, userId: string, qrId: string): Promise<{ imageUrl: string; publicId: string }> => {
  const publicId = buildPublicId(userId, qrId);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, overwrite: true, resource_type: "image", format: "png" },
      (error, uploadResult) => {
        if (error || !uploadResult) return reject(error);
        resolve(uploadResult);
      }
    );
    stream.end(pngBuffer);
  });

  return { imageUrl: result.secure_url, publicId: result.public_id };
};

const getJpegDownloadUrl = (pngImageUrl: string): string => {
  return pngImageUrl.replace("/upload/", "/upload/f_jpg,fl_attachment/");
};

const deleteQRImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

export { 
  buildPublicId, 
  uploadQRImage, 
  getJpegDownloadUrl,
  deleteQRImage
  };