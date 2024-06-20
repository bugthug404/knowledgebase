import { PlaywrightCrawler } from "crawlee";
import { saveUrlData } from "./save-url-data";
import { urlPageText } from "./url-page-text";

export async function extractWebsiteUrl(
  url: string,
  domain: string,
  colName: string
) {
  // const urls: { url: string; title?: string }[] = [];
  const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks }) {
      if (request.loadedUrl.endsWith(".webp")) return;
      const pageText = await urlPageText(request.loadedUrl);
      const title = await page.title();
      await saveUrlData(url, colName, title, pageText);
      // await enqueueLinks();
      // await page.close();
    },
    maxConcurrency: 10,
  });

  await crawler.run([url]);

  // await crawler.run([
  //   "https://store.galileofx.com/pages/pricing-unlocked",
  //   "https://store.galileofx.com/pages/faqs",
  // ]);
  return;
}
