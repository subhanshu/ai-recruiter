import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ccd8c1681e5479efe988b1740fde06f7@o4509470669733888.ingest.us.sentry.io/4509980125691904",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  
  sendDefaultPii: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    //  session-replay
    // Replay may only be enabled for the client-side
    Sentry.replayIntegration(),
    //  session-replay
    //  user-feedback
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "system",
    }),
    //  user-feedback
  ],
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
  //  session-replay
  // Capture Replay for 10% of all
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  //  session-replay
});
//  performance
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
//  performance
