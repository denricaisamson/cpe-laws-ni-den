'use client';

import React, { useState, useEffect } from 'react';
import {
  ProductWithDetails,
  MerchandiseInquiry,
  getProducts,
  getProductById,
  submitMerchandiseInquiry,
  getMerchandiseInquiries,
  subscribeToCommunityStore,
} from '@/lib/community-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPHP } from '@/lib/utils';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Tag,
  Package,
  X,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  CheckCheck,
} from 'lucide-react';

interface MerchandiseClientProps {
  initialProducts?: ProductWithDetails[];
}

export function MerchandiseClient({ initialProducts }: MerchandiseClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<ProductWithDetails[]>(initialProducts || []);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [inquiries, setInquiries] = useState<MerchandiseInquiry[]>([]);
  const [showInquiriesModal, setShowInquiriesModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Inquire / Order Modal
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [recipientName, setRecipientName] = useState<string>('Juan Dela Cruz');
  const [recipientEmail, setRecipientEmail] = useState<string>('learner.juan@fsl.edu.ph');
  const [contactNumber, setContactNumber] = useState<string>('+63 917 123 4567');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Benilde SDEAS Campus, Manila');
  const [orderNotes, setOrderNotes] = useState<string>('Please include Deaf Awareness pin guide.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = () => {
    const list = getProducts(activeCategory);
    setProducts(list);
    setInquiries(getMerchandiseInquiries());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToCommunityStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [activeCategory]);

  const handleOpenOrderModal = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setFormError(null);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = submitMerchandiseInquiry(selectedProduct.id, {
        quantity: orderQuantity,
        recipientName,
        email: recipientEmail,
        contactNumber,
        deliveryAddress,
        notes: orderNotes,
      });

      // Show toast
      setToastMessage(result.message);
      setTimeout(() => setToastMessage(null), 4000);

      // Refresh list & close modal
      loadData();
      setSelectedProduct(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 right-4 z-50 bg-emerald-800 text-white px-5 py-3.5 rounded-xl border-2 border-emerald-950 shadow-2xl flex items-center gap-2 font-bold animate-fade-in"
        >
          <CheckCheck className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-800/80 text-rose-200 text-xs font-bold border border-rose-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Official Deaf Culture & Advocacy Store</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Official FSL Merchandise Catalog 🤟
          </h1>
          <p className="text-rose-100 text-base font-medium max-w-2xl">
            Support Deaf community initiatives! Proceeds from official shirts, tote bags, and enamel pins directly fund Deaf instructor stipends, accessible classroom equipment, and community learning resources.
          </p>
        </div>

        {inquiries.length > 0 && (
          <button
            type="button"
            onClick={() => setShowInquiriesModal(true)}
            className="self-start md:self-center shrink-0 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-2 transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-amber-300" />
            <span>My Inquiries ({inquiries.length})</span>
          </button>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-slate-300 shadow-xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Merchandise categories">
          {[
            { id: 'all', label: 'All Gear' },
            { id: 'Apparel', label: 'Apparel' },
            { id: 'Accessories', label: 'Accessories' },
            { id: 'Pins & Badges', label: 'Pins & Badges' },
          ].map((tab) => {
            const isCurrent = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isCurrent}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isCurrent
                    ? 'bg-blue-700 text-white border-2 border-blue-900 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search merchandise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-slate-50 text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Merchandise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 border-2 border-slate-300 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">No merchandise items found</h2>
            <p className="text-sm text-slate-600">
              Try selecting a different category filter or clearing your search query.
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;

            return (
              <Card
                key={product.id}
                className="border-2 border-slate-300 hover:border-slate-400 transition-all flex flex-col justify-between shadow-xs bg-white overflow-hidden group"
              >
                <div>
                  {/* Visual Header / Avatar Banner */}
                  <div className="aspect-4/3 bg-slate-100 border-b-2 border-slate-200 flex flex-col items-center justify-center relative p-6">
                    <span className="text-6xl filter drop-shadow-sm transition-transform group-hover:scale-110">
                      {product.icon_emoji || (product.name.includes('Shirt') ? '👕' : product.name.includes('Bag') ? '👜' : product.name.includes('Pin') ? '🏷️' : '🎗️')}
                    </span>
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-900 text-white border border-blue-950 shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 text-xs font-black uppercase text-slate-500 bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                      {product.category || 'Gear'}
                    </span>
                  </div>

                  <CardHeader className="p-5 pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Official SDEAS Gear
                      </span>
                      {product.stock > 0 ? (
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300">
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-rose-100 text-rose-950 border border-rose-300">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-xl font-black text-slate-900 leading-snug">
                      {product.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-1 text-xs text-slate-600 font-medium leading-relaxed">
                    <p>{product.description}</p>
                  </CardContent>
                </div>

                <div className="p-5 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-500">Advocacy Price</div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {formatPHP(product.price)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    disabled={isOutOfStock}
                    onClick={() => handleOpenOrderModal(product)}
                    className="font-black text-xs px-4"
                  >
                    <ShoppingBag className="w-4 h-4 mr-1.5" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Inquire / Order'}</span>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Simulated Inquire / Pre-Order Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-order-title"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl border-2 border-slate-400 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-100 p-6 border-b-2 border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-black uppercase bg-blue-100 text-blue-900 border border-blue-300 mb-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Advocacy Pre-Order Inquiry</span>
                </div>
                <h2 id="modal-order-title" className="text-xl font-black text-slate-900">
                  {selectedProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close modal"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-5 overflow-y-auto flex-1">
              {formError && (
                <div
                  role="alert"
                  className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Unit Price:</span>
                  <span className="text-slate-900 text-sm font-black">{formatPHP(selectedProduct.price)}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Available Stock:</span>
                  <span className="text-emerald-800 font-black">{selectedProduct.stock} units</span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label htmlFor="order-quantity" className="text-xs font-black uppercase text-slate-700">
                    Order Quantity:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={orderQuantity <= 1}
                      onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white border-2 border-slate-300 font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      id="order-quantity"
                      type="number"
                      min={1}
                      max={selectedProduct.stock}
                      value={orderQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setOrderQuantity(Math.min(selectedProduct.stock, Math.max(1, val)));
                        }
                      }}
                      className="w-14 text-center font-black text-sm bg-white border-2 border-slate-300 rounded-lg py-1"
                    />
                    <button
                      type="button"
                      disabled={orderQuantity >= selectedProduct.stock}
                      onClick={() => setOrderQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                      className="w-8 h-8 rounded-lg bg-white border-2 border-slate-300 font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs font-black uppercase text-slate-900">Total Inquiry Amount:</span>
                  <span className="text-xl font-black text-blue-900">
                    {formatPHP(selectedProduct.price * orderQuantity)}
                  </span>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Contact & Delivery Information
                </h3>

                <div>
                  <label htmlFor="recipient-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (Recipient / Contact Person) *
                  </label>
                  <input
                    id="recipient-name"
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-white text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="recipient-email" className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="recipient-email"
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-white text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-number" className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile / WhatsApp Number
                    </label>
                    <input
                      id="contact-number"
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-white text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="delivery-address" className="block text-xs font-bold text-slate-700 mb-1">
                    Pickup Location / Shipping Address
                  </label>
                  <input
                    id="delivery-address"
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-white text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="order-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    Special Inquiries or Sizing Notes
                  </label>
                  <textarea
                    id="order-notes"
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full text-xs font-medium p-3 bg-white text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Informational Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  This is a simulated advocacy checkout. Submitting records your pre-order in the system and immediately decrements inventory stock in real time.
                </span>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedProduct(null)}
                  className="font-bold border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="font-bold min-h-[44px]"
                >
                  <CheckCheck className="w-4 h-4 mr-1.5" />
                  <span>Confirm Pre-Order ({formatPHP(selectedProduct.price * orderQuantity)})</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiries Summary Drawer / Modal */}
      {showInquiriesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-inquiries-title"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setShowInquiriesModal(false)}
        >
          <div
            className="bg-white rounded-2xl border-2 border-slate-400 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-100 p-6 border-b-2 border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-700" />
                <h2 id="modal-inquiries-title" className="text-xl font-black text-slate-900">
                  Recorded Pre-Orders & Inquiries ({inquiries.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiriesModal(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-blue-900">{inq.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-950 border border-emerald-300">
                        {inq.status}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{inq.product_name}</div>
                    <div className="text-xs font-medium text-slate-600">
                      Qty: {inq.quantity} • Recipient: {inq.recipient_name} ({inq.email})
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-slate-900">{formatPHP(inq.total_price)}</div>
                    <div className="text-[10px] font-bold text-slate-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-100 border-t-2 border-slate-200 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowInquiriesModal(false)}
                className="font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
