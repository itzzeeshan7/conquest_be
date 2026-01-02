import { BadRequestException, Injectable } from "@nestjs/common";
import { ERRORS_CONSTANTS } from "../../../shared/constants/errors.constants";
import { SuccessResponseDto } from "../../../shared/dto/SuccessResponse.dto";
import { MailService } from "../../../shared/mail/mail.service";
import { RedisServiceAdapter } from "../../../shared/redis-adapter/redis-adapter.service";
import { ListingEntity } from "../../listings/entities/Listing.entity";
import { ListingsService } from "../../listings/services/listings.service";
import { CancelScheduledViewingDto } from "../dto/CancelScheduledViewing.dto";
import { ScheduledViewingDto } from "../dto/ScheduledViewing.dto";
import { ScheduledViewing } from "../entities/ScheduledViewing.entity";
import { Users } from "../entities/Users.entity";
import { ScheduledViewingRepository } from "../repositories/scheduledViewing.repository";
import { PropertiesService } from "../../listings/services/properties.service";
import { PropertyEntity } from "../../listings/entities/Property.entity";

@Injectable()

export class ScheduledViewingService {
    constructor(
        private scheduledViewingRepository: ScheduledViewingRepository,
        private readonly redisServiceAdapter: RedisServiceAdapter,
        private readonly mailService: MailService,
        // private readonly listingService: ListingsService
        private readonly propertyService: PropertiesService
    ) { }

    public async sendAndSaveScheduledViewing(user: Users, scheduledViewingDto: ScheduledViewingDto, agents: Users[]): Promise<SuccessResponseDto> {
        let scheduledViewing: ScheduledViewing = new ScheduledViewing();
        const { code, listing_key, building_key } = scheduledViewingDto;
        const id = await this.redisServiceAdapter.get(code);

        let listing = null

        if (id) {
            scheduledViewing = await this.fetchScheduleViewing({user, listing_key, building_key});
            if (listing_key) {
                listing = await this.propertyService.findOne({ ListingKey: listing_key });
                if (listing) {
                    if (!scheduledViewing) {
                        scheduledViewing = new ScheduledViewing();
                        scheduledViewing.listing_key = listing_key;
                    } else {
                        scheduledViewing.building_id = null;
                    }
                } else {
                    throw new BadRequestException([ERRORS_CONSTANTS.SCHEDULED_VIEWING.LISTING_ID_NOT_FOUND]);
                }
            } else if (building_key) {
                listing = await this.propertyService.findOne({ BuildingKey: building_key });
                if (listing) {
                    if (!scheduledViewing) {
                        scheduledViewing = new ScheduledViewing();
                        scheduledViewing.property_building_key = building_key;
                    } else {
                        scheduledViewing.apartment_id = null;
                    }
                } else {
                    throw new BadRequestException([ERRORS_CONSTANTS.SCHEDULED_VIEWING.LISTING_ID_NOT_FOUND]);
                }
            }
            else {
                throw new BadRequestException([ERRORS_CONSTANTS.SCHEDULED_VIEWING.LISTING_ID_MISSING]);
            }
            await this.redisServiceAdapter.delete(code);

            scheduledViewing.message = scheduledViewingDto.message;
            scheduledViewing.scheduled_date = scheduledViewingDto.scheduledDate
            scheduledViewing.user_id = user.id;
            scheduledViewing.canceled = false;
            await this.scheduledViewingRepository.createUpdate(scheduledViewing);
            await this.mailService.scheduledViewing(scheduledViewingDto, 'Schedule Viewing', user, listing, agents);
        } else {
            throw new BadRequestException(
                [ERRORS_CONSTANTS.CONTACT_US.CANNOT_SENT_MESSAGE]
            );
        }

        return new SuccessResponseDto({ message: true });
    }

    public async cancelScheduledViewing(user: Users, scheduledViewingDto: CancelScheduledViewingDto, agents: Users[]): Promise<SuccessResponseDto> {
        let scheduledViewing: ScheduledViewing = new ScheduledViewing();
        let property: PropertyEntity = new PropertyEntity();
        const { code, listing_key, building_key } = scheduledViewingDto;
        const id = await this.redisServiceAdapter.get(code);

        if (id) {
            scheduledViewing = await this.fetchScheduleViewing({user, listing_key, building_key});
            if (scheduledViewing) {
                scheduledViewing.canceled = true;
                await this.scheduledViewingRepository.createUpdate(scheduledViewing);
                let scheduledViewingDto = new ScheduledViewingDto();
                scheduledViewingDto.listing_key = scheduledViewing.listing_key;
                scheduledViewingDto.building_key = scheduledViewing.property_building_key;
                scheduledViewingDto.scheduledDate = scheduledViewing.scheduled_date;
                if (scheduledViewingDto.listing_key) {
                    property = await this.propertyService.findOne({ ListingKey: listing_key });
                } else {
                    property = await this.propertyService.findOne({ BuildingKey: building_key });
                }
                await this.mailService.scheduledViewing(scheduledViewingDto, 'Cancel Schedule Viewing', user, property, agents);
            } else {
                throw new BadRequestException([ERRORS_CONSTANTS.SCHEDULED_VIEWING.LISTING_ID_NOT_FOUND]);
            }

        } else {
            throw new BadRequestException(
                [ERRORS_CONSTANTS.CONTACT_US.CANNOT_SENT_MESSAGE]
            );
        }

        return new SuccessResponseDto({ message: true });
    }

    private async fetchScheduleViewing({ user, listing_key, building_key }) {
        const scheduledViewing = await this.scheduledViewingRepository.createQueryBuilder()
            .where('user_id = :userId and (listing_key = :listing_key or property_building_key = :building_key)', { userId: user.id, listing_key, building_key })
            .getOne();
        return scheduledViewing;
    }

}