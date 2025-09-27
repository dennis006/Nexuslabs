-- auth_register.sql
-- Zweck: Hilfsfunktionen zur sicheren Registrierung und Authentifizierung von Benutzern
--         für die Tabelle public."User" entsprechend dem Prisma-Schema.
-- Abhängigkeit: nutzt die PostgreSQL-Erweiterung pgcrypto (crypt(), gen_salt(), gen_random_uuid()).
-- Hinweis: Prisma nutzt normalerweise cuid() als Applikations-Default für die Spalte id (TEXT).
--          Für manuelle Inserts erzeugen wir gen_random_uuid()::text, was kompatibel ist.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.register_user(
    p_email TEXT,
    p_username TEXT,
    p_password TEXT,
    p_role public."Role" DEFAULT 'MEMBER'
)
RETURNS TABLE (
    id TEXT,
    email TEXT,
    username TEXT,
    role public."Role",
    "createdAt" TIMESTAMPTZ
) AS
$$
DECLARE
    email_lc TEXT;
    username_clean TEXT;
    username_lc TEXT;
    hashed_password TEXT;
    inserted_user public."User"%ROWTYPE;
BEGIN
    IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
        RAISE EXCEPTION 'INVALID_EMAIL' USING ERRCODE = '22023';
    END IF;

    email_lc := lower(trim(p_email));
    IF email_lc !~ '^[^@]+@[^@]+\.[^@]+$' THEN
        RAISE EXCEPTION 'INVALID_EMAIL' USING ERRCODE = '22023';
    END IF;

    IF p_username IS NULL OR length(trim(p_username)) = 0 THEN
        RAISE EXCEPTION 'INVALID_USERNAME' USING ERRCODE = '22023';
    END IF;

    username_clean := trim(p_username);
    username_lc := lower(username_clean);

    IF username_clean !~ '^[a-zA-Z0-9_-]{3,20}$' THEN
        RAISE EXCEPTION 'INVALID_USERNAME' USING ERRCODE = '22023';
    END IF;

    IF p_password IS NULL OR length(p_password) < 8 THEN
        RAISE EXCEPTION 'PASSWORD_TOO_SHORT' USING ERRCODE = '22023';
    END IF;

    PERFORM 1
      FROM public."User"
     WHERE lower(email) = email_lc;
    IF FOUND THEN
        RAISE EXCEPTION 'EMAIL_ALREADY_USED' USING ERRCODE = '23505';
    END IF;

    PERFORM 1
      FROM public."User"
     WHERE lower(username) = username_lc;
    IF FOUND THEN
        RAISE EXCEPTION 'USERNAME_ALREADY_USED' USING ERRCODE = '23505';
    END IF;

    hashed_password := crypt(p_password, gen_salt('bf', 12));

    INSERT INTO public."User" (id, email, username, "passwordHash", role, "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid()::text,
        email_lc,
        username_clean,
        hashed_password,
        COALESCE(p_role, 'MEMBER'),
        now(),
        now()
    )
    RETURNING * INTO inserted_user;

    RETURN QUERY SELECT
        inserted_user.id,
        inserted_user.email,
        inserted_user.username,
        inserted_user.role,
        inserted_user."createdAt";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.register_user(TEXT, TEXT, TEXT, public."Role")
    IS 'Registriert einen neuen Benutzer mit Validierungen, bcrypt-Hashing und normalisierten Werten.';


CREATE OR REPLACE FUNCTION public.authenticate_user(
    p_email_or_username TEXT,
    p_password TEXT
)
RETURNS TABLE (
    id TEXT,
    email TEXT,
    username TEXT,
    role public."Role"
) AS
$$
DECLARE
    lookup_value TEXT;
    user_row public."User"%ROWTYPE;
BEGIN
    IF p_email_or_username IS NULL OR length(trim(p_email_or_username)) = 0 THEN
        RAISE EXCEPTION 'AUTHENTICATION_FAILED' USING ERRCODE = '28000';
    END IF;

    lookup_value := lower(trim(p_email_or_username));

    SELECT *
      INTO user_row
      FROM public."User"
     WHERE lower(email) = lookup_value
        OR lower(username) = lookup_value
     LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'AUTHENTICATION_FAILED' USING ERRCODE = '28000';
    END IF;

    IF crypt(p_password, user_row."passwordHash") <> user_row."passwordHash" THEN
        RAISE EXCEPTION 'AUTHENTICATION_FAILED' USING ERRCODE = '28000';
    END IF;

    RETURN QUERY SELECT
        user_row.id,
        user_row.email,
        user_row.username,
        user_row.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.authenticate_user(TEXT, TEXT)
    IS 'Validiert die Zugangsdaten anhand von Email oder Username und gibt Kernattribute zurück.';


CREATE UNIQUE INDEX IF NOT EXISTS "User_email_lower_key"
    ON public."User" (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_lower_key"
    ON public."User" (lower(username));

-- Hinweis: Falls bereits UNIQUE Constraints auf email/username bestehen, bleiben diese erhalten.
--          Die zusätzlichen Indizes erzwingen effektive case-insensitive Eindeutigkeit.

COMMIT;

-- Beispiel: neuen Member registrieren
-- SELECT * FROM public.register_user(
--   'user@example.com',
--   'User_123',
--   'SuperSicheresPasswort123',
--   'MEMBER'
-- );

-- Beispiel: Admin registrieren
-- SELECT * FROM public.register_user(
--   'admin@example.com',
--   'AdminUser',
--   'NochSicherer!234',
--   'ADMIN'
-- );

-- Beispiel: authenticate
-- SELECT * FROM public.authenticate_user('user@example.com', 'SuperSicheresPasswort123');
-- SELECT * FROM public.authenticate_user('User_123', 'SuperSicheresPasswort123');

