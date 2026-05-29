import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getOrganizationForClerkOrg(clerkOrgId: string) {
    return convex.query(api.organizations.getByClerkId, { clerkOrgId });
}

export async function getAuthorizedSermon(sermonId: string, clerkOrgId: string) {
    const organization = await getOrganizationForClerkOrg(clerkOrgId);
    if (!organization) return null;

    const sermon = await convex.query(api.sermons.getById, {
        sermonId: sermonId as Id<"sermons">,
    });

    if (!sermon || sermon.organizationId !== organization._id) {
        return null;
    }

    return { organization, sermon };
}

export async function getAuthorizedClip(clipId: string, clerkOrgId: string) {
    const organization = await getOrganizationForClerkOrg(clerkOrgId);
    if (!organization) return null;

    const clip = await convex.query(api.clips.getById, {
        clipId: clipId as Id<"clips">,
    });

    if (!clip) return null;

    const sermon = await convex.query(api.sermons.getById, {
        sermonId: clip.sermonId,
    });

    if (!sermon || sermon.organizationId !== organization._id) {
        return null;
    }

    return { organization, sermon, clip };
}

export async function getAuthorizedClipByS3Key(s3Key: string, clerkOrgId: string) {
    const organization = await getOrganizationForClerkOrg(clerkOrgId);
    if (!organization) return null;

    const clip = await convex.query(api.clips.getByS3Key, { s3Key });
    if (!clip) return null;

    const sermon = await convex.query(api.sermons.getById, {
        sermonId: clip.sermonId,
    });

    if (!sermon || sermon.organizationId !== organization._id) {
        return null;
    }

    return { organization, sermon, clip };
}
