import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import routes from './routes/rotas';
import bodyParser from 'body-parser';

dotenv.config()
const server = express();
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json())
server.use(routes);

server.use((req: Request, res: Response) => {
    res.status(404);
    res.json({ error: 'Endpoint não encontrado.' });
});

server.listen(process.env.PORT, ()=>{console.log('rodando na porta: ' + process.env.PORT)})
