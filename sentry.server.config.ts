import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ccd8c1681e5479efe988b1740fde06f7@o4509470669733888.ingest.us.sentry.io/4509980125691904",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  
  
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  sendDefaultPii: true,
  //  logs
  // Enable logs to be sent to Sentry
  enableLogs: true,
  //  logs
  //  performance
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  //  performance
});
