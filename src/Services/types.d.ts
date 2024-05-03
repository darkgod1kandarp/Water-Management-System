import { MailDataRequired } from '@sendgrid/mail';
export interface EmailTemplates {
	report: 'd-cee982cccb574959bbfa06c96e12d750';
}

export interface SendEmailProps extends MailDataRequired {
	to: string;
	template: ReportTemplateData;
	attachments?: EmailAttachment[];
	onSuccessfulSend?: (data: ClientResponse) => void;
	onFailedSend?: (error: Error) => void;
}

export interface ReportTemplateData {
	id: EmailTemplates['report'];
	name: string;
    month : string;
}

export interface EmailAttachment {
	filename: string;
	content: string;
}