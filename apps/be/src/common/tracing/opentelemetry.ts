/**
 * OpenTelemetry tracing setup.
 *
 * Set OTEL_ENABLED=true to activate tracing (export to OTLP endpoint).
 * Set METRICS_ENABLED=true to activate Prometheus metrics at /metrics.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | null = null;

export function initTracing(): void {
  const tracingEnabled = process.env.OTEL_ENABLED === 'true';
  const metricsEnabled = process.env.METRICS_ENABLED === 'true';

  if (!tracingEnabled && !metricsEnabled) return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  try {
    let traceExporter: OTLPTraceExporter | undefined;
    let prometheusExporter: PrometheusExporter | undefined;

    if (tracingEnabled && endpoint) {
      traceExporter = new OTLPTraceExporter({
        url: `${endpoint}/v1/traces`,
      });
    }

    if (metricsEnabled) {
      prometheusExporter = new PrometheusExporter({
        port: 9464,
      });
    }

    const nodeSdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'arcadeum-be',
        [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? 'unknown',
      }),
      traceExporter,
      metricReader: prometheusExporter,
      instrumentations: [
        new HttpInstrumentation(),
        new MongoDBInstrumentation(),
      ],
    });

    nodeSdk.start();
    sdk = nodeSdk;

    if (tracingEnabled && endpoint) {
      console.log(`[tracing] OpenTelemetry tracing initialized → ${endpoint}`);
    }
    if (metricsEnabled) {
      console.log('[tracing] Prometheus metrics initialized → :9464/metrics');
    }
  } catch (err) {
    console.warn(`[tracing] Failed to initialize OpenTelemetry: ${err}`);
  }
}

export async function shutdownTracing(): Promise<void> {
  if (!sdk) return;
  await sdk.shutdown();
}
