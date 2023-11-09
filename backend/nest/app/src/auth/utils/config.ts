import { EMAIL_HOST, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_USER } from "src/Constants"

export interface MailSettings {
	host: string
	port?: number
	secure?: boolean
	auth: {
		user: string
		pass: string
	}
}

export const settings: MailSettings = {
	host: EMAIL_HOST,
	port: EMAIL_PORT,
	secure: true,
	auth: {
	  user: EMAIL_USER,
	  pass: EMAIL_PASSWORD
	}
}


export const options = {
    from: EMAIL_USER,
    to: "", 
    subject: "42 Pong Master: Verification code", 
    text: ""
}