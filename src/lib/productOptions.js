// Shoppers never see stock counts; the server checks real stock when items are added.
export const MAX_ORDER_QUANTITY = 99;

function unique(values) {
  const seen = [];
  values.forEach((value) => {
    const label = String(value || '').trim();
    if (label && !seen.includes(label)) seen.push(label);
  });
  return seen;
}

export function variantChoices(variant) {
  if (Array.isArray(variant?.options) && variant.options.length) {
    return variant.options.map((option) => ({
      name: option.name,
      label: option.label,
    }));
  }
  const choices = [];
  if (variant?.size) choices.push({ name: 'Size', label: variant.size });
  if (variant?.color) choices.push({ name: 'Color', label: variant.color });
  return choices;
}

function isColorGroup(group) {
  return group?.kind === 'swatch' || /\bcolou?rs?\b/i.test(String(group?.name || '').trim());
}

export function selectionGroups(product) {
  const defined = Array.isArray(product?.option_groups) ? product.option_groups : [];
  if (defined.length) {
    return defined
      .map((group) => ({
        name: group.name,
        kind: isColorGroup(group) ? 'swatch' : 'text',
        required: true,
        values: (group.values || [])
          .map((value) => ({ label: value.label, colorHex: value.color_hex || '' }))
          .filter((value) => value.label),
      }))
      .filter((group) => group.name && group.values.length);
  }

  const variants = product?.variants || [];
  const groups = [];
  const sizes = unique(variants.map((variant) => variant.size));
  const colors = unique(variants.map((variant) => variant.color));
  if (sizes.length) {
    groups.push({
      name: 'Size',
      kind: 'text',
      required: true,
      values: sizes.map((label) => ({ label, colorHex: '' })),
    });
  }
  if (colors.length) {
    groups.push({
      name: 'Color',
      kind: 'swatch',
      required: true,
      values: colors.map((label) => ({ label, colorHex: '' })),
    });
  }
  if (!groups.length && product?.color) {
    groups.push({
      name: 'Color',
      kind: 'swatch',
      required: false,
      values: [{ label: product.color, colorHex: '' }],
    });
  }
  return groups;
}

function isSellableVariant(variant) {
  return variant?.is_active !== false;
}

function isInStock(variant) {
  return variant.availability !== 'out_of_stock';
}

export function availableLabels(group, groups, variants, selected) {
  if (!variants.length) return group.values.map((value) => value.label);
  const sellable = variants.filter(isSellableVariant);
  if (!sellable.length) return [];
  const labels = group.values.filter((value) => sellable.some((variant) => {
    const choices = variantChoices(variant);
    if (!choices.some((choice) => choice.name === group.name && choice.label === value.label)) return false;
    return groups.every((other) => {
      if (other.name === group.name || !other.required) return true;
      const picked = selected[other.name];
      if (!picked) return true;
      return choices.some((choice) => choice.name === other.name && choice.label === picked);
    });
  })).map((value) => value.label);
  return labels;
}

export function optionParts(item) {
  if (Array.isArray(item?.options) && item.options.length) {
    return item.options
      .map((option) => `${option.name}: ${option.label}`)
      .filter((part) => part.trim() !== ':');
  }
  const parts = [];
  if (item?.size) parts.push(`Size: ${item.size}`);
  if (item?.color) parts.push(`Color: ${item.color}`);
  return parts;
}

export function matchedVariant(groups, variants, selected) {
  const required = groups.filter((group) => group.required);
  const active = variants.filter(isSellableVariant);
  if (!active.length) return null;
  if (required.some((group) => !selected[group.name])) return null;
  if (!required.length) {
    return active.find(isInStock) || active[0];
  }
  const matches = active.filter((variant) => {
    const choices = variantChoices(variant);
    return required.every((group) => choices.some((choice) => (
      choice.name === group.name && choice.label === selected[group.name]
    )));
  });
  return matches.find(isInStock) || matches[0] || null;
}

function itemsForVariantIds(all, ids) {
  if (!ids?.size) return [];
  return all.filter((item) => item.variant && ids.has(String(item.variant)));
}

/** Active variants whose options include every currently picked label. */
export function candidateVariants(product, selected = {}) {
  const picks = Object.entries(selected || {}).filter(([, label]) => String(label || '').trim());
  const active = (product?.variants || []).filter((variant) => variant.is_active !== false);
  if (!picks.length) return active;
  return active.filter((variant) => {
    const choices = variantChoices(variant);
    return picks.every(([name, label]) => (
      choices.some((choice) => choice.name === name && choice.label === label)
    ));
  });
}

function colorLinkedItems(all, variants, selected = {}) {
  const colorPick = Object.entries(selected || {}).find(([name, label]) => (
    String(label || '').trim() && /\bcolou?rs?\b/i.test(String(name || ''))
  ));
  if (!colorPick) return [];
  const [colorName, colorLabel] = colorPick;
  const siblingIds = new Set(
    (variants || [])
      .filter((variant) => variantChoices(variant).some((choice) => (
        choice.name === colorName && choice.label === colorLabel
      )))
      .map((variant) => String(variant.id)),
  );
  return itemsForVariantIds(all, siblingIds);
}

/** Filter images or videos by exact / partial / shared variant scope. */
export function scopedGalleryItems(all, product, chosen, selected = {}) {
  const items = Array.isArray(all) ? all : [];
  if (!items.length) return [];
  const shared = items.filter((item) => !item.variant);

  if (chosen?.id) {
    const exact = items.filter((item) => String(item.variant) === String(chosen.id));
    if (exact.length) return exact;

    const byColor = colorLinkedItems(items, product?.variants, {
      ...selected,
      ...Object.fromEntries(
        variantChoices(chosen)
          .filter((choice) => /\bcolou?rs?\b/i.test(choice.name))
          .map((choice) => [choice.name, choice.label]),
      ),
    });
    if (byColor.length) return byColor;
    return shared.length ? shared : items;
  }

  const hasPicks = Object.values(selected || {}).some((label) => String(label || '').trim());
  if (hasPicks) {
    const candidates = candidateVariants(product, selected);
    const candidateIds = new Set(candidates.map((variant) => String(variant.id)));
    const forCandidates = itemsForVariantIds(items, candidateIds);
    if (forCandidates.length) return forCandidates;

    const byColor = colorLinkedItems(items, product?.variants, selected);
    if (byColor.length) return byColor;
  }

  return shared.length ? shared : items;
}

/**
 * Images for the product gallery.
 * Prefer exact matched variant, then images for the current (possibly partial)
 * option picks / same color, then shared images, then the full set.
 */
export function galleryForSelection(product, chosen, selected = {}) {
  const scoped = scopedGalleryItems(product?.images, product, chosen, selected);
  if (scoped.length) return scoped;
  return [{ image: product?.primary_image || '/images/placeholder.svg' }];
}

/** Mixed gallery slides: images first, then YouTube videos for the selection. */
export function galleryMediaForSelection(product, chosen, selected = {}) {
  const images = scopedGalleryItems(product?.images, product, chosen, selected);
  const videos = scopedGalleryItems(product?.videos, product, chosen, selected);
  const imageSlides = images.length
    ? images
    : (product?.primary_image ? [{ image: product.primary_image }] : []);
  const media = [
    ...imageSlides.map((item, index) => ({
      type: 'image',
      key: `image-${item.id || item.image || index}`,
      ...item,
    })),
    ...videos.map((item, index) => ({
      type: 'video',
      key: `video-${item.id || item.youtube_id || index}`,
      ...item,
    })),
  ];
  if (media.length) return media;
  return [{ type: 'image', key: 'placeholder', image: '/images/placeholder.svg' }];
}
