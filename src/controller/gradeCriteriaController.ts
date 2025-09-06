import { Request,Response} from "express";

export const editGrade = (req: Request, res: Response) => {
    const id = req.params.id;
    const {name,assessment_criteria,action} = req.body;
    res.json({message: `student ${name} grade has change to ${action} of assessment criteria ${assessment_criteria}.`});
}