/**
 * Defines the shape of the data that can be sent in a PUT request
 * to update a center's profile. All properties are optional.
 */
export type TUpdateCenterPayload = {
  centerName?: string;
  phone?: string;
  address?: string;
  geoLocation?: {
    lat?: number;
    lng?: number;
  };
  web?: string;
  imageUrl?: string;
};
