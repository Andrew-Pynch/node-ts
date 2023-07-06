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

export const prompts = {
    [ConversationStep.GETTING_BODY_GROUP]:
        'What body group would you like to work on today?',
    [ConversationStep.GETTING_EXERCISE]:
        'What exercise do you want to perform?',
    [ConversationStep.GETTING_REPS]: 'How many reps are you planning to do?',
    [ConversationStep.GETTING_SETS]: 'How many sets are you planning to do?',
    [ConversationStep.GETTING_WEIGHT]: 'How much weight will you be lifting?',
    [ConversationStep.CONFIRMATION]:
        'Got it. Please confirm the details. Reply "yes" to confirm or "no" to start over.',
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
