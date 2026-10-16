CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

CREATE FUNCTION public.fn_assign_region_by_city() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.city IS NOT NULL AND (NEW.id_region IS NULL OR NEW.id_region = '') THEN
    SELECT id_region
      INTO NEW.id_region
      FROM "Region"
     WHERE LOWER(region_name) = LOWER(TRIM(NEW.city))
       AND deleted_at IS NULL
     LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.fn_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TABLE public."AccessLog" (
    id_log character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36),
    date_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    access_type character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."DeviceConfiguration" (
    id_config character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36),
    offline_usage boolean,
    android_version character varying(20),
    screen_size character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."FavoriteWords" (
    id_favorite character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36),
    id_lexicalunit character(36),
    times_used integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."Feedback" (
    id_feedback character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36),
    id_session character(36),
    rating integer,
    comment text,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    is_reviewed boolean DEFAULT false NOT NULL,
    id_lexicalunit character varying(36),
    support_response text,
    CONSTRAINT chk_feedback_rating CHECK (((rating >= 1) AND (rating <= 5)))
);

COMMENT ON COLUMN public."Feedback".is_reviewed IS 'TRUE = un miembro de Soporte/Admin ya revisó esta valoración';

CREATE TABLE public."LexicalUnit" (
    id_lexicalunit character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    text character varying(100),
    language character varying(50) DEFAULT 'es_Co'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    video_url character varying(500)
);

CREATE TABLE public."Message" (
    id_message character varying(36) NOT NULL,
    id_sender character varying(36) NOT NULL,
    id_receiver character varying(36) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    read_at timestamp without time zone,
    CONSTRAINT chk_message_no_self_send CHECK (((id_sender)::text <> (id_receiver)::text))
);

CREATE TABLE public."Notification" (
    id_notification character varying(36) NOT NULL,
    id_user character varying(36) NOT NULL,
    type character varying(40) NOT NULL,
    title character varying(150) NOT NULL,
    body text,
    reference_id character varying(36),
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);

COMMENT ON TABLE public."Notification" IS 'Avisos in-app para el usuario (campana del menú).';

COMMENT ON COLUMN public."Notification".type IS 'ticket_resolved | feedback_answered';

COMMENT ON COLUMN public."Notification".read_at IS 'NULL mientras no se haya leído; marca la fecha al leerla.';

CREATE TABLE public."Region" (
    id_region character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    region_name character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."Role" (
    id_role character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    role_name character varying(50) NOT NULL
);

CREATE TABLE public."SignAvatarConfig" (
    id_sign_avatar character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36),
    avatar_style character varying(50),
    skin_color character varying(50),
    clothing_color character varying(50),
    avatar_size character varying(10),
    lsc_speed integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."SignInput" (
    id_sign_input character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_session character(36),
    video_url character varying(255),
    generated_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."Support" (
    id_support character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36),
    subject character varying(150),
    message text,
    status character varying(20) DEFAULT 'pending'::character varying,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    solution text
);

CREATE TABLE public."SystemErrorLog" (
    id_error character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    error_type character varying(100),
    module character varying(100),
    message text,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."TranslationDetail" (
    id_detail character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_session character(36) NOT NULL,
    id_lexicalunit character(36) NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."TranslationSession" (
    id_session character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_user character(36) NOT NULL,
    date_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20),
    translation_type character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE TABLE public."User" (
    id_user character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_role character(36) NOT NULL,
    id_region character(36),
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    second_last_name character varying(50),
    phone character varying(20) NOT NULL,
    address character varying(255),
    city character varying(100),
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL
);

COMMENT ON COLUMN public."User".is_active IS 'TRUE = usuario puede autenticarse; FALSE = cuenta desactivada por un administrador';

CREATE TABLE public."VoiceInput" (
    id_voice_input character(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    id_session character(36),
    audio_url character varying(255),
    generated_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone
);

CREATE VIEW public.vw_admin_dashboard AS
 SELECT TRIM(BOTH FROM (((((u.first_name)::text ||
        CASE
            WHEN ((u.middle_name IS NOT NULL) AND ((u.middle_name)::text <> ''::text)) THEN (' '::text || (u.middle_name)::text)
            ELSE ''::text
        END) || ' '::text) || (u.last_name)::text) ||
        CASE
            WHEN ((u.second_last_name IS NOT NULL) AND ((u.second_last_name)::text <> ''::text)) THEN (' '::text || (u.second_last_name)::text)
            ELSE ''::text
        END)) AS full_name,
    u.email,
    r.role_name,
    COALESCE((((rg.region_name)::text || ' — '::text) || (rg.department)::text), 'Sin región'::text) AS region,
    count(DISTINCT ts.id_session) AS total_translations,
    count(DISTINCT sp.id_support) AS support_tickets,
    count(DISTINCT fb.id_feedback) AS feedback_count
   FROM (((((public."User" u
     JOIN public."Role" r ON ((u.id_role = r.id_role)))
     LEFT JOIN public."Region" rg ON ((u.id_region = rg.id_region)))
     LEFT JOIN public."TranslationSession" ts ON ((u.id_user = ts.id_user)))
     LEFT JOIN public."Support" sp ON ((u.id_user = sp.id_user)))
     LEFT JOIN public."Feedback" fb ON ((u.id_user = fb.id_user)))
  WHERE (u.deleted_at IS NULL)
  GROUP BY u.first_name, u.middle_name, u.last_name, u.second_last_name, u.email, r.role_name, rg.region_name, rg.department;

CREATE VIEW public.vw_system_statistics AS
 SELECT ( SELECT count(*) AS count
           FROM public."User"
          WHERE ("User".deleted_at IS NULL)) AS total_users,
    ( SELECT count(*) AS count
           FROM public."TranslationSession"
          WHERE ("TranslationSession".deleted_at IS NULL)) AS total_translations,
    ( SELECT count(*) AS count
           FROM public."Support"
          WHERE ("Support".deleted_at IS NULL)) AS total_support_requests,
    ( SELECT count(*) AS count
           FROM public."Feedback"
          WHERE ("Feedback".deleted_at IS NULL)) AS total_feedback,
    ( SELECT round(avg("Feedback".rating), 2) AS round
           FROM public."Feedback"
          WHERE ("Feedback".deleted_at IS NULL)) AS average_rating;

CREATE VIEW public.vw_user_dashboard AS
 SELECT TRIM(BOTH FROM (((((u.first_name)::text ||
        CASE
            WHEN ((u.middle_name IS NOT NULL) AND ((u.middle_name)::text <> ''::text)) THEN (' '::text || (u.middle_name)::text)
            ELSE ''::text
        END) || ' '::text) || (u.last_name)::text) ||
        CASE
            WHEN ((u.second_last_name IS NOT NULL) AND ((u.second_last_name)::text <> ''::text)) THEN (' '::text || (u.second_last_name)::text)
            ELSE ''::text
        END)) AS full_name,
    u.email,
    count(DISTINCT ts.id_session) AS translations_made,
    count(DISTINCT fw.id_favorite) AS favorite_words,
    COALESCE(avg(f.rating), (0)::numeric) AS average_rating,
    count(DISTINCT sp.id_support) AS support_requests
   FROM ((((public."User" u
     LEFT JOIN public."TranslationSession" ts ON ((u.id_user = ts.id_user)))
     LEFT JOIN public."FavoriteWords" fw ON ((u.id_user = fw.id_user)))
     LEFT JOIN public."Feedback" f ON ((u.id_user = f.id_user)))
     LEFT JOIN public."Support" sp ON ((u.id_user = sp.id_user)))
  WHERE (u.deleted_at IS NULL)
  GROUP BY u.id_user, u.first_name, u.middle_name, u.last_name, u.second_last_name, u.email;

CREATE VIEW public.vw_users AS
 SELECT u.first_name,
    u.last_name,
    u.email,
    r.role_name,
    rg.region_name
   FROM ((public."User" u
     JOIN public."Role" r ON ((u.id_role = r.id_role)))
     LEFT JOIN public."Region" rg ON ((u.id_region = rg.id_region)));

ALTER TABLE ONLY public."AccessLog"
    ADD CONSTRAINT "AccessLog_pkey" PRIMARY KEY (id_log);

ALTER TABLE ONLY public."DeviceConfiguration"
    ADD CONSTRAINT "DeviceConfiguration_id_user_key" UNIQUE (id_user);

ALTER TABLE ONLY public."DeviceConfiguration"
    ADD CONSTRAINT "DeviceConfiguration_pkey" PRIMARY KEY (id_config);

ALTER TABLE ONLY public."FavoriteWords"
    ADD CONSTRAINT "FavoriteWords_pkey" PRIMARY KEY (id_favorite);

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id_feedback);

ALTER TABLE ONLY public."LexicalUnit"
    ADD CONSTRAINT "LexicalUnit_pkey" PRIMARY KEY (id_lexicalunit);

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id_message);

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id_notification);

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id_region);

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id_role);

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_role_name_key" UNIQUE (role_name);

ALTER TABLE ONLY public."SignAvatarConfig"
    ADD CONSTRAINT "SignAvatarConfig_id_user_key" UNIQUE (id_user);

ALTER TABLE ONLY public."SignAvatarConfig"
    ADD CONSTRAINT "SignAvatarConfig_pkey" PRIMARY KEY (id_sign_avatar);

ALTER TABLE ONLY public."SignInput"
    ADD CONSTRAINT "SignInput_pkey" PRIMARY KEY (id_sign_input);

ALTER TABLE ONLY public."Support"
    ADD CONSTRAINT "Support_pkey" PRIMARY KEY (id_support);

ALTER TABLE ONLY public."SystemErrorLog"
    ADD CONSTRAINT "SystemErrorLog_pkey" PRIMARY KEY (id_error);

ALTER TABLE ONLY public."TranslationDetail"
    ADD CONSTRAINT "TranslationDetail_pkey" PRIMARY KEY (id_detail);

ALTER TABLE ONLY public."TranslationSession"
    ADD CONSTRAINT "TranslationSession_pkey" PRIMARY KEY (id_session);

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id_user);

ALTER TABLE ONLY public."VoiceInput"
    ADD CONSTRAINT "VoiceInput_pkey" PRIMARY KEY (id_voice_input);

CREATE INDEX idx_detail_lexicalunit ON public."TranslationDetail" USING btree (id_lexicalunit) WHERE (deleted_at IS NULL);

CREATE INDEX idx_detail_session ON public."TranslationDetail" USING btree (id_session) WHERE (deleted_at IS NULL);

CREATE INDEX idx_feedback_is_reviewed ON public."Feedback" USING btree (is_reviewed) WHERE (deleted_at IS NULL);

CREATE INDEX idx_feedback_lexicalunit ON public."Feedback" USING btree (id_lexicalunit) WHERE (deleted_at IS NULL);

CREATE INDEX idx_message_created ON public."Message" USING btree (created_at DESC);

CREATE INDEX idx_message_pair ON public."Message" USING btree (id_sender, id_receiver, created_at DESC);

CREATE INDEX idx_message_receiver ON public."Message" USING btree (id_receiver);

CREATE INDEX idx_message_sender ON public."Message" USING btree (id_sender);

CREATE INDEX idx_notification_sin_leer ON public."Notification" USING btree (id_user) WHERE ((read_at IS NULL) AND (deleted_at IS NULL));

CREATE INDEX idx_notification_usuario ON public."Notification" USING btree (id_user, created_at DESC) WHERE (deleted_at IS NULL);

CREATE INDEX idx_session_user_fecha ON public."TranslationSession" USING btree (id_user, date_time DESC) WHERE (deleted_at IS NULL);

CREATE INDEX idx_user_is_active ON public."User" USING btree (is_active) WHERE (deleted_at IS NULL);

CREATE UNIQUE INDEX uq_feedback_usuario_palabra ON public."Feedback" USING btree (id_user, id_lexicalunit) WHERE ((id_lexicalunit IS NOT NULL) AND (deleted_at IS NULL));

CREATE UNIQUE INDEX uq_notification_referencia ON public."Notification" USING btree (id_user, type, reference_id) WHERE ((reference_id IS NOT NULL) AND (deleted_at IS NULL));

CREATE TRIGGER trg_access_log_updated_at BEFORE UPDATE ON public."AccessLog" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_assign_region BEFORE INSERT OR UPDATE OF city ON public."User" FOR EACH ROW EXECUTE FUNCTION public.fn_assign_region_by_city();

CREATE TRIGGER trg_device_config_updated_at BEFORE UPDATE ON public."DeviceConfiguration" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_favorite_words_updated_at BEFORE UPDATE ON public."FavoriteWords" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_feedback_updated_at BEFORE UPDATE ON public."Feedback" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_lexical_unit_updated_at BEFORE UPDATE ON public."LexicalUnit" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_region_updated_at BEFORE UPDATE ON public."Region" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_sign_avatar_updated_at BEFORE UPDATE ON public."SignAvatarConfig" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_sign_input_updated_at BEFORE UPDATE ON public."SignInput" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_support_updated_at BEFORE UPDATE ON public."Support" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_system_error_log_updated_at BEFORE UPDATE ON public."SystemErrorLog" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_translation_detail_updated_at BEFORE UPDATE ON public."TranslationDetail" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_translation_session_updated_at BEFORE UPDATE ON public."TranslationSession" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_user_updated_at BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_voice_input_updated_at BEFORE UPDATE ON public."VoiceInput" FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_id_lexicalunit_fkey" FOREIGN KEY (id_lexicalunit) REFERENCES public."LexicalUnit"(id_lexicalunit);

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_id_receiver_fkey" FOREIGN KEY (id_receiver) REFERENCES public."User"(id_user);

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_id_sender_fkey" FOREIGN KEY (id_sender) REFERENCES public."User"(id_user);

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_id_user_fkey" FOREIGN KEY (id_user) REFERENCES public."User"(id_user);

ALTER TABLE ONLY public."TranslationDetail"
    ADD CONSTRAINT fk_detail_session FOREIGN KEY (id_session) REFERENCES public."TranslationSession"(id_session);

ALTER TABLE ONLY public."SignInput"
    ADD CONSTRAINT fk_sign_session FOREIGN KEY (id_session) REFERENCES public."TranslationSession"(id_session);

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT fk_user_region FOREIGN KEY (id_region) REFERENCES public."Region"(id_region);

ALTER TABLE ONLY public."VoiceInput"
    ADD CONSTRAINT fk_voice_session FOREIGN KEY (id_session) REFERENCES public."TranslationSession"(id_session);
