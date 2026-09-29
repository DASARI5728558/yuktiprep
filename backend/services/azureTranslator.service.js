const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT;
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const translateText = async (text, targetLanguageCode) => {
  if (!text || !targetLanguageCode) {
    return text;
  }

  const normalizedTarget = targetLanguageCode.split("-")[0].toLowerCase();

  if (normalizedTarget === "en") {
    return text;
  }

  if (
    !AZURE_TRANSLATOR_KEY ||
    !AZURE_TRANSLATOR_ENDPOINT ||
    !AZURE_TRANSLATOR_REGION
  ) {
    return text;
  }

  try {
    const controller = `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${normalizedTarget}`;

    const response = await fetch(controller, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
        "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ text }]),
    });

    if (!response.ok) {
      return text;
    }

    const result = await response.json();
    if (result && result[0]?.translations?.[0]?.text) {
      return result[0].translations[0].text;
    }

    return text;
  } catch (error) {
    console.error("Azure translation failed:", error);
    return text;
  }
};

export const translateTexts = async (texts, targetLanguageCode) => {
  const normalizedTarget = targetLanguageCode
    ? targetLanguageCode.split("-")[0].toLowerCase()
    : targetLanguageCode;

  if (!texts || !normalizedTarget || normalizedTarget === "en") {
    if (normalizedTarget === "en") {
      console.log("for english no translation required");
    }
    return texts;
  }

  if (
    !AZURE_TRANSLATOR_KEY ||
    !AZURE_TRANSLATOR_ENDPOINT ||
    !AZURE_TRANSLATOR_REGION
  ) {
    return texts;
  }
  console.log("Azure Translator config:", {
    hasKey: Boolean(AZURE_TRANSLATOR_KEY),
    keyLength: AZURE_TRANSLATOR_KEY?.length,
    endpoint: AZURE_TRANSLATOR_ENDPOINT,
    region: AZURE_TRANSLATOR_REGION,
  });

  try {
    const controller = `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${normalizedTarget}`;

    const chunkSize = 50;
    const results = [];

    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const body = chunk.map((text) => ({ text }));

      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        const response = await fetch(controller, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
            "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (response.status === 429) {
          retries--;
          if (retries > 0) {
            console.warn(
              `Azure translation rate limited (429). Retrying in 2 seconds... (${retries} retries left)`,
            );
            await sleep(2000);
            continue;
          }
        }

        if (!response.ok) {
          console.error(
            "Azure translation chunk failed with status:",
            response.status,
          );
          // Fallback to original text for this chunk if it fails
          results.push(...chunk);
          success = true;
          continue;
        }

        const result = await response.json();
        if (Array.isArray(result)) {
          const translatedChunk = result.map((item, index) => {
            if (item?.translations?.[0]?.text) {
              return item.translations[0].text;
            }
            return chunk[index];
          });
          results.push(...translatedChunk);
        } else {
          results.push(...chunk);
        }
        success = true;
      }

      // Add a small delay between chunks to avoid hitting the rate limit
      if (i + chunkSize < texts.length) {
        await sleep(500);
      }
    }

    return results;
  } catch (error) {
    console.error("Azure batch translation failed:", error);
    return texts;
  }
};
