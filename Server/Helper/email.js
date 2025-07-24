import nodemailer from 'nodemailer';

// Configure your email here (use your Gmail or other SMTP for real use)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // replace with your email
        pass: 'your_email_password'   // replace with your app password
    }
});

export const sendInvoiceEmail = async (to, plan, amount) => {
    const mailOptions = {
        from: 'your_email@gmail.com',
        to,
        subject: 'Your Plan Upgrade Invoice',
        html: `<h2>Thank you for upgrading!</h2>
               <p>You have successfully upgraded to the <b>${plan.toUpperCase()}</b> plan.</p>
               <p>Amount Paid: <b>₹${amount}</b></p>
               <p>Enjoy your new benefits!</p>`
    };
    await transporter.sendMail(mailOptions);
}; 