import { GoogleProvider } from "../providers/translation/google.provider.js";
import { AzureProvider } from "../providers/translation/azure.provider.js";

class TranslationService {
  constructor() {
    this.primaryProvider = new GoogleProvider();
    this.fallbackProvider = new AzureProvider();
  }

  /**
   * Translates text using the primary provider (Google). 
   * If it fails with a transient error, it falls back to the secondary (Azure).
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    if (!text) return text;
    try {
      return await this.primaryProvider.translateText(text, sourceLanguage, targetLanguage);
    } catch (error) {
      console.warn("Primary translation provider failed, attempting fallback:", error.message);
      try {
        return await this.fallbackProvider.translateText(text, sourceLanguage, targetLanguage);
      } catch (fallbackError) {
        console.error("Fallback translation provider also failed:", fallbackError.message);
        throw fallbackError; // Throw so that BullMQ can retry or record failure
      }
    }
  }

  async translateTexts(texts, sourceLanguage, targetLanguage) {
    if (!texts || texts.length === 0) return texts;
    try {
      return await this.primaryProvider.translateTexts(texts, sourceLanguage, targetLanguage);
    } catch (error) {
      console.warn("Primary batch translation provider failed, attempting fallback:", error.message);
      try {
        return await this.fallbackProvider.translateTexts(texts, sourceLanguage, targetLanguage);
      } catch (fallbackError) {
        console.error("Fallback batch translation provider also failed:", fallbackError.message);
        throw fallbackError;
      }
    }
  }
}

export const translationService = new TranslationService();
