import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.route.js';
import todoRouter from './routes/todo.route.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import notebookRouter from './routes/notebook.route.js';
import postRouter from './routes/post.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
    res.send('Hello World!');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', authMiddleware, postRouter);
app.use('/api/v1/todos', authMiddleware, todoRouter);
app.use('/api/v1/notebooks', authMiddleware, notebookRouter);

// app.all('/:path(*)', (req, res) => {
//   res.status(404).send(`Cannot ${req.method} ${req.url}`);
// });

// app.use((req, res) => {
//   res.status(404).send(`Cannot find ${req.method} - ${req.url} on this server`);
// });

app.use((_req, res) => {
    res
        .status(404)
        .sendFile(path.join(__dirname, "views", "404.html"));
})

export default app;
