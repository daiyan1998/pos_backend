import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Parallel queries for better performance
    const [
      todaysSales,
      activeTables,
      recentOrders,
      todaysOrders
    ] = await Promise.all([
      getTodaysSalesStats(startOfDay, endOfDay),
      getActiveTables(),
      getRecentOrders(),
      getTodaysOrdersCount(startOfDay, endOfDay)
    ]);

    // Calculate average order value
    const avgOrderValue = todaysOrders._count.id > 0 
      ? (todaysSales.totalRevenue / todaysOrders._count.id) 
      : 0;

    res.json({
      success: true,
      data: {
        todaysSales: {
          totalRevenue: todaysSales.totalRevenue,
          totalOrders: todaysOrders._count.id,
          averageOrderValue: avgOrderValue,
          comparedToYesterday: todaysSales.growthPercentage
        },
        activeTables: {
          count: activeTables.length,
          tables: activeTables
        },
        recentOrders: recentOrders,
        quickStats: {
          pendingOrders: await getPendingOrdersCount(),
          lowStockItems: await getLowStockCount(),
          todaysRevenue: todaysSales.totalRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function: Today's sales statistics
const getTodaysSalesStats = async (startOfDay: Date, endOfDay : Date) => {
  const todaysSales = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: {
        in: ['SERVED', 'READY'] // Only completed orders
      }
    },
    _sum: {
      finalAmount: true
    },
    _count: {
      id: true
    }
  });

  // Yesterday's sales for comparison
  const yesterday = new Date(startOfDay);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(endOfDay);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const yesterdaysSales = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: yesterday,
        lte: yesterdayEnd
      },
      status: {
        in: ['SERVED', 'READY']
      }
    },
    _sum: {
      finalAmount: true
    }
  });

  const todayRevenue = Number(todaysSales._sum.finalAmount) || 0;
  const yesterdayRevenue = Number(yesterdaysSales._sum.finalAmount) || 0;
  
  const growthPercentage = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : 0;

  return {
    totalRevenue: todayRevenue,
    orderCount: todaysSales._count.id,
    growthPercentage: Math.round(growthPercentage * 100) / 100
  };
};

// Helper function: Active tables
const getActiveTables = async () => {
  return await prisma.table.findMany({
    where: {
      status: {
        in: ['OCCUPIED', 'RESERVED']
      }
    },
    include: {
      orders: {
        where: {
          status: {
            in: ['PENDING', 'IN_PREPARATION', 'READY']
          }
        },
        select: {
          id: true,
          orderNumber: true,
          finalAmount: true,
          createdAt: true,
          customerName: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1 // Latest order for this table
      }
    },
    orderBy: {
      tableNumber: 'asc'
    }
  });
};

// Helper function: Recent orders
const getRecentOrders = async () => {
  return await prisma.order.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      table: {
        select: {
          tableNumber: true
        }
      },
      creator: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      orderItems: {
        include: {
          menuItem: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
};

// Helper functions for additional stats
const getTodaysOrdersCount = async (startOfDay: Date, endOfDay: Date) => {
  return await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    _count: {
      id: true
    }
  });
};

const getPendingOrdersCount = async () => {
  const result = await prisma.order.aggregate({
    where: {
      status: {
        in: ['PENDING', 'IN_PREPARATION']
      }
    },
    _count: {
      id: true
    }
  });
  return result._count.id;
};

const getLowStockCount = async () => {
  const lowStockItems = await prisma.inventoryItem.findMany({
    where: {
      currentStock: {
        lte: prisma.inventoryItem.fields.minStock // currentStock <= minStock
      },
      isActive: true
    }
  });
  return lowStockItems.length;
};


