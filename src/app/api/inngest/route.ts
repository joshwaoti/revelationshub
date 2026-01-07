import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processSermon } from "@/inngest/functions/process-sermon";
import { generateTextContent } from "@/inngest/functions/generate-text-content";

// Inngest API route handler
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processSermon,
        generateTextContent,
    ],
});
