import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Status, Block } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  API_BASE = environment.apiBaseUrl ;

  constructor(private http: HttpClient) { 
  }

  loadStatus() {
  	return this.http.get<Status>(this.API_BASE + '/explorer/status/');
  }

  loadBlock(hash) {
      return this.http.get<Block>(this.API_BASE + '/explorer/block/' + '?hash=' + hash);
  }

  loadBlocks(page = 1) {
    return this.http.get<Block[]>(this.API_BASE + '/explorer/blocks/' + '?page=' + (page+1));
  }

  searchBlock(query) {
    return this.http.get<any>(this.API_BASE + '/explorer/search/' + '?q=' + query);
  }

  loadBlocksRange() {
      return this.http.get<Block[]>(this.API_BASE + '/explorer/range/');
  }
}
