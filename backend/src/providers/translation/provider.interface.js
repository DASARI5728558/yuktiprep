/**
 * Base Translation Provider class that defines the expected interface
 * for all translation providers (Google, Azure, etc.)
 */
export class TranslationProvider {
  /**
   * Translate a single text string.
   * @param {string} text - The text to translate.
   * @param {string} sourceLanguage - The source language code (e.g. 'en').
   * @param {string} targetLanguage - The target language code (e.g. 'hi').
   * @returns {Promise<string>} The translated text.
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    throw new Error("translateText method must be implemented by subclasses");
  }

  /**
   * Translates multiple texts at once, if the provider supports batching.
   * Default implementation just calls translateText in a loop (concurrently).
   * @param {string[]} texts - Array of texts to translate.
   * @param {string} sourceLanguage - The source language code.
   * @param {string} targetLanguage - The target language code.
   * @returns {Promise<string[]>} Array of translated texts.
   */
  async translateTexts(texts, sourceLanguage, targetLanguage) {
    return Promise.all(
      texts.map((text) => this.translateText(text, sourceLanguage, targetLanguage))
    );
  }
}
