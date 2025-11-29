import nodemailer from 'nodemailer';
import config from './index';
import logger from '../utils/logger';

// Create Nodemailer transporter with Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    logger.error('Mailer configuration error:', error);
  } else {
    logger.info('Mailer is ready to send emails via Mailtrap');
  }
});

export default transporter;
