import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function validateAvatarFile(file) {
  if (!file) return 'Choose a photo to upload.';
  const type = (file.type || '').toLowerCase();
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const typeOk = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type);
  const extensionOk = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  if (type && type !== 'application/octet-stream' && !typeOk) {
    return 'Upload a JPEG, PNG, or WebP photo.';
  }
  if (!typeOk && !extensionOk) return 'Upload a JPEG, PNG, or WebP photo.';
  if (file.size > AVATAR_MAX_BYTES) return 'Profile photos must be 2 MB or smaller.';
  return '';
}

export function profileError(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== 'object') return 'Could not update your profile.';
  if (typeof data.detail === 'string') return data.detail;
  for (const value of Object.values(data)) {
    if (typeof value === 'string' && value) return value;
    if (Array.isArray(value) && value.length) return String(value[0]);
  }
  return 'Could not update your profile.';
}

export function buildProfileBody(fields, { file, removed }) {
  if (!file && !removed) return fields;
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value ?? ''));
  if (file) body.append('avatar', file);
  else body.append('clear_avatar', 'true');
  return body;
}

function blankForm(user) {
  return {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
  };
}

function phoneProblem(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(2);
  else if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  if (!/^01[3-9]\d{8}$/.test(digits)) {
    return 'Enter a Bangladeshi mobile number, such as 01712345678.';
  }
  return '';
}

export function useProfileForm(user, onSaved) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => blankForm(user));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  useEffect(() => {
    if (user && !editing) setFormData(blankForm(user));
  }, [user, editing]);

  function beginEdit() {
    setFormData(blankForm(user));
    setPhotoFile(null);
    setPhotoRemoved(false);
    setEditing(true);
  }

  function cancelEdit() {
    setFormData(blankForm(user));
    setPhotoFile(null);
    setPhotoRemoved(false);
    setEditing(false);
  }

  function onSelectPhoto(file) {
    const message = validateAvatarFile(file);
    if (message) {
      toast.error(message);
      return;
    }
    setPhotoFile(file);
    setPhotoRemoved(false);
  }

  function onRemovePhoto() {
    setPhotoFile(null);
    setPhotoRemoved(true);
  }

  async function save() {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('Enter your first and last name.');
      return;
    }
    const phoneMessage = phoneProblem(formData.phone);
    if (phoneMessage) {
      toast.error(phoneMessage);
      return;
    }
    setLoading(true);
    try {
      await authAPI.updateProfile(
        buildProfileBody(formData, { file: photoFile, removed: photoRemoved }),
      );
      if (onSaved) await onSaved();
      setPhotoFile(null);
      setPhotoRemoved(false);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(profileError(error));
    } finally {
      setLoading(false);
    }
  }

  return {
    editing,
    loading,
    formData,
    setFormData,
    photoFile,
    photoRemoved,
    beginEdit,
    cancelEdit,
    onSelectPhoto,
    onRemovePhoto,
    save,
  };
}
