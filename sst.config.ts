import { SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "notil",
      region: "ap-northeast-2",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "Notil", {
        timeout: "30 seconds",
        memorySize: "512 MB",
        environment: {
          DATABASE_URL: process.env.DATABASE_URL!,
          JWT_SECRET: process.env.JWT_SECRET!,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
        },
        customDomain: {
          domainName: "notil.click",
          hostedZone: "notil.click",
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
