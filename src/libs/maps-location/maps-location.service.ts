import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from '../../config/app/config.service';
import { AxiosResponse } from 'axios';
import { format } from "date-fns";

@Injectable()
export class MapsLocationService {
  private logger: Logger;

  constructor(
    private readonly appConfigService: AppConfigService, 
    private readonly httpService: HttpService) {
      this.logger = new Logger();
      this.logger.log('TrestleService');
  }

  public endpoints = {
    mapQuestApi: `https://www.mapquestapi.com/geocoding/v1/address?key=${this.appConfigService.mapQuestKey}`,
    geocodeMapsApi: `https://geocode.maps.co/search?api_key=${this.appConfigService.geocodeMapsKey}`
  };

  public async mapQuestFetchCoordinates(body: any): Promise<AxiosResponse> {
    let data: any;
    try {
      const dataResponse = await this.httpService.post(this.endpoints.mapQuestApi, body).toPromise();
      data = dataResponse;
    } catch (e) {
      console.log(JSON.stringify(body));
    }

    if (data?.data?.results) {
      return data.data.results[0].locations[0].latLng;
    } 
  }

  public async geocodeMapsFetchCoordinates(address: string, postalCode: string, region: string): Promise<any> {
    const addressReplaced = address.replace(/  +/g, ' ').toLowerCase().split(' ').join('+');
    const fullAddress = `${addressReplaced}+${region}+New+York+NY+${postalCode}+US`;

    let data: any;
    try {
      const dataResponse = await this.httpService.get(`${this.endpoints.geocodeMapsApi}&q=${fullAddress}`).toPromise();
      data = dataResponse;
    } catch (e) {
      console.log(JSON.stringify(address));
      console.log(e.code);
    }

    if (!data || data?.data?.length === 0) return;

    if (data?.data?.length === 1) {
      return {
        latitude: data?.data[0].lat,
        longitude: data?.data[0].lon
      }
    } else {
      const dataBuilding = data?.data?.find((item: any) => item.class === 'building' || item.type === 'house');
      if (!dataBuilding) return;
      return {
        latitude: dataBuilding.lat,
        longitude: dataBuilding.lon
      }
    }
  }
}
