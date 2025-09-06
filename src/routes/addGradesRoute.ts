import {Router} from "express";
import {createGrade} from "../controller/addGradesController";

const router=Router();

router.post('/',createGrade);

export default router;