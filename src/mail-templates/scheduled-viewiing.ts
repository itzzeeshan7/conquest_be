import { ListingEntity } from "../modules/listings/entities/Listing.entity";
import { PropertyEntity } from "../modules/listings/entities/Property.entity";
import { ScheduledViewingDto } from "../modules/users/dto/ScheduledViewing.dto";

export const scheduledViewingTemplate = (scheduledViewing: ScheduledViewingDto, property: PropertyEntity): string => {
    let buildingApartment = '';
    if (scheduledViewing.building_key) {
        if (property.BuildingKey) {
            buildingApartment = `Building : ${property.BuildingName ? property.BuildingName : property.UnparsedAddress}`
        }
    } else {
        buildingApartment = `Apartment : ${property.AddressWithUnit}`
    }
    return `Your request to schedule an appointment has been made, an agent will contact you shortly to confirm.
    Request for: ${buildingApartment} on ${scheduledViewing.scheduledDate}`
}