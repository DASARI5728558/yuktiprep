import { v2 } from "@google-cloud/translate";
import { TranslationProvider } from "./provider.interface.js";

const { Translate } = v2;

/**
 * Google Cloud Translation implementation
 */
export class GoogleProvider extends TranslationProvider {
  constructor() {
    super();
    // It will use GOOGLE_TRANSLATION_API_KEY if provided, otherwise it falls back to GOOGLE_APPLICATION_CREDENTIALS
    const options = {};
    
    if (process.env.GOOGLE_TRANSLATION_API_KEY) {
      options.key = process.env.GOOGLE_TRANSLATION_API_KEY;
    } else if (process.env.GOOGLE_TRANSLATION_PROJECT_ID) {
      options.projectId = process.env.GOOGLE_TRANSLATION_PROJECT_ID;
    }
    
    this.translate = new Translate(options);
  }

  /**
   * @param {string} text 
   * @param {string} sourceLanguage 
   * @param {string} targetLanguage 
   * @returns {Promise<string>}
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    if (!text || !targetLanguage || targetLanguage === "en") return text;
    
    // The Google Translate API v2 uses simple language codes like 'hi', 'ta'
    const [translation] = await this.translate.translate(text, {
      from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      to: targetLanguage,
    });
    return translation;
  }

  /**
   * @param {string[]} texts 
   * @param {string} sourceLanguage 
   * @param {string} targetLanguage 
   * @returns {Promise<string[]>}
   */
  async translateTexts(texts, sourceLanguage, targetLanguage) {
    if (!texts || texts.length === 0 || !targetLanguage || targetLanguage === "en") return texts;

    const [translations] = await this.translate.translate(texts, {
      from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      to: targetLanguage,
    });
    
    // Ensure we always return an array
    if (!Array.isArray(translations)) {
      return [translations];
    }
    return translations;
  }
}
