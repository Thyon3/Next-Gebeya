import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function Breadcrumb({ customItems = null, productName = null, categoryName = null }) {
  const router = useRouter();

  const breadcrumbItems = useMemo(() => {
    // If custom items provided, use them
    if (customItems) {
      return [{ label: 'Home', href: '/' }, ...customItems];
    }

    // Auto-generate from URL path
    const pathSegments = router.asPath.split('?')[0].split('/').filter(Boolean);
    const items = [{ label: 'Home', href: '/' }];

    // Build breadcrumb based on current path
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format segment label
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Special handling for specific routes
      if (segment === 'product' && productName) {
        // Skip "Product" and use actual product name
        return;
      } else if (segment === 'order' && pathSegments[index + 1]) {
        label = 'Orders';
      } else if (segment === 'admin') {
        label = 'Admin Dashboard';
      } else if (segment === 'order-history') {
        label = 'Order History';
      } else if (segment === 'placeorder') {
        label = 'Place Order';
      }

      // Don't add link for last item (current page)
      const isLast = index === pathSegments.length - 1;
      
      items.push({
        label: isLast && productName ? productName : label,
        href: isLast ? null : currentPath,
      });
    });

    // Add category if provided
    if (categoryName && !items.some(item => item.label === categoryName)) {
      items.splice(1, 0, {
        label: categoryName,
        href: `/search?category=${encodeURIComponent(categoryName)}`,
      });
    }

    return items;
  }, [router.asPath, customItems, productName, categoryName]);

  // Don't show breadcrumb on homepage
  if (router.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol 
        className="flex flex-wrap items-center gap-2 text-sm"
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href ? (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">
                      {index === 0 && (
                        <svg
                          className="w-4 h-4 inline-block mr-1 mb-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      )}
                      {item.label}
                    </span>
                  </Link>
                  <meta itemProp="position" content={String(index + 1)} />
                </>
              ) : (
                <>
                  <span
                    className="text-gray-900 dark:text-gray-100 font-medium"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                  <meta itemProp="position" content={String(index + 1)} />
                </>
              )}

              {!isLast && (
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
