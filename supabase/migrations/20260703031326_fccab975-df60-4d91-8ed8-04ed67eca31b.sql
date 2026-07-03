-- 1) Bersihkan admin lama yang bukan pemilik
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (SELECT id FROM auth.users WHERE lower(email) = 'blokaiyani2026@gmail.com');

-- 2) Pastikan pemilik (jika sudah terdaftar) langsung jadi admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'blokaiyani2026@gmail.com'
ON CONFLICT DO NOTHING;

-- 3) Kunci fungsi claim_admin_if_first agar hanya berlaku untuk email pemilik
CREATE OR REPLACE FUNCTION public.claim_admin_if_first()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT lower(email) INTO uemail FROM auth.users WHERE id = uid;
  IF uemail <> 'blokaiyani2026@gmail.com' THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

-- 4) Trigger otomatis beri admin ke pemilik saat signup / verifikasi email
CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'blokaiyani2026@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

DROP TRIGGER IF EXISTS on_auth_user_updated_grant_owner ON auth.users;
CREATE TRIGGER on_auth_user_updated_grant_owner
AFTER UPDATE OF email, email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();