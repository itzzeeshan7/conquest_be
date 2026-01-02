import { Injectable } from "@nestjs/common";
import { UserRoleRepository } from "../repositories/userRole.repository";
import { UserRole } from "../entities/UserRole.entity";
import { Role } from "../types/Role.enum";

@Injectable()
export class UserRolesService {
    constructor(
        private readonly userRoleRepository: UserRoleRepository
    ) {
    }

    public async getDefaultUserRole(): Promise<UserRole> {
        const defaultRole = await this.userRoleRepository.findOne({ where: { name: Role.USER } });
        if (defaultRole) {
            return defaultRole;
        } else {
            return await this.addDefaultUserRole();
        }
    }

    private async addDefaultUserRole(): Promise<UserRole> {
        const role = new UserRole();
        role.name = Role.USER;
        return await this.userRoleRepository.addRole(role);
    }

    public async getAdminUserRole(): Promise<UserRole> {
        const adminRole = await this.userRoleRepository.findOne({ where: { name: Role.ADMIN } });
        if (adminRole) {
            return adminRole;
        } else {
            return await this.addRole(Role.ADMIN);
        }
    }

    public async addRole(name: Role): Promise<UserRole> {
        const role = await this.userRoleRepository.findOne({ where: { name } });
        if (role) {
            return role;
        } else {
            const role = new UserRole();
            role.name = name;
            return await this.userRoleRepository.addRole(role);
        }
    }

    public async getAll(): Promise<UserRole[]> {
        return await this.userRoleRepository.find();
    }

    public async getUserRole(name: Role): Promise<UserRole> {
        return await this.userRoleRepository.findOne({ where: { name } });
    }
}