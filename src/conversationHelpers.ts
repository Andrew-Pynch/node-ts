import { getAllExercisesByUserIdAndBodyGroup } from './exerciseHelpers';

export const validUserIds = ['clfmq747j0000wk3u87d7wlul'];
export const validUsersByPhone = {
    '+15039302186': 'clfmq747j0000wk3u87d7wlul',
};

const getUserIdFromPhoneNumber = (phoneNumber: string): string => {
    return validUsersByPhone[phoneNumber];
};

export enum ConversationStep {
    GETTING_BODY_GROUP = 'GETTING_BODY_GROUP',
    GETTING_EXERCISE = 'GETTING_EXERCISE',
    GETTING_REPS = 'GETTING_REPS',
    GETTING_SETS = 'GETTING_SETS',
    GETTING_WEIGHT = 'GETTING_WEIGHT',
    CONFIRMATION = 'CONFIRMATION',
}

export enum BodyGroup {
    CHEST = 'Chest',
    ARMS = 'Arms',
    SHOULDERS = 'Shoulders',
    BACK = 'Back',
    CORE = 'Core',
    LEGS = 'Legs',
}

const getBodyGroupPrompt = () => {
    const bodyGroups = Object.values(BodyGroup);
    const bodyGroupString = bodyGroups.join(', ');
    return `What body group would you like to work on today? Your options are: ${bodyGroupString}`;
};

const getExercisePrompt = async (bodyGroup: BodyGroup, userId: string) => {
    try {
        // Replace the hardcoded request and response object with actual user id and body group
        const req = {
            body: { userId: userId, bodyGroup: bodyGroup },
        } as unknown as Request;
        const res = {
            json: (exercises: any) =>
                exercises.map((exercise) => exercise.name).join(', '),
            status: (statusCode: number) => res,
        } as unknown as Response;

        const exerciseList = await getAllExercisesByUserIdAndBodyGroup(
            req,
            res
        );
        return `What exercise do you want to perform? Your options are: ${exerciseList}`;
    } catch (error) {
        console.error('error', error);
        return 'An error occurred while retrieving exercises.';
    }
};

const getRepsPrompt = () => {
    return 'How many reps are you planning to do?';
};

const getSetsPrompt = () => {
    return 'How many sets are you planning to do?';
};

const getWeightPrompt = () => {
    return 'How much weight will you be lifting?';
};

const getConfirmationPrompt = () => {
    return 'Got it. Please confirm the details. Reply "yes" to confirm or "no" to start over.';
};

export const prompts = async (phoneNumber: string, bodyGroup: BodyGroup) => {
    return {
        [ConversationStep.GETTING_BODY_GROUP]: getBodyGroupPrompt(),
        [ConversationStep.GETTING_EXERCISE]: await getExercisePrompt(
            bodyGroup,
            getUserIdFromPhoneNumber(phoneNumber)
        ),
        [ConversationStep.GETTING_REPS]: getRepsPrompt(),
        [ConversationStep.GETTING_SETS]: getSetsPrompt(),
        [ConversationStep.GETTING_WEIGHT]: getWeightPrompt(),
        [ConversationStep.CONFIRMATION]: getConfirmationPrompt(),
    };
};

export const getNextConversationStep = (
    currentStep: ConversationStep
): ConversationStep => {
    const steps = Object.values(ConversationStep);
    const currentIndex = steps.indexOf(currentStep);
    const nextIndex = (currentIndex + 1) % steps.length; // cycle back to 0 after the last step
    return steps[nextIndex] as ConversationStep;
};

export const ConversationHelpers = () => {
    getBodyGroup: async () => {};
};
