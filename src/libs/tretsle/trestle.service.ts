import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from '../../config/app/config.service';
import { AxiosResponse } from 'axios';
import { format } from "date-fns";
import { UtilityService } from '../../providers/utility.service';

const baseUrl = 'https://api-trestle.corelogic.com';

@Injectable()
export class TrestleService {
  private logger: Logger;

  constructor(private readonly appConfigService: AppConfigService, private readonly httpService: HttpService, private readonly utilityService: UtilityService) {
    this.logger = new Logger();
    this.logger.log('TrestleService');
  }

  private formatDate = (date: Date) => `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm')}Z`

  public endpoints = {
    token: '/trestle/oidc/connect/token',
    pagination: `/trestle/odata/Property?$top=200&$expand=Media($select=MediaURL,MediaCategory)&$select=${this.utilityService.getPopulatedColumns().join(',')}`,
    openHousePagination: '/trestle/odata/OpenHouse?$top=1000',
    media: '/trestle/odata/Media?$top=10',
    // replication:
    //   '/trestle/odata/Property?$select=ListingKey,StandardStatus,ListPrice,PriceChangeTimestamp,StatusChangeTimestamp,ContractStatusChangeDate&replication=true',
    metadata: '/trestle/odata/$metadata',
    filterByModificationTimestamp: (date: Date): string => `/trestle/odata/Property?$filter=${encodeURI(`ModificationTimestamp ge ${this.formatDate(date)}`)}&$top=200&$expand=Media($select=MediaURL,MediaCategory)&$select=${this.utilityService.getPopulatedColumns().join(',')}`,
    customFilter: (filterType: string, filterValue: string): string => `/trestle/odata/Property?$filter=${encodeURI(`${filterType} eq '${filterValue}'`)}&$top=200&$expand=Media($select=MediaURL,MediaCategory)`,
    reconciliation: '/trestle/odata/Property?$select=ListingKey&$top=100000'
    // filterByPriceChangeTimestamp: (date: Date): string => `/trestle/odata/Property?$filter=${encodeURI(`ModificationTimestamp ge ${this.formatDate(date)}`)}&$top=1000`,
    // filterByContractStatusChangeDate: (date: Date): string => `/trestle/odata/Property?$filter=${encodeURI(`ContractStatusChangeDate ge ${this.formatDate(date)}`)}&$top=1000`,
    // filterByStatusChangeTimestamp: (date: Date): string => `/trestle/odata/Property?$filter=${encodeURI(`StatusChangeTimestamp ge ${this.formatDate(date)}`)}&$top=1000`,
  };

  private async fetch(url: string, options: any): Promise<AxiosResponse> {
    try {
      const response = await this.httpService.get(url, options).toPromise();
      return response;
    } catch (e) {
      throw e;
    }

  }

  private async authenticate(): Promise<string> {
    const params = new URLSearchParams();
    params.append('client_id', this.appConfigService.trestleClientId);
    params.append('client_secret', this.appConfigService.trestleSecreteKey);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'api');

    let token;

    try {
      const tokenResp = await this.httpService.post(baseUrl + this.endpoints.token, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true
      }).toPromise();
      token = tokenResp.data;
    } catch (e) {
      throw e;
    }


    return token.access_token;
  }

  public async fetchListingMedia(req: any) {
    let { url, token, endpoint } = req || {}
    if (!token) {
      token = await this.authenticate();
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const options = {
      headers,
      method: 'POST',
    };

    if (!url) {
      url = baseUrl + endpoint;
    }

    const response = await this.fetch(url, options);

    return { ...response.data, token };
  }

  public async fetchReconciliationData(req?: any) {
    let {token, data, url} = req || {};
    data = data || [];

    let res: any;

    if (!url) {
      res = await this.fetchListingMedia({ token, endpoint: this.endpoints.reconciliation });
    } else {
      res = await this.fetchListingMedia({ token, url });
    }

    data.push(...res.value.map((item: any) => item.ListingKey));
    if (res['@odata.nextLink']) {
      await this.fetchReconciliationData({ token: data.token, data, url: res['@odata.nextLink'] });
    }

    return data;
  }
}
