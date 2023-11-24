import { IsNotEmpty } from "class-validator";

export type ROUTE = "game" | "leaderboard" | "profile" | "chat";

export class RouteDto {
  @IsNotEmpty()
  route: ROUTE;
}
