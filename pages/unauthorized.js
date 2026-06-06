import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function Unauthorized() {
  const router = useRouter();
  const { message } = router.query;

  return (
    <>
      <Head>
        <title>Unauthorized - eShop</title>
        <meta name="description" content="Unauthorized access" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Access Denied
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {message || "You are not authorized to access this page"}
            </p>
          </div>

          <div className="card p-8 space-y-4">
            <p className="text-center text-gray-700">
              This page requires authentication or special permissions.
            </p>
            <div className="space-y-2">
              <Link href="/login">
                <button className="primary-button w-full">
                  Sign In
                </button>
              </Link>
              <Link href="/">
                <button className="default-button w-full">
                  Go to Homepage
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
