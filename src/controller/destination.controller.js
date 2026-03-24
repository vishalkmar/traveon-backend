const { Destination, Blog } = require("../models");

// Create Destination
exports.createDestination = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Validate input
    if (!name || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and image are required",
      });
    }

    // Check if description has at least 10 words
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must have at least 10 words",
      });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    // Check if destination already exists
    const existingDestination = await Destination.findOne({
      where: { slug },
    });

    if (existingDestination) {
      return res.status(400).json({
        success: false,
        message: "Destination already exists",
      });
    }

    const destination = await Destination.create({
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: destination,
    });
  } catch (error) {
    console.error("Create Destination Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating destination",
    });
  }
};

// Get All Destinations
exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      include: [
        {
          model: Blog,
          as: "blogs",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error("Get Destinations Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching destinations",
    });
  }
};

// Get Single Destination with Blogs
exports.getDestinationWithBlogs = async (req, res) => {
  try {
    const { slug } = req.params;

    const destination = await Destination.findOne({
      where: { slug },
      include: [
        {
          model: Blog,
          as: "blogs",
        },
      ],
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error("Get Destination Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching destination",
    });
  }
};

// Update Destination
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    if (description) {
      const wordCount = description.trim().split(/\s+/).length;
      if (wordCount < 10) {
        return res.status(400).json({
          success: false,
          message: "Description must have at least 10 words",
        });
      }
    }

    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : destination.slug;

    await destination.update({
      name: name || destination.name,
      slug,
      description: description || destination.description,
      image: image || destination.image,
    });

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: destination,
    });
  } catch (error) {
    console.error("Update Destination Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating destination",
    });
  }
};

// Delete Destination
exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    await destination.destroy();

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.error("Delete Destination Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting destination",
    });
  }
};
