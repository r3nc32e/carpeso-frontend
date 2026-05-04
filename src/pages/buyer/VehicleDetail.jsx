import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  Car,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

import { IMG_BASE } from '../../api/config';

function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [currentImg, setCurrentImg] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);  // review pending delete
  const [deleting, setDeleting] = useState(false);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  usePageTitle(
    vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehicle Details"
  );

  const [reserveForm, setReserveForm] = useState({
    deliveryNotes: "",
    paymentMode: "",
    cityName: "",
    barangayName: "",
    streetNo: "",
    addressLabel: "",
  });

  const PAYMENT_MODES = [
    "CASH",
    "GCASH",
    "MAYA",
    "BANK_TRANSFER",
    "CAR_FINANCING",
    "CREDIT_CARD",
  ];

  useEffect(() => {
    fetchVehicle();
    fetchReviews();
    api.get("/locations/cities").then((res) => setCities(res.data.data));
    if (isAuthenticated() && user?.role === "BUYER") {
      fetchAddresses();
    }
  }, [id]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/buyer/addresses");
      const addrs = res.data.data || [];
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        setSelectedAddressId(String(addrs[0].id));
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error(err);
      setShowNewAddressForm(true);
    }
  };

  const handleCityChange = async (cityId) => {
    const city = cities.find((c) => c.id === parseInt(cityId));
    setReserveForm((prev) => ({
      ...prev,
      cityName: city?.name || "",
      barangayName: "",
    }));
    if (cityId) {
      const res = await api.get(`/locations/barangays/${cityId}`);
      setBarangays(res.data.data);
    }
  };

  const fetchVehicle = async () => {
    try {
      const res = await api.get(`/public/vehicles/${id}`);
      setVehicle(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/public/vehicles/${id}/reviews`);
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return `${IMG_BASE}${url.replace("/uploads", "")}`;
  };

  const allMedia = [
    ...(vehicle?.imageUrls || []).map((url) => ({ type: "image", url })),
    ...(vehicle?.videoUrls || []).map((url) => ({ type: "video", url })),
    ...(vehicle?.videoUrl && !vehicle?.videoUrls?.length
      ? [{ type: "video", url: vehicle.videoUrl }]
      : []),
  ];

  const getDeliveryAddress = () => {
    if (!showNewAddressForm && selectedAddressId) {
      const addr = savedAddresses.find(
        (a) => String(a.id) === selectedAddressId
      );
      if (addr) {
        return `${addr.streetNo ? addr.streetNo + ", " : ""}${addr.barangayName}, ${addr.cityName}`;
      }
    }
    if (reserveForm.cityName && reserveForm.barangayName) {
      return `${reserveForm.streetNo ? reserveForm.streetNo + ", " : ""}${reserveForm.barangayName}, ${reserveForm.cityName}`;
    }
    return "";
  };

  const handleSaveNewAddress = async () => {
    if (!reserveForm.cityName || !reserveForm.barangayName) {
      setError("Please select city and barangay!");
      return;
    }
    setSavingAddress(true);
    try {
      const label =
        reserveForm.addressLabel || `Address ${savedAddresses.length + 1}`;
      await api.post("/buyer/addresses", {
        label,
        cityName: reserveForm.cityName,
        barangayName: reserveForm.barangayName,
        streetNo: reserveForm.streetNo,
      });
      await fetchAddresses();
      setReserveForm((prev) => ({ ...prev, addressLabel: "" }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address!");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await api.delete(`/buyer/addresses/${addrId}`);
      await fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReserve = async () => {
    if (!reserveForm.paymentMode) {
      setError("Please select a payment mode!");
      return;
    }
    const deliveryAddress = getDeliveryAddress();
    if (!deliveryAddress) {
      setError("Please select or enter a delivery address!");
      return;
    }
    try {
      await api.post("/buyer/reserve", {
        vehicleId: parseInt(id),
        deliveryAddress,
        deliveryNotes: reserveForm.deliveryNotes,
        paymentMode: reserveForm.paymentMode,
      });
      setSuccess("Reservation submitted!");
      setShowReserveModal(false);
      fetchVehicle();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reserve!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (!comment.trim()) {
      setReviewError("Please write a comment!");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      await api.post("/buyer/reviews", {
        vehicleId: parseInt(id),
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      setReviewSuccess("Review posted!");
      fetchReviews();
      setTimeout(() => setReviewSuccess(""), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to post review!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/buyer/reviews/${deleteTarget.id}`);
      setReviewSuccess("Review deleted!");
      setDeleteTarget(null);
      fetchReviews();
      setTimeout(() => setReviewSuccess(""), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to delete review!");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const StarRating = ({ value, onChange, size = 20 }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange && onChange(s);
          }}
        >
          <Star
            size={size}
            className={
              s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );

  const statusColor = (status) =>
    ({
      AVAILABLE: "bg-green-100 text-green-700",
      RESERVED: "bg-yellow-100 text-yellow-700",
      SOLD: "bg-gray-100 text-gray-500",
    })[status] || "bg-gray-100 text-gray-600";

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 animate-pulse">Loading vehicle...</p>
      </div>
    );

  if (!vehicle)
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Vehicle not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-red-600 font-semibold"
        >
          ← Go Back
        </button>
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-0">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition font-semibold text-sm"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}

      {/* Vehicle Card */}
      <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* ─── FIXED-SIZE MEDIA SECTION ──────────────────────────────────────
            The outer wrapper uses a fixed height (h-64 on mobile, h-80 on sm+).
            `overflow-hidden` ensures nothing inside can push the box taller.
            The image/video is absolutely positioned and fills the box while
            keeping its aspect ratio via object-contain.
        ──────────────────────────────────────────────────────────────────── */}
        {allMedia.length > 0 ? (
          <div className="bg-black">
            {/* Fixed-height viewport — NEVER grows with media */}
            <div className="relative w-full h-64 sm:h-80 overflow-hidden">
              {allMedia[currentImg]?.type === "image" ? (
                <img
                  src={getImageUrl(allMedia[currentImg].url)}
                  alt="vehicle"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <video
                  src={`${IMG_BASE}${allMedia[currentImg]?.url?.replace("/uploads", "")}`}
                  controls
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}

              {/* Prev / Next arrows */}
              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImg((i) =>
                        i === 0 ? allMedia.length - 1 : i - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImg((i) =>
                        i === allMedia.length - 1 ? 0 : i + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition z-10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Counter badge */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                {currentImg + 1} / {allMedia.length}
                {allMedia[currentImg]?.type === "video" && " 🎥"}
              </div>
            </div>

            {/* Thumbnail strip — fixed height, never affects main box */}
            {allMedia.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-gray-900 h-[72px] items-center">
                {allMedia.map((media, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                      currentImg === i
                        ? "border-red-500"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {media.type === "image" ? (
                      <img
                        src={getImageUrl(media.url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                        🎥
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback when no media — same fixed height */
          <div className="w-full h-64 sm:h-80 bg-gray-100 flex items-center justify-center">
            <Car size={80} className="text-gray-300" />
          </div>
        )}

        {/* Details */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {vehicle.year} • {vehicle.color} • {vehicle.categoryName}
              </p>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating
                    value={Math.round(vehicle.averageRating || 0)}
                    size={16}
                  />
                  <span className="text-sm text-gray-500">
                    ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                ₱{Number(vehicle.price).toLocaleString()}
              </p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${statusColor(vehicle.status)}`}
              >
                {vehicle.status}
              </span>
              {vehicle.quantity > 0 && vehicle.status === "AVAILABLE" && (
                <p className="text-xs text-gray-400 mt-1">
                  {vehicle.quantity} unit{vehicle.quantity !== 1 ? "s" : ""}{" "}
                  available
                </p>
              )}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              {
                label: "Condition",
                value: vehicle.condition?.replace(/_/g, " ") || "—",
              },
              { label: "Fuel Type", value: vehicle.fuelType || "—" },
              { label: "Transmission", value: vehicle.transmission || "—" },
              { label: "Body Type", value: vehicle.bodyType || "—" },
              {
                label: "Mileage",
                value: vehicle.mileage
                  ? `${Number(vehicle.mileage).toLocaleString()} km`
                  : "—",
              },
              {
                label: "Warranty",
                value: vehicle.warrantyYears
                  ? `${vehicle.warrantyYears} year(s)`
                  : "—",
              },
              { label: "Plate No.", value: vehicle.plateNumber || "—" },
              { label: "Engine No.", value: vehicle.engineNumber || "—" },
              { label: "Chassis No.", value: vehicle.chassisNumber || "—" },
              {
                label: "Units Available",
                value:
                  vehicle.quantity > 0
                    ? `${vehicle.quantity} unit(s)`
                    : "Out of Stock",
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-semibold uppercase">
                  {label}
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {vehicle.description && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-2">
                Description
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {vehicle.description}
              </p>
            </div>
          )}

          {vehicle.warrantyDetails && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-green-600 uppercase mb-1">
                Warranty Coverage
              </p>
              <p className="text-sm text-green-700">{vehicle.warrantyDetails}</p>
            </div>
          )}

          {vehicle.status === "AVAILABLE" &&
            isAuthenticated() &&
            user?.role === "BUYER" && (
              <button
                onClick={() => {
                  setReserveForm({
                    deliveryNotes: "",
                    paymentMode: "",
                    cityName: "",
                    barangayName: "",
                    streetNo: "",
                    addressLabel: "",
                  });
                  setError("");
                  setShowReserveModal(true);
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition"
              >
                Reserve This Vehicle
              </button>
            )}
          {!isAuthenticated() && vehicle.status === "AVAILABLE" && (
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition"
            >
              Login to Reserve
            </button>
          )}
          {vehicle.status !== "AVAILABLE" && (
            <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-center">
              {vehicle.status === "RESERVED"
                ? "🔒 Currently Reserved"
                : "✅ Already Sold"}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Reviews & Ratings
          {reviews.length > 0 && (
            <span className="ml-2 text-sm text-gray-400 font-normal">
              ({reviews.length})
            </span>
          )}
        </h2>

        {isAuthenticated() && user?.role === "BUYER" && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3"
          >
            <p className="text-sm font-semibold text-gray-700">
              Write a Review
            </p>
            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
                ⚠️ {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
                ✅ {reviewSuccess}
              </div>
            )}
            <div>
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-gray-400 mt-1">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              rows={3}
              placeholder="Share your experience with this vehicle..."
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </form>
        )}

        {!isAuthenticated() && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-sm text-gray-500">
              <button
                onClick={() => navigate("/login")}
                className="text-red-600 font-bold hover:underline"
              >
                Login
              </button>{" "}
              to write a review
            </p>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-sm">
              No reviews yet — be the first!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {r.buyerFirstName?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {r.buyerFirstName} {r.buyerLastName}
                    </p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={
                            s <= r.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {/* Delete — visible only on your own reviews */}
                  {isAuthenticated() && user?.role === "BUYER" &&
                   r.buyerEmail && user.email &&
                   r.buyerEmail === user.email && (
                    <button
                      onClick={() => setDeleteTarget(r)}
                      title="Delete my review"
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-600 ml-11">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Review Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete Review?</h3>
              <p className="text-sm text-gray-500">
                Your review will be permanently removed. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold disabled:opacity-60"
              >
                Keep It
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Reserve Vehicle
              </h3>
              <button
                onClick={() => setShowReserveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-gray-800">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-gray-500">
                  {vehicle.year} • ₱{Number(vehicle.price).toLocaleString()}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Payment Mode *
                </label>
                <select
                  value={reserveForm.paymentMode}
                  onChange={(e) =>
                    setReserveForm((prev) => ({
                      ...prev,
                      paymentMode: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                >
                  <option value="">Select Payment Mode</option>
                  {PAYMENT_MODES.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Delivery Address *
                </label>

                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(String(addr.id));
                          setShowNewAddressForm(false);
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                          selectedAddressId === String(addr.id) &&
                          !showNewAddressForm
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${
                            selectedAddressId === String(addr.id) &&
                            !showNewAddressForm
                              ? "border-red-500 bg-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {addr.label}
                              {addr.default && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                  Default
                                </span>
                              )}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {addr.streetNo ? addr.streetNo + ", " : ""}
                            {addr.barangayName}, {addr.cityName}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={() => {
                        setShowNewAddressForm(true);
                        setSelectedAddressId("");
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                        showNewAddressForm
                          ? "border-red-500 bg-red-50"
                          : "border-dashed border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          showNewAddressForm
                            ? "border-red-500 bg-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <p className="text-sm font-semibold text-gray-600">
                        + Add new address
                      </p>
                    </div>
                  </div>
                )}

                {(savedAddresses.length === 0 || showNewAddressForm) && (
                  <div className="space-y-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Address Label
                      </label>
                      <input
                        value={reserveForm.addressLabel}
                        onChange={(e) =>
                          setReserveForm((prev) => ({
                            ...prev,
                            addressLabel: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        placeholder={`Home, Office, Address ${savedAddresses.length + 1}...`}
                      />
                    </div>
                    <select
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    >
                      <option value="">Select City *</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={reserveForm.barangayName}
                      onChange={(e) =>
                        setReserveForm((prev) => ({
                          ...prev,
                          barangayName: e.target.value,
                        }))
                      }
                      disabled={!reserveForm.cityName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Select Barangay *</option>
                      {barangays.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={reserveForm.streetNo}
                      onChange={(e) =>
                        setReserveForm((prev) => ({
                          ...prev,
                          streetNo: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                      placeholder="Street / House No. (optional)"
                    />
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={handleSaveNewAddress}
                        disabled={savingAddress}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
                      >
                        {savingAddress
                          ? "Saving..."
                          : "💾 Save this address for future use"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Delivery Notes
                </label>
                <textarea
                  value={reserveForm.deliveryNotes}
                  onChange={(e) =>
                    setReserveForm((prev) => ({
                      ...prev,
                      deliveryNotes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  rows={2}
                  placeholder="Landmark, special instructions (optional)..."
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                ⚠️ Reservation expires in 48 hours. Admin will confirm your
                booking.
              </div>
            </div>

            <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowReserveModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReserve}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleDetail;