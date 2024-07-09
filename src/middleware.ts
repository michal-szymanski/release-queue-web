import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/auth/sign-in(.*)', '/auth/callback(.*)']);

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        auth().protect();
    }
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
};

// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

// export const config = {
//     matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
// };
