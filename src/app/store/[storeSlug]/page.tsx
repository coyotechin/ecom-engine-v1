import Link from "next/link";

type StorePageProps = {
  params: Promise<{
    storeSlug: string;
  }>;
};

const storefrontSections = [
  "Store Home",
  "Product Listing",
  "Product Detail",
  "Search",
  "Cart",
  "Checkout",
  "Order Confirmation",
  "My Orders",
  "Login / OTP",
  "Contact / Support",
];

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.24em] text-neutral-500 uppercase">
                Customer Exclusive Front Store
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-black sm:text-5xl">
                {storeSlug}
              </h1>
            </div>

            <Link
              href="/"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
            >
              Back Home
            </Link>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-neutral-600">
            This customer-facing store will allow end customers to browse
            products, search, add items to cart, checkout, receive order
            confirmation, and track orders.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          {storefrontSections.map((section) => (
            <div
              key={section}
              className="rounded-3xl border border-neutral-200 bg-white p-6"
            >
              <p className="text-sm font-medium text-neutral-500">
                Storefront Section
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-black">
                {section}
              </h2>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}