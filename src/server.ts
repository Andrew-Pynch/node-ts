import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import os from 'os';
import twilio from 'twilio';

const MessagingResponse = twilio.twiml.MessagingResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`App is listening on hostname: ${os.hostname()}, port: ${port}`);
//    console.log(`App is running at: https://server-production-5f16.up.railway.app:${port}`);
});




// Object to hold ongoing conversations
let ongoingConversations: { [key: string]: string[] } = {};

app.post('/sms', (req: Request, res: Response) => {
  console.log('Received an SMS from:', req.body.From); // Log the sender of the SMS
  
  const twiml = new MessagingResponse();

  // Confirm the message is from the right number
  if (req.body.From !== '+15039302186') {
    twiml.message('Unauthorized user.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
    return;
  }

  twiml.message('Authorized user.'); // Add a message for the authorized user
  console.log('Authorized user recognized.'); // Log that the authorized user was recognized

  // Implement your conversation logic here
  // Push new messages into ongoingConversations[req.body.From]
  // and use the length of that array to determine which question to ask next

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

