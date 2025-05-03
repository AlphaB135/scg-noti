import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.listen(3001, () => console.log('API ↯ http://localhost:3001'));
