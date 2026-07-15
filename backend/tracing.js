import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

const OTEL_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://otel-collector:4317";

const exporter = new OTLPTraceExporter({
  url: OTEL_ENDPOINT,
});

const sdk = new NodeSDK({
  serviceName: "movies-backend",
  traceExporter: exporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": { enabled: true },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-mongoose": { enabled: true },
    }),
  ],
});

sdk.start();
console.log("OpenTelemetry tracing initialized");

process.on("SIGTERM", () => {
  sdk.shutdown().then(() => console.log("Tracing shut down"));
});

export default sdk;
