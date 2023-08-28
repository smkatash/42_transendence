import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as Redis from 'redis';

const url = 'redis://localhost:6379'
  

@Injectable()
export class RedisService {
    private client: Redis.RedisClientType
    
    constructor() {
        this.client  = Redis.createClient({ url })
        //this.client.connect()
        this.client.on('error', (error) => {
            new InternalServerErrorException(error)
        });
    }

    async getClient(): Promise<Redis.RedisClientType> {
        return this.client 
    }

    async storeSession(key: string, value: string): Promise<void> {
        console.log(key, ' and ', value)
        console.log('Saving ', key, ' and ', value)
        try {
            await this.client.set(key, value)
        } catch( error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }

    async getSession(key: string): Promise<string> {
        let value: string = ''

        try {
            value = await this.client.get(key)
        } catch(error) {
            throw new InternalServerErrorException()
        }
        return value
    } 
}
