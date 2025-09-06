import { Request,Response } from "express";


export const createGrade = (req: Request, res: Response) => {
    const {assessment_criteria,percentage,action} = req.body;

    res.json({message: `Grade with percentage ${percentage} and assessment criteria ${assessment_criteria} has been ${action}.`});

}