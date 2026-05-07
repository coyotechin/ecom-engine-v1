import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type StorePageProps = {
  params: Promise<{
    storeSlug: string;
  }>;
};

const categories = ["All", "Featured", "New Arrivals", "Best Sellers", "Offers"];

const products = [
  {
    name: "Demo Product One",
    category: "Featured",
    price: "₹999",
    stock: "In stock",
    description: "A sample product card for the customer storefront.",
  },
  {
    name: "Demo Product Two",
    category: "Best Seller",
    price: "₹1,499",
    stock: "In stock",
    description: "Used to preview product listing and cart flow.",
  },
  {
    name: "Demo Product Three",
    category: "New Arrival",
    price: "₹799",
    stock: "Low stock",
    description: "A clean product preview before Supabase data connection.",
  },
  {
    name: "Demo Product Four",
    category: "Offer",
    price: "₹599",
    stock: "In stock",
    description: "Temporary product data for storefront layout testing.",
  },
];

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;

  const formattedStoreName = storeSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:px-10 lg:px-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="w-fit">
              <p className="text-xs font-medium tracking-[0.24em] text-neutral-500 uppercase">
                Ecom Engine Store
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-black">
                {formattedStoreName}
              </h1>
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-5 py-3 text-sm text-neutral-500 sm:w-80">
                Search products...
              </div>

              <Button href="/" variant="outline">
                Back Home
              </Button>

              <Button variant="primary">Cart · 0</Button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                className="whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:py-20">
          <div>
            <Badge variant="dark">Customer Exclusive Front Store</Badge>

            <h2 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-black sm:text-6xl">
              Browse, add to cart, checkout, and track orders.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600">
              This storefront is connected to the client business backend. In
              the next development phases, products, stock, cart, checkout,
              payments, and order status will come from the Ecom Engine
              database.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary">Shop Featured</Button>
              <Button variant="outline">Contact Store</Button>
            </div>
          </div>

          <Card className="bg-white shadow-none">
            <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
              Store Preview
            </p>

            <div className="mt-6 space-y-4">
              {[
                "Product listing",
                "Cart preview",
                "Checkout flow",
                "Order confirmation",
                "Customer support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-neutral-800">
                    {item}
                  </span>
                  <Badge variant="muted">Ready UI</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
              Featured Products
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-black">
              Store catalogue preview
            </h2>
          </div>

          <Badge variant="outline">Demo data · Supabase pending</Badge>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.name}
              className="flex min-h-80 flex-col justify-between shadow-none transition hover:-translate-y-1 hover:border-black"
            >
              <div>
                <div className="flex h-36 items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-50">
                  <span className="text-sm font-medium text-neutral-400">
                    Product Image
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="muted">{product.category}</Badge>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-black">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-lg font-semibold text-black">
                    {product.price}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {product.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Badge
                  variant={product.stock === "Low stock" ? "outline" : "dark"}
                >
                  {product.stock}
                </Badge>

                <Button variant="outline" size="sm">
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:px-10 lg:grid-cols-3 lg:px-12">
          <Card className="shadow-none">
            <p className="text-sm font-medium text-neutral-500">Cart</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              0 items
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Cart functionality will be connected after product and order
              database setup.
            </p>
          </Card>

          <Card className="shadow-none">
            <p className="text-sm font-medium text-neutral-500">Checkout</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Payment pending
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Razorpay and COD status tracking will be added after core order
              logic.
            </p>
          </Card>

          <Card className="shadow-none">
            <p className="text-sm font-medium text-neutral-500">Support</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Contact store
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Customer support details will come from the client store setup
              profile.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}