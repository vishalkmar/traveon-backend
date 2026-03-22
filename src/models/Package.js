"use strict";

module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    "Package",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // =========================
      // ROOT LEVEL API FIELDS
      // =========================
      gtxPkgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      packRangeType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gtxPkgSourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quadPrice: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      agencyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      displayIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      shortJsonInfo: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      packageSearchString: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "packageSearchString",
      },
      destinations: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      destinationIds: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countries: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countryIds: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      minPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      maxPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      minPax: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pkgValidFrom: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pkgValidTo: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bookingValidUntil: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isMarkForDel: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // =========================
      // PACKAGE OBJECT FIELDS
      // longJsonInfo.package.*
      // =========================
      tpId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isCF: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isSharingPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isFixPriceCalculate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imgHeader: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isFixedDeparturePackage: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      isBusRoutePackage: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      imgThumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bookingValidUntill: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      advBookingDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      advBookingPercent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      priceRange: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      markUpOnGTXNetworkPackage: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      agencyIdB2C: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      agencyIdB2B: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      destinationPlaces: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      destinationPlacesSysId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sourcePlaces: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sourcePlaceSysId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      agencyName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tagLine1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tagLine2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      allowMinPax: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      groupSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Source object
      source: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "package.Source object",
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sourceValue: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Type object
      packageTypeObject: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "package.Type object",
      },
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      typeValue: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Supplier object
      supplier: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "package.Supplier object",
      },
      supplierId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplierName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // PackageSpec object
      packageSpec: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "package.PackageSpec object",
      },
      packageSpecification: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      packageSpecificationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      inclusionsText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      packageType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Validity object
      validity: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      validFrom: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      validTo: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      // =========================
      // NESTED / COMPLEX JSON
      // =========================
      cities: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "package.Cities object",
      },
      discountCode: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      transfers: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      otherServices: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      itineraries: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      citiesBySequence: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      tourTypes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      terms: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      packTypeMask: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      inclMask: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      discountType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      discountVal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      cancellationRules: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      buspickupLocation: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      transferData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      allowBookingType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fixedInventory: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      fixedInventoryCountry: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      bookingvalidityDay: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      eventarray: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      flightData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      busData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      busRouteData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      addonServices: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      packageTax: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      visaDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      visaServiceProviderDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // =========================
      // EXTRACTED DISPLAY / HELPER FIELDS
      // =========================
      destination: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Terms extracted text helpers
      refundPolicy: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bookingTerms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancellationPolicy: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      exclusions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      inclusion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      travelBasics: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      whyUseUs: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Original API payload storage
      longJsonInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Complete original API response JSON",
      },
    },
    {
      tableName: "packages",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["gtxPkgId"],
        },
        {
          fields: ["agencyId"],
        },
        {
          fields: ["destinationPlacesSysId"],
        },
        {
          fields: ["sourcePlaceSysId"],
        },
        {
          fields: ["isFeatured"],
        },
        {
          fields: ["isActive"],
        },
        {
          fields: ["isPublished"],
        },
        {
          fields: ["validFrom"],
        },
        {
          fields: ["validTo"],
        },
        {
          fields: ["bookingValidUntil"],
        },
      ],
    }
  );

  return Package;
};