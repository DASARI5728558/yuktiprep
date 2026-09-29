import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

async function testFilter() {
  const url = "https://portal-psc.ap.gov.in/HomePages/ExaminationCalendar";
  const res = await axios.get(url, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const $ = cheerio.load(res.data);
  const links = [];
  $("a").each((i, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (href) {
      links.push({ href, text });
    }
  });

  const year2026Links = links.filter((l) => {
    const combined = (l.text + " " + l.href).toLowerCase();
    return combined.includes("2026") || combined.includes("26");
  });

  console.log("Filtered 2026 links:", JSON.stringify(year2026Links, null, 2));
}

testFilter();
