import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
import { MailOptions } from "nodemailer/lib/json-transport";
import * as config from '../utils/config'


@Injectable()
export class MailService {
	private settings: config.MailSettings
	private options: MailOptions
	constructor() {
		this.settings = config.settings
		this.options = config.options
	}

	public async send(receiver: string, body: string) {
        if(nodemailer && this.options) {
            const transporter = nodemailer.createTransport(this.settings)
			transporter.verify((err, success) => {
				if (err) {
					new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
				}
			})

			this.options.to = receiver
			this.options.text = body
			try {
				await transporter.sendMail(this.options)
			} catch (error) {
				new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
			}
        }
    }

}
