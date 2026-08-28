import Visit from "../../models/visit.model.js";
import type { IVisit } from "../../models/visit.model.js";

type CreateVisitData = Omit<IVisit, "timestamp">;

const createVisit = (data: CreateVisitData) => {
  return Visit.create(data);
};

//countDocuments is faster than using .length after find() method
const countVisits = (linkId: string) => {
  return Visit.countDocuments({         
    linkId,
  });
};

const deleteVisitsByLinkId = (linkId: string) => {  
  return Visit.deleteMany({
    linkId,
  });
};

export { 
  createVisit, 
  countVisits,
  deleteVisitsByLinkId 
  };
