import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { MainEntity } from "../../../shared/database/Base.entity";

@Entity()
export class OpenHouseEntity extends MainEntity {

    @PrimaryColumn()
    OpenHouseId: string;

    @Column({nullable: true})
    AppointmentRequiredYN: boolean;

    @Column({nullable: true})
    HumanModifiedYN: boolean;

    @Column({nullable: true})
    ListAgentKey: string;

    @Column({nullable: true})
    @Index('OPEN_HOUSE_LISTING_ID_INDEX')
    ListingId: string;
    
    @Column({nullable: true})
    @Index('OPEN_HOUSE_LISTING_KEY_INDEX')
    ListingKey: string;
    
    @Column({nullable: true})
    ListingKeyNumeric: number;
    
    @Column({nullable: true})
    ListOfficeKey: string;
    
    @Column({nullable: true})
    ListOfficeMlsId: string;
    
    @Column({nullable: true, type: 'date' })
    ModificationTimestamp: Date;

    @Column({nullable: true})
    OpenHouseAttendedBy: string;
    
    @Column({nullable: true, type: 'date' })
    OpenHouseDate: Date;
    
    @Column({nullable: true, type: 'date' })
    OpenHouseEndTime: Date;
    
    @Column({nullable: true})
    OpenHouseKey: string;
    
    @Column({nullable: true})
    OpenHouseKeyNumeric: number;
    
    @Column({nullable: true})
    OpenHouseLiveStreamURL: string;
    
    @Column({nullable: true})
    OpenHouseRemarks: string;
    
    @Column({nullable: true, type: 'date' })
    OpenHouseStartTime: Date;
    
    @Column({nullable: true})
    OpenHouseStatus: string;
    
    @Column({nullable: true})
    OpenHouseType: string;
    
    @Column({nullable: true, type: 'date' })
    OriginalEntryTimestamp: Date;
    
    @Column({nullable: true})
    OriginatingSystemID: string;
    
    @Column({nullable: true})
    OriginatingSystemKey: string;
    
    @Column({nullable: true})
    OriginatingSystemName: string;
    
    @Column({nullable: true})
    OriginatingSystemSubName: string;
    
    @Column({nullable: true})
    Permission: string;
    
    @Column({nullable: true})
    PermissionPrivate: string;
    
    @Column({nullable: true})
    Refreshments: string;
        
    @Column({nullable: true})
    ShowingAgentFirstName: string;
    
    @Column({nullable: true})
    ShowingAgentKey: string;
    
    @Column({nullable: true})
    ShowingAgentKeyNumeric: number;
    
    @Column({nullable: true})
    ShowingAgentLastName: string;
    
    @Column({nullable: true})
    ShowingAgentMlsID: string;
    
    @Column({nullable: true})
    SourceSystemID: string;
    
    @Column({nullable: true})
    SourceSystemKey: string;
    
    @Column({nullable: true})
    SourceSystemName: string;    
}