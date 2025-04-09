import { Router } from "express";
import { deleteCollection } from "../../utils/vector-db";
import { addText, getText, listTexts, updateText, deleteText, searchTexts } from "./vector.service";

const vectorRouter = Router();

// Create
vectorRouter.post("/add", addText);

// Read
vectorRouter.post("/get", getText);
vectorRouter.post("/list", listTexts);

// Update
vectorRouter.put("/update", updateText);
// vectorRouter.patch("/partial-update/:id", partialUpdateText);

// Delete
vectorRouter.delete("/delete/:id", deleteText);
vectorRouter.delete("/delete-collection/:collectionName", deleteCollection);

// Search
vectorRouter.post("/search", searchTexts);

export default vectorRouter;
