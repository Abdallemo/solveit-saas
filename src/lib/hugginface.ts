
import { env } from '@/env/server'
import {HfInference} from '@huggingface/inference'

export const  huggingface = new HfInference(env.HUGGINGFACE_API_KEY)

