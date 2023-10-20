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
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
	  user: '42.master.pong@gmail.com',
	  pass: 'nrvbszqkuckandnn'
	}
}


export const options = {
    from: '42.master.pong@gmail.com',
    to: "", 
    subject: "Verify your accont", 
    text: ""
}