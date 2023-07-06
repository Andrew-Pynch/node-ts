require('dotenv').config();
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import os from 'os';
import twilio from 'twilio';
import {
    ConversationStep,
    getNextConversationStep,
    prompts,
} from './conversationHelpers';

const MessagingResponse = twilio.twiml.MessagingResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(
        `App is listening on hostname: ${os.hostname()}, port: ${port}`
    );
    //    console.log(`App is running at: https://server-production-5f16.up.railway.app:${port}`);
});

// Define the type for ConversationStates
type ConversationStates = {
    [key: string]: ConversationStep;
};

// Object to hold the current state of each conversation
let conversationStates: ConversationStates = {};

app.post('/sms', (req: Request, res: Response) => {
    const fromNumber = req.body.From;
    const message = req.body.Body;

    console.log('Received an SMS from:', fromNumber);

    const twiml = new MessagingResponse();

    if (fromNumber !== '+15039302186') {
        twiml.message('Unauthorized user.');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        return;
    }

    if (!conversationStates[fromNumber] || message.toLowerCase() === 'no') {
        // If the conversation hasn't started yet or the user wants to start over
        conversationStates[fromNumber] = ConversationStep.GETTING_BODY_GROUP;
    } else if (
        message.toLowerCase() === 'yes' &&
        conversationStates[fromNumber] === ConversationStep.CONFIRMATION
    ) {
        // If the user confirmed the details
        twiml.message('Thank you! Your workout has been logged.');
        delete conversationStates[fromNumber];
    } else {
        // Otherwise, move to the next step
        conversationStates[fromNumber] = getNextConversationStep(
            conversationStates[fromNumber]
        );
    }

    if (conversationStates[fromNumber]) {
        twiml.message(prompts[conversationStates[fromNumber]]);
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});
