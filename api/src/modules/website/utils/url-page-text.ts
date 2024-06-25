import axios from "axios";
import { JSDOM } from "jsdom";

export async function urlPageText(url: string) {
  if (url.length === 0) {
    return "";
  }

  try {
    const response = await axios.get(url);
    if (response.status > 299) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const dom = new JSDOM(response.data);
    const body = dom.window.document.body;

    const removeScripts = (node) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (
          child.nodeName.toLowerCase() === "script" ||
          child.nodeName.toLowerCase() === "iframe" ||
          child.nodeName.toLowerCase() === "footer" ||
          child.nodeName.toLowerCase() === "header" ||
          child.nodeName.toLowerCase() === "style" ||
          child.textContent.trim().split(/\s+/).length <= 5
        ) {
          child.parentNode.removeChild(child);
        } else {
          removeScripts(child);
        }
      }
    };

    removeScripts(body);

    const textContent = body.textContent.trim();
    const removeEmptyLines = (textContent: string) => {
      const lines = textContent.split("\n");
      const nonEmptyLines = lines.filter((line) => line.trim());
      return nonEmptyLines.join("\n ");
    };

    let cleanedTextContent = removeEmptyLines(textContent);

    cleanedTextContent = cleanedTextContent
      .replaceAll("?", "? ")
      .replaceAll(".", ". ")
      .replaceAll(/\s+/g, " ");

    console.log("cleanedTextContent.length  ===  ", cleanedTextContent.length);
    console.log("url  ===", url);

    return cleanedTextContent;
  } catch (e) {
    console.log("error", e);

    return "";
  }
}
