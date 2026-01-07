import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Clerk webhook to sync users and organizations to Convex
export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SECRET");
        return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify webhook signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventType = evt.type;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
        console.error("Missing NEXT_PUBLIC_CONVEX_URL");
        return NextResponse.json({ error: "Missing Convex URL" }, { status: 500 });
    }

    try {
        switch (eventType) {
            case "organization.created":
            case "organization.updated": {
                const { id, name, slug, image_url } = evt.data;

                await fetch(`${convexUrl}/api/mutation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "organizations:upsert",
                        args: {
                            clerkOrgId: id,
                            name: name || "Unnamed Organization",
                            slug: slug || undefined,
                            imageUrl: image_url || undefined,
                        },
                    }),
                });

                console.log(`Organization ${id} synced to Convex`);
                break;
            }

            case "organizationMembership.created":
            case "organizationMembership.updated": {
                const { organization, public_user_data, role } = evt.data;

                // First get the organization from Convex
                const orgResponse = await fetch(`${convexUrl}/api/query`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: "organizations:getByClerkId",
                        args: { clerkOrgId: organization.id },
                    }),
                });

                const org = await orgResponse.json();

                if (org?._id) {
                    // Map Clerk role to our roles
                    const mappedRole = role === "org:admin" ? "admin" :
                        role === "org:editor" ? "editor" : "contributor";

                    await fetch(`${convexUrl}/api/mutation`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            path: "members:upsert",
                            args: {
                                clerkUserId: public_user_data.user_id,
                                organizationId: org._id,
                                role: mappedRole,
                                email: public_user_data.identifier || "",
                                name: `${public_user_data.first_name || ""} ${public_user_data.last_name || ""}`.trim() || undefined,
                                imageUrl: public_user_data.image_url || undefined,
                            },
                        }),
                    });

                    console.log(`Member ${public_user_data.user_id} synced to Convex`);
                }
                break;
            }

            case "user.created":
            case "user.updated": {
                // User events - we handle these when they join an organization
                console.log(`User event ${eventType} received`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
