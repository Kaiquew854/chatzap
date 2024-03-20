import { Request, Response, query, response } from "express";
import axios from 'axios';
import yts from 'yt-search'

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


//---------------------//---------------------//--------
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

    if (textFromUser.includes('PIADA')) {
        resultResponse = await getJoke();
        reqBody = {
            "messaging_product": "whatsapp",
            "to": `${process.env.RecipientPhoneNumber}`,
            "type": "text",
            "text": {
                "body": resultResponse
            }
        }
        reqBody.text.body = resultResponse
    }

    if (textFromUser.includes('#PLAY')) {
        enviarMensagem("aguarde...")
        resultResponse = await ytSearch(textFromUser);
        let urlmusica: string = resultResponse.toString()
        resultResponse = await conversor(urlmusica)
        reqBody = {
            "messaging_product": "whatsapp",
            "to": `${process.env.RecipientPhoneNumber}`,
            "type": "audio",
            "audio": {
                "link": resultResponse
            }
        }
        reqBody.audio.link = resultResponse

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

const enviarMensagem = async (msg:string) => {
    await fetch(`https://graph.facebook.com/${process.env.Version}/${process.env.PhoneNumberID}/messages`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.UserAccessToken}`,
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                "messaging_product": "whatsapp",
                "to": `${process.env.RecipientPhoneNumber}`,
                "type": "text",
                "text": {
                    "body": msg
                }
            }
            )
        });
}



//chamadas a API's externas
const getJoke = async () => {
    const piada = await axios.get('https://v2.jokeapi.dev/joke/Any?lang=pt');
    const joke = piada.data.setup
    const jokePunch = piada.data.delivery
    const fullJoke: String = (joke + "\n \n resposta: " + jokePunch);
    return fullJoke
}

//retorna url de videos do youtube
const ytSearch = async (musicText: String) => {
    musicText = musicText.substring(7)

    let v: string = ""
    let views: string = ""
    let linkVideo: String = ""

    try {
        const pesquisa = await yts(musicText.toString())
        let videos = pesquisa.videos.slice(0, 10)
        videos.forEach(function (v) {
            const views = String(v.views).padStart(10, ' ')
            if (v.seconds <= 300) {
                linkVideo = v.url
            }
        })

    } catch (error) {
        return ("erro ao localizar video tente novamente")
    }

    return linkVideo
}

//converte url de video para mp3
const conversor = async (url: String) => {
    console.log(url)
    let musicJson: any = ''

    const getMusic = await fetch(`https://youtube.michaelbelgium.me/api/converter/convert`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.ConversorToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    "url": url,
                    "format": "mp3"
                }
            )
        }
    )

        .catch((error) => {
            return error.toString()
        })

    musicJson = await getMusic.json()
    console.log(JSON.stringify(musicJson.file))
    return (musicJson.file)

}



