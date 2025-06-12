import { env } from '@/env/server'
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3'

export const s3 = new S3Client({
    region:'auto',
    endpoint:env.S3_ENDPOINT,
    credentials:{
        accessKeyId:env.S3_ACCESS_KEY_ID,
        secretAccessKey:env.S3_SECRTE_ACCESS_KEY_ID
    }
})

