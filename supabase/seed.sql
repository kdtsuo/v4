SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict LiRK1IiE9yVbpegEaIGVUo33nVUkdyNuouX1yjYbrWwbvhwwb4oaWAvEAGbvZBZ

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



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '276f98e3-4652-4c0d-962e-ae55ad91bc35', 'authenticated', 'authenticated', 'kpopdanceteam.suo@gmail.com', '$2a$10$M6n.U.CTRC5ohtDjd3O5ue9S4y7NxAD1fQUPfES20zep6sQNgLuvC', '2025-11-11 06:36:06.798857+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-18 22:23:16.600054+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-11 06:36:06.772091+00', '2026-02-18 22:23:16.672126+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('276f98e3-4652-4c0d-962e-ae55ad91bc35', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '{"sub": "276f98e3-4652-4c0d-962e-ae55ad91bc35", "email": "kpopdanceteam.suo@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-11 06:36:06.788335+00', '2025-11-11 06:36:06.788405+00', '2025-11-11 06:36:06.788405+00', 'c97c3bec-af10-435f-8a2c-c7827796b134');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('2fdb3cb2-b43c-4b7b-ab87-f8a5f0b1de13', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2026-02-18 22:23:16.600713+00', '2026-02-18 22:23:16.600713+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '142.231.91.53', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('2fdb3cb2-b43c-4b7b-ab87-f8a5f0b1de13', '2026-02-18 22:23:16.677736+00', '2026-02-18 22:23:16.677736+00', 'password', 'de34d640-57b1-4ff1-ad1d-5072bf4a99c5');


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
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
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
	('00000000-0000-0000-0000-000000000000', 29, 'npchq5vfvwtd', '276f98e3-4652-4c0d-962e-ae55ad91bc35', false, '2026-02-18 22:23:16.647089+00', '2026-02-18 22:23:16.647089+00', NULL, '2fdb3cb2-b43c-4b7b-ab87-f8a5f0b1de13');


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
-- Data for Name: links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."links" ("id", "created_at", "label", "iconType", "date", "link", "user_id", "price", "order") VALUES
	(6, '2026-02-12 23:37:35.953265+00', 'K-Fest Showcase Tickets', 'rubric', '2026-02-12', 'https://campus.hellorubric.com/?eid=51375', '276f98e3-4652-4c0d-962e-ae55ad91bc35', 10, 0),
	(50, '2025-10-23 20:52:41.945105+00', 'Sticker Survey', 'googleForms', '2025-10-23', 'https://docs.google.com/forms/d/e/1FAIpQLSdk0KOTE4wik6Ugxcl21Awodk3s1e4bj73eZKnHyFnvaIU5vg/viewform?usp=header', '276f98e3-4652-4c0d-962e-ae55ad91bc35', NULL, 2),
	(7, '2025-03-06 08:32:07.839392+00', 'Discord Server', 'discord', '2024-10-31', 'https://discord.com/invite/tbKkvjV2W8', '276f98e3-4652-4c0d-962e-ae55ad91bc35', NULL, 3),
	(40, '2025-07-25 06:12:19.709904+00', 'Youtube', 'youtube', '2025-07-25', 'https://youtube.com/@KpopDanceTeamSUO?si=l44BFS2K3xPjRZ1A', '276f98e3-4652-4c0d-962e-ae55ad91bc35', NULL, 4),
	(34, '2025-06-03 02:25:42.07262+00', 'Ticket Sales, Membership, & Merch', 'rubric', '2025-06-03', 'https://campus.hellorubric.com/?s=7805&fbclid=PAQ0xDSwKrO-1leHRuA2FlbQIxMQABpz-wCrH3XFMRCqXE6T-RIjv-Kh2V1C7EXUk5h8umKdCnArJX1pFnGc1V1MBq_aem_DJlKU0FysrvrRzFb-Sbn2g', '276f98e3-4652-4c0d-962e-ae55ad91bc35', NULL, 5),
	(8, '2026-02-18 22:23:44.89098+00', 'Volunteer Form for K-Fest Showcase', 'googleForms', '2026-02-18', 'https://forms.gle/imuqzCJCskNZZPcg7', '276f98e3-4652-4c0d-962e-ae55ad91bc35', NULL, 1);


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."positions" ("created_at", "label", "form_url", "is_accepting_responses", "id", "description") VALUES
	('2025-03-08 07:01:20.911111+00', 'Executive Team', 'https://forms.gle/ufezb8Gut92E7pMeA', false, '688fea18-10c4-4c83-8ba7-76c29fa931d3', 'Executive Team runs the club’s core operations. We plan events and performances, manage finances, handle promotions, coordinate practices, and represent the team with UBCO and external partners. We keep the club organized, visible, and growing.'),
	('2025-08-14 01:38:13.239365+00', 'ACE', 'https://forms.gle/jUTrkHMrQkKF2RBKA', true, 'b4fbcd10-aa1c-4b21-b4e7-aec809657fdd', 'ACE Group is a performance-focused subunit made up of intermediate-advanced dancers and capable singers who will sing/rap + dance simultaneously, following a K-pop idol training style, but in a positive & supportive environment!'),
	('2025-03-09 07:01:20.911111+00', 'Performance Group', 'https://forms.gle/4CFzbsd3Xn1Lstns8', true, 'a3b290a3-b2e1-4924-af94-c554d6436d42', 'Performance group is for club members who wish to participate in performances and the showcase. Workshops and practice spaces will be provided; however, it will be expected that choreography is self-taught while the Performance Director will focus on formations, detail and quality.'),
	('2025-03-10 07:01:20.911111+00', 'Dance Instructor', 'https://forms.gle/eciAuTKB63WLQzGg7', true, 'b6019b1e-4f69-4315-8f1f-e9cd474d2ba2', 'Dance Instructors leads weekly classes by teaching choreography selected through member and non-member song voting. They break down routines clearly, guide skill development for all levels, and keep practices structured, fun, and high-energy.'),
	('2025-03-11 07:01:20.911111+00', 'Cameraman', 'https://forms.gle/LpXTwzCNKjVZN3De9', true, 'e9ab7739-4a07-449c-84b5-5cdb24411e87', 'Cameraman leads all photography and videography for the club, capturing classes, performances, and events for marketing and promotion. They manage filming, editing, and visual content to maintain a strong online presence and brand image.');


--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sponsors" ("id", "title", "image", "location", "maplink", "text", "websitelink", "user_id", "created_at", "updated_at") VALUES
	('02bd9cf9-b64c-4edc-b0aa-423b078eebe3', 'Tossing Pizzeria', 'https://imgur.com/7PSHxK9.png', '975 Academy Way # 120', 'https://maps.app.goo.gl/2crwuZG3ZnR5kZ2y9', '15% off minimum $15 order', 'https://www.tossingpizzeria.com/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-03-01 10:20:30.470463+00', '2025-07-28 18:55:24.813827+00'),
	('11777651-3bc5-4858-8b2f-f00333be3263', 'Macao Imperial Tea', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLkqnd3-GbrvtRtMtBjBWRGs14dycs_FqfNw&s', '590 Hwy 33 W #23', 'https://www.google.ca/maps/place/Macao+Imperial+Tea/@49.8896423,-119.4000558,17z/data=!3m2!4b1!5s0x537d8d254aed5519:0xcfc309a147be2f5b!4m6!3m5!1s0x537d8de1f6a33909:0x884826c2eda55afd!8m2!3d49.8896389!4d-119.3974809!16s%2Fg%2F11tjx7cm31?entry=ttu&g_ep=EgoyMDI0MTAxNC4wIKXMDSoASAFQAw%3D%3D', '15% off', 'https://www.macaoimperialteacanada.com/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-03-06 10:20:30.470463+00', '2025-03-06 10:20:30.470463+00'),
	('26cb0108-126a-44e7-863b-5156e1d1008f', 'Soban Korea Bistro', 'https://imgur.com/Ksbj6qt.png', '530 Bernard Ave', 'https://maps.app.goo.gl/HNKP2CsPHqqr3Tpz9', 'Free drink on dine in', 'https://sobankoreanbistro.com/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-08-28 20:18:18.734075+00', '2025-08-28 20:18:18.734075+00'),
	('2cdcb0c2-d512-4e65-b56c-badba0786787', 'Bubble Waffle Cafe', 'https://imgur.com/Zyde3DR.png', '5538 Airport Way #102', 'https://maps.app.goo.gl/6pycwtVSyN2P44P56', '10% off', 'https://www.bubblewafflecafe.ca/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-03-06 10:20:30.470463+00', '2025-08-07 21:16:11.96782+00'),
	('382c7965-ccbf-4017-9ac4-8ad4477fb0ec', 'Bamboo Chopsticks', 'https://imgur.com/7Krghst.png', '2189 Springfield Rd #112', 'https://maps.app.goo.gl/qWFVLawzadNgp4z2A', '15% off', 'https://bamboochopsticks.ca/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-08-07 21:10:24.477921+00', '2025-08-07 21:10:24.477921+00'),
	('403c3813-aa27-425c-9e1d-87d5ff2f066f', 'O-Lake Cafe and Bistro', 'https://imgur.com/oHRPIkR.png', '375 Lawrence Ave', 'https://maps.app.goo.gl/fFxTTUcJLyZonH8y5', '10% off', 'https://www.instagram.com/o_lakecafe/?hl=en', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-07-11 02:42:18.251503+00', '2025-07-11 02:42:18.251503+00'),
	('5482ae17-2f58-4146-a51f-c1f669bf79f0', 'Steve''s Poké Bar', 'https://imgur.com/rGUG3lA.png', '1945 Dilworth Dr #2', 'https://maps.app.goo.gl/dku7KqCFv2JXvqkE9', '10% off', 'https://www.stevespokebar.ca/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-07-11 02:37:13.955013+00', '2025-07-11 02:37:13.955013+00'),
	('56c1ae22-e2e4-4412-985b-27683629956e', 'Formosa Tea Cafe', 'https://www.formosateacafe.ca/wp-content/uploads/2021/04/Logo.png', '1970 Kane Rd Unit 210', 'https://www.google.ca/maps/place/Formosa+Tea+Cafe+-+Glenmore+Location+(Bubble+Tea)/@49.9151098,-119.4450163,17z/data=!3m1!4b1!4m6!3m5!1s0x537df363e212f627:0x6cc37747be5faec5!8m2!3d49.9151064!4d-119.4424414!16s%2Fg%2F11tdbmlwh7?entry=ttu&g_ep=EgoyMDI0MTAxNC4wIKXMDSoASAFQAw%3D%3D', '10% off', 'https://www.formosateacafe.ca/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-03-06 10:20:30.470463+00', '2025-03-06 10:20:30.470463+00'),
	('971977a0-a8a7-4c8c-952e-097ab6927cf2', 'BOBA Bubble Tea & Desserts', 'https://imgur.com/ybrWXmK.png', '1546 Harvey Ave #200', 'https://www.google.com/maps/place/BOBA+Bubble+Tea+%26+Desserts/@49.8823633,-119.4644213,17z/data=!4m15!1m8!3m7!1s0x537d8de413aea0ef:0x93db70d82a51c7fa!2sBOBA+Bubble+Tea+%26+Desserts!8m2!3d49.8823633!4d-119.4644213!10e9!16s%2Fg%2F11kj4h91nn!3m5!1s0x537d8de413aea0ef:0x93db70d82a51c7fa!8m2!3d49.8823633!4d-119.4644213!16s%2Fg%2F11kj4h91nn?entry=ttu&g_ep=EgoyMDI1MDgwNC4wIKXMDSoASAFQAw%3D%3D', '10% off', 'https://bobacafe.ca/home.html', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-08-07 21:40:13.436601+00', '2025-08-07 21:40:13.436601+00'),
	('97d3aa44-6420-46ab-827f-529de0f06a75', 'Simplee Boba', 'https://imgur.com/usxl1TZ.png', '1945 Pier Mac Way #1', 'https://www.google.com/maps/place/Simplee+Boba/@49.956237,-119.3872375,17z/data=!3m1!4b1!4m6!3m5!1s0x537deda072247753:0x9d406aa041af9d32!8m2!3d49.956237!4d-119.3872375!16s%2Fg%2F11k78c08c0?entry=ttu&g_ep=EgoyMDI1MDgwNC4wIKXMDSoASAFQAw%3D%3D', '20% off', 'https://simpleeboba.ca/', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-08-07 21:34:08.927115+00', '2025-08-07 21:34:08.927115+00'),
	('ae94637d-16c7-49a9-865f-84d5f4d8492d', 'Seoulful Convenience', 'https://kelownatalk.com/upload/8cbf895a37b744f4a58d530649b0c2b8.webp', '1619 Ellis St', 'https://www.google.ca/maps/place/Seoulful+Convenience/@49.885116,-119.4959369,17z/data=!3m1!4b1!4m6!3m5!1s0x537df52e4a80e70f:0x77812feb6aba0273!8m2!3d49.8851126!4d-119.493362!16s%2Fg%2F11lnhlpht6?entry=ttu&g_ep=EgoyMDI0MTExMC4wIKXMDSoASAFQAw%3D%3D', '5% off', 'https://seoulfulconvenience.ca', '276f98e3-4652-4c0d-962e-ae55ad91bc35', '2025-03-06 10:20:30.470463+00', '2025-03-06 10:20:30.470463+00');


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_members" ("id", "full_name", "role", "bio", "profile_image_url", "instagram_url", "linkedin_url", "github_url", "order_index", "created_at", "updated_at", "is_archived") VALUES
	('1395e86d-d23c-47dd-98b1-69130146b5a1', 'Rexmin', 'Jr Events', 'Jr Events.', NULL, 'https://www.instagram.com/rexminvu/', NULL, NULL, NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:38:33.970032+00', false),
	('290672bd-f5f1-4906-87e4-9ab5d79cf547', 'Jomila', 'VP External', 'VP External.', '', 'https://www.instagram.com/jomilaagatha/', '', '', NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:38:10.47778+00', false),
	('2ffa3f84-b3c5-4b4a-b8a3-645edeaeade0', 'Miki', 'VP Events', 'VP Events.', '', 'https://www.instagram.com/_mk.13___/', '', '', NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:37:57.190359+00', false),
	('3cdbedc2-5251-4373-af86-21e2d4587914', 'Rin Meng', 'Web Developer', 'Loves making websites with beautiful UI.', '', 'https://www.instagram.com/rin.m04/?theme=dark', 'https://www.linkedin.com/in/rin-m-b28910234/', 'https://github.com/rinmeng', 0, '2025-11-10 04:19:46.222748+00', '2025-11-10 05:10:08.926185+00', false),
	('3fc0c511-99bb-4185-9089-9e6d91962153', 'Marita Meng', 'President', 'asd', '', '', '', '', 0, '2025-11-11 05:39:14.335245+00', '2025-11-11 05:39:16.766043+00', true),
	('43f7cf0b-c2e4-4286-b580-03eff89de873', 'Mikhail', 'Jr Finance/Marketing', 'Jr Finance/Marketing.', '', 'https://www.instagram.com/mikhail.wav/', '', '', NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:37:27.643173+00', false),
	('46f6b385-e6ab-4fd8-b0ab-8f3f8f9e6d77', 'Charlie', 'Jr Internal', 'Jr Internal.', '', 'https://www.instagram.com/hey.charlie.ray/', '', '', NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:31:01.891289+00', false),
	('61c764fa-f2fb-463f-9b4d-346f88bba94a', 'Amber', 'Marketing', 'Marketing.', '', 'https://www.instagram.com/christienneamber/', '', '', 0, '2025-11-10 04:24:24.931884+00', '2025-11-10 04:38:43.899179+00', false),
	('83ae15d5-da50-4189-be3f-36774078ca6c', 'Hayden', 'Jr External', 'Jr External.', '', 'https://www.instagram.com/lin._.hayden/', '', '', NULL, '2025-11-10 04:30:15.039108+00', '2025-11-10 04:30:27.960295+00', false),
	('9553f50c-5fe0-4e09-887d-8ee375a48dbb', 'Sierra', 'VP Marketing', 'VP Marketing.', '', 'https://www.instagram.com/sierra.porter7/', '', '', NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:30:43.000149+00', false),
	('c58fc27f-47ef-42ef-8765-865950dbd8e5', 'Conner', 'Performance Director', 'Performance Director.', NULL, 'https://www.instagram.com/_conner_tr/', NULL, NULL, NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:38:52.802543+00', false),
	('d4ae1935-5f4b-484b-a047-d75612ce299b', 'Marita Meng', 'President', 'President.', '', 'https://www.instagram.com/marchenesa/', '', '', 0, '2025-11-10 04:20:42.119449+00', '2025-11-11 05:39:08.391353+00', false),
	('df9a5de3-56c9-4a92-9367-434f8b1d7bd1', 'Sam', 'VP Finance', 'VP Finance.', NULL, 'https://www.instagram.com/keeping_it.reel/', NULL, NULL, NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:40:23.533493+00', false),
	('ed1753f6-85f9-43f8-8990-2c89c87a587f', 'Rune', 'VP Internal', 'VP Internal.', NULL, 'https://www.instagram.com/runecial/', NULL, NULL, NULL, '2025-11-10 04:27:05.756372+00', '2025-11-10 04:40:35.069183+00', false),
	('a1ccaa91-1431-464d-8354-f337ce877b2b', 'Kristyn', 'Jr Events', 'Jr Events.', '', 'https://www.instagram.com/kristyn._.5/', '', '', NULL, '2025-11-10 04:27:05.756372+00', '2025-11-12 07:00:14.020855+00', false);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
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
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 29, true);


--
-- Name: links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."links_id_seq"', 8, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict LiRK1IiE9yVbpegEaIGVUo33nVUkdyNuouX1yjYbrWwbvhwwb4oaWAvEAGbvZBZ

RESET ALL;
