import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck, CheckCircle2, FileText, ImagePlus, Upload, UserRound, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { careersAPI } from '@/lib/api';

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  university: '',
  session: '',
  department: '',
  student_id: '',
};

const PICTURE_MAX = 2 * 1024 * 1024;
const CV_MAX = 5 * 1024 * 1024;
const PICTURE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function normalizeBdMobile(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(2);
  else if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  return digits;
}

function requiredText(value, message, max = 200) {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return message;
  if (cleaned.length > max) return `Use ${max} characters or fewer.`;
  return '';
}

function pictureProblem(file) {
  if (!file) return 'Choose a photo to upload.';
  if (!file.size) return 'Choose a photo to upload.';
  const type = (file.type || '').toLowerCase();
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const typeOk = PICTURE_TYPES.includes(type);
  const extensionOk = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  if ((type && type !== 'application/octet-stream' && !typeOk) || (!typeOk && !extensionOk)) {
    return 'Upload a JPEG, PNG, or WebP photo.';
  }
  if (file.size > PICTURE_MAX) return 'Photos must be 2 MB or smaller.';
  return '';
}

function cvProblem(file) {
  if (!file) return 'Choose a CV to upload.';
  if (!file.size) return 'Choose a CV to upload.';
  const type = (file.type || '').toLowerCase();
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const looksPdf = extension === 'pdf' || type === 'application/pdf';
  if (!looksPdf || (type && type !== 'application/pdf' && type !== 'application/octet-stream')) {
    return 'Upload your CV as a PDF. Word files are not accepted.';
  }
  if (file.size > CV_MAX) return 'CV must be 5 MB or smaller.';
  return '';
}

function studentIdProblem(value) {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
  if (!/^[A-Za-z0-9][A-Za-z0-9 \-]{2,30}[A-Za-z0-9]$/.test(cleaned)) {
    return 'Enter a student ID of 4 to 32 letters, numbers, spaces, or hyphens.';
  }
  return '';
}

function validate(fields, picture, cv) {
  return {
    name: requiredText(fields.name, 'Enter your name.'),
    phone: /^01[3-9]\d{8}$/.test(normalizeBdMobile(fields.phone))
      ? ''
      : 'Enter a Bangladeshi mobile number, such as 01712345678.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fields.email || '').trim())
      ? ''
      : 'Enter a valid email address.',
    university: requiredText(fields.university, 'Enter your university.'),
    session: requiredText(fields.session, 'Enter your session.'),
    department: requiredText(fields.department, 'Enter your department.'),
    student_id: studentIdProblem(fields.student_id),
    picture: pictureProblem(picture),
    cv: cvProblem(cv),
  };
}

function apiFieldErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const mapped = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'message' || key === 'detail') return;
    if (Array.isArray(value) && value.length) mapped[key] = String(value[0]);
    else if (typeof value === 'string' && value) mapped[key] = value;
  });
  return mapped;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-secondary-700">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-charcoal-500">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function inputClass(error) {
  return error ? 'input border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'input';
}

export default function CareersPage() {
  const [fields, setFields] = useState(EMPTY);
  const [picture, setPicture] = useState(null);
  const [pictureUrl, setPictureUrl] = useState('');
  const [cv, setCv] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pictureRef = useRef(null);
  const cvRef = useRef(null);

  useEffect(() => {
    if (!picture) {
      setPictureUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(picture);
    setPictureUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [picture]);

  function setField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  function choosePicture(file) {
    const problem = file ? pictureProblem(file) : '';
    if (problem) {
      setErrors((current) => ({ ...current, picture: problem }));
      return;
    }
    setPicture(file);
    setErrors((current) => ({ ...current, picture: '' }));
  }

  function chooseCv(file) {
    const problem = file ? cvProblem(file) : '';
    if (problem) {
      setErrors((current) => ({ ...current, cv: problem }));
      if (cvRef.current) cvRef.current.value = '';
      return;
    }
    setCv(file);
    setErrors((current) => ({ ...current, cv: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(fields, picture, cv);
    const invalid = Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    setFormError('');
    if (invalid) {
      toast.error('Check the highlighted fields and try again.');
      return;
    }

    const body = new FormData();
    Object.entries(fields).forEach(([key, value]) => body.append(key, value.trim().replace(/\s+/g, ' ')));
    body.set('phone', normalizeBdMobile(fields.phone));
    body.set('email', fields.email.trim().toLowerCase());
    body.append('picture', picture);
    body.append('cv', cv);

    setLoading(true);
    try {
      await careersAPI.submitApplication(body);
      setSubmitted(true);
    } catch (error) {
      const status = error?.response?.status;
      const fieldMessages = apiFieldErrors(error);
      if (Object.keys(fieldMessages).length) {
        setErrors((current) => ({ ...current, ...fieldMessages }));
        toast.error('Check the highlighted fields and try again.');
      } else if (status === 429) {
        const message = 'Please wait a little while before sending another application.';
        setFormError(message);
        toast.error(message);
      } else {
        const message = error?.response?.data?.detail
          || error?.response?.data?.message
          || 'Could not send your application. Please try again.';
        setFormError(typeof message === 'string' ? message : 'Could not send your application. Please try again.');
        toast.error(typeof message === 'string' ? message : 'Could not send your application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function startAnother() {
    setFields(EMPTY);
    setPicture(null);
    setCv(null);
    setErrors({});
    setFormError('');
    setSubmitted(false);
  }

  return (
    <Layout
      title="Career Opportunities - Pickorbeet"
      description="Students can apply to Pickorbeet with their university details, portrait, and CV."
    >
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,134,31,0.35),transparent_46%)]" />
        <div className="container-custom relative py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-300">Students</p>
            <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Career Opportunities</h1>
            <p className="mt-4 max-w-2xl text-lg text-navy-100">
              Apply with your university details. We read every application and write back by email.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream-200 py-12 md:py-16">
        <div className="container-custom grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-24">
            {[
              [UserRound, 'No account needed', 'Send the form once. We will contact you at the email and phone you provide.'],
              [ImagePlus, 'A clear portrait', 'JPEG, PNG, or WebP, up to 2 MB.'],
              [FileText, 'CV as a PDF', 'Up to 5 MB. Export Word files to PDF before uploading.'],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="rounded-2xl border border-cream-400 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-charcoal-900">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-charcoal-500">{copy}</p>
              </div>
            ))}
          </aside>

          {submitted ? (
            <div className="order-1 rounded-3xl border border-cream-400 bg-white px-6 py-16 text-center shadow-xl md:px-12 lg:order-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-bold text-charcoal-900">Application received</h2>
              <p className="mx-auto mt-3 max-w-md text-charcoal-500">
                Thank you{fields.name ? `, ${fields.name.split(' ')[0]}` : ''}. We have your details and will be in touch.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/" className="btn btn-primary">Back to Pickorbeet</Link>
                <button type="button" onClick={startAnother} className="btn btn-outline-dark">
                  Submit another application
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="order-1 rounded-3xl border border-cream-400 bg-white p-6 shadow-xl md:p-8 lg:order-2"
            >
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-charcoal-900">Student application</h2>
                <p className="mt-1 text-sm text-charcoal-500">
                  All fields are required. We use them only to review your application.
                </p>
              </div>

              {formError ? (
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>
              ) : null}

              <fieldset className="space-y-5">
                <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">
                  About you
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field id="name" label="Name" error={errors.name}>
                    <input id="name" name="name" value={fields.name} onChange={setField} className={inputClass(errors.name)} placeholder="Your full name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
                  </Field>
                  <Field id="phone" label="Phone" error={errors.phone} hint="A Bangladeshi mobile number.">
                    <input id="phone" name="phone" value={fields.phone} onChange={setField} className={inputClass(errors.phone)} placeholder="01712345678" autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                  </Field>
                </div>
                <Field id="email" label="Email" error={errors.email}>
                  <input id="email" name="email" type="email" value={fields.email} onChange={setField} className={inputClass(errors.email)} placeholder="you@university.edu" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
                </Field>
              </fieldset>

              <fieldset className="mt-8 space-y-5 border-t border-cream-400 pt-8">
                <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">
                  Academics
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field id="university" label="University" error={errors.university}>
                    <input id="university" name="university" value={fields.university} onChange={setField} className={inputClass(errors.university)} placeholder="University of Dhaka" aria-invalid={Boolean(errors.university)} />
                  </Field>
                  <Field id="session" label="Session" error={errors.session} hint="Your admission session.">
                    <input id="session" name="session" value={fields.session} onChange={setField} className={inputClass(errors.session)} placeholder="2022-23" aria-invalid={Boolean(errors.session)} />
                  </Field>
                  <Field id="department" label="Department" error={errors.department}>
                    <input id="department" name="department" value={fields.department} onChange={setField} className={inputClass(errors.department)} placeholder="Computer Science and Engineering" aria-invalid={Boolean(errors.department)} />
                  </Field>
                  <Field id="student_id" label="Student ID" error={errors.student_id} hint="As printed on your university ID, for example 2021-1-60-123.">
                    <input id="student_id" name="student_id" value={fields.student_id} onChange={setField} className={inputClass(errors.student_id)} placeholder="2021-1-60-123" aria-invalid={Boolean(errors.student_id)} />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="mt-8 space-y-5 border-t border-cream-400 pt-8">
                <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">
                  Documents
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-secondary-700">Picture</p>
                    <div className={`flex items-center gap-4 rounded-2xl border bg-cream-100 p-4 ${errors.picture ? 'border-red-400' : 'border-cream-400'}`}>
                      <button
                        type="button"
                        onClick={() => pictureRef.current?.click()}
                        className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-navy-500 shadow-sm"
                        aria-label={picture ? 'Replace portrait' : 'Add a portrait'}
                      >
                        {pictureUrl ? (
                          <img src={pictureUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlus className="h-7 w-7" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <button type="button" onClick={() => pictureRef.current?.click()} className="text-sm font-semibold text-navy-700">
                          {picture ? 'Replace photo' : 'Add a portrait'}
                        </button>
                        <p className="mt-1 text-xs text-charcoal-500">JPEG, PNG, or WebP. 2 MB maximum.</p>
                        {picture ? (
                          <button
                            type="button"
                            onClick={() => choosePicture(null)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-charcoal-500 hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" /> Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <input
                      ref={pictureRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        choosePicture(event.target.files?.[0] || null);
                        event.target.value = '';
                      }}
                    />
                    {errors.picture ? <p className="mt-1.5 text-xs text-red-600">{errors.picture}</p> : null}
                  </div>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-secondary-700">CV</p>
                    <button
                      type="button"
                      onClick={() => cvRef.current?.click()}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        chooseCv(event.dataTransfer.files?.[0] || null);
                      }}
                      className={`flex min-h-[122px] w-full items-center gap-4 rounded-2xl border border-dashed bg-cream-100 p-4 text-left ${
                        errors.cv ? 'border-red-400' : dragging ? 'border-gold-500 bg-gold-50' : 'border-cream-500'
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-navy-600 shadow-sm">
                        {cv ? <FileText className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-charcoal-900">
                          {cv ? cv.name : 'Drop your CV here'}
                        </span>
                        <span className="mt-1 block text-xs text-charcoal-500">
                          {cv ? formatSize(cv.size) : 'PDF only, up to 5 MB'}
                        </span>
                      </span>
                    </button>
                    <input
                      ref={cvRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(event) => {
                        chooseCv(event.target.files?.[0] || null);
                        event.target.value = '';
                      }}
                    />
                    {cv ? (
                      <button
                        type="button"
                        onClick={() => setCv(null)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-charcoal-500 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" /> Remove CV
                      </button>
                    ) : null}
                    {errors.cv ? <p className="mt-1.5 text-xs text-red-600">{errors.cv}</p> : null}
                  </div>
                </div>
              </fieldset>

              <div className="mt-8 flex flex-col gap-3 border-t border-cream-400 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-charcoal-500">
                  <BadgeCheck className="h-4 w-4 text-navy-500" />
                  Your CV and photo stay private to our team.
                </p>
                <button type="submit" className="btn btn-primary min-w-[180px]" disabled={loading}>
                  {loading ? 'Sending…' : 'Submit application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
