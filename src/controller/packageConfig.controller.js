import db from "../models/index.js";
import { Op } from "sequelize";

const { Package, PackageConfig } = db;

const packageHasCountryId = (pkg, countryId) => {
  const cid = String(countryId).trim();
  if (!cid) return true;
  const ids = String(pkg.countryIds ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(cid);
};

// Admin list: all packages from `packages` merged with optional `package_configs` (toggle state)
export const getAllPackagesConfig = async (req, res) => {
  try {
    const { countryId, status, searchString } = req.query;
    const where = {};

    if (searchString && String(searchString).trim()) {
      const term = String(searchString).trim();
      const or = [{ name: { [Op.like]: `%${term}%` } }];
      const num = Number(term);
      if (!Number.isNaN(num) && term !== "") {
        or.push({ gtxPkgId: num });
      }
      where[Op.or] = or;
    }

    const packages = await Package.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 500,
    });

    let rows = packages;
    if (countryId) {
      rows = rows.filter((p) => packageHasCountryId(p, countryId));
    }

    const gtxIds = rows.map((p) => p.gtxPkgId);
    const configs = gtxIds.length
      ? await PackageConfig.findAll({
          where: { gtxPkgId: { [Op.in]: gtxIds } },
        })
      : [];
    const byGtx = new Map(configs.map((c) => [c.gtxPkgId, c]));

    let merged = rows.map((pkg) => {
      const c = byGtx.get(pkg.gtxPkgId);
      const isEnabled = c ? Boolean(c.isEnabled) : true;
      const isTopSelling = c ? Boolean(c.isTopSelling) : false;
      const flowString = c?.flowString || null;
      return {
        id: c?.id ?? null,
        packageId: pkg.id,
        packageName: pkg.name,
        gtxPkgId: pkg.gtxPkgId,
        minPrice: pkg.minPrice,
        maxPrice: pkg.maxPrice,
        createdAt: c?.createdAt ?? pkg.createdAt,
        isEnabled,
        isTopSelling,
        flowString,
      };
    });

    if (status === "true" || status === "false") {
      const wantEnabled = status === "true";
      merged = merged.filter((m) => m.isEnabled === wantEnabled);
    }

    res.status(200).json({
      success: true,
      data: merged,
    });
  } catch (error) {
    console.error("Error fetching package configs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch package configurations",
      error: error.message,
    });
  }
};

// Distinct countries from stored packages (`countryIds` + `countries` CSVs)
export const getCountriesFromPackages = async (req, res) => {
  try {
    const packages = await Package.findAll({
      attributes: ["countryIds", "countries"],
      where: {
        [Op.or]: [
          { countryIds: { [Op.ne]: null } },
          { countries: { [Op.ne]: null } },
        ],
      },
      raw: true,
    });

    const countries = new Map();
    packages.forEach((pkg) => {
      const ids = String(pkg.countryIds || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const names = String(pkg.countries || "")
        .split(",")
        .map((s) => s.trim());
      ids.forEach((id, idx) => {
        if (!countries.has(id)) {
          countries.set(id, names[idx] || id);
        }
      });
    });

    const countryList = Array.from(countries.entries())
      .map(([id, name]) => ({
        id,
        name: String(name).trim() || id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      data: countryList,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch countries",
      error: error.message,
    });
  }
};

// Toggle package enable/disable status
export const togglePackageStatus = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;
    const gid = Number(gtxPkgId);
    if (Number.isNaN(gid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GTX package ID",
      });
    }
    const { isEnabled } = req.body;

    // Validate input
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isEnabled must be a boolean"
      });
    }

    // Find or create package config
    let config = await PackageConfig.findOne({
      where: { gtxPkgId: gid },
    });

    if (!config) {
      // If config doesn't exist, create it first
      const pkg = await Package.findOne({
        where: { gtxPkgId: gid },
      });

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }

      config = await PackageConfig.create({
        packageId: pkg.id,
        gtxPkgId: gid,
        packageName: pkg.name,
        countriesId: pkg.countryIds ?? null,
        minPrice: pkg.minPrice,
        maxPrice: pkg.maxPrice,
        isEnabled,
      });
    } else {
      // Update existing config
      config.isEnabled = isEnabled;
      config.disabledAt = !isEnabled ? new Date() : null;
      config.enabledAt = isEnabled ? new Date() : null;
      await config.save();
    }

    res.status(200).json({
      success: true,
      message: `Package ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: config
    });
  } catch (error) {
    console.error("Error toggling package status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle package status",
      error: error.message
    });
  }
};

// Check if package is enabled
export const isPackageEnabled = async (gtxPkgId) => {
  try {
    const gid = Number(gtxPkgId);
    if (Number.isNaN(gid)) return true;
    const config = await PackageConfig.findOne({
      where: { gtxPkgId: gid },
      attributes: ["isEnabled"],
    });

    // If no config exists, package is enabled by default
    return !config || config.isEnabled;
  } catch (error) {
    console.error("Error checking package status:", error);
    return true; // Default to enabled if error
  }
};

// Packages that are enabled for public (no row in package_configs, or is_enabled = true)
export const getEnabledPackages = async (req, res) => {
  try {
    const { countryId } = req.query;

    const packages = await Package.findAll({
      order: [["createdAt", "DESC"]],
      limit: 500,
    });

    let rows = countryId
      ? packages.filter((p) => packageHasCountryId(p, countryId))
      : packages;

    const gtxIds = rows.map((p) => p.gtxPkgId);
    const disabled = gtxIds.length
      ? await PackageConfig.findAll({
          where: { gtxPkgId: { [Op.in]: gtxIds }, isEnabled: false },
          attributes: ["gtxPkgId"],
        })
      : [];
    const disabledSet = new Set(disabled.map((d) => d.gtxPkgId));
    rows = rows.filter((p) => !disabledSet.has(p.gtxPkgId));

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching enabled packages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enabled packages",
      error: error.message,
    });
  }
};

// Get package config details
export const getPackageConfigDetails = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;
    const gid = Number(gtxPkgId);
    if (Number.isNaN(gid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GTX package ID",
      });
    }

    const config = await PackageConfig.findOne({
      where: { gtxPkgId: gid },
      include: [{
        model: Package,
        attributes: ['id', 'name', 'gtxPkgId', 'minPrice', 'maxPrice', 'isPublished', 'destinations', 'countries']
      }]
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Package configuration not found"
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error("Error fetching package config details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch package configuration details",
      error: error.message
    });
  }
};

// Bulk update package status
export const bulkUpdatePackageStatus = async (req, res) => {
  try {
    const { packages } = req.body; // Array of { gtxPkgId, isEnabled }

    if (!Array.isArray(packages)) {
      return res.status(400).json({
        success: false,
        message: "packages must be an array"
      });
    }

    const results = [];

    for (const pkg of packages) {
      try {
        let config = await PackageConfig.findOne({
          where: { gtxPkgId: pkg.gtxPkgId }
        });

        if (!config) {
          const dbPkg = await Package.findOne({
            where: { gtxPkgId: pkg.gtxPkgId }
          });
          if (dbPkg) {
            config = await PackageConfig.create({
              packageId: dbPkg.id,
              gtxPkgId: pkg.gtxPkgId,
              packageName: dbPkg.name,
              countriesId: dbPkg.countryIds ?? null,
              minPrice: dbPkg.minPrice,
              maxPrice: dbPkg.maxPrice,
              isEnabled: pkg.isEnabled,
            });
          }
        } else {
          config.isEnabled = pkg.isEnabled;
          config.disabledAt = !pkg.isEnabled ? new Date() : null;
          config.enabledAt = pkg.isEnabled ? new Date() : null;
          await config.save();
        }

        results.push({
          gtxPkgId: pkg.gtxPkgId,
          success: true,
          data: config
        });
      } catch (err) {
        results.push({
          gtxPkgId: pkg.gtxPkgId,
          success: false,
          error: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      data: results
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Bulk update failed",
      error: error.message
    });
  }
};

// Toggle top-selling flag for a package
export const toggleTopSelling = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;
    const gid = Number(gtxPkgId);
    if (Number.isNaN(gid)) {
      return res.status(400).json({ success: false, message: "Invalid GTX package ID" });
    }
    const { isTopSelling } = req.body;
    if (typeof isTopSelling !== "boolean") {
      return res.status(400).json({ success: false, message: "isTopSelling must be a boolean" });
    }

    let config = await PackageConfig.findOne({ where: { gtxPkgId: gid } });

    if (!config) {
      const pkg = await Package.findOne({ where: { gtxPkgId: gid } });
      if (!pkg) {
        return res.status(404).json({ success: false, message: "Package not found" });
      }
      config = await PackageConfig.create({
        packageId: pkg.id,
        gtxPkgId: gid,
        packageName: pkg.name,
        countriesId: pkg.countryIds ?? null,
        minPrice: pkg.minPrice,
        maxPrice: pkg.maxPrice,
        isEnabled: true,
        isTopSelling,
      });
    } else {
      config.isTopSelling = isTopSelling;
      await config.save();
    }

    res.status(200).json({
      success: true,
      message: `Package ${isTopSelling ? "marked as" : "removed from"} top selling`,
      data: config,
    });
  } catch (error) {
    console.error("Error toggling top selling:", error);
    res.status(500).json({ success: false, message: "Failed to toggle top selling", error: error.message });
  }
};

// Get top-selling packages (public endpoint — returns gtxPkgIds that are top selling)
export const getTopSellingGtxIds = async (req, res) => {
  try {
    const topConfigs = await PackageConfig.findAll({
      where: { isTopSelling: true },
      attributes: ["gtxPkgId"],
    });
    const ids = topConfigs.map((c) => c.gtxPkgId);
    res.status(200).json({ success: true, data: ids });
  } catch (error) {
    console.error("Error fetching top selling ids:", error);
    res.status(500).json({ success: false, message: "Failed to fetch top selling packages", error: error.message });
  }
};

// Public: get custom flow string for a package (used by Book Now button)
export const getPackageFlowString = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;
    const gid = Number(gtxPkgId);
    if (Number.isNaN(gid)) {
      return res.status(400).json({ success: false, message: "Invalid GTX package ID" });
    }
    const config = await PackageConfig.findOne({
      where: { gtxPkgId: gid },
      attributes: ["flowString"],
    });
    res.status(200).json({ success: true, flowString: config?.flowString || null });
  } catch (error) {
    console.error("Error fetching package flow string:", error);
    res.status(500).json({ success: false, message: "Failed to fetch flow string", error: error.message });
  }
};

// Admin: set / update / clear flow string for a package
export const updateFlowString = async (req, res) => {
  try {
    const { gtxPkgId } = req.params;
    const gid = Number(gtxPkgId);
    if (Number.isNaN(gid)) {
      return res.status(400).json({ success: false, message: "Invalid GTX package ID" });
    }
    const { flowString } = req.body; // null or empty string = clear

    let config = await PackageConfig.findOne({ where: { gtxPkgId: gid } });

    if (!config) {
      const pkg = await Package.findOne({ where: { gtxPkgId: gid } });
      if (!pkg) {
        return res.status(404).json({ success: false, message: "Package not found" });
      }
      config = await PackageConfig.create({
        packageId: pkg.id,
        gtxPkgId: gid,
        packageName: pkg.name,
        countriesId: pkg.countryIds ?? null,
        minPrice: pkg.minPrice,
        maxPrice: pkg.maxPrice,
        isEnabled: true,
        flowString: flowString || null,
      });
    } else {
      config.flowString = flowString || null;
      await config.save();
    }

    res.status(200).json({
      success: true,
      message: flowString ? "Flow string updated" : "Flow string cleared",
      data: { flowString: config.flowString },
    });
  } catch (error) {
    console.error("Error updating flow string:", error);
    res.status(500).json({ success: false, message: "Failed to update flow string", error: error.message });
  }
};

export default {
  getAllPackagesConfig,
  getCountriesFromPackages,
  togglePackageStatus,
  toggleTopSelling,
  getTopSellingGtxIds,
  getPackageFlowString,
  updateFlowString,
  isPackageEnabled,
  getEnabledPackages,
  getPackageConfigDetails,
  bulkUpdatePackageStatus
};
