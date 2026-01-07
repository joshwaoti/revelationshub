import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Paystack webhook event types
interface PaystackEvent {
    event: string;
    data: {
        customer?: {
            email: string;
            customer_code: string;
        };
        subscription_code?: string;
        plan?: {
            plan_code: string;
            name: string;
        };
        status?: string;
        next_payment_date?: string;
        metadata?: {
            organizationId?: string;
        };
    };
}

// Map Paystack plan codes to our tier names
const PLAN_MAP: Record<string, string> = {
    "PLN_free": "free",
    "PLN_plus": "plus",
    "PLN_silver": "silver",
    "PLN_gold": "gold",
    "PLN_platinum": "platinum",
};

// Verify Paystack webhook signature
function verifySignature(body: string, signature: string): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return false;

    const hash = crypto
        .createHmac("sha512", secret)
        .update(body)
        .digest("hex");

    return hash === signature;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-paystack-signature");

        if (!signature || !verifySignature(body, signature)) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        const event: PaystackEvent = JSON.parse(body);
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

        switch (event.event) {
            case "subscription.create":
            case "subscription.not_renew":
            case "subscription.enable":
            case "subscription.disable":
                await handleSubscriptionUpdate(event, convexUrl);
                break;

            case "charge.success":
                // Handle successful charge - could update usage limits
                console.log("Charge successful:", event.data);
                break;

            case "invoice.payment_failed":
                await handlePaymentFailed(event, convexUrl);
                break;

            default:
                console.log("Unhandled Paystack event:", event.event);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Paystack webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

async function handleSubscriptionUpdate(event: PaystackEvent, convexUrl?: string) {
    if (!convexUrl) return;

    const organizationId = event.data.metadata?.organizationId;
    if (!organizationId) {
        console.error("No organizationId in subscription metadata");
        return;
    }

    const planCode = event.data.plan?.plan_code || "";
    const plan = PLAN_MAP[planCode] || "free";
    const status = event.data.status === "active" ? "active" :
        event.data.status === "cancelled" ? "cancelled" :
            "past_due";

    // Update subscription in Convex
    await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path: "subscriptions:upsert",
            args: {
                organizationId,
                paystackCustomerId: event.data.customer?.customer_code || "",
                paystackSubscriptionId: event.data.subscription_code,
                plan,
                status,
                currentPeriodEnd: event.data.next_payment_date
                    ? new Date(event.data.next_payment_date).getTime()
                    : undefined,
                clipCredits: getClipCreditsForPlan(plan),
            },
        }),
    });
}

async function handlePaymentFailed(event: PaystackEvent, convexUrl?: string) {
    if (!convexUrl) return;

    const organizationId = event.data.metadata?.organizationId;
    if (!organizationId) return;

    // Update subscription status to past_due
    await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path: "subscriptions:upsert",
            args: {
                organizationId,
                paystackCustomerId: event.data.customer?.customer_code || "",
                plan: "free", // Downgrade on payment failure
                status: "past_due",
                clipCredits: 2,
            },
        }),
    });
}

function getClipCreditsForPlan(plan: string): number {
    const credits: Record<string, number> = {
        free: 2,
        plus: 50,
        silver: 100,
        gold: 200,
        platinum: 999999,
    };
    return credits[plan] || 2;
}
