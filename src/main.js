import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import { UserRoutes } from './routes/index.js';

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

//routes
app.use(UserRoutes);

const PORT = process.env.SERVER_PORT || 8888;

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
