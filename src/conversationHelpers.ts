import { getAllNamesByUserIdAndBodyGroup } from './exerciseHelpers';
import { UserResponses } from './server';

export const validUserIds = ['clfmq747j0000wk3u87d7wlul'];
export const validUsersByPhone = {
    '+15039302186': 'clfmq747j0000wk3u87d7wlul',
};

// probably a better way to do this...
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

export type ExercisePair = {
    id: number;
    exercise: string;
};

const generateExercisePairs = (exercises: any[]): ExercisePair[] => {
    return exercises.map((exercise, index) => {
        return { id: index + 1, exercise: exercise.exercise };
    });
};

const getBodyGroupPrompt = () => {
    const bodyGroups = Object.values(BodyGroup);
    const bodyGroupString = bodyGroups.join(', ');
    return `What body group would you like to work on today? Your options are: ${bodyGroupString}`;
};

const getExercisePrompt = async (bodyGroup: BodyGroup, userId: string) => {
    try {
        const exerciseList = await getAllNamesByUserIdAndBodyGroup(
            userId,
            bodyGroup
        );

        const exercisePairs = generateExercisePairs(exerciseList);

        const exerciseString = exercisePairs
            .map((pair) => `${pair.id}. ${pair.exercise}`)
            .join('\n');

        return `What exercise do you want to perform? Your options are:\n${exerciseString}`;
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

export const prompts = async (
    phoneNumber: string,
    userResponses: UserResponses,
    bodyGroup: BodyGroup
) => {
    const userId = getUserIdFromPhoneNumber(phoneNumber);
    if (!userResponses[userId]) {
        userResponses[userId] = {};
    }

    let exercisePairs = [];
    if (bodyGroup) {
        const exerciseList = await getAllNamesByUserIdAndBodyGroup(
            userId,
            bodyGroup
        );

        exercisePairs = generateExercisePairs(exerciseList);
        userResponses[userId].exercises = exercisePairs;
    }

    const exerciseString = exercisePairs
        .map((pair) => `${pair.id}. ${pair.exercise}`)
        .join('\n');

    return {
        [ConversationStep.GETTING_BODY_GROUP]: getBodyGroupPrompt(),
        [ConversationStep.GETTING_EXERCISE]: `What exercise do you want to perform? Your options are:\n${exerciseString}`,
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
