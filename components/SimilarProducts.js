import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import ReactStars from "react-rating-stars-component";
import { formatPrice } from "@/utils/currency";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function SimilarProducts({ product, allProducts, isOpen, closeModal, currency, onAddToCart }) {
  // Filter similar products by category or brand
  const similarProducts = allProducts
    .filter(
      (p) =>
        p._id !== product._id &&
        (p.category === product.category || p.brand === product.brand)
    )
    .slice(0, 6);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      Similar Products
                    </Dialog.Title>
                    <p className="text-gray-600 mt-1">
                      Products similar to {product.name}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {similarProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No similar products found
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                    {similarProducts.map((similarProduct) => (
                      <div
                        key={similarProduct._id}
                        className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <Link href={`/product/${similarProduct.slug}`} onClick={closeModal}>
                          <div className="relative h-48 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={similarProduct.image}
                              alt={similarProduct.name}
                              fill
                              className="object-contain hover:scale-105 transition-transform"
                            />
                          </div>
                        </Link>

                        <Link href={`/product/${similarProduct.slug}`} onClick={closeModal}>
                          <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 line-clamp-2">
                            {similarProduct.name}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm mb-2">
                          {similarProduct.brand}
                        </p>

                        <div className="flex items-center mb-2">
                          <ReactStars
                            count={5}
                            size={18}
                            activeColor="#ffd700"
                            value={similarProduct.rating}
                            edit={false}
                          />
                          <span className="ml-1 text-xs text-gray-600">
                            ({similarProduct.numReviews})
                          </span>
                        </div>

                        <p className="text-xl font-bold text-blue-600 mb-3">
                          {formatPrice(similarProduct.price, currency)}
                        </p>

                        <button
                          onClick={() => onAddToCart(similarProduct)}
                          disabled={similarProduct.countInStock === 0}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {similarProduct.countInStock === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
