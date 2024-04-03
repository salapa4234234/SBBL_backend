import nodemailer from "nodemailer";

export const sendMail = async (email, subject, content) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: "nabaraj2055@gmail.com",
        pass: "zvqt eher sekc ueqz",
      },
    });
    const options = {
      from: "nabaraj2055@gmail.com",
      to: email,
      subject: subject,
      html: content,
    };
    await transport.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfuly sent mail!", info);
      }
    });
  } catch (error) {
    console.log("errr", error);
  }
};
