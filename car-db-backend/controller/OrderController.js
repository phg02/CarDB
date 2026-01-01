import Order from "../model/Order.js";
import User from "../model/User.js";
import CarPost from "../model/CarPost.js";

// ==================== CREATE ORDER ====================
/**
 * Create a new order (customer initiates order)
 * @route POST /api/orders/create
 */
export const createOrder = async (req, res) => {
  const { customer, firstName, lastName, email, phone, address, city, state, country, zipCode, items, notes } = req.body;

  if (!customer || !firstName || !lastName || !email || !address || !city || !country || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    // Validate customer exists
    const customerUser = await User.findById(customer);
    if (!customerUser) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Validate items and calculate total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const carPost = await CarPost.findById(item.carPost);
      if (!carPost) {
        return res.status(404).json({
          success: false,
          message: `Car post with ID ${item.carPost} not found`,
        });
      }

      const seller = await User.findById(item.seller);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: `Seller with ID ${item.seller} not found`,
        });
      }

      // Prevent customer from buying their own car
      if (customer.toString() === item.seller.toString()) {
        return res.status(400).json({
          success: false,
          message: "You cannot purchase your own listed car",
        });
      }

      const itemTotal = carPost.price * (item.quantity || 1);
      total += itemTotal;

      validatedItems.push({
        carPost: item.carPost,
        seller: item.seller,
        title: carPost.title || carPost.make,
        price: carPost.price,
        quantity: item.quantity || 1,
      });
    }

    // Create new order
    const newOrder = new Order({
      customer,
      firstName,
      lastName,
      email,
      phone: phone || "",
      address,
      city,
      state: state || "",
      country,
      zipCode: zipCode || "",
      items: validatedItems,
      total,
      notes: notes || "",
      orderStatus: "pending",
      paymentStatus: false,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: newOrder,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ==================== GET ORDER BY ID ====================
/**
 * Get order details by ID
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate("customer", "name email phone")
      .populate("items.carPost", "title make model year price images")
      .populate("items.seller", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Order has been deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: error.message,
    });
  }
};

// ==================== GET CUSTOMER ORDERS ====================
/**
 * Get all orders for a customer
 * @route GET /api/orders/customer
 * SECURITY: Uses authenticated user ID from JWT token instead of route parameter
 */
export const getCustomerOrders = async (req, res) => {
  const customerId = req.user.userId; // Get from authenticated token
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: customerId, isDeleted: false })
      .populate("items.carPost", "title heading make model year price photo_links fuel_type drivetrain transmission std_seating body_type engine_size overall_length overall_width overall_height carfax_clean_title inventory_type")
      .populate("items.seller", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ customer: customerId, isDeleted: false });

    res.status(200).json({
      success: true,
      message: "Customer orders retrieved successfully",
      data: {
        orders,
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting customer orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

/**
 * Get order by car ID (for checking if a car is sold)
 * @route GET /api/orders/car/:carId
 */
export const getOrderByCarId = async (req, res) => {
  const { carId } = req.params;

  try {
    const order = await Order.findOne({
      'items.carPost': carId,
      isDeleted: false
    })
      .populate('customer', 'name email')
      .populate('items.carPost', 'heading make model year price')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found for this car',
      });
    }

    // Format the response to include all necessary fields for frontend
    const formattedOrder = {
      _id: order._id,
      orderId: order._id,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state || '',
      country: order.country,
      zipCode: order.zipCode || '',
      orderStatus: order.orderStatus || 'pending',
      paymentStatus: order.paymentStatus,
      total: order.total,
      items: order.items,
      customer: order.customer,
      createdAt: order.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: formattedOrder,
    });
  } catch (error) {
    console.error('Error getting order by car ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message,
    });
  }
};

// ==================== UPDATE PAYMENT DETAILS (VNPay Return) ====================
/**
 * Update order with VNPay payment details
 * @route PATCH /api/orders/:id/payment-vnpay
 */
export const updatePaymentDetailsVNPay = async (req, res) => {
  const { id } = req.params;
  const { responseCode, transactionId, bankCode, bankTmnCode, paymentTime, paymentId } = req.body;

  if (!id || !responseCode) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment details
    order.paymentDetails = {
      responseCode,
      transactionId,
      bankCode,
      bankTmnCode,
      paymentTime: paymentTime ? new Date(paymentTime) : new Date(),
    };

    // Set payment status based on response code
    if (responseCode === "00") {
      order.paymentStatus = true;
      order.orderStatus = "confirmed";
      order.paymentId = paymentId;
      
      // Mark car posts as sold only after successful payment
      for (const item of order.items) {
        await CarPost.findByIdAndUpdate(item.carPost, { sold: true, status: 'Sold' });
      }
    } else {
      order.paymentStatus = false;
      order.orderStatus = "cancelled";
      // Payment failed - don't mark cars as sold, keep them available
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment details updated successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error updating payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment details",
      error: error.message,
    });
  }
};

// ==================== UPDATE ORDER STATUS ====================
/**
 * Update order status (admin/seller)
 * @route PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  if (!orderStatus || !["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true, runValidators: true }
    ).populate("items.carPost items.seller");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// ==================== CANCEL ORDER ====================
/**
 * Cancel an order
 * @route PATCH /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// ==================== SOFT DELETE ORDER ====================
/**
 * Soft delete an order (mark as deleted)
 * @route DELETE /api/orders/:id
 */
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent cancellation if order is in transit or delivered
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel orders that are in transit or have been delivered",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        orderStatus: 'cancelled'
      },
      { new: true }
    );

    // Mark car posts as available again
    for (const item of updatedOrder.items) {
      await CarPost.findByIdAndUpdate(item.carPost, { sold: false, status: 'Available' });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

// ==================== GET ORDER STATISTICS ====================
/**
 * Get order statistics for a seller
 * @route GET /api/orders/seller/stats
 * SECURITY: Uses authenticated user ID from JWT token instead of route parameter
 */
export const getOrderStats = async (req, res) => {
  const sellerId = req.user.userId; // Get from authenticated token

  try {
    const totalOrders = await Order.countDocuments({
      "items.seller": sellerId,
      isDeleted: false,
    });

    const completedOrders = await Order.countDocuments({
      "items.seller": sellerId,
      orderStatus: "delivered",
      isDeleted: false,
    });

    const pendingOrders = await Order.countDocuments({
      "items.seller": sellerId,
      orderStatus: "pending",
      isDeleted: false,
    });

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          "items.seller": require("mongoose").Types.ObjectId(sellerId),
          orderStatus: "delivered",
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: {
        stats: {
          totalOrders,
          completedOrders,
          pendingOrders,
          totalRevenue: totalRevenue[0]?.revenue || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order statistics",
      error: error.message,
    });
  }
};
