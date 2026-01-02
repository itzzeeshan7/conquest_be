export const ERRORS_CONSTANTS = {
  DB: {
    23505: (entityName: string): string => `${entityName} already exists.`,
  },
  CODES: {
    INVALID_CREDENTIALS: 'Invalid Credentials',
    INVALID_CODE_ACTIVATION: 'Invalid Code Activation',
    USER_NOT_FOUND: 'User Not Found',
    USER_NOT_ACTIVATED: 'User Not Activated. Please check your email.',
    USER_LOCKED: 'User Locked, Contact support!'
  },
  SAVED_LISTINGS: {
    LISTING_NOT_SAVED: 'ERROR LISTING NOT SAVED',
    LISTING_NOT_FOUND: 'ERROR LISTING NOT FOUND',
    LISTING_NOT_DELETED: 'ERROR LISTING NOT DELETED'
  },
  CONTACT_US: {
    CANNOT_SENT_MESSAGE: `ERROR CANNOT SENT MESSAGE!`
  },
  SCHEDULED_VIEWING: {
    LISTING_ID_MISSING: 'ERROR LISTING ID MISSING',
    LISTING_ID_NOT_FOUND: 'ERROR LINSTING ID NOT FOUND'
  }
};
