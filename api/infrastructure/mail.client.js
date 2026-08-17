const { Resend } = require("resend");

const client = new Resend(process.env.RESEND_API_KEY);

module.exports.MailClient = {
    send: async ({ to, subject, body }) => {
        return await client.emails.send({
            from: `Propio AI <${process.env.SENDER_ADDRESS}>`,
            to,
            subject,
            html: body
        })
    }
}