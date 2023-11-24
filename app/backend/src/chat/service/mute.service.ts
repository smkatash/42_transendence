import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TIME_TO_MUTE } from "src/utils/Constants";
import { Repository } from "typeorm";
import { Mute } from "../entities/mute.entity";

// const timeToMute = 30000;//30sec

@Injectable()
export class MuteService {
  constructor(
    @InjectRepository(Mute)
    private readonly muteRepository: Repository<Mute>,
  ) {}

  async mute(uId: string, cId: number) {
    const alreadyMuted = await this.getMute(uId, cId);
    if (alreadyMuted) {
      throw new BadRequestException("Already muted");
    }
    const time = new Date(new Date().getTime() + TIME_TO_MUTE);
    const mute = this.muteRepository.create({
      cId,
      uId,
      mutedUntil: time,
    });
    return await this.muteRepository.save(mute);
  }

  async getMute(uId: string, cId: number) {
    return await this.muteRepository.findOne({
      where: {
        uId,
        cId,
      },
    });
  }

  // async deleteMute(uId: string, cId: number)  {
  async deleteMute(id: number) {
    return await this.muteRepository.delete(id);
    // return await this.muteRepository.delete({
    // uId, cId

    // });
  }
  async deleteMutesByChannel(cId: number) {
    return await this.muteRepository.delete({
      cId,
    });
  }

  async purge() {
    await this.muteRepository.createQueryBuilder().delete().execute();
  }
}
