import Joi from "joi";

const jsonObject = Joi.object().unknown(true);
const jsonArray = Joi.array().items(Joi.any());

export const createPackageSchema = Joi.object({
  // =========================
  // ROOT LEVEL API FIELDS
  // =========================
  gtxPkgId: Joi.number().required(),
  packRangeType: Joi.number().optional().allow(null),
  gtxPkgSourceId: Joi.number().optional().allow(null),
  quadPrice: Joi.boolean().optional().allow(null),
  agencyId: Joi.number().optional().allow(null),
  isFeatured: Joi.boolean().optional().default(false),
  displayIndex: Joi.number().optional().allow(null),
  shortJsonInfo: Joi.object().optional().allow(null),

  packageSearchString: Joi.string().optional().allow(null, ""),
  destinations: Joi.string().optional().allow(null, ""),
  destinationIds: Joi.string().optional().allow(null, ""),
  countries: Joi.string().optional().allow(null, ""),
  countryIds: Joi.string().optional().allow(null, ""),

  minPrice: Joi.alternatives()
    .try(Joi.number(), Joi.string(), Joi.boolean())
    .optional()
    .allow(null),
  maxPrice: Joi.alternatives()
    .try(Joi.number(), Joi.string(), Joi.boolean())
    .optional()
    .allow(null),

  nights: Joi.number().optional().allow(null),
  minPax: Joi.number().min(1).optional().allow(null),
  pkgValidFrom: Joi.date().optional().allow(null),
  pkgValidTo: Joi.date().optional().allow(null),
  bookingValidUntil: Joi.date().optional().allow(null),

  isPublished: Joi.boolean().optional().default(false),
  isActive: Joi.boolean().optional().default(true),
  isMarkForDel: Joi.boolean().optional().default(false),

  // =========================
  // PACKAGE OBJECT FIELDS
  // =========================
  tpId: Joi.number().optional().allow(null),
  isCF: Joi.number().optional().allow(null),
  url: Joi.string().optional().allow(null, ""),
  isSharingPrice: Joi.number().optional().allow(null),
  isFixPriceCalculate: Joi.string().optional().allow(null, ""),
  imgHeader: Joi.string().optional().allow(null, ""),
  isFixedDeparturePackage: Joi.boolean().optional().allow(null),
  isBusRoutePackage: Joi.boolean().optional().allow(null),
  imgThumbnail: Joi.string().optional().allow(null, ""),
  bookingValidUntill: Joi.date().optional().allow(null),
  advBookingDays: Joi.number().optional().allow(null),
  details: Joi.string().optional().allow(null, ""),
  advBookingPercent: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),
  priceRange: Joi.string().optional().allow(null, ""),
  markUpOnGTXNetworkPackage: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),

  agencyIdB2C: Joi.number().optional().allow(null),
  agencyIdB2B: Joi.number().optional().allow(null),

  destinationPlaces: Joi.string().optional().allow(null, ""),
  destinationPlacesSysId: Joi.number().optional().allow(null),
  sourcePlaces: Joi.string().optional().allow(null, ""),
  sourcePlaceSysId: Joi.number().optional().allow(null),

  agencyName: Joi.string().optional().allow(null, ""),
  name: Joi.string().required(),
  tagLine1: Joi.string().optional().allow(null, ""),
  tagLine2: Joi.string().optional().allow(null, ""),

  allowMinPax: Joi.number().optional().allow(null),
  groupSize: Joi.number().optional().allow(null),

  // =========================
  // EXTRACTED OBJECT FIELDS
  // =========================
  source: jsonObject.optional().allow(null),
  sourceId: Joi.number().optional().allow(null),
  sourceValue: Joi.string().optional().allow(null, ""),

  packageTypeObject: jsonObject.optional().allow(null),
  typeId: Joi.number().optional().allow(null),
  typeValue: Joi.string().optional().allow(null, ""),

  supplier: jsonObject.optional().allow(null),
  supplierId: Joi.string().optional().allow(null, ""),
  supplierName: Joi.string().optional().allow(null, ""),

  packageSpec: jsonObject.optional().allow(null),
  packageSpecification: Joi.string().optional().allow(null, ""),
  packageSpecificationId: Joi.number().optional().allow(null),

  inclusionsText: Joi.string().optional().allow(null, ""),
  packageType: Joi.string().optional().allow(null, ""),

  validity: jsonObject.optional().allow(null),
  validFrom: Joi.date().optional().allow(null),
  validTo: Joi.date().optional().allow(null),

  // =========================
  // COMPLEX JSON FIELDS
  // =========================
  cities: jsonObject.optional().allow(null),
  discountCode: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  transfers: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  otherServices: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  itineraries: jsonObject.optional().allow(null),
  citiesBySequence: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  tourTypes: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  terms: jsonObject.optional().allow(null),

  packTypeMask: Joi.number().optional().allow(null),
  inclMask: Joi.alternatives().try(jsonObject, jsonArray, Joi.string(), Joi.number()).optional().allow(null),
  discountType: Joi.number().optional().allow(null),
  discountVal: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),

  cancellationRules: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  buspickupLocation: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  transferData: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),

  allowBookingType: Joi.number().optional().allow(null),
  fixedInventory: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),
  fixedInventoryCountry: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),
  bookingvalidityDay: Joi.number().optional().allow(null),
  eventarray: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  flightData: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  busData: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  busRouteData: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  addonServices: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  packageTax: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  visaDetails: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),
  visaServiceProviderDetails: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),

  // =========================
  // HELPER / DISPLAY FIELDS
  // =========================
  destination: Joi.string().optional().allow(null, ""),
  country: Joi.string().optional().allow(null, ""),
  shortDescription: Joi.string().optional().allow(null, ""),

  refundPolicy: Joi.string().optional().allow(null, ""),
  bookingTerms: Joi.string().optional().allow(null, ""),
  cancellationPolicy: Joi.string().optional().allow(null, ""),
  conditions: Joi.string().optional().allow(null, ""),
  exclusions: Joi.string().optional().allow(null, ""),
  inclusion: Joi.string().optional().allow(null, ""),
  travelBasics: Joi.string().optional().allow(null, ""),
  whyUseUs: Joi.string().optional().allow(null, ""),

  longJsonInfo: jsonObject.optional().allow(null),
}).unknown(true);

export const updatePackageSchema = Joi.object({
  // =========================
  // ROOT LEVEL API FIELDS
  // =========================
  packRangeType: Joi.number().optional().allow(null),
  gtxPkgSourceId: Joi.number().optional().allow(null),
  quadPrice: Joi.boolean().optional().allow(null),
  agencyId: Joi.number().optional().allow(null),
  isFeatured: Joi.boolean().optional(),
  displayIndex: Joi.number().optional().allow(null),
  shortJsonInfo: Joi.object().optional().allow(null),

  packageSearchString: Joi.string().optional().allow(null, ""),
  destinations: Joi.string().optional().allow(null, ""),
  destinationIds: Joi.string().optional().allow(null, ""),
  countries: Joi.string().optional().allow(null, ""),
  countryIds: Joi.string().optional().allow(null, ""),

  minPrice: Joi.alternatives()
    .try(Joi.number(), Joi.string(), Joi.boolean())
    .optional()
    .allow(null),
  maxPrice: Joi.alternatives()
    .try(Joi.number(), Joi.string(), Joi.boolean())
    .optional()
    .allow(null),

  nights: Joi.number().optional().allow(null),
  minPax: Joi.number().min(1).optional().allow(null),
  pkgValidFrom: Joi.date().optional().allow(null),
  pkgValidTo: Joi.date().optional().allow(null),
  bookingValidUntil: Joi.date().optional().allow(null),

  isPublished: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  isMarkForDel: Joi.boolean().optional(),

  // =========================
  // PACKAGE OBJECT FIELDS
  // =========================
  tpId: Joi.number().optional().allow(null),
  isCF: Joi.number().optional().allow(null),
  url: Joi.string().optional().allow(null, ""),
  isSharingPrice: Joi.number().optional().allow(null),
  isFixPriceCalculate: Joi.string().optional().allow(null, ""),
  imgHeader: Joi.string().optional().allow(null, ""),
  isFixedDeparturePackage: Joi.boolean().optional().allow(null),
  isBusRoutePackage: Joi.boolean().optional().allow(null),
  imgThumbnail: Joi.string().optional().allow(null, ""),
  bookingValidUntill: Joi.date().optional().allow(null),
  advBookingDays: Joi.number().optional().allow(null),
  details: Joi.string().optional().allow(null, ""),
  advBookingPercent: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),
  priceRange: Joi.string().optional().allow(null, ""),
  markUpOnGTXNetworkPackage: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),

  agencyIdB2C: Joi.number().optional().allow(null),
  agencyIdB2B: Joi.number().optional().allow(null),

  destinationPlaces: Joi.string().optional().allow(null, ""),
  destinationPlacesSysId: Joi.number().optional().allow(null),
  sourcePlaces: Joi.string().optional().allow(null, ""),
  sourcePlaceSysId: Joi.number().optional().allow(null),

  agencyName: Joi.string().optional().allow(null, ""),
  name: Joi.string().optional(),
  tagLine1: Joi.string().optional().allow(null, ""),
  tagLine2: Joi.string().optional().allow(null, ""),

  allowMinPax: Joi.number().optional().allow(null),
  groupSize: Joi.number().optional().allow(null),

  // =========================
  // EXTRACTED OBJECT FIELDS
  // =========================
  source: jsonObject.optional().allow(null),
  sourceId: Joi.number().optional().allow(null),
  sourceValue: Joi.string().optional().allow(null, ""),

  packageTypeObject: jsonObject.optional().allow(null),
  typeId: Joi.number().optional().allow(null),
  typeValue: Joi.string().optional().allow(null, ""),

  supplier: jsonObject.optional().allow(null),
  supplierId: Joi.string().optional().allow(null, ""),
  supplierName: Joi.string().optional().allow(null, ""),

  packageSpec: jsonObject.optional().allow(null),
  packageSpecification: Joi.string().optional().allow(null, ""),
  packageSpecificationId: Joi.number().optional().allow(null),

  inclusionsText: Joi.string().optional().allow(null, ""),
  packageType: Joi.string().optional().allow(null, ""),

  validity: jsonObject.optional().allow(null),
  validFrom: Joi.date().optional().allow(null),
  validTo: Joi.date().optional().allow(null),

  // =========================
  // COMPLEX JSON FIELDS
  // =========================
  cities: jsonObject.optional().allow(null),
  discountCode: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  transfers: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  otherServices: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  itineraries: jsonObject.optional().allow(null),
  citiesBySequence: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  tourTypes: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  terms: jsonObject.optional().allow(null),

  packTypeMask: Joi.number().optional().allow(null),
  inclMask: Joi.alternatives().try(jsonObject, jsonArray, Joi.string(), Joi.number()).optional().allow(null),
  discountType: Joi.number().optional().allow(null),
  discountVal: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),

  cancellationRules: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  buspickupLocation: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  transferData: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),

  allowBookingType: Joi.number().optional().allow(null),
  fixedInventory: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),
  fixedInventoryCountry: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),
  bookingvalidityDay: Joi.number().optional().allow(null),
  eventarray: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  flightData: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  busData: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  busRouteData: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  addonServices: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  packageTax: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),
  visaDetails: Joi.alternatives().try(jsonObject, jsonArray).optional().allow(null),
  visaServiceProviderDetails: Joi.alternatives().try(jsonArray, jsonObject).optional().allow(null),

  // =========================
  // HELPER / DISPLAY FIELDS
  // =========================
  destination: Joi.string().optional().allow(null, ""),
  country: Joi.string().optional().allow(null, ""),
  shortDescription: Joi.string().optional().allow(null, ""),

  refundPolicy: Joi.string().optional().allow(null, ""),
  bookingTerms: Joi.string().optional().allow(null, ""),
  cancellationPolicy: Joi.string().optional().allow(null, ""),
  conditions: Joi.string().optional().allow(null, ""),
  exclusions: Joi.string().optional().allow(null, ""),
  inclusion: Joi.string().optional().allow(null, ""),
  travelBasics: Joi.string().optional().allow(null, ""),
  whyUseUs: Joi.string().optional().allow(null, ""),

  longJsonInfo: jsonObject.optional().allow(null),
}).unknown(true);