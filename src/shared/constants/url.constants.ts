export const URL_CONSTANTS = {
    EMAIL_ACTIVATION: (baseUrl: string, code: string) => `http://${baseUrl}/activation/email?code=${code}`,
    EMAIL_PASSWORD_RESET: (baseUrl: string, code: string) => `http://${baseUrl}/reset-password?code=${code}`,
};