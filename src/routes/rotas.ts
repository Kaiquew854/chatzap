import { Router, Request, Response, query } from "express";
import * as controller from '../controllers/messageController'
import dotenv from 'dotenv';

dotenv.config()
const routes = Router();

routes.get("/", controller.firstPage);

//facebook/meta envia para este endpoint os dados do hub challenge, que deve ser retornado
routes.get('/webhook', controller.challenge);

//obter ultimas mensagens armazenadas no webhook
routes.post("/webhook", controller.webHookMessages);

export default routes