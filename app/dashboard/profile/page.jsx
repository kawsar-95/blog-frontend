"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { userService } from "@/services/user.service";
import { validateProfile, validatePasswordChange, validateImage } from "@/utils/validators";
import Avatar from "@/components/Avatar";
import { Spinner } from "@/components/Loader";

export default function ProfilePage() {
  const { user, profileImage, refreshProfile } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Image upload state
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Password state
  const [pw, setPw] = useState({ password: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    setForm({ firstName: user?.firstName || "", lastName: user?.lastName || "" });
  }, [user]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    const errs = validateProfile(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await userService.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      await refreshProfile();
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  function pickFile(f) {
    const err = validateImage(f);
    if (err) {
      toast.error(err);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function uploadImage() {
    if (!file) return;
    setUploading(true);
    try {
      await userService.uploadImage(file);
      await refreshProfile();
      toast.success("Profile image updated");
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      toast.error(e?.message || "Could not upload image");
    } finally {
      setUploading(false);
    }
  }

  function updatePw(k, v) {
    setPw((p) => ({ ...p, [k]: v }));
    setPwErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function changePassword(e) {
    e.preventDefault();
    const errs = validatePasswordChange(pw);
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setPwSaving(true);
    try {
      await userService.changePassword(pw.password);
      toast.success("Password changed");
      setPw({ password: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e?.message || "Could not change password");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-800">Profile Image</h2>
        <p className="text-sm text-slate-500">JPG/PNG up to 2 MB.</p>
        <div className="mt-5 flex items-center gap-5">
          <Avatar src={preview || profileImage} name={[user?.firstName, user?.lastName].join(" ")} size={88} />
          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => pickFile(e.target.files?.[0])}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
            <button
              type="button"
              className="btn-primary mt-3"
              disabled={!file || uploading}
              onClick={uploadImage}
            >
              {uploading ? <><Spinner size={14} /> Uploading...</> : "Upload"}
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-800">Account Information</h2>
        <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">First Name</label>
            <input className="input" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label className="label">Last Name</label>
            <input className="input" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={user?.email || ""} readOnly />
            <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input bg-slate-50" value={user?.role || ""} readOnly />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={saving}>
              {saving ? <><Spinner size={14} /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
        <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pw.password} onChange={(e) => updatePw("password", e.target.value)} />
            {pwErrors.password && <p className="mt-1 text-xs text-red-600">{pwErrors.password}</p>}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input" value={pw.confirmPassword} onChange={(e) => updatePw("confirmPassword", e.target.value)} />
            {pwErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.confirmPassword}</p>}
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={pwSaving}>
              {pwSaving ? <><Spinner size={14} /> Updating...</> : "Change Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}