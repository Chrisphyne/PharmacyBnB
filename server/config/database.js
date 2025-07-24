const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        logger.debug('Database Query:', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }

    // Log database errors
    this.prisma.$on('error', (e) => {
      logger.error('Database Error:', e);
    });

    // Log database info
    this.prisma.$on('info', (e) => {
      logger.info('Database Info:', e.message);
    });

    // Log database warnings
    this.prisma.$on('warn', (e) => {
      logger.warn('Database Warning:', e.message);
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');
      return true;
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database is responding' };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', message: error.message };
    }
  }

  // Get database statistics
  async getStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        LIMIT 10;
      `;

      return stats;
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return null;
    }
  }

  // Transaction helper
  async transaction(callback) {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  // Bulk operations helper
  async createMany(model, data, options = {}) {
    try {
      return await this.prisma[model].createMany({
        data,
        ...options
      });
    } catch (error) {
      logger.error(`Bulk create failed for ${model}:`, error);
      throw error;
    }
  }

  // Soft delete helper
  async softDelete(model, where) {
    try {
      return await this.prisma[model].update({
        where,
        data: { isActive: false }
      });
    } catch (error) {
      logger.error(`Soft delete failed for ${model}:`, error);
      throw error;
    }
  }

  // Search helper with pagination
  async searchWithPagination(model, searchConfig) {
    const {
      where = {},
      include = {},
      orderBy = { createdAt: 'desc' },
      page = 1,
      limit = 10,
      select
    } = searchConfig;

    try {
      const skip = (page - 1) * limit;
      
      const [items, totalCount] = await Promise.all([
        this.prisma[model].findMany({
          where,
          include,
          orderBy,
          skip,
          take: limit,
          ...(select && { select })
        }),
        this.prisma[model].count({ where })
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error(`Search with pagination failed for ${model}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

// Export Prisma client for direct use
module.exports = database.prisma;

// Also export database instance for utility methods
module.exports.database = database;