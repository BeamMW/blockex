import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Block } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  API_BASE = environment.apiBaseUrl;
  assetsList = [];

  constructor(private http: HttpClient) {
  }

  loadBlocks(page = 1): any {
    return this.http.get<Block[]>(this.API_BASE + '/explorer/blocks/' + '?page=' + (page + 1));
  }
}
