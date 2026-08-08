(async function (global) {
  "use strict";
  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY
  };

  function rupiah(n) {
    return "Rp" + (parseInt(n, 10) || 0).toLocaleString("id-ID");
  }

  function mapRow(row) {
    return {
      id: row.id,
      type: row.type,
      weight: row.weight,
      category: row.category,
      price: row.price,
      oldPrice: row.old_price,
      discount: row.discount,
      title: row.title,
      seed: row.seed,
      sold: row.sold,
      rating: Number(row.rating),
      shortDesc: row.short_desc,
      description: row.description,
      highlights: row.highlights || [],
      specs: row.specs || {},
      images: row.images || [],
      variantGroups: row.variant_groups || [],
      variantPricing: row.variant_pricing || {},
      isBest: row.is_best === true,
      isRekomendasi: row.is_rekomendasi === true
    };
  }

  var PRODUCTS = [];
  var CATEGORY_LABELS = {};

  try {
    var results = await Promise.all([
      fetch(SUPABASE_URL + "/rest/v1/products?select=*&order=id.asc", { headers: SUPABASE_HEADERS }),
      fetch(SUPABASE_URL + "/rest/v1/product_categories?select=*&order=sort_order.asc", { headers: SUPABASE_HEADERS })
    ]);

    var prodRows = results[0].ok ? await results[0].json() : [];
    var catRows = results[1].ok ? await results[1].json() : [];

    PRODUCTS = prodRows.map(mapRow);
    catRows.forEach(function (c) { CATEGORY_LABELS[c.key] = c.label; });
  } catch (e) {
    console.error("Gagal memuat produk dari Supabase:", e);
  }

  PRODUCTS.forEach(function (p) {
    p.categoryLabel = CATEGORY_LABELS[p.category] || p.category;
  });

  function getById(id) {
    var numId = parseInt(id, 10);
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === numId) return PRODUCTS[i];
    }
    return null;
  }

  function getRelated(product, limit) {
    limit = limit || 4;
    var related = PRODUCTS.filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    });
    if (related.length < limit) {
      PRODUCTS.forEach(function (p) {
        if (related.length >= limit) return;
        if (p.id !== product.id && related.indexOf(p) === -1) related.push(p);
      });
    }
    return related.slice(0, limit);
  }

  function getBestSellers() {
    return PRODUCTS.filter(function (p) { return p.isBest === true; })
      .sort(function (a, b) { return b.sold - a.sold; });
  }

  function getRekomendasi() {
    return PRODUCTS.filter(function (p) { return p.isRekomendasi === true; })
      .sort(function (a, b) { return b.sold - a.sold; })
      .slice(0, 8);
  }

  global.PRODUCTS_DATA = {
    all: PRODUCTS,
    categoryLabels: CATEGORY_LABELS,
    getById: getById,
    getRelated: getRelated,
    getBestSellers: getBestSellers,
    getRekomendasi: getRekomendasi,
    rupiah: rupiah
  };

  document.dispatchEvent(new CustomEvent("products-data:ready"));
})(window);
