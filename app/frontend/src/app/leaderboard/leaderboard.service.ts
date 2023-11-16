import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../entities.interface';
import { HOST_IP } from '../Constants';

@Injectable({
	providedIn: 'root'
  })
  export class LeaderboardService {

	constructor(private http: HttpClient) { }

	domain: string = HOST_IP

	getAllPlayersStats(): Observable<Player[]> {
	  const url = `${this.domain}/api/ranking/board`
	  return this.http.get<Player[]>(url, { withCredentials: true })
	}
}
