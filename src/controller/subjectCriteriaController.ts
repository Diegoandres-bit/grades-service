import {Request, Response} from 'express';
const data=([
        {id:1,assessment_criteria:'Exam',percentage:30},
        {id:2,assessment_criteria:'Homework',percentage:25},
    ]);
export const gradeCriteria=(req:Request,res:Response)=>{
    
    res.json(data);
}

export const totalPercentage=(req:Request,res:Response)=>{
   
    const totalPercentage= data.reduce((total, item) => total + item.percentage, 0);
    res.json(totalPercentage)
}