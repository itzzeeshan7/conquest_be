import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { OpenData } from "./modules/other-apis/entities/OpenData.entity";
import { OpenDataApisService } from "./modules/other-apis/services/open-data-apis.service";
import { UserDto } from "./modules/users/dto/User.dto";
import { UserRolesService } from "./modules/users/services/userRoles.service";
import { UsersService } from "./modules/users/services/users.service";
import { Role } from "./modules/users/types/Role.enum";


@Injectable()
export class AppService implements OnApplicationBootstrap {
    constructor(
        private readonly usersService: UsersService,
        private readonly userRolesService: UserRolesService,
        private readonly openDataService: OpenDataApisService
    ) { }

    async onApplicationBootstrap() {

        const adminRole = await this.userRolesService.getAdminUserRole();
        const agentRole = await this.userRolesService.addRole(Role.AGENT);
        const supportRole = await this.userRolesService.addRole(Role.SUPPORT);

        let users: UserDto[] = [{
            email: 'cvetanovski.martin@gmail.com',
            name: 'Martin Cvetanovski',
            password: 'asdasdasd',
            roles: [adminRole, supportRole]
        }, {
            email: 'jg@conquest.nyc',
            name: 'Jaf Glazer',
            password: 'asdasdasd',
            roles: [adminRole, agentRole]
        }];

        await Promise.all(users.map(async (user) => {
            const existUser = await this.usersService.getByEmail(user.email);
            if (!existUser) {
                await this.usersService.create(user);
            }
        }));

        const openData = [
            {
                id: 1,
                name: 'pointOfInteres',
                url: 'https://data.cityofnewyork.us/resource/',
                queryString: 't95h-5fsr.json'
            },
            {
                id: 2,
                name: 'subwayStations',
                url: 'https://data.cityofnewyork.us/resource/',
                queryString: 'kk4q-3rt2.json'
            },
            {
                id: 3,
                name: 'cityBike',
                url: 'https://data.cityofnewyork.us/resource/',
                queryString: 'cc5c-sm6z.json'
            },
            {
                id: 3,
                name: 'subWayLines',
                url: 'https://data.cityofnewyork.us/resource/',
                queryString: 's7zz-qmyz.json'
            }
        ] as OpenData[]

        openData.forEach(async data => {
            await this.openDataService.createUpdateOpenData(data);
        })
    }
}