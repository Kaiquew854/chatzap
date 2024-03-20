import { Request, Response, query, response } from "express";

export const firstPage = (req: Request, res: Response) => {
    res.send('Webhook do whatsapp. não tem front-end, acesse server.ts');
}

//facebook meta envia para este endpoint os dados do hub challenge, que deve ser retornado
export const challenge = (req: Request, res: Response) => {
    return res.send(req.query['hub.challenge']).status(200);
    
};

//mensagens no webhook
export const webHookMessages = (req: Request, res: Response) => {

    let msgJson = req.body
    if (msgJson.object) {
        if (msgJson.entry &&
            msgJson.entry[0].changes &&
            msgJson.entry[0].changes[0].value.messages &&
            msgJson.entry[0].changes[0].value.messages[0]) {

            //dados da mensagem recebida  
            let emissor = msgJson.entry[0].changes[0].value.messages[0].from
            let receptor = msgJson.entry[0].changes[0].value.metadata.display_phone_number
            let msgFromUser = msgJson.entry[0].changes[0].value.messages[0].text.body

            console.log("usuario mandou uma mensagem");
            msgToUser(msgFromUser);

        } else {
            console.log("bot enviou uma mensagem")
        }
    }
    
    res.sendStatus(200);
};

//enviar mensagem para o usuario
const msgToUser = async (msgTxt: String) => {
    let textFromUser: String = msgTxt.toUpperCase()
    let resultResponse: String = "oi eu sou o ChatZap"
    let reqBody: any
    
    reqBody = {
        "messaging_product": "whatsapp",
        "to": `${process.env.RecipientPhoneNumber}`,
        "type": "text",
        "text": {
            "body": resultResponse
        }
    }


     await fetch(`https://graph.facebook.com/${process.env.Version}/${process.env.PhoneNumberID}/messages`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.UserAccessToken}`,
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(reqBody)
        });
}


