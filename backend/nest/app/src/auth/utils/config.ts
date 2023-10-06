export interface MailSettings {
	host: string
	port: number
	secure: boolean
	auth: {
		user: string
		pass: string
	}
}

export const settings: MailSettings = {
	host: "smtp.forwardemail.net",
	port: 465,
	secure: true,
	auth: {
	  user: '',
	  pass: ''
	}
}


export const options = {
    from: '"Pong Master " <noreply@pong.master.com>',
    to: "", 
    subject: "Verify your accont", 
    text: ""
}