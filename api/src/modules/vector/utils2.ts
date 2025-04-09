import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getStoreClient, getEmbeder } from "../../utils/db";
import { generateUUID } from "../cv-ranking/utils";
import { getCustomStoreClient } from "../../utils/custom-qdrant";

export const addTextToStore = async (
    collection: string,
    fullText: string
) => {
    try {
        const client = getCustomStoreClient();

        try {
            await client.getCollection(collection);
        } catch (error) {
            console.error(error.message, "error getting collection", error.response.statusText);
            if ((error.response.statusText as string).startsWith("Not found"))
                console.log("creating collection");
            try {
                await client.createCollection(collection, {
                    vectors: {
                        size: 768,
                        distance: "Cosine",
                    },
                });
                console.log("created collection");
            } catch (error) {
                console.log("error creating collection", error.message);
            }
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });

        const texts = await textSplitter.splitText(fullText);
        // console.log("texts -- ", texts);

        const embedder = getEmbeder();
        const docEmbeddings = await embedder.embedDocuments(texts);

        if (texts.length !== docEmbeddings.length) {
            throw new Error("docs length is not equal to documents length");
        }

        const points = docEmbeddings.map((d, i) => {
            return {
                id: generateUUID(),
                vector: d,
                payload: {
                    content: texts[i],
                },
            };
        });

        console.log("points  -- ", points[0]?.id, points[1]?.id);

        const op = await client.upsert(collection, {
            // wait: true,

            points: points,
        });

        console.log("op -- ", op);
    } catch (error) {
        // console.error("error adding to store", fullText);
        console.log("error.message - ", error.message);
        console.log("error-response - ", error.response);
        throw new Error(error);
    }
};