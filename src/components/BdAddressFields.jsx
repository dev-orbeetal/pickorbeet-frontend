'use client';

import { useEffect, useMemo, useState } from 'react';
import { geoAPI } from '@/lib/api';

const selectClass =
  'mt-1 h-11 w-full rounded-xl border border-[#E3E8F1] bg-[#F7F9FC] px-3 text-[#051340] outline-none focus:border-[#0040EE]';
const labelClass = 'mt-2.5 block text-sm font-medium text-[#3C4660]';

/**
 * Cascading Division → District → Post office, plus free-text City.
 * Expects value shape: { division, district, post_office, postal_code, city }
 */
export default function BdAddressFields({
  value,
  onChange,
  prefix = '',
  fieldClassName = selectClass,
  labelClassName = labelClass,
  cityLabel = 'City / locality',
  required = true,
}) {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [postOffices, setPostOffices] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingOffices, setLoadingOffices] = useState(false);

  const division = value?.division || '';
  const district = value?.district || '';
  const postOffice = value?.post_office || '';
  const postalCode = value?.postal_code || '';
  const city = value?.city || '';

  const selectedDivision = useMemo(
    () => divisions.find((item) => item.name === division || item.slug === division),
    [divisions, division],
  );
  const selectedDistrict = useMemo(
    () => districts.find((item) => item.name === district || item.slug === district),
    [districts, district],
  );

  useEffect(() => {
    let cancelled = false;
    setLoadingDivisions(true);
    geoAPI
      .divisions()
      .then((response) => {
        if (!cancelled) setDivisions(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) setDivisions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDivisions(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDivision?.id && !division) {
      setDistricts([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingDistricts(true);
    const key = selectedDivision?.slug || selectedDivision?.id || division;
    geoAPI
      .districts(key)
      .then((response) => {
        if (!cancelled) setDistricts(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) setDistricts([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDistricts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDivision?.id, selectedDivision?.slug, division]);

  useEffect(() => {
    if (!selectedDistrict?.id && !district) {
      setPostOffices([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingOffices(true);
    const key = selectedDistrict?.slug || selectedDistrict?.id || district;
    geoAPI
      .postOffices(key)
      .then((response) => {
        if (!cancelled) setPostOffices(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) setPostOffices([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOffices(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict?.id, selectedDistrict?.slug, district]);

  const patch = (next) => onChange({ ...value, ...next });

  const idPrefix = prefix || 'bd';

  return (
    <div>
      <label className={labelClassName} htmlFor={`${idPrefix}-division`}>
        Division
        <select
          id={`${idPrefix}-division`}
          className={fieldClassName}
          value={selectedDivision?.slug || ''}
          required={required}
          disabled={loadingDivisions}
          onChange={(event) => {
            const next = divisions.find((item) => item.slug === event.target.value);
            patch({
              division: next?.name || '',
              district: '',
              post_office: '',
              postal_code: '',
            });
          }}
        >
          <option value="">{loadingDivisions ? 'Loading…' : 'Select division'}</option>
          {divisions.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClassName} htmlFor={`${idPrefix}-district`}>
        District
        <select
          id={`${idPrefix}-district`}
          className={fieldClassName}
          value={selectedDistrict?.slug || ''}
          required={required}
          disabled={!division || loadingDistricts}
          onChange={(event) => {
            const next = districts.find((item) => item.slug === event.target.value);
            patch({
              district: next?.name || '',
              post_office: '',
              postal_code: '',
            });
          }}
        >
          <option value="">
            {!division ? 'Select division first' : loadingDistricts ? 'Loading…' : 'Select district'}
          </option>
          {districts.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClassName} htmlFor={`${idPrefix}-post-office`}>
        Post office
        <select
          id={`${idPrefix}-post-office`}
          className={fieldClassName}
          value={postOffice && postalCode ? `${postOffice}|||${postalCode}` : ''}
          required={required}
          disabled={!district || loadingOffices}
          onChange={(event) => {
            const [name, code] = event.target.value.split('|||');
            patch({
              post_office: name || '',
              postal_code: code || '',
            });
          }}
        >
          <option value="">
            {!district ? 'Select district first' : loadingOffices ? 'Loading…' : 'Select post office'}
          </option>
          {postOffices.map((item) => (
            <option key={item.id} value={`${item.name}|||${item.postal_code}`}>
              {item.name} ({item.postal_code})
            </option>
          ))}
        </select>
      </label>

      <label className={labelClassName} htmlFor={`${idPrefix}-city`}>
        {cityLabel}
        <input
          id={`${idPrefix}-city`}
          className={fieldClassName}
          value={city}
          required={required}
          placeholder="Area, locality, or neighbourhood"
          onChange={(event) => patch({ city: event.target.value })}
        />
      </label>
    </div>
  );
}
