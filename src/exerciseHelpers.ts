import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();

export const getAllExercises = async (req: Request, res: Response) => {
    try {
        const exercises = await prisma.exercise.findMany({});
        res.json(exercises);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while retrieving exercises.',
        });
    }
};

export const getAllExercisesByUserId = async (req: Request, res: Response) => {
    const schema = z.object({ userId: z.string() });
    const { userId } = schema.parse(req.params);

    try {
        const exercises = await prisma.exercise.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });

        res.json(exercises);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while retrieving exercises.',
        });
    }
};

export const getAllExercisesByUserIdAndBodyGroup = async (
    req: Request,
    res: Response
) => {
    const schema = z.object({
        userId: z.string(),
        bodyGroup: z.string(),
    });
    const { userId, bodyGroup } = schema.parse(req.body);

    try {
        const exercises = await prisma.exercise.findMany({
            where: {
                userId,
                bodyGroup,
            },
            orderBy: {
                date: 'desc',
            },
        });

        res.json(exercises);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while retrieving exercises.',
        });
    }
};

export const getAllNamesByUserIdAndBodyGroup = async (
    req: Request,
    res: Response
) => {
    const schema = z.object({
        userId: z.string(),
        bodyGroup: z.string().optional(),
    });
    const { userId, bodyGroup } = schema.parse(req.body);

    try {
        const exercises = await prisma.exercise.findMany({
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

        res.json(exercises);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while retrieving exercises.',
        });
    }
};

export const get3MostRecentExercisesByExerciseAndBodyGroup = async (
    req: Request,
    res: Response
) => {
    const schema = z.object({
        bodyGroup: z.string(),
        exercise: z.string(),
    });
    const { bodyGroup, exercise } = schema.parse(req.body);

    try {
        const exercises = await prisma.exercise.findMany({
            where: { bodyGroup, exercise },
            orderBy: { date: 'desc' },
            take: 3,
        });

        res.json(exercises);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while retrieving exercises.',
        });
    }
};

export const addExercise = async (req: Request, res: Response) => {
    const schema = z.object({
        userId: z.string(),
        date: z.date(),
        bodyGroup: z.string(),
        exercise: z.string(),
        weight: z.number(),
        sets: z.number(),
        reps: z.number(),
        specialModifier: z.string().optional(),
    });
    const input = schema.parse(req.body);

    try {
        const newExercise = await prisma.exercise.create({
            data: input as any,
        });
        res.json(newExercise);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while creating the exercise.',
        });
    }
};

export const updateExercise = async (req: Request, res: Response) => {
    const schema = z.object({
        id: z.string(),
        date: z.date().optional(),
        bodyGroup: z.string().optional(),
        exercise: z.string().optional(),
        weight: z.number().optional(),
        sets: z.number().optional(),
        reps: z.number().optional(),
        specialModifier: z.string().optional(),
    });
    const { id, ...updateData } = schema.parse(req.body);

    try {
        const updatedExercise = await prisma.exercise.update({
            where: { id },
            data: updateData,
        });
        res.json(updatedExercise);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while updating the exercise.',
        });
    }
};

export const deleteExerciseById = async (req: Request, res: Response) => {
    const schema = z.object({ id: z.string() });
    const { id } = schema.parse(req.params);

    try {
        const deletedExercise = await prisma.exercise.delete({ where: { id } });
        res.json(deletedExercise);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({
            error: 'An error occurred while deleting the exercise.',
        });
    }
};
