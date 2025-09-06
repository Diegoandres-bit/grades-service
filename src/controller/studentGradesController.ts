import {Request, Response} from 'express';
type grade={
    percentage:number,
    assessment_criteria:string,
    grade:number
}
export const getGradesFromSubjectStudent = (req:Request,res: Response) => {
    const data=([
        {percentage:30, assessment_criteria: 'Exam', grade: 0},
        {percentage:25, assessment_criteria: 'Homework', grade: 18},
        {percentage:15, assessment_criteria: 'Project', grade: 45},
        {percentage:30, assessment_criteria: 'Class Participation', grade: 4},
        
    ]);
   
res.json(data);
}
                                                                                                                                                                                                                                                                                                                                           
export const finalGrade=(req:Request,res:Response)=> {
    const finalGrade=([{finalGrade:88}])
    res.json (finalGrade)
}


