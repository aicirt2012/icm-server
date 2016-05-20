export class Email {
	id: string;
	messageId: string;
	subject: string;
	html: string;
	text: string;
	date: Date;
	from: [{
    address: string;
    name: string;
  }];
	to: [{
    address: string;
    name: string;
  }];
}
