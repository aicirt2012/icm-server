import {Address} from './address'

export class Email {
	id: string;
	messageId: string;
	subject: string;
	html: string;
	text: string;
	date: string;
	from: Address[];
	to: Address[];
}