/**
 * OpenTelemetry tracing setup.
 *
 * Set OTEL_ENABLED=true to activate.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | null = null;

export function initTracing(): void {
  if (process.env.OTEL_ENABLED !== 'true') return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    console.warn(
      '[tracing] OTEL_ENABLED=true but OTEL_EXPORTER_OTLP_ENDPOINT is not set — skipping.',
    );
    return;
  }

  try {
    const exporter = new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    });

    const nodeSdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'arcadeum-be',
        [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? 'unknown',
      }),
      traceExporter: exporter,
      instrumentations: [
        new HttpInstrumentation(),
        new MongoDBInstrumentation(),
      ],
    });

    nodeSdk.start();
    sdk = nodeSdk;
    console.log(`[tracing] OpenTelemetry initialized → ${endpoint}`);
  } catch (err) {
    console.warn(`[tracing] Failed to initialize OpenTelemetry: ${err}`);
    console.warn(
      '[tracing] Install @opentelemetry/* packages to enable tracing.',
    );
  }
}

export async function shutdownTracing(): Promise<void> {
  if (!sdk) return;
  await sdk.shutdown();
}
