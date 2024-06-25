import { addToStore, addToStoreCustom } from "../../../utils/db";

export async function saveUrlData(
  colName: string,
  pageText?: string
): Promise<{ cleanedTextContent: string }> {
  const textContent = pageText;

  const removeEmptyLines = (textContent: string) => {
    const lines = textContent.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim());
    return nonEmptyLines.join("\n");
  };

  const cleanedTextContent = removeEmptyLines(textContent);

  return { cleanedTextContent };
}
