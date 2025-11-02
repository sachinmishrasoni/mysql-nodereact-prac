import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
    res.send('Hello World!');
});

// app.all('/:path(*)', (req, res) => {
//   res.status(404).send(`Cannot ${req.method} ${req.url}`);
// });

// app.use((req, res) => {
//   res.status(404).send(`Cannot find ${req.method} - ${req.url} on this server`);
// });

app.use((req, res) => {
    res
        .status(404)
        .sendFile(path.join(__dirname, "views", "404.html"));
})

export default app;
