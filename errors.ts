/**
 * Custom error class for when the CORS proxy requires user activation.
 * This allows the UI to catch this specific error and show a tailored message.
 */
export class CorsActivationError extends Error {
  public readonly activationUrl: string;

  constructor(message: string, url: string) {
    super(message);
    this.name = 'CorsActivationError';
    this.activationUrl = url;
    // This is necessary for instanceof to work correctly in some environments
    Object.setPrototypeOf(this, CorsActivationError.prototype);
  }
}
