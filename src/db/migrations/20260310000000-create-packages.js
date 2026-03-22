"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("packages", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },

      // =========================
      // ROOT LEVEL API FIELDS
      // =========================
      gtxPkgId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      packRangeType: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      gtxPkgSourceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      quadPrice: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      agencyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      displayIndex: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      shortJsonInfo: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      packageSearchString: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      destinations: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      destinationIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      countries: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      countryIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      minPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      maxPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      nights: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      minPax: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pkgValidFrom: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      pkgValidTo: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      bookingValidUntil: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isMarkForDel: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // =========================
      // PACKAGE OBJECT FIELDS
      // =========================
      tpId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isCF: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isSharingPrice: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isFixPriceCalculate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      imgHeader: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isFixedDeparturePackage: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      isBusRoutePackage: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      imgThumbnail: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bookingValidUntill: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      advBookingDays: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      advBookingPercent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      priceRange: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      markUpOnGTXNetworkPackage: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      agencyIdB2C: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      agencyIdB2B: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      destinationPlaces: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      destinationPlacesSysId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sourcePlaces: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sourcePlaceSysId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      agencyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tagLine1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tagLine2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      allowMinPax: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      groupSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // =========================
      // OBJECT EXTRACTS
      // =========================
      source: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      sourceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sourceValue: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      packageTypeObject: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      typeValue: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      supplier: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      supplierId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      supplierName: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      packageSpec: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      packageSpecification: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      packageSpecificationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      inclusionsText: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      packageType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      validity: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      validFrom: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      validTo: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      // =========================
      // COMPLEX JSON FIELDS
      // =========================
      cities: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      discountCode: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      transfers: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      otherServices: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      itineraries: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      citiesBySequence: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      tourTypes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      terms: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      packTypeMask: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      inclMask: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      discountType: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      discountVal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      cancellationRules: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      buspickupLocation: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      transferData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      allowBookingType: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      fixedInventory: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      fixedInventoryCountry: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      bookingvalidityDay: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      eventarray: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      flightData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      busData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      busRouteData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      addonServices: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      packageTax: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      visaDetails: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      visaServiceProviderDetails: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      // =========================
      // HELPER / DISPLAY FIELDS
      // =========================
      destination: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refundPolicy: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bookingTerms: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancellationPolicy: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      exclusions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      inclusion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      travelBasics: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      whyUseUs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // =========================
      // ORIGINAL JSON
      // =========================
      longJsonInfo: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("packages", ["gtxPkgId"], {
      unique: true,
      name: "packages_gtxPkgId_unique",
    });

    await queryInterface.addIndex("packages", ["agencyId"], {
      name: "packages_agencyId_idx",
    });

    await queryInterface.addIndex("packages", ["destinationPlacesSysId"], {
      name: "packages_destinationPlacesSysId_idx",
    });

    await queryInterface.addIndex("packages", ["sourcePlaceSysId"], {
      name: "packages_sourcePlaceSysId_idx",
    });

    await queryInterface.addIndex("packages", ["isFeatured"], {
      name: "packages_isFeatured_idx",
    });

    await queryInterface.addIndex("packages", ["isActive"], {
      name: "packages_isActive_idx",
    });

    await queryInterface.addIndex("packages", ["isPublished"], {
      name: "packages_isPublished_idx",
    });

    await queryInterface.addIndex("packages", ["validFrom"], {
      name: "packages_validFrom_idx",
    });

    await queryInterface.addIndex("packages", ["validTo"], {
      name: "packages_validTo_idx",
    });

    await queryInterface.addIndex("packages", ["bookingValidUntil"], {
      name: "packages_bookingValidUntil_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("packages", "packages_bookingValidUntil_idx");
    await queryInterface.removeIndex("packages", "packages_validTo_idx");
    await queryInterface.removeIndex("packages", "packages_validFrom_idx");
    await queryInterface.removeIndex("packages", "packages_isPublished_idx");
    await queryInterface.removeIndex("packages", "packages_isActive_idx");
    await queryInterface.removeIndex("packages", "packages_isFeatured_idx");
    await queryInterface.removeIndex("packages", "packages_sourcePlaceSysId_idx");
    await queryInterface.removeIndex("packages", "packages_destinationPlacesSysId_idx");
    await queryInterface.removeIndex("packages", "packages_agencyId_idx");
    await queryInterface.removeIndex("packages", "packages_gtxPkgId_unique");

    await queryInterface.dropTable("packages");
  },
};