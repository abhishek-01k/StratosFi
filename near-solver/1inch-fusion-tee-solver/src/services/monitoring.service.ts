import { LoggerService } from './logger.service';
import { SolverService } from './solver.service';
import { LiquidityService } from './liquidity.service';

export class MonitoringService {
  private logger = new LoggerService('MonitoringService');
  private metrics: Metrics = {
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    orders: {
      total: 0,
      successful: 0,
      failed: 0,
      processing: 0,
    },
    liquidity: {
      totalValueUsd: 0,
      utilizationPercent: 0,
    },
    performance: {
      avgExecutionTimeMs: 0,
      successRate: 0,
      totalProfitUsd: 0,
    },
    system: {
      memoryUsageMb: 0,
      cpuUsagePercent: 0,
      uptimeHours: 0,
    },
  };

  constructor(
    private solverService: SolverService,
    private liquidityService: LiquidityService
  ) {}

  async updateMetrics(): Promise<void> {
    try {
      // Update solver metrics
      const solverStats = this.solverService.getStats();
      this.metrics.orders.total = solverStats.totalExecutions;
      this.metrics.orders.successful = solverStats.successfulExecutions;
      this.metrics.orders.failed = solverStats.failedExecutions;
      this.metrics.performance.successRate = parseFloat(solverStats.successRate.replace('%', ''));

      // Update liquidity metrics
      const balanceSummary = this.liquidityService.getBalanceSummary();
      this.metrics.liquidity.totalValueUsd = balanceSummary.totalValueUsd;

      // Update system metrics
      this.updateSystemMetrics();

      this.metrics.lastUpdateTime = Date.now();
    } catch (error) {
      this.logger.error('Failed to update metrics:', error);
    }
  }

  private updateSystemMetrics(): void {
    // Memory usage
    const memoryUsage = process.memoryUsage();
    this.metrics.system.memoryUsageMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    // CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    this.metrics.system.cpuUsagePercent = Math.round((cpuUsage.user + cpuUsage.system) / 1000000);

    // Uptime
    const uptimeMs = Date.now() - this.metrics.startTime;
    this.metrics.system.uptimeHours = Math.round(uptimeMs / 1000 / 60 / 60 * 100) / 100;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];
    
    // Check solver status
    checks.push({
      name: 'solver',
      status: this.metrics.orders.total > 0 ? 'healthy' : 'degraded',
      message: `Processed ${this.metrics.orders.total} orders`,
    });

    // Check liquidity
    checks.push({
      name: 'liquidity',
      status: this.metrics.liquidity.totalValueUsd > 1000 ? 'healthy' : 'unhealthy',
      message: `Total liquidity: $${this.metrics.liquidity.totalValueUsd.toFixed(2)}`,
    });

    // Check success rate
    checks.push({
      name: 'performance',
      status: this.metrics.performance.successRate > 80 ? 'healthy' : 
              this.metrics.performance.successRate > 50 ? 'degraded' : 'unhealthy',
      message: `Success rate: ${this.metrics.performance.successRate}%`,
    });

    // Check memory usage
    checks.push({
      name: 'memory',
      status: this.metrics.system.memoryUsageMb < 1000 ? 'healthy' : 
              this.metrics.system.memoryUsageMb < 2000 ? 'degraded' : 'unhealthy',
      message: `Memory usage: ${this.metrics.system.memoryUsageMb}MB`,
    });

    const isHealthy = checks.every(check => check.status !== 'unhealthy');
    const isDegraded = checks.some(check => check.status === 'degraded');

    return {
      status: isHealthy ? (isDegraded ? 'degraded' : 'healthy') : 'unhealthy',
      isHealthy,
      checks,
      timestamp: new Date().toISOString(),
      uptime: this.metrics.system.uptimeHours,
    };
  }

  getPrometheusMetrics(): string {
    const lines: string[] = [];
    
    // Add metric descriptions
    lines.push('# HELP fusion_solver_orders_total Total number of orders processed');
    lines.push('# TYPE fusion_solver_orders_total counter');
    lines.push(`fusion_solver_orders_total ${this.metrics.orders.total}`);
    
    lines.push('# HELP fusion_solver_orders_successful Total number of successful orders');
    lines.push('# TYPE fusion_solver_orders_successful counter');
    lines.push(`fusion_solver_orders_successful ${this.metrics.orders.successful}`);
    
    lines.push('# HELP fusion_solver_orders_failed Total number of failed orders');
    lines.push('# TYPE fusion_solver_orders_failed counter');
    lines.push(`fusion_solver_orders_failed ${this.metrics.orders.failed}`);
    
    lines.push('# HELP fusion_solver_liquidity_usd Total liquidity value in USD');
    lines.push('# TYPE fusion_solver_liquidity_usd gauge');
    lines.push(`fusion_solver_liquidity_usd ${this.metrics.liquidity.totalValueUsd}`);
    
    lines.push('# HELP fusion_solver_success_rate Order execution success rate');
    lines.push('# TYPE fusion_solver_success_rate gauge');
    lines.push(`fusion_solver_success_rate ${this.metrics.performance.successRate}`);
    
    lines.push('# HELP fusion_solver_memory_usage_mb Memory usage in MB');
    lines.push('# TYPE fusion_solver_memory_usage_mb gauge');
    lines.push(`fusion_solver_memory_usage_mb ${this.metrics.system.memoryUsageMb}`);
    
    lines.push('# HELP fusion_solver_uptime_hours Solver uptime in hours');
    lines.push('# TYPE fusion_solver_uptime_hours gauge');
    lines.push(`fusion_solver_uptime_hours ${this.metrics.system.uptimeHours}`);
    
    return lines.join('\n');
  }
}

interface Metrics {
  startTime: number;
  lastUpdateTime: number;
  orders: {
    total: number;
    successful: number;
    failed: number;
    processing: number;
  };
  liquidity: {
    totalValueUsd: number;
    utilizationPercent: number;
  };
  performance: {
    avgExecutionTimeMs: number;
    successRate: number;
    totalProfitUsd: number;
  };
  system: {
    memoryUsageMb: number;
    cpuUsagePercent: number;
    uptimeHours: number;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  isHealthy: boolean;
  checks: HealthCheck[];
  timestamp: string;
  uptime: number;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
}