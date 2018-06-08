import * as SparkPost from "sparkpost";
console.log(process.env.SPARKPOST_API_KEY, "key");

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true,
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm email",
      html: `
      <html>
      <body>
      <p>Testing SparkPost - the world's most awesomest email service!</p>
      <a href="${url}"><button>Confirm Email</button></a>
      </body>
      </html>`,
    },
    recipients: [{ address: recipient }],
  });

  console.log(response);
};
