const nodemailer = require('nodemailer');
const config = require('../config/config');

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.nodeMailer.email,
      pass: config.nodeMailer.pass,
    },
  });

  const mailOptions = {
    from: config.nodeMailer.email,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
