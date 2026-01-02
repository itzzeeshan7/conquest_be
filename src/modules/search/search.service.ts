import { Injectable } from '@nestjs/common';
import {PerchwellService} from "../../libs/perchwell/perchwell.service";

@Injectable()
export class SearchService {
    constructor(
        private readonly perchwellService: PerchwellService
    ){}

    public async search(): Promise<any> {
        const result = await this.perchwellService.search('sd');
        return result;
    }
}
