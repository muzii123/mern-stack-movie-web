import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const OTEL_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://otel-collector:4317";

const exporter = new OTLPTraceExporter({
  url: OTEL_ENDPOINT,
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "movies-backend",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || "development",
  }),
  traceExporter: exporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Instrument HTTP requests automatically
      "@opentelemetry/instrumentation-http": { enabled: true },
      // Instrument Express routes automatically
      "@opentelemetry/instrumentation-express": { enabled: true },
      // Instrument MongoDB queries automatically
      "@opentelemetry/instrumentation-mongoose": { enabled: true },
    }),
  ],
});

sdk.start();
console.log("OpenTelemetry tracing initialized");

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk.shutdown().then(() => console.log("Tracing shut down"));
});

export default sdk;
