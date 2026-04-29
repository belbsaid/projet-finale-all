/**
 * Public-safe car serialization helpers.
 * These prevent accidental exposure of sensitive fields like
 * costPriceDZD, internalNotes, createdBy, and updatedBy.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Serialize a populated car document for public consumption.
 * EXCLUDES: costPriceDZD, sellingPriceDZD, discountDZD,
 *           internalNotes, createdBy, updatedBy, documents
 */
export function serializePublicCar(car: any, lang: string = "fr") {
  const brand = car.brand;
  const model = car.model;
  const category = car.category;

  return {
    id: car._id?.toString() ?? car.id,
    brand: brand
      ? {
          id: brand._id?.toString(),
          name: brand.name,
          displayName:
            lang === "ar" && brand.nameAr ? brand.nameAr : brand.name,
          logo: brand.logo,
          origin: brand.origin,
        }
      : null,
    model: model
      ? {
          id: model._id?.toString(),
          name: model.name,
          displayName:
            lang === "ar" && model.nameAr ? model.nameAr : model.name,
          year: model.year,
          engine: model.engine,
          transmission: model.transmission,
          fuelType: model.fuelType,
          features: model.features,
        }
      : null,
    category: category
      ? {
          id: category._id?.toString(),
          name: category.name,
          displayName:
            lang === "ar" && category.nameAr ? category.nameAr : category.name,
        }
      : null,
    year: car.year,
    vin: car.vin || null,
    stockNumber: car.stockNumber,
    color: car.color,
    colorCode: car.colorCode,
    mileage: car.mileage,
    finalPriceDZD: car.finalPriceDZD,
    isDiscounted: car.discountDZD > 0,
    status: car.status,
    arrivalDate: car.arrivalDate,
    expectedDeliveryDate: car.expectedDeliveryDate,
    soldDate: car.soldDate,
    specs: car.specs,
    features: car.features,
    photos: car.photos,
    videos: car.videos,
    customerNotes: car.customerNotes,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
    statusHistory: Array.isArray(car.statusHistory) 
      ? car.statusHistory.map((h: any) => ({
          status: h.status,
          date: h.date,
          note: h.note,
        }))
      : [],
    // EXCLUDED: costPriceDZD, sellingPriceDZD, discountDZD,
    //           internalNotes, createdBy, updatedBy, documents
  };
}

/**
 * Serialize a car for the minimal public VIN lookup.
 * Returns only the bare essentials needed for public tracking.
 */
export function serializeVinPublic(car: any) {
  const brand = car.brand;
  const model = car.model;

  return {
    status: car.status,
    stockNumber: car.stockNumber,
    brand: brand ? { name: brand.name } : null,
    model: model ? { name: model.name } : null,
    finalPriceDZD: car.finalPriceDZD,
  };
}

/**
 * Serialize a car for the protected VIN lookup.
 * Returns richer data for authenticated users, but still
 * excludes admin-only fields.
 */
export function serializeVinProtected(car: any, lang: string = "fr") {
  return {
    ...serializePublicCar(car, lang),
    expectedDeliveryDate: car.expectedDeliveryDate,
    customerNotes: car.customerNotes,
  };
}

/**
 * Serialize a car for static generation (Next.js SSG).
 * Returns only the minimal fields needed for generateStaticParams.
 */
export function serializeCarForStatic(car: any) {
  return {
    id: car._id?.toString() ?? car.id,
    stockNumber: car.stockNumber,
    slug: car.stockNumber?.toLowerCase().replace(/\s+/g, "-"),
    updatedAt: car.updatedAt,
  };
}

/**
 * Serialize a car for the customer dashboard / VIN lookup.
 * Returns only public-safe fields relevant to a customer.
 */
export function serializeCustomerCar(car: any) {
  const brand = car.brand;
  const model = car.model;

  return {
    id: car._id?.toString() ?? car.id,
    vin: car.vin || null,
    stockNumber: car.stockNumber,
    status: car.status,
    brand: brand
      ? {
          name: brand.name,
          logo: brand.logo,
        }
      : null,
    model: model
      ? {
          name: model.name,
          year: model.year,
        }
      : null,
    color: car.color,
    finalPriceDZD: car.finalPriceDZD,
    expectedDeliveryDate: car.expectedDeliveryDate,
    arrivalDate: car.arrivalDate,
    soldDate: car.soldDate,
    customerNotes: car.customerNotes,
    warranty: car.specs?.warranty ?? null,
    statusHistory: Array.isArray(car.statusHistory) 
      ? car.statusHistory.map((h: any) => ({
          status: h.status,
          date: h.date,
          note: h.note,
        }))
      : [],
  };
}
