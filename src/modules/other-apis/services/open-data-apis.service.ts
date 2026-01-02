import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from '../../../config/app/config.service';
import { AxiosResponse } from 'axios';
import * as facilities from '../constants/Facilities.const';
import { ILocation } from '../../../shared/interfaces/location.interface';
import { UtilityService } from '../../../providers/utility.service';
import { OpenDataRepository } from '../repositories/openData.repository';
import { OpenData } from '../entities/OpenData.entity';
import { MailService } from '../../../shared/mail/mail.service';
import { UserRepository } from '../../users/repositories/users.repository';
import { UserRoleRepository } from '../../users/repositories/userRole.repository';
import { Role } from '../../users/types/Role.enum';
import * as fs from 'fs';

@Injectable()
export class OpenDataApisService {
  private pointOfInteresUrl;
  private subwayStationsUrl;
  private cityBikeUrl;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    private readonly utilityService: UtilityService,
    private readonly openDataRepository: OpenDataRepository,
    private readonly mailService: MailService,
  ) {

  }

  public async get(urlWithQueryString: string): Promise<any> {
    return await this.httpService
      .get(urlWithQueryString, {
        headers: {
          'X-App-Token': this.appConfigService.dataCityOfNewYorkAppToken,
        },
      })
      .toPromise();
  }

  public async getPointOfInterest(position: ILocation): Promise<any> {
    let distance = 1000;
    let result = { data: [] };
    let returnData;
    await this.openDataRepository.findOne({ where: { id: 1 } }).then(data => {
      this.pointOfInteresUrl = data.url + data.queryString;
    })
    try {
      while (result.data.length === 0 && distance < 4000) {
        var queryString = `?$where=within_circle(the_geom, ${position['latitude']}, ${position['longitude']}, ${distance})`;
        result = await this.get(this.pointOfInteresUrl + queryString);
        distance += 1000;
      }
    } catch (e) {
      console.log('-------------------url error pointOfInteresUrl-------------------');
      console.log(this.pointOfInteresUrl);
      console.log('-------------------error-------------------');
      console.log(e.errno);
      const supportEmails = (await this.getAgentsSupport()).map(agent => agent['u_email']);
      this.mailService.alertMail(`
      Failed to fatch data from ${this.pointOfInteresUrl}.
      Please visit https://data.cityofnewyork.us/City-Government/Points-Of-Interest/rxuy-2muj . 
      Under Export menu select SODA API and select last part after resource/ in 'API Endpoint:' input. Ex; tkph-xgkf.json
      `, supportEmails)
    } finally {
      if (!result) {
        return {};
      }
      const data = result['data'];
      const facilityType = data.reduce(
        (p, c) => (
          p[c.facility_type] ? p[c.facility_type].push(c) : (p[c.facility_type] = [c]), p
        ),
        {}
      );
      const newData = Object.keys(facilityType).map((k) => {
        return {
          facilitiesTypes: facilities.FacilityTypes[k],
          pointOfInterest: facilityType[k]
            .map((facility) => {
              return {
                type: facilities[facilities.FacilityTypes[k]][
                  facility.faci_dom
                ],
                name: facility.name,
                location: {
                  latitude: facility.the_geom.coordinates[1],
                  longitude: facility.the_geom.coordinates[0],
                },
                distance: this.utilityService.calculateDistance(position, {
                  latitude: facility.the_geom.coordinates[1],
                  longitude: facility.the_geom.coordinates[0],
                }),
                markerType: 'marker'
              };
            })
            .sort((a, b) => a.distance - b.distance),
        };
      });
      returnData = newData;
    }

    return returnData;
  }

  public async getSubwayStation(position: ILocation): Promise<any> {
    return;
    await this.openDataRepository.findOne({ where: { id: 2 } }).then(data => {
      this.subwayStationsUrl = data.url + data.queryString;
    })
    let distance = 500;
    let result = { data: [] };
    let returnData;

    try {
      while (result.data.length === 0 && distance < 3000) {
        var queryString = `?$where=within_circle(the_geom, ${position['latitude']}, ${position['longitude']}, ${distance})`;
        result = await this.get(this.subwayStationsUrl + queryString);
        distance += 500;
      }

    } catch (e) {
      console.log('-------------------url error subwayStationsUrl-------------------');
      console.log(this.subwayStationsUrl);
      console.log('-------------------error-------------------');
      console.log(e.errno);
      const supportEmails = (await this.getAgentsSupport()).map(agent => agent['u_email']);
      this.mailService.alertMail(`
      Failed to fatch data from ${this.subwayStationsUrl}.
      Please visit https://data.cityofnewyork.us/Transportation/Subway-Stations/arq3-7z49 . 
      Under Export menu select SODA API and select last part after resource/ in 'API Endpoint:' input:. Ex; tkph-xgkf.json
      `, supportEmails)
    } finally {
      if (!result) {
        return [];
      }
      const newData = result['data']
        .map((subway) => {
          return {
            lines: subway.line,
            name: subway.name,
            notes: subway.notes,
            location: {
              latitude: subway.the_geom.coordinates[1],
              longitude: subway.the_geom.coordinates[0],
            },
            distance: this.utilityService.calculateDistance(position, {
              latitude: subway.the_geom.coordinates[1],
              longitude: subway.the_geom.coordinates[0],
            }),
            markerType: 'marker'
          };
        })
        .sort((a, b) => a.distance - b.distance);
      returnData = newData;
    }

    return returnData;
  }

  public async getCityBike(position: ILocation): Promise<any> {
    await this.openDataRepository.findOne({ where: { id: 3 } }).then(data => {
      this.cityBikeUrl = data.url + data.queryString;
    })

    let distance = 500;
    let result = { data: [] };
    let returnData;

    try {
      while (result.data.length === 0 && distance < 3000) {
        var queryString = `?$where=within_circle(the_geom, ${position['latitude']}, ${position['longitude']}, ${distance})`;
        result = await this.get(this.cityBikeUrl + queryString);
        distance += 500
      }
    } catch (e) {
      console.log('-------------------url error cityBikeUrl-------------------');
      console.log(this.cityBikeUrl);
      console.log('-------------------error-------------------');
      console.log(e.errno);
      const supportEmails = (await this.getAgentsSupport()).map(agent => agent['u_email']);

      this.mailService.alertMail(`
      Failed to fatch data from ${this.cityBikeUrl}.
      Please visit https://data.cityofnewyork.us/Transportation/Bicycle-Routes/7vsa-caz7 . 
      Under Export menu select SODA API and select last part after resource/ in 'API Endpoint:' input:. Ex; tkph-xgkf.json
      `, supportEmails)
    } finally {
      if (!result) {
        return [];
      }
      const newData = result['data']
        .map((segment) => {
          let coordinates = [];
          if (segment.the_geom.type === 'LineString') {
            coordinates = segment.the_geom.coordinates.map((coordinate: any) => ({ latitude: coordinate[1], longitude: coordinate[0] }))
          } else {
            coordinates = segment.the_geom.coordinates.reduce((acc, line) => {

              for (let coordinate of line) {
                acc.push({ latitude: coordinate[1], longitude: coordinate[0] })
              }

              return acc;
            }, [])
          }
          return {
            name: segment.street ? segment.street : segment.name,
            notes: segment.fromstreet ? `From Street ${segment.fromstreet} to Street ${segment.tostreet
              }. Bike direction: ${segment.bikedir == 'R' ? 'right' : 'left'}` : '',
            location: {
              latitude: coordinates[0].latitude,
              longitude: coordinates[0].longitude,
            },
            coordinates: [...coordinates],
            distance: this.utilityService.calculateDistance(position, {
              latitude: coordinates[0].latitude,
              longitude: coordinates[0].longitude,
            }),
            markerType: 'marker'
          };
        })
        .sort((a, b) => a.distance - b.distance);
      returnData = newData;
    }

    return returnData;
  }

  public async createUpdateOpenData(openData: OpenData) {
    let openDataEntity = new OpenData();

    openDataEntity.id = openData.id;
    openDataEntity.name = openData.name;
    openDataEntity.url = openData.url;
    openDataEntity.queryString = openData.queryString;

    return await openDataEntity.save();
  }

  public async updateAsAdmin(openData: OpenData) {
    let openDataEntity = new OpenData();

    openDataEntity.id = openData.id;
    openDataEntity.queryString = openData.queryString;

    return await openDataEntity.save();
  }

  public async getAll(): Promise<OpenData[]> {
    return await this.openDataRepository.find();
  }

  public async getOne(id: number): Promise<OpenData> {
    return await this.openDataRepository.findOne({ where: { id: id } });
  }

  public async getNews(): Promise<any> {
    const news = JSON.parse(fs.readFileSync('./assets/news.json', 'utf8'));
    return news;
  }

  private async getAgentsSupport() {
    const agentRole = await this.userRoleRepository.findOne({ where: { name: Role.SUPPORT } });
    const users = await this.userRepository.createQueryBuilder('u').innerJoin('users_roles', 'ur', `u.id = ur.usersId`)
      .where(`ur.userRoleId = :roleId`, { roleId: agentRole.id })
      .execute();

    return users;
  }
}
