
export const CLIENT_ID = process.env.CLIENT_ID
export const CLIENT_SECRET = process.env.CLIENT_SECRET
export const CALLBACK_URL = `${process.env.HOST_IP}/api/42auth/redirect`
export const FRONT_END_CALLBACK_URL = `${process.env.HOST_IP}/profile`
export const FRONT_END_2FA_CALLBACK_URL = `${process.env.HOST_IP}/login/2fa`
export const DB_TYPE = "postgres"
export const DB_HOST = process.env.DB_HOST
export const DB_PORT= Number(process.env.DB_PORT)
export const DB_USERNAME = process.env.POSTGRES_USER
export const DB_PASSWORD = process.env.POSTGRES_PASSWORD
export const DB_NAME = process.env.POSTGRES_DB
export const SESSION_SECRET = process.env.SESSION_SECRET
export const IMAGE_UPLOADS_PATH = process.env.IMAGE_UPLOADS_PATH
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
export const EMAIL_HOST = process.env.EMAIL_HOST
export const EMAIL_PORT = Number(process.env.EMAIL_PORT)


export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PORT = process.env.REDIS_PORT
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD
export const REDIS_CLIENT = process.env.REDIS_CLIENT
export const FRONT_END_URL = process.env.HOST_IP

export const DEFAULT_PADDLE_LENGTH = 80
export const DEFAULT_PADDLE_WIDTH = 1
export const DEFAULT_TABLE_PROPORTION = 2
export const BALL_RADIUS = 7.5
export const DEFAULT_TABLE_HEIGHT = 500
export const DEFAULT_PADDLE_GAP = 90
export const POSTGRES_UNIQUE_VIOLATION = '23505'
export const MAXPOINTS = 1

export const SALT_ROUNDS = 10
export const TIME_TO_MUTE = 30000;//30sec
export const SAFE_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
export const CHANNEL_NAME_REGEX = /^#?[A-Za-z\d_-]{2,20}$/
