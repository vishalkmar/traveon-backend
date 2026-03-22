import db from "../models/index.js";
import {
  createPackageSchema,
  updatePackageSchema,
} from "../validation/package.validation.js";

const Package = db.Package;

const isNil = (value) => value === undefined || value === null;

const toNullIfEmpty = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

const toStringOrNull = (value) => {
  if (isNil(value)) return null;
  return String(value);
};

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === false ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }
  return Number(value);
};

const toBooleanOrDefault = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  return Boolean(value);
};

const toDateOrNull = (value) => {
  if (!value || value === false) return null;
  return value;
};

const toJsonOrNull = (value) => {
  if (value === undefined || value === null) return null;
  return value;
};

const extractTerms = (terms = {}) => ({
  refundPolicy: terms?.RefundPolicy || null,
  bookingTerms: terms?.BookingTerms || null,
  cancellationPolicy: terms?.CancellationPolicy || null,
  conditions: terms?.Conditions || null,
  exclusions: terms?.Exclusions || null,
  inclusion: terms?.Inclusion || null,
  travelBasics: terms?.TravelBasics || null,
  whyUseUs: terms?.WhyUseUs || null,
});

const mapPackageData = (data = {}) => {
  const pkg = data?.longJsonInfo?.package || {};

  const mapped = {
    // =========================
    // ROOT LEVEL
    // =========================
    gtxPkgId: toNumberOrNull(data.gtxPkgId),
    packRangeType: toNumberOrNull(data.packRangeType),
    gtxPkgSourceId: toNumberOrNull(data.gtxPkgSourceId),
    quadPrice: toBooleanOrDefault(data.quadPrice, false),
    agencyId: toNumberOrNull(data.agencyId),
    isFeatured: toBooleanOrDefault(data.isFeatured, false),
    displayIndex: toNumberOrNull(data.displayIndex),
    shortJsonInfo: toJsonOrNull(data.shortJsonInfo),

    packageSearchString: toNullIfEmpty(
      data.packageSearchString || data.PackageSearchSting
    ),
    destinations: toNullIfEmpty(data.destinations),
    destinationIds: toNullIfEmpty(data.destinationIds),
    countries: toNullIfEmpty(data.countries),
    countryIds: toNullIfEmpty(data.countryIds),

    minPrice:
      data.minPrice === false ? null : toNumberOrNull(data.minPrice),
    maxPrice:
      data.maxPrice === false ? null : toNumberOrNull(data.maxPrice),

    nights:
      data.nights === -1 || data.nights === false
        ? null
        : toNumberOrNull(data.nights),
    minPax: toNumberOrNull(data.minPax),
    pkgValidFrom: toDateOrNull(data.pkgValidFrom),
    pkgValidTo: toDateOrNull(data.pkgValidTo),
    bookingValidUntil: toDateOrNull(data.bookingValidUntil),

    isPublished: toBooleanOrDefault(data.isPublished, false),
    isActive: data.isActive ?? true,
    isMarkForDel: toBooleanOrDefault(
      data.isMarkForDel ?? data.isMarkForDelete,
      false
    ),

    // keep original
    longJsonInfo: toJsonOrNull(data.longJsonInfo),
  };

  if (pkg && Object.keys(pkg).length > 0) {
    // =========================
    // PACKAGE OBJECT FIELDS
    // =========================
    mapped.tpId = toNumberOrNull(pkg.TPId);
    mapped.isCF = toNumberOrNull(pkg.IsCF);
    mapped.url = toNullIfEmpty(pkg.URL);
    mapped.isSharingPrice = toNumberOrNull(pkg.IsSharingPrice);
    mapped.isFixPriceCalculate = toNullIfEmpty(pkg.IsFixPriceCalculate);
    mapped.imgHeader = toNullIfEmpty(pkg.ImgHeader);
    mapped.isFixedDeparturePackage = toBooleanOrDefault(
      pkg.IsFixedDeparturePackage,
      false
    );
    mapped.isBusRoutePackage = toBooleanOrDefault(
      pkg.IsBusRoutePackage,
      false
    );
    mapped.imgThumbnail = toNullIfEmpty(pkg.ImgThumbnail);
    mapped.bookingValidUntill = toDateOrNull(pkg.BookingValidUntill);
    mapped.advBookingDays = toNumberOrNull(pkg.AdvBookingDays);
    mapped.details = toNullIfEmpty(pkg.DETAILS);
    mapped.advBookingPercent = toNumberOrNull(pkg.AdvBookingPercent);
    mapped.priceRange = toNullIfEmpty(pkg.PriceRange);
    mapped.markUpOnGTXNetworkPackage = toNumberOrNull(
      pkg.MarkUpOnGTXNetworkPackage
    );

    mapped.agencyId = mapped.agencyId ?? toNumberOrNull(pkg.AgencyId);
    mapped.agencyIdB2C = toNumberOrNull(pkg.AgencyIdB2C);
    mapped.agencyIdB2B = toNumberOrNull(pkg.AgencyIdB2B);

    mapped.destinationPlaces = toNullIfEmpty(pkg.DestinationPlaces);
    mapped.destinationPlacesSysId = toNumberOrNull(pkg.DestinationPlacesSysId);
    mapped.sourcePlaces = toNullIfEmpty(pkg.SourcePlaces);
    mapped.sourcePlaceSysId = toNumberOrNull(pkg.SourcePlaceSysId);

    mapped.agencyName = toNullIfEmpty(pkg.AgencyName);
    mapped.name = toNullIfEmpty(pkg.Name) || toNullIfEmpty(data.name);
    mapped.tagLine1 = toNullIfEmpty(pkg.TagLine1);
    mapped.tagLine2 = toNullIfEmpty(pkg.TagLine2);

    mapped.allowMinPax = toNumberOrNull(pkg.AllowMinPax);
    mapped.groupSize = toNumberOrNull(pkg.GroupSize);

    // =========================
    // SOURCE / TYPE / SUPPLIER / SPEC
    // =========================
    mapped.source = toJsonOrNull(pkg.Source);
    mapped.sourceId = toNumberOrNull(pkg?.Source?.SourceId);
    mapped.sourceValue = toNullIfEmpty(pkg?.Source?.Value);

    mapped.packageTypeObject = toJsonOrNull(pkg.Type);
    mapped.typeId = toNumberOrNull(pkg?.Type?.TypeId);
    mapped.typeValue = toNullIfEmpty(pkg?.Type?.Value?.trim?.() || pkg?.Type?.Value);

    mapped.supplier = toJsonOrNull(pkg.Supplier);
    mapped.supplierId = toStringOrNull(pkg?.Supplier?.SupplierId);
    mapped.supplierName = toNullIfEmpty(pkg?.Supplier?.SupplierName);

    mapped.packageSpec = toJsonOrNull(pkg.PackageSpec);
    mapped.packageSpecification = toNullIfEmpty(
      pkg?.PackageSpec?.Specification
    );
    mapped.packageSpecificationId = toNumberOrNull(
      pkg?.PackageSpec?.SpecificationId
    );

    mapped.inclusionsText = toNullIfEmpty(pkg.Inclusions);
    mapped.packageType = toNullIfEmpty(pkg.PackageType);

    mapped.validity = toJsonOrNull(pkg.Validity);
    mapped.validFrom = toDateOrNull(pkg?.Validity?.From || data.pkgValidFrom);
    mapped.validTo = toDateOrNull(pkg?.Validity?.To || data.pkgValidTo);

    // =========================
    // COMPLEX JSON FIELDS
    // =========================
    mapped.cities = toJsonOrNull(pkg.Cities);
    mapped.discountCode = toJsonOrNull(pkg.DiscountCode);
    mapped.transfers = toJsonOrNull(pkg.Transfers);
    mapped.otherServices = toJsonOrNull(pkg.OtherServices);
    mapped.itineraries = toJsonOrNull(pkg.Itineraries);
    mapped.citiesBySequence = toJsonOrNull(pkg.CitiesBySequence);
    mapped.tourTypes = toJsonOrNull(pkg.TourTypes);
    mapped.terms = toJsonOrNull(pkg.Terms);

    mapped.packTypeMask = toNumberOrNull(pkg.PackTypeMask);
    mapped.inclMask = toJsonOrNull(pkg.InclMask);
    mapped.discountType = toNumberOrNull(pkg.DiscountType);
    mapped.discountVal = toNumberOrNull(pkg.DiscountVal);

    mapped.cancellationRules = toJsonOrNull(pkg.CancellationRules);
    mapped.buspickupLocation = toJsonOrNull(pkg.BuspickupLocation);
    mapped.transferData = toJsonOrNull(pkg.TransferData);

    mapped.allowBookingType = toNumberOrNull(pkg.AllowBookingType);
    mapped.fixedInventory = toJsonOrNull(pkg.fixedInventory);
    mapped.fixedInventoryCountry = toJsonOrNull(pkg.fixedInventoryCountry);
    mapped.bookingvalidityDay = toNumberOrNull(pkg.bookingvalidityDay);
    mapped.eventarray = toJsonOrNull(pkg.eventarray);
    mapped.flightData = toJsonOrNull(pkg.FlightData);
    mapped.busData = toJsonOrNull(pkg.BusData);
    mapped.busRouteData = toJsonOrNull(pkg.BusRouteData);
    mapped.addonServices = toJsonOrNull(pkg.AddonServices);
    mapped.packageTax = toJsonOrNull(pkg.PackageTax);
    mapped.visaDetails = toJsonOrNull(pkg.VisaDetails);
    mapped.visaServiceProviderDetails = toJsonOrNull(
      pkg.VisaServiceProviderDetails
    );

    // =========================
    // HELPER / DISPLAY FIELDS
    // =========================
    mapped.destination =
      toNullIfEmpty(data.destination) ||
      toNullIfEmpty(pkg.DestinationPlaces) ||
      toNullIfEmpty(data.destinations);

    mapped.country =
      toNullIfEmpty(data.country) || toNullIfEmpty(data.countries);

    mapped.shortDescription = toNullIfEmpty(data.shortDescription);

    const extractedTerms = extractTerms(pkg.Terms || {});
    mapped.refundPolicy = extractedTerms.refundPolicy;
    mapped.bookingTerms = extractedTerms.bookingTerms;
    mapped.cancellationPolicy = extractedTerms.cancellationPolicy;
    mapped.conditions = extractedTerms.conditions;
    mapped.exclusions = extractedTerms.exclusions;
    mapped.inclusion = extractedTerms.inclusion;
    mapped.travelBasics = extractedTerms.travelBasics;
    mapped.whyUseUs = extractedTerms.whyUseUs;
  }

  // direct fallback from request body
  if (!mapped.name) mapped.name = toNullIfEmpty(data.name);
  if (!mapped.destination) mapped.destination = toNullIfEmpty(data.destination);
  if (!mapped.country) mapped.country = toNullIfEmpty(data.country);
  if (!mapped.agencyName) mapped.agencyName = toNullIfEmpty(data.agencyName);
  if (!mapped.supplierName) mapped.supplierName = toNullIfEmpty(data.supplierName);
  if (!mapped.supplierId) mapped.supplierId = toStringOrNull(data.supplierId);

  return mapped;
};

// POST - Create new package
export const createPackage = async (req, res) => {
  try {
    const packageData = mapPackageData(req.body);

    const { error, value } = createPackageSchema.validate(packageData, {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages,
      });
    }

    const existingPackage = await Package.findOne({
      where: { gtxPkgId: value.gtxPkgId },
    });

    if (existingPackage) {
      return res.status(409).json({
        success: false,
        message: "Package with this GTX package ID already exists",
      });
    }

    const createdPackage = await Package.create(value);

    return res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: createdPackage,
    });
  } catch (error) {
    console.error("Create Package Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating package",
      error: error.message,
    });
  }
};

// GET - Get all packages
export const getAllPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      destination,
      country,
      isActive,
      featured,
      agencyId,
      gtxPkgId,
    } = req.query;

    const where = {};

    if (destination) where.destination = destination;
    if (country) where.country = country;
    if (agencyId) where.agencyId = agencyId;
    if (gtxPkgId) where.gtxPkgId = gtxPkgId;
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (featured !== undefined) where.isFeatured = featured === "true";

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Package.findAndCountAll({
      where,
      limit: limitNumber,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Packages retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(count / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get All Packages Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving packages",
      error: error.message,
    });
  }
};

// GET - Get package by UUID ID
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const packageData = await Package.findByPk(id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package retrieved successfully",
      data: packageData,
    });
  } catch (error) {
    console.error("Get Package by ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving package",
      error: error.message,
    });
  }
};

// GET - Get package by GTX package ID
export const getPackageByGtxPkgId = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;

    if (!gtxPkgId) {
      return res.status(400).json({
        success: false,
        message: "GTX Package ID is required",
      });
    }

    const packageData = await Package.findOne({
      where: { gtxPkgId: Number(gtxPkgId) },
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package retrieved successfully",
      data: packageData,
    });
  } catch (error) {
    console.error("Get Package by GTX ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving package",
      error: error.message,
    });
  }
};

// PUT - Update package by UUID ID
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPackage = await Package.findByPk(id);

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const mappedData = mapPackageData(req.body);

    const { error, value } = updatePackageSchema.validate(mappedData, {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages,
      });
    }

    // prevent accidental gtxPkgId conflict
    if (value.gtxPkgId && value.gtxPkgId !== existingPackage.gtxPkgId) {
      const anotherPackage = await Package.findOne({
        where: { gtxPkgId: value.gtxPkgId },
      });

      if (anotherPackage) {
        return res.status(409).json({
          success: false,
          message: "Another package with this GTX package ID already exists",
        });
      }
    }

    const updatedPackage = await existingPackage.update(value);

    return res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Update Package Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
};

// PUT - Update package by GTX package ID
export const updatePackageByGtxPkgId = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;

    const existingPackage = await Package.findOne({
      where: { gtxPkgId: Number(gtxPkgId) },
    });

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const mappedData = mapPackageData(req.body);

    const { error, value } = updatePackageSchema.validate(mappedData, {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages,
      });
    }

    if (value.gtxPkgId) {
      value.gtxPkgId = existingPackage.gtxPkgId;
    }

    const updatedPackage = await existingPackage.update(value);

    return res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Update Package by GTX ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
};

// DELETE - Delete package by UUID ID
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const packageData = await Package.findByPk(id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    await packageData.destroy();

    return res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Delete Package Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting package",
      error: error.message,
    });
  }
};

// DELETE - Delete package by GTX package ID
export const deletePackageByGtxPkgId = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;

    const packageData = await Package.findOne({
      where: { gtxPkgId: Number(gtxPkgId) },
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    await packageData.destroy();

    return res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Delete Package by GTX ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting package",
      error: error.message,
    });
  }
};

// UPSERT - Create or update by GTX package ID
export const upsertPackageByGtxPkgId = async (req, res) => {
  try {
    const mappedData = mapPackageData(req.body);

    if (!mappedData.gtxPkgId) {
      return res.status(400).json({
        success: false,
        message: "gtxPkgId is required",
      });
    }

    const existingPackage = await Package.findOne({
      where: { gtxPkgId: mappedData.gtxPkgId },
    });

    if (existingPackage) {
      const { error, value } = updatePackageSchema.validate(mappedData, {
        abortEarly: false,
        stripUnknown: false,
      });

      if (error) {
        const errorMessages = error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errorMessages,
        });
      }

      const updatedPackage = await existingPackage.update(value);

      return res.status(200).json({
        success: true,
        message: "Package updated successfully",
        data: updatedPackage,
      });
    }

    const { error, value } = createPackageSchema.validate(mappedData, {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages,
      });
    }

    const createdPackage = await Package.create(value);

    return res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: createdPackage,
    });
  } catch (error) {
    console.error("Upsert Package Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error upserting package",
      error: error.message,
    });
  }
};