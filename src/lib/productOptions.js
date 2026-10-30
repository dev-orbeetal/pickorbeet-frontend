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

export function availableLabels(group, groups, variants, selected) {
  if (!variants.length) return group.values.map((value) => value.label);
  const labels = group.values.filter((value) => variants.some((variant) => {
    if (variant.is_active === false) return false;
    const choices = variantChoices(variant);
    if (!choices.some((choice) => choice.name === group.name && choice.label === value.label)) return false;
    return groups.every((other) => {
      if (other.name === group.name || !other.required) return true;
      const picked = selected[other.name];
      if (!picked) return true;
      return choices.some((choice) => choice.name === other.name && choice.label === picked);
    });
  })).map((value) => value.label);
  return labels.length ? labels : group.values.map((value) => value.label);
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
  const active = variants.filter((variant) => variant.is_active !== false);
  if (!active.length) return null;
  if (required.some((group) => !selected[group.name])) return null;
  if (!required.length) {
    return active.find((variant) => Number(variant.stock_quantity) > 0) || active[0];
  }
  const matches = active.filter((variant) => {
    const choices = variantChoices(variant);
    return required.every((group) => choices.some((choice) => (
      choice.name === group.name && choice.label === selected[group.name]
    )));
  });
  return matches.find((variant) => Number(variant.stock_quantity) > 0) || matches[0] || null;
}
