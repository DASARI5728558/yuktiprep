import { translateText, translateTexts } from "../../../services/azureTranslator.service.js";
import { TranslationProvider } from "./provider.interface.js";

/**
 * Azure Translation implementation. 
 * Reuses the existing azureTranslator.service.js internally.
 */
export class AzureProvider extends TranslationProvider {
  async translateText(text, sourceLanguage, targetLanguage) {
    if (!text || !targetLanguage || targetLanguage === "en") return text;
    // The existing azure service does not explicitly take sourceLanguage for the endpoint it hits,
    // but relies on Azure auto-detect or defaults. We just pass the text and target.
    return translateText(text, targetLanguage);
  }

  async translateTexts(texts, sourceLanguage, targetLanguage) {
    if (!texts || texts.length === 0 || !targetLanguage || targetLanguage === "en") return texts;
    return translateTexts(texts, targetLanguage);
  }
}
