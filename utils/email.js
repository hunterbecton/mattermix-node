const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.fromEmail = 'hunter@mattermix.com';
    this.fromName = 'Mattermix';
  }

  async sendMagicLink() {
    const mailOptions = {
      to: this.to,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      templateId: 'd-eced363c59ae4fc39cc5741f91c1cd18',
      dynamic_template_data: {
        url: this.url,
      },
    };

    await sgMail.send(mailOptions).then(() => {}, console.error);
  }

  async sendRenewalReminder() {
    const mailOptions = {
      to: this.to,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      templateId: 'd-24d6253594c94c8689b01ef8a23e3536',
      dynamic_template_data: {},
    };

    await sgMail.send(mailOptions).then(() => {}, console.error);
  }
};
