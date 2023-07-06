import { Exercise } from '@prisma/client';
import { prisma } from './db';

export const getAllExercises = async () => {
    try {
        return await prisma.exercise.findMany({});
    } catch (error) {
        console.error('error', error);
        throw new Error('An error occurred while retrieving exercises.');
    }
};

export const getAllExercisesByUserId = async (userId: string) => {
    try {
        return await prisma.exercise.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
    } catch (error) {
        console.error('error', error);
        throw new Error('An error occurred while retrieving exercises.');
    }
};

export const getAllExercisesByUserIdAndBodyGroup = async (
    userId: string,
    bodyGroup: string
) => {
    try {
        return await prisma.exercise.findMany({
            where: {
                userId,
                bodyGroup,
            },
            orderBy: {
                date: 'desc',
            },
        });
    } catch (error) {
        console.error('error', error);
        throw new Error('An error occurred while retrieving exercises.');
    }
};

export const getAllNamesByUserIdAndBodyGroup = async (
    userId: string,
    bodyGroup?: string
) => {
    try {
        return await prisma.exercise.findMany({
            select: { exercise: true },
            where: {
                userId,
                ...(bodyGroup ? { bodyGroup } : {}),
            },
            distinct: ['exercise'],
            orderBy: {
                date: 'desc',
            },
        });
    } catch (error) {
        console.error('error', error);
        throw new Error('An error occurred while retrieving exercises.');
    }
};

// Similar modifications for the rest of the functions...

export const get3MostRecentExercisesByExerciseAndBodyGroup = async (
    exercise: string,
    bodyGroup: string
) => {
    try {
        return await prisma.exercise.findMany({
            where: { bodyGroup, exercise },
            orderBy: { date: 'desc' },
            take: 3,
        });
    } catch (error) {
        throw new Error('An error occurred while retrieving exercises.');
    }
};

export const addExercise = async (exercise: Exercise) => {
    try {
        const newExercise = await prisma.exercise.create({
            data: exercise,
        });
        return newExercise;
    } catch (error) {
        console.error('error', error);
        throw new Error('An error occurred while adding the exercise.');
    }
};
