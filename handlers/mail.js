const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const generateHtml = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html);

  return inlined;
};

exports.sendEmail = (options) => {
  const html = generateHtml(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: 'Juan Lopez <juan@gmail.com>',
    to: options.user.email,
    subject: options.subject,
    html,
    text,
  };

  return transport.sendMail(mailOptions);
};
