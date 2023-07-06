require('dotenv').config();
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import os from 'os';
import twilio from 'twilio';
import {
    BodyGroup,
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

type ConversationStates = {
    [key: string]: ConversationStep;
};
let conversationStates: ConversationStates = {};

type UserResponses = {
    [key: string]: {
        bodyGroup?: BodyGroup;
        // ... other fields as needed
    };
};
let userResponses: UserResponses = {};

app.post('/sms', async (req: Request, res: Response) => {
    const twiml = new MessagingResponse();

    const fromNumber = req.body.From;
    const parsed = req.body.Body;
    const message: string = parsed ? parsed : '';

    if (message === '' || !message) {
        twiml.message('Please send a valid message.');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        return;
    }

    console.log('Received an SMS from:', fromNumber);

    if (
        message.toLowerCase() === 'cancel' ||
        message.toLowerCase() === 'reset'
    ) {
        conversationStates = {};
        twiml.message('Your workout has been cancelled.');
    }

    if (fromNumber !== '+15039302186') {
        twiml.message('Unauthorized user.');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        return;
    }

    if (!conversationStates[fromNumber] || message.toLowerCase() === 'no') {
        // If the conversation hasn't started yet or the user wants to start over
        conversationStates[fromNumber] = ConversationStep.GETTING_BODY_GROUP;
        userResponses[fromNumber] = {}; // Reset the user's responses
    } else if (
        conversationStates[fromNumber] ===
            ConversationStep.GETTING_BODY_GROUP &&
        Object.values(BodyGroup).includes(message as BodyGroup)
    ) {
        // Store the body group
        if (!userResponses[fromNumber]) {
            userResponses[fromNumber] = {};
        }
        userResponses[fromNumber].bodyGroup = message as BodyGroup;
        conversationStates[fromNumber] = getNextConversationStep(
            conversationStates[fromNumber]
        );
    }

    if (conversationStates[fromNumber]) {
        const currentPrompts = await prompts(
            fromNumber,
            userResponses[fromNumber]?.bodyGroup
        );
        twiml.message(currentPrompts[conversationStates[fromNumber]]);
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});
