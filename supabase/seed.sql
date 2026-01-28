SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict nkARno6eMBEyOaOdpowjgBiZ8egfp5bOTgANPj34WuWLBNS68eCX0VFCMK1sPAm

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'fe94c6da-4acf-4f06-b48d-5d40e1ff0fb9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"nbcf46@motorolasolutions.com","user_id":"7211af5a-1901-41ca-a9fe-dce6ba1cf5be","user_phone":""}}', '2025-11-20 11:31:31.542559+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0f8846b-92b2-4bbb-af62-c6fb02bf89ca', '{"action":"login","actor_id":"7211af5a-1901-41ca-a9fe-dce6ba1cf5be","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-20 11:34:38.172108+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1dda78e-c756-4a35-83d8-717c7ae197a5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@test.com","user_id":"2185d159-1356-4d53-aefa-37c4ef44e5e0","user_phone":""}}', '2025-12-08 13:58:22.044002+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd07d14f9-628e-48f0-afc2-eb2b7a24b156', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@test.com","user_id":"2185d159-1356-4d53-aefa-37c4ef44e5e0","user_phone":""}}', '2026-01-26 20:17:36.107173+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7f60f2e-3394-4958-804b-9d1bc35211fa', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@test.com","user_id":"29d1445e-be22-4e23-8c3e-11f2b5aebda6","user_phone":""}}', '2026-01-26 20:17:48.75932+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cceb1698-299a-447d-9c07-e1005958932d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"nbcf46@motorolasolutions.com","user_id":"7211af5a-1901-41ca-a9fe-dce6ba1cf5be","user_phone":""}}', '2026-01-26 21:32:50.359608+00', ''),
	('00000000-0000-0000-0000-000000000000', '449053ad-a27e-44cd-bd7b-77437fef6e42', '{"action":"user_signedup","actor_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-01-26 21:33:11.092515+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f33b2a3a-10fd-412e-ba3d-4b943403b3f4', '{"action":"login","actor_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-26 21:33:11.097483+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a13d6fbe-0cfc-4125-97a5-5e4a7f567a78', '{"action":"login","actor_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-26 21:36:54.552498+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd92ea79e-2acb-4cf0-9e0e-e1becde9d6fd', '{"action":"logout","actor_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account"}', '2026-01-26 21:48:14.169185+00', ''),
	('00000000-0000-0000-0000-000000000000', '966de991-b4dd-44d0-aabf-8eceb01f2d9c', '{"action":"login","actor_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-26 21:48:30.931496+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd138a09e-2622-4fac-937c-28d34e1507eb', '{"action":"logout","actor_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account"}', '2026-01-26 21:48:50.386593+00', ''),
	('00000000-0000-0000-0000-000000000000', '06dfb176-dcd0-4dcc-86ff-124c07c25e41', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"nbcf46@motorolasolutions.com","user_id":"971f5e72-c053-4f63-8a78-7cc3a137d56c","user_phone":""}}', '2026-01-26 21:48:58.640363+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e44a456-ec18-4c6a-b801-295d85c39e3e', '{"action":"user_signedup","actor_id":"2e888d53-e6d3-4cc6-9dac-a40c8abeede1","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-01-26 21:49:08.620845+00', ''),
	('00000000-0000-0000-0000-000000000000', '3ea24953-578b-449b-9123-6e6ab43eecb5', '{"action":"login","actor_id":"2e888d53-e6d3-4cc6-9dac-a40c8abeede1","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-26 21:49:08.625738+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ddaf259f-4c97-4e7a-bb0e-3424c3761aa4', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"nbcf46@motorolasolutions.com","user_id":"2e888d53-e6d3-4cc6-9dac-a40c8abeede1","user_phone":""}}', '2026-01-26 21:59:43.960467+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b564ae16-da2e-463b-bcd8-0e5eb18c6148', '{"action":"user_signedup","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-01-26 22:01:29.890769+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb89ffff-dd77-4f5e-8a4f-7ace2917a9e8', '{"action":"login","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-26 22:01:29.894175+00', ''),
	('00000000-0000-0000-0000-000000000000', '0a94538f-ae5a-4099-bcd2-a9b621b77cd9', '{"action":"logout","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account"}', '2026-01-26 22:04:08.440969+00', ''),
	('00000000-0000-0000-0000-000000000000', '2943905c-5211-4c5f-88d3-b838a04e257b', '{"action":"login","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-01-26 22:04:24.924662+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e2ab924-f496-43c4-bc74-8b560005fc9f', '{"action":"token_refreshed","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"token"}', '2026-01-27 11:45:33.076772+00', ''),
	('00000000-0000-0000-0000-000000000000', '96dfc998-18a8-4a68-b401-0b17a3faf7cf', '{"action":"token_revoked","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"token"}', '2026-01-27 11:45:33.085462+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f30dd5fc-e3e8-4842-b4e3-6164d5b9a7d8', '{"action":"token_refreshed","actor_id":"e0290b49-16c1-4d5f-8ba2-7564ed936092","actor_username":"nbcf46@motorolasolutions.com","actor_via_sso":false,"log_type":"token"}', '2026-01-27 11:45:37.506637+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '29d1445e-be22-4e23-8c3e-11f2b5aebda6', 'authenticated', 'authenticated', 'test@test.com', '$2a$10$IHwb3cVap7vyJ7D80YioeepI4OG9cpz3pIyOfsernqqstzmkCKEla', '2026-01-26 20:17:48.76209+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-01-26 20:17:48.749717+00', '2026-01-26 20:17:48.76342+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e0290b49-16c1-4d5f-8ba2-7564ed936092', 'authenticated', 'authenticated', 'nbcf46@motorolasolutions.com', '$2a$10$pekuTKmFznIkFW0.MW6QmeIVMRAIWR0UiCc7g6uGNyHcOgIlDxHS.', '2026-01-26 22:01:29.891305+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-26 22:04:24.925464+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e0290b49-16c1-4d5f-8ba2-7564ed936092", "email": "nbcf46@motorolasolutions.com", "email_verified": true, "phone_verified": false}', NULL, '2026-01-26 22:01:29.882119+00', '2026-01-27 11:45:33.119813+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('29d1445e-be22-4e23-8c3e-11f2b5aebda6', '29d1445e-be22-4e23-8c3e-11f2b5aebda6', '{"sub": "29d1445e-be22-4e23-8c3e-11f2b5aebda6", "email": "test@test.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-26 20:17:48.756761+00', '2026-01-26 20:17:48.756841+00', '2026-01-26 20:17:48.756841+00', '7548bdee-6cd9-4032-8455-02f700306938'),
	('e0290b49-16c1-4d5f-8ba2-7564ed936092', 'e0290b49-16c1-4d5f-8ba2-7564ed936092', '{"sub": "e0290b49-16c1-4d5f-8ba2-7564ed936092", "email": "nbcf46@motorolasolutions.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-26 22:01:29.88871+00', '2026-01-26 22:01:29.88874+00', '2026-01-26 22:01:29.88874+00', 'efc6a9d9-4d5a-40ca-9c02-db79e0c465bc');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id") VALUES
	('6d839205-7dc0-4e44-a6e2-e0fde540170c', 'e0290b49-16c1-4d5f-8ba2-7564ed936092', '2026-01-26 22:04:24.925543+00', '2026-01-27 11:45:37.509216+00', NULL, 'aal1', NULL, '2026-01-27 11:45:37.508742', 'node', '172.20.0.1', NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('6d839205-7dc0-4e44-a6e2-e0fde540170c', '2026-01-26 22:04:24.927559+00', '2026-01-26 22:04:24.927559+00', 'password', '84d30ffa-b77f-4e07-8c0e-e9ee65b989d4');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 7, 'ce5uxcze2aq4', 'e0290b49-16c1-4d5f-8ba2-7564ed936092', true, '2026-01-26 22:04:24.92631+00', '2026-01-27 11:45:33.087346+00', NULL, '6d839205-7dc0-4e44-a6e2-e0fde540170c'),
	('00000000-0000-0000-0000-000000000000', 8, 'la3zaz6ggzng', 'e0290b49-16c1-4d5f-8ba2-7564ed936092', false, '2026-01-27 11:45:33.103676+00', '2026-01-27 11:45:33.103676+00', 'ce5uxcze2aq4', '6d839205-7dc0-4e44-a6e2-e0fde540170c');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: travel_styles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."travel_styles" ("id", "name", "is_predefined") VALUES
	('d1583e93-84d5-43c2-ad68-1d5e94fe1118', 'Relaxation', true),
	('67ebac98-dd66-4e45-9a91-3b70003c558e', 'Adventure', true),
	('05f3882b-d4e1-4c42-9925-56c562a29281', 'Cultural', true),
	('1ac29d88-1acd-45ac-9972-39a1ca34931b', 'Foodie', true),
	('01a3bf4b-f0e7-4946-856f-1c540439bf83', 'Luxury', true),
	('5d2de56b-44ef-4476-b996-8acedb6d45d0', 'Budget', true),
	('66b0f7db-4825-4a97-a911-314f8c4696a0', 'Nature', true),
	('d6e91136-e152-4713-a20c-fb7add61fb2f', 'Urban', true),
	('95d35da7-a106-4ff9-8ac4-f63bdcc93682', 'History', true),
	('5767c166-a7ab-4688-abd4-0c653e1ea0bc', 'Road trip', true);


--
-- Data for Name: traveler_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."traveler_types" ("id", "name", "is_predefined") VALUES
	('921c51fa-638b-4315-b07e-7c79989b4de8', 'Solo traveler', true),
	('380b1514-4761-4204-a89f-032754e7d8c2', 'Couple', true),
	('112f624d-e0fb-4d56-808c-de3574a50257', 'Family with young children', true),
	('b368748c-1b21-4e6b-989c-92e43f4036d0', 'Family with teenagers', true),
	('a4017ea5-c0af-452a-9216-90650fe46d45', 'Group of friends', true);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("user_id", "travel_style_id", "traveler_type_id", "interests", "past_travel_experiences", "generation_count") VALUES
	('29d1445e-be22-4e23-8c3e-11f2b5aebda6', NULL, NULL, '{}', '{}', 0),
	('e0290b49-16c1-4d5f-8ba2-7564ed936092', NULL, NULL, '{}', '{}', 0);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 8, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict nkARno6eMBEyOaOdpowjgBiZ8egfp5bOTgANPj34WuWLBNS68eCX0VFCMK1sPAm

RESET ALL;
