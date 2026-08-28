import QRScan from "../../models/qrScan.model.js";
import type { IQRScan } from "../../models/qrScan.model.js";

type CreateQRScanData = Omit<IQRScan, "timestamp">;

const createQRScan = (data: CreateQRScanData) => {
  return QRScan.create(data);
};

const countQRScans = (qrId: string) => {
  return QRScan.countDocuments({ qrId });
};

const deleteQRScansByQrId = (qrId: string) => {
  return QRScan.deleteMany({ qrId });
};

export { 
  createQRScan, 
  countQRScans, 
  deleteQRScansByQrId 
  };