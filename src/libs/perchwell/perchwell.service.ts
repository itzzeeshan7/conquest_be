import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from '../../config/app/config.service';
import { AxiosResponse } from 'axios';
import * as xml2js from 'xml2js';
const baseUrl = 'http://rets.perchwell.com:6103';
import { UtilityService } from '../../providers/utility.service';

const endpoints = {
  login: baseUrl + '/login',
  search: baseUrl + '/search',
};

@Injectable()
export class PerchwellService {
  private logger: Logger;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    private readonly utilityService: UtilityService
  ) {
    this.logger = new Logger('PerchwellService');
  }

  private async request(url: string, query: Object): Promise<AxiosResponse> {
    return await this.httpService
      .request({
        url: url,
        auth: {
          username: this.appConfigService.perchwellUsername,
          password: this.appConfigService.perchwellPassword,
        },
        responseType: 'text',
        params: { ...query },
      })
      .toPromise();
  }

  public async search(query: string): Promise<Object> {
    const result = await this.request(endpoints.search, {
      SearchType: 'Listing',
      Query: `(State=NY)`, //query, //`(UpdatedAt=${format(new Date(), 'yyyy-MM-dd')}+)`,
      Class: 'Listing',
      Format: 'JSON',
      Offset: 0,
      Limit: 100,
    });

    const parsed = await xml2js.parseStringPromise(result.data);
    const data = JSON.parse(parsed.RETS._);
    // console.log(data);
    return data;
  }

  public async fetchDataFromPerchwell(
    query: string,
    offset: number
  ): Promise<Object[]> {

    const columnNames = await this.utilityService.getColumnsNames();

    const result = await this.request(endpoints.search, {
      SearchType: 'Listing',
      Query: query === '' ? `(City=*New*,*Brooklyn*)` : query, //query, //`(UpdatedAt=${format(new Date(), 'yyyy-MM-dd')}+)`,
      Class: 'Listing',
      Format: 'STANDARD-XML', //,'JSON'
      Offset: offset,
      Limit: 1500,
    });

    // const parsed = await xml2js.parseStringPromise(result.data);
    // let data;
    // try {
    //   data = JSON.parse(parsed.RETS._);
    // } catch (err) { }
    // finally {
    //   if (!data) {
    //     data = []
    //   }
    // }

    const parsed = await xml2js.parseStringPromise(result.data);
    let data;
    try {
      data = parsed.RETS.Listing;
      let newData = [];
      for (let app of data) {
        newData.push(this.utilityService.mapXMLtoJSON(columnNames, app));
      }
      data = newData;
    } catch (err) { }
    finally {
      if (!data) {
        data = []
      }
    }

    return data;

    // const parsed = await xml2js.parseStringPromise(result.data);
    // let data;
    // try {
    //   data = parsed.RETS.Listing;
    //   let newData = [];
    //   for (let app of data) {      
    //     newData.push(this.utilityService.mapXMLtoJSON(app));
    //   }
    // } catch (err) { }
    // finally {
    //   if (!data) {
    //     data = []
    //   }
    // }
  }

  // public async getApartmentData(id: any): Promise<any> {
  //   const result = await this.httpService
  //     .get('https://www.perchwell.com/api/v5/listings/' + id, {
  //       headers: {
  //         Accept: 'application/json, text/javascript, */*; q=0.01',
  //         'Accept-Encoding': 'gzip, deflate, br',
  //         'Accept-Language':
  //           'en-GB,en;q=0.9,en-US;q=0.8,mk;q=0.7,sr;q=0.6,bs;q=0.5,hr;q=0.4,bg;q=0.3',
  //         Connection: 'keep-alive',
  //         Cookie:
  //           '_ga=GA1.2.1149625325.1624997038; mdn_anonymous_id=0c08a185-432e-49ae-86d8-f1ca247738dd; _gid=GA1.2.171637628.1626205696; _hp2_ses_props.1931208104=%7B%22ts%22%3A1626207830959%2C%22d%22%3A%22www.perchwell.com%22%2C%22h%22%3A%22%2Fresults%22%2C%22g%22%3A%22%23__%22%7D; _hp2_id.1931208104=%7B%22userId%22%3A%22530577178191420%22%2C%22pageviewId%22%3A%22281445892097313%22%2C%22sessionId%22%3A%226928828313865179%22%2C%22identity%22%3A%2221880%22%2C%22trackerVersion%22%3A%224.0%22%2C%22identityField%22%3Anull%2C%22isIdentified%22%3A1%7D; intercom-session-trq7czv5=OFI5SUtPREV0WENKUmlreFJneDZtaDVwenJZdUJSSTNpcG5iOGxUNnRpcktYdEhvQnplM3QzcTVMT2F0SlZyeC0tK3VnUTZJZjA3ZGxqMjJxOEl5cUIwZz09--e4a84113c66e1e961d73cff2bc9e2673a59d6cd7; _babylon_session=YzBZWHMyMGw1Y2Q2RzY3SWIxQncwbURwRmxWUFpyb21DWVFDbXV1Uk1DMHdKaVlyN1ZaMmpLR01oSk8vdXpPOWZJa05kYkJyNURwVGxWN0NQY0xrd1IwY25UZVIyMTVDZitqcnYxajJBQVNSaHh2QUh1TkMrTUdxWi9PR0gvbEFaQWs5d3hnTGZ4YzBIU1JmQmkrWExRQ3FibklVVGo1T2NvcWR3UmdMc0lQQzBkVlRiYnFNcGdhalcrZHJ3Tm1qdis0UDlPZXZhUTgvOVEvbmFhVUtRallBNzFmTHk2Z3c0M3hhL1ZTVk12SUZWblgybm1RYkVqL21Lam1kaTJtUjR5OU8xekpuRHN0dGljblluV1hoMEpvb2ZHZWFEUjJ0ZDdMMjc1c0s2L2MrUjVodENzNnJMV0FTQ3hnQlBzdkN1S1JmVGZ4VUJtMVdSWTkreG4wMUJhWUkzbVNLZHZoUTErMEo4b1IwZXh1S3hCa3RJYlBXdFNYR1RxejRaSU1FWlFnQ3Bodmh6SHViOFZmOGZlNGo1dz09LS1FODhuMDFMaG16VHFvczJwS25Id2hnPT0%3D--3604813e9ad7609e3eb01c82fcdf563d20a184c4',
  //         'If-None-Match': 'W/"a108bd6bcd64d5032ade25778827fd92"',
  //         Referer: 'https://www.perchwell.com/results',
  //         'sec-ch-u':
  //           'Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
  //         'Sec-Fetch-Dest': 'empty',
  //         'Sec-Fetch-Mode': 'cors',
  //         'Sec-Fetch-Site': 'same-origin',
  //         'User-Agent':
  //           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  //         'X-CSRF-Token':
  //           'Qlgk45EJryVekSHPW7vGX+GfOn3cXrZiVE6yQjzDMbmHp1Nc8ac21JKxb032FcDWBBA8NxYInfrJw8t0Qeh/Dw==',
  //         'X-Requested-With': 'XMLHttpRequest',
  //       },
  //     })
  //     .toPromise();
  //   return result.data;
  // }

  // public async getBuildingData(id: any): Promise<any> {
  //   const result = await this.httpService
  //     .get('https://www.perchwell.com/api/v5/buildings/' + id, {
  //       headers: {
  //         Accept: 'application/json, text/javascript, */*; q=0.01',
  //         'Accept-Encoding': 'gzip, deflate, br',
  //         'Accept-Language':
  //           'en-GB,en;q=0.9,en-US;q=0.8,mk;q=0.7,sr;q=0.6,bs;q=0.5,hr;q=0.4,bg;q=0.3',
  //         Connection: 'keep-alive',
  //         Cookie:
  //           '_ga=GA1.2.1149625325.1624997038; mdn_anonymous_id=0c08a185-432e-49ae-86d8-f1ca247738dd; _gid=GA1.2.171637628.1626205696; _hp2_ses_props.1931208104=%7B%22ts%22%3A1626207830959%2C%22d%22%3A%22www.perchwell.com%22%2C%22h%22%3A%22%2Fresults%22%2C%22g%22%3A%22%23__%22%7D; _hp2_id.1931208104=%7B%22userId%22%3A%22530577178191420%22%2C%22pageviewId%22%3A%22281445892097313%22%2C%22sessionId%22%3A%226928828313865179%22%2C%22identity%22%3A%2221880%22%2C%22trackerVersion%22%3A%224.0%22%2C%22identityField%22%3Anull%2C%22isIdentified%22%3A1%7D; intercom-session-trq7czv5=OFI5SUtPREV0WENKUmlreFJneDZtaDVwenJZdUJSSTNpcG5iOGxUNnRpcktYdEhvQnplM3QzcTVMT2F0SlZyeC0tK3VnUTZJZjA3ZGxqMjJxOEl5cUIwZz09--e4a84113c66e1e961d73cff2bc9e2673a59d6cd7; _babylon_session=YzBZWHMyMGw1Y2Q2RzY3SWIxQncwbURwRmxWUFpyb21DWVFDbXV1Uk1DMHdKaVlyN1ZaMmpLR01oSk8vdXpPOWZJa05kYkJyNURwVGxWN0NQY0xrd1IwY25UZVIyMTVDZitqcnYxajJBQVNSaHh2QUh1TkMrTUdxWi9PR0gvbEFaQWs5d3hnTGZ4YzBIU1JmQmkrWExRQ3FibklVVGo1T2NvcWR3UmdMc0lQQzBkVlRiYnFNcGdhalcrZHJ3Tm1qdis0UDlPZXZhUTgvOVEvbmFhVUtRallBNzFmTHk2Z3c0M3hhL1ZTVk12SUZWblgybm1RYkVqL21Lam1kaTJtUjR5OU8xekpuRHN0dGljblluV1hoMEpvb2ZHZWFEUjJ0ZDdMMjc1c0s2L2MrUjVodENzNnJMV0FTQ3hnQlBzdkN1S1JmVGZ4VUJtMVdSWTkreG4wMUJhWUkzbVNLZHZoUTErMEo4b1IwZXh1S3hCa3RJYlBXdFNYR1RxejRaSU1FWlFnQ3Bodmh6SHViOFZmOGZlNGo1dz09LS1FODhuMDFMaG16VHFvczJwS25Id2hnPT0%3D--3604813e9ad7609e3eb01c82fcdf563d20a184c4',
  //         'If-None-Match': 'W/"a108bd6bcd64d5032ade25778827fd92"',
  //         Referer: 'https://www.perchwell.com/results',
  //         'sec-ch-u':
  //           'Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
  //         'Sec-Fetch-Dest': 'empty',
  //         'Sec-Fetch-Mode': 'cors',
  //         'Sec-Fetch-Site': 'same-origin',
  //         'User-Agent':
  //           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  //         'X-CSRF-Token':
  //           'Qlgk45EJryVekSHPW7vGX+GfOn3cXrZiVE6yQjzDMbmHp1Nc8ac21JKxb032FcDWBBA8NxYInfrJw8t0Qeh/Dw==',
  //         'X-Requested-With': 'XMLHttpRequest',
  //       },
  //     })
  //     .toPromise();
  //   return result.data;
  // }
}
