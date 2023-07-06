require('dotenv').config();
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import os from 'os';
import twilio from 'twilio';
import {
    BodyGroup,
    ConversationStep,
    ExercisePair,
    getNextConversationStep,
    prompts,
} from './conversationHelpers';

const __DEV__ = process.env.NODE_ENV === 'development';

type MessagingResponseInstance = InstanceType<
    typeof twilio.twiml.MessagingResponse
>;
class MessageResponseWrapper {
    private twiml: MessagingResponseInstance;
    private message: any;

    constructor() {
        this.twiml = new twilio.twiml.MessagingResponse();
        this.message = this.twiml.message('');
    }

    public addMessage(message: string): void {
        this.message.body(message);
    }

    public getTwiml(): MessagingResponseInstance {
        return this.twiml;
    }

    public send(__DEV__: boolean): void {
        if (__DEV__) {
            console.log(this.twiml.toString());
        } else {
            // Logic to send the SMS via Twilio
        }
    }
}
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, () => {
    console.log(
        `App is listening on hostname: ${os.hostname()}, port: ${port}`
    );
    //    console.log(`App is running at: https://server-production-5f16.up.railway.app:${port}`);
});

export type ConversationStates = {
    [key: string]: ConversationStep;
};
let conversationStates: ConversationStates = {};
export interface UserResponse {
    bodyGroup?: BodyGroup;
    exercises?: ExercisePair[];
    selectedExercise?: string;
    // Add other fields as necessary
}
export type UserResponses = {
    [key: string]: UserResponse;
};
let userResponses: UserResponses = {};

app.post('/sms', async (req: Request, res: Response) => {
    const responseWrapper = new MessageResponseWrapper();

    const fromNumber = req.body.From;
    const parsed = req.body.Body;
    const message: string = parsed ? parsed : '';

    if (message === '' || !message) {
        responseWrapper.addMessage('Please send a valid message.');
        responseWrapper.send(__DEV__);
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(responseWrapper.getTwiml().toString());
        return;
    }

    console.log('Received an SMS from:', fromNumber);

    if (
        message.toLowerCase() === 'cancel' ||
        message.toLowerCase() === 'reset'
    ) {
        conversationStates = {};
        responseWrapper.addMessage('Your workout has been cancelled.');
    }

    if (fromNumber !== '+15039302186' && fromNumber !== '15039302186') {
        responseWrapper.addMessage('Unauthorized user.');
        responseWrapper.send(__DEV__);
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(responseWrapper.getTwiml().toString());
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

    if (conversationStates[fromNumber] === ConversationStep.GETTING_EXERCISE) {
        const selectedExerciseNumber = parseInt(message, 10);
        if (!isNaN(selectedExerciseNumber)) {
            const selectedExercise =
                userResponses[fromNumber].exercises[selectedExerciseNumber - 1];
            if (selectedExercise) {
                // Store the selected exercise and move to the next step
                userResponses[fromNumber].selectedExercise =
                    selectedExercise.exercise;
                conversationStates[fromNumber] = getNextConversationStep(
                    conversationStates[fromNumber]
                );
            } else {
                // Invalid exercise number provided
                responseWrapper.addMessage(
                    'Invalid exercise number. Please try again.'
                );
            }
        } else {
            // Non-number input provided
            responseWrapper.addMessage(
                'Please provide the number of the exercise.'
            );
        }
    }

    if (conversationStates[fromNumber]) {
        const currentPrompts = await prompts(
            fromNumber,
            userResponses,
            userResponses[fromNumber]?.bodyGroup
        );
        responseWrapper.addMessage(
            currentPrompts[conversationStates[fromNumber]]
        );
    }

    responseWrapper.send(__DEV__);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(responseWrapper.getTwiml().toString());
});
