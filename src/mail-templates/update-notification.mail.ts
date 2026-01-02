import { ListingEntity } from "../modules/listings/entities/Listing.entity";
import { UserDto } from "../modules/users/dto/User.dto";

export const updateNotificationTemplate = (userInfo: any, listings: Array<any>): string => {

  let listingHtml = '';

  for (const listing of listings) {
    let status = '';
    switch (listing.status_code) {
      case 100:
        status = 'Active'
        break;
      case 200:
        status = 'Accepted Offer'
        break;
      case 240:
        status = 'Under Contract'
        break;
      case 300:
        status = 'Expired'
        break;
      case 400:
        status = 'Rented'
        break;
      case 500:
        status = 'Sold'
        break;
      case 600:
        status = 'Permanently Off-Market'
        break;
      case 640:
        status = 'Temporarily Off-Market'
        break;
    }
    listingHtml += ` 
  <a href="https://www.conquest.nyc/apartment?id=${listing.id}" style="color:inherit;font-size:inherit;text-decoration:none" target="_blank">
                      <div>
                        <table style="width:100%;font-family:&quot;Helvetica&quot;,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5em;padding:5px 0">
                          <tbody>
                            <tr style="height:20px">
                              <td style="width:225px;padding:0">
                                <a href="https://www.conquest.nyc/apartment?id=${listing.id}" style="color:inherit;font-size:inherit;text-decoration:none" target="_blank" style="max-width:207px;max-height:200px;border-radius:8px;margin:5px 0" class="CToWUd">
                                  <img alt="Listing Image" src="${listing.img}" style="max-width:207px;max-height:200px;border-radius:8px;margin:5px 0" class="CToWUd">
                                </a>
                              </td>
                              <td style="padding:0">
                                <table cellspacing="-5" style="width:100%">
                                  <tbody>
                                    <tr style="height:20px;font-size:18px;font-weight:bold;color:black">
                                      <td align="left" style="padding:0">
                                        <a href="https://www.conquest.nyc/apartment?id=${listing.id}" style="color:inherit;font-size:inherit;text-decoration:none" target="_blank">
                                          ${listing.address_with_unit}
                                        </a>
                                      </td>
                                    </tr>
                                    <tr style="height:20px">
                                      <td style="color:#888888;padding:0">${listing.property_type}</td>
                                    </tr>
                                    <tr style="height:20px">
                                      <td style="padding:0">$${listing.listing_price.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                      <td>
                                      Listing Status: ${listing.sale_or_rental === 'R' ? 'Rental' : 'Sales'}
                                      </td>
                                    </tr>
                                    <tr style="height:20px">
                                      <td style="padding:0">Status: ${status}</td>
                                    </tr>
                                    <tr style="height:20px">
                                      <td style="padding:0">
                                        ${listing.beds ? `<span style="margin-right:10px">${listing.beds} beds</span>` : ''}
                                        ${listing.baths ? `<span style="margin-right:10px">${listing.baths} baths</span>` : ''}
                                        ${listing.listing_price_per_sqft && listing.sqft
                                        ? `<span style="margin-right:10px">${listing.sqft.toLocaleString()} ft<sup>2</sup> ($${listing.listing_price_per_sqft.toLocaleString()}/ft<sup>2</sup>)</span>` : ''}
                                        
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
    </div>
</a>
              
                    <br>
                    `;
  }

  let mailTemplate = `<table bgcolor="#ffffff" style="width:100%;padding:10px">
    <tbody>
      <tr>
        <td bgcolor="#FFFFFF" style="border-bottom-width:1px;border-bottom-color:#1b181c;border-bottom-style:solid;clear:both!important;display:block!important;max-width:600px!important;margin:0 auto;padding:20px">
          <div style="display:block;max-width:600px;margin:0 auto">
            <table style="width:100%">
              <tbody>
                <tr>
                  <td>
  
                    <p style="font-family:&quot;Helvetica&quot;,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6em;font-weight:normal;margin:0 0 15px;padding:0">
                    Hi ${userInfo.username},</p>
                    <p style="font-family:&quot;Helvetica&quot;,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6em;font-weight:normal;margin:0 0 10px;padding:0">
                    There has been ${listings.length} ${listings.length === 1 ? 'update' : 'updates'} in your savings </p>`;

  mailTemplate += listingHtml;


  mailTemplate += `   </td>
    </tr>
  </tbody>
</table>
</div>
</td>
</tr>
</tbody>
</table>
`


  return mailTemplate;
}