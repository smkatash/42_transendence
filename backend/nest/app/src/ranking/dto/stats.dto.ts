import { IsNumber } from "class-validator";


export class StatsDto {
	@IsNumber()
	wins: number
	@IsNumber()
	losses: number
}