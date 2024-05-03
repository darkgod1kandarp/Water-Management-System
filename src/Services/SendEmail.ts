import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { EmailTemplates, SendEmailProps } from './types';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
export const templates: EmailTemplates = {
	report: 'd-cee982cccb574959bbfa06c96e12d750',
};
export const SendEmail = async ({
	to,
	template,
	attachments,
	onSuccessfulSend,
}: SendEmailProps) => {
	const msg = {
		to: to,
		from: {
			email: 'support@webbound.in',
			name: 'Webbound Support',
		},
		templateId: template.id,
		dynamic_template_data: template,
		attachments,
	};
	try {
		const data = await sgMail.send(msg);
		if (onSuccessfulSend) return onSuccessfulSend(data[0]);
	} catch (error: any) {
		throw new Error(error);
	}
};