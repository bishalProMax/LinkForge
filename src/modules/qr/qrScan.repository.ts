import QRScan from "../../models/qrScan.model.js";

const createQRScan = (qrId: string) => {
  return QRScan.create({ qrId });
};

const countQRScans = (qrId: string) => {
  return QRScan.countDocuments({ qrId });
};

const getQRScans = (qrId: string) => {
  return QRScan.find({ qrId }).select("timestamp -_id").sort({ timestamp: -1 });
};

const deleteQRScansByQrId = (qrId: string) => {
  return QRScan.deleteMany({ qrId });
};

export { 
  createQRScan, 
  countQRScans, 
  getQRScans, 
  deleteQRScansByQrId 
  };