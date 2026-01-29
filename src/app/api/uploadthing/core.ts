import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
        .middleware(async ({ req }) => {
            const session = await getSession();
            if (!session || !session.user) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            return { uploadedBy: metadata.userId, url: file.url };
        }),
    
    contractUploader: f({ 
        pdf: { maxFileSize: "8MB", maxFileCount: 4 },
        image: { maxFileSize: "4MB", maxFileCount: 4 }
    })
        .middleware(async ({ req }) => {
            const session = await getSession();
            if (!session || !session.user) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, url: file.url, name: file.name };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
