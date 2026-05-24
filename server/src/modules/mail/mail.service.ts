import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendgridService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  messageSignUpGenerate(
    to: string[],
    templateId: string,
    dynamic_template_data: any,
  ) {
    return {
      to: to.join(', '),
      subject: 'Thông báo / Lời mời từ hệ thống',
      html: `<p>Vui lòng click vào đường dẫn sau: <a href="${dynamic_template_data.link}">${dynamic_template_data.link}</a></p>`,
    };
  }

  messageForgotPasswordGenerate(
    to: string[],
    templateId: string,
    dynamic_template_data: any,
  ) {
    return {
      to: to.join(', '),
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `<p>Vui lòng click vào đường dẫn sau để đặt lại mật khẩu: <a href="${dynamic_template_data.link}">${dynamic_template_data.link}</a></p>`,
    };
  }

  async send(msg: any) {
    const mailOptions = {
      from: `"${process.env.FROM_EMAIL_NAME || 'System'}" <${process.env.GMAIL_USER}>`,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    };
    return this.transporter.sendMail(mailOptions);
  }

  messageCronjobGenerate(to: string[], templateId: string) {
    return {
      to: to.join(', '),
      subject: 'Cronjob Notification',
      html: '<p>This is a cronjob notification.</p>',
    };
  }
}
