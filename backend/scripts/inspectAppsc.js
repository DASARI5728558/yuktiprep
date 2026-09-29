import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

async function inspectAppsc() {
  try {
    const url = "https://portal-psc.ap.gov.in/HomePages/ExaminationCalendar";
    const res = await axios.get(url, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log("Status:", res.status);
    const $ = cheerio.load(res.data);
    const links = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (href) {
        links.push({ href, text });
      }
    });

    console.log("Total links on APPSC calendar page:", links.length);
    const pdfLinks = links.filter((l) => l.href.toLowerCase().includes(".pdf") || l.text.toLowerCase().includes("calendar") || l.text.toLowerCase().includes("schedule"));
    console.log("Matching calendar/PDF links:", JSON.stringify(pdfLinks, null, 2));
  } catch (err) {
    console.error("Error inspecting APPSC:", err.message);
  }
}

inspectAppsc();
