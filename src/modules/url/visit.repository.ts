import Visit from "../../models/visit.model.js";

const createVisit = (linkId: string) => {
  return Visit.create({
    linkId,
  });
};

//countDocuments is faster than using .length after find() method
const countVisits = (linkId: string) => {
  return Visit.countDocuments({         
    linkId,
  });
};

const getVisits = (linkId: string) => {
  return Visit.find({
    linkId,
  }).select("timestamp -_id")
    .sort({ timestamp: -1 });
};

const deleteVisitsByLinkId = (linkId: string) => {  //didnt used for now
  return Visit.deleteMany({
    linkId,
  });
};

export { 
  createVisit, 
  countVisits, 
  getVisits, 
  deleteVisitsByLinkId 
  };
