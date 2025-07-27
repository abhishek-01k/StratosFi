import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { LoggerService } from './logger.service';
import { MonitoringService } from './monitoring.service';
import { TEEService } from './tee.service';
import { env } from '../configs/env.validation';

export class HttpService {
  private logger = new LoggerService('HttpService');
  private server: ReturnType<typeof createServer>;

  constructor(
    private monitoringService: MonitoringService,
    private teeService: TEEService
  ) {
    this.server = createServer(this.handleRequest.bind(this));
  }

  start(): void {
    this.server.listen(env.METRICS_PORT, () => {
      this.logger.info(`HTTP server listening on port ${env.METRICS_PORT}`);
    });
  }

  stop(): void {
    this.server.close(() => {
      this.logger.info('HTTP server stopped');
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const parsedUrl = parse(req.url || '', true);
    const path = parsedUrl.pathname || '/';

    try {
      switch (path) {
        case '/health':
          await this.handleHealth(req, res);
          break;
        case '/metrics':
          await this.handleMetrics(req, res);
          break;
        case '/address':
          await this.handleAddress(req, res);
          break;
        case '/attestation':
          await this.handleAttestation(req, res);
          break;
        case '/stats':
          await this.handleStats(req, res);
          break;
        default:
          this.handleNotFound(req, res);
      }
    } catch (error) {
      this.logger.error('Request handling error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async handleHealth(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const health = await this.monitoringService.getHealthStatus();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  private async handleMetrics(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const metrics = this.monitoringService.getPrometheusMetrics();
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(metrics);
  }

  private async handleAddress(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const response = {
      address: env.NEAR_ACCOUNT_ID,
      network: env.NEAR_NETWORK_ID,
      teeMode: env.TEE_MODE,
      supportedChains: env.INCH_FUSION_NETWORK_IDS.split(',').map((id: string) => parseInt(id.trim())),
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  private async handleAttestation(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const attestation = this.teeService.getAttestation();
    
    if (!attestation) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No attestation available' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(attestation, null, 2));
  }

  private async handleStats(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const metrics = this.monitoringService.getMetrics();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics, null, 2));
  }

  private handleNotFound(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      availableEndpoints: [
        '/health - Health status',
        '/metrics - Prometheus metrics',
        '/address - Solver address info',
        '/attestation - TEE attestation data',
        '/stats - Detailed statistics',
      ]
    }, null, 2));
  }
}