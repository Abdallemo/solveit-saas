import { huggingface } from "@/lib/hugginface";

export async function GET(req: Request,) {

    // const response = await openai.responses.create({
    //     model:'gpt-3.5-turbo    ',
    //     instructions:'you need just to act normal with no difinishins',
    //     input:'why typesript is so likeble'

    // })
    const commingData = req.body;
    console.log(commingData)

    const response = await huggingface.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: "javascript vs php in 40 words " }],
        max_tokens: 100,
    });

    return Response.json({ answer: response.choices[0].message })

}

export async function POST(req: Request) {

    const body = await req.json();
    console.log(body)
    const message:string = body.message;

    const response = await huggingface.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: message }],
    });

    return Response.json({ answer: response.choices[0].message.content })
}

