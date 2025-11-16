import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import grades from './routes/studentGradeRoutes';
import notasMateriaEstudianteRoute from './routes/notas-materia-estudiante-route';
import subjectCriteria from './routes/subjectCriteriaroute';
import addGrade from './routes/GradesRoute';
import editGrade from './routes/gradeCriteriaroute';
import path from 'path';

import mongoose from "mongoose";

const app = express();
const PORT = 5001;

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/grades")
  .then(() => console.log("✔️ MongoDB conectado"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grades Service API',
      version: '1.0.0',
      description: 'API para manejar calificaciones de estudiantes',
    },
  },
  apis: [path.join(__dirname, '../docs/swagger.yml')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/grades', grades);
app.use('/api', notasMateriaEstudianteRoute);
app.use('/api/criteria', subjectCriteria);
app.use('/api/grade', addGrade);
app.use('/api/edit-grade', editGrade);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
});
