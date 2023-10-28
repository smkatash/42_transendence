import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../entities.interface';

@Injectable({
	providedIn: 'root'
  })
  export class LeaderboardService {
  
	constructor(private http: HttpClient) { }
  
	domain: string = 'http://127.0.0.1:3000'
  
	getAllPlayersStats(): Observable<Player[]> {
	  const url = `${this.domain}/ranking/board`
	  return this.http.get<Player[]>(url, { withCredentials: true })
	}
}