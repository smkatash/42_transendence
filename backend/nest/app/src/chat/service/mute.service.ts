import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mute } from "../entities/mute.entity";
import { Repository } from "typeorm";

const timeToMute = 30000;//30sec

@Injectable()
export class MuteService    {
    constructor(
        @InjectRepository(Mute)
        private readonly muteRepository: Repository<Mute> 
    )   {}

    async mute(uId: string, cId: number)    {
        const alreadyMuted = await this.getMute(uId, cId);
        if (alreadyMuted)   {
            throw new BadRequestException('Already muted')
        }
        const time = new Date(new Date().getTime() + timeToMute);
        const mute = this.muteRepository.create({
        cId, uId, mutedUntil: time
       })
       return await this.muteRepository.save(mute);
    }

    async getMute(uId: string, cId: number) {
        return await this.muteRepository.findOne({
            where:  {
                uId,
                cId
            }
        }) 
    }

    // async deleteMute(uId: string, cId: number)  {
    async deleteMute(id: number)    {
        return await this.muteRepository.delete(id);
        // return await this.muteRepository.delete({
            // uId, cId

        // });
    }

    async purge()   {
        await this.muteRepository
            .createQueryBuilder()
            .delete()
            .execute()
    }
}