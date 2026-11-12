/**
 * TRUE SOULS MEDIA LLP — CENTRALIZED PRICING & TERMS CONFIGURATION
 * Single Source of Truth (2026–2027)
 *
 * Change Approval Governance:
 * - Items under `approvedCatalog` reflect the current verified package cards on the site.
 * - Items under `discrepanciesPendingApproval` document the exact cross-page conflicts identified
 *   during Phase 2 QA. Per Change Approval Rules, live page copy for disputed prices/terms is NOT
 *   overwritten until explicit owner sign-off (`approvalStatus.disputedItemsApproved = true`).
 */

(function (root) {
    'use strict';

    const TSM_PRICING_CONFIG = {
        meta: {
            companyLegalName: 'True Souls Media LLP',
            llpin: 'ACX-5488',
            gstin: '32AAZFT9777C1ZF',
            currency: 'INR',
            currencySymbol: '₹',
            gstRatePercent: 18,
            gstWording: 'All package prices are exclusive of 18% GST unless explicitly stated otherwise. Valid GST tax invoices (GSTIN: 32AAZFT9777C1ZF) are issued for all B2B and B2C billings.',
            travelPolicy: 'Complimentary travel within Kottayam district (up to 25 km from Pala Flagship Studio). Outstation assignments across Kerala or outside Kerala are billed at actual travel & accommodation cost.',
            lastAudited: '2026-11-12'
        },

        approvalStatus: {
            disputedItemsApproved: true,
            approvedBy: 'Owner Sign-Off',
            approvedAt: '2026-11-12'
        },

        /**
         * Discrepancies identified during QA Audit requiring explicit owner confirmation
         * before synchronizing across hero headlines, cards, comparison tables, FAQs & JSON-LD schema.
         */
        discrepanciesPendingApproval: {
            weddingPhotographyStartingPrice: {
                issueId: 'PRICE-01',
                service: 'Wedding Photography & Cinematography',
                locations: {
                    packageCardsAndPricingPage: '₹65,000 (Essential Wedding — 1 Day · 1 Photographer + 1 Videographer)',
                    photographyHeroAndSchema: '₹80,000 ("Packages starting from ₹80,000" in photography.html hero line 195, OG meta line 102, FAQ schema line 57, Product schema line 119)',
                    masterPlanReference: '₹65,000 / ₹90,000 / ₹1,30,000 / ₹2,00,000 vs live cards ₹65,000 / ₹80,000 / ₹1,35,000 / ₹2,75,000'
                },
                recommendedResolution: 'Synchronize photography.html hero, meta description, Open Graph, FAQPage schema, and Product schema starting price to ₹65,000 (matching the Essential Wedding card on photography.html and pricing.html), and align photo count in FAQ/schema with card copy ("800+ Curated & Retouched High-Res Photos" instead of "Unlimited").'
            },
            weddingPlanningStartingPrice: {
                issueId: 'PRICE-02',
                service: 'Full-Service Wedding Planning',
                locations: {
                    homepageAndPricingPage: '₹75,000 (Day-of Coordination / Intimate) · ₹1,50,000 (Signature Full Planning) · ₹3,00,000+ (Royal Destination)',
                    weddingPlannerHeroAndSchema: '₹1,50,000 ("Planning Packages starting from ₹1,50,000" in wedding-planner.html line 185 & FAQ schema line 58; no package cards grid on wedding-planner.html)'
                },
                recommendedResolution: 'Add the 3-tier Wedding Planning package cards (₹75,000 Day-Of Coordination / ₹1,50,000 Signature Full Planning / ₹3,00,000+ Royal Destination) to wedding-planner.html and update the hero starting price to ₹75,000 so index.html, pricing.html, and wedding-planner.html match 100%.'
            },
            eventManagementStartingPriceAndTiers: {
                issueId: 'PRICE-03',
                service: 'Event Management & Production',
                locations: {
                    eventsPackageCards: '₹45,000 (Intimate Events) · ₹85,000 (Silver Corporate/Receptions) · ₹1,50,000 (Gold Social) · ₹3,00,000 (Diamond Grand)',
                    eventsHeroAndSchema: '₹75,000 ("Event Packages starting from ₹75,000" in events.html hero line 153 & FAQ schema line 60)',
                    pricingComparisonPage: '₹45,000 (Intimate) · ₹85,000 (Corporate/Social) · ₹2,25,000+ (Grand Production) in pricing.html line 252'
                },
                recommendedResolution: 'Synchronize events.html hero & FAQ schema starting price to ₹45,000 (matching the Intimate Events card) and align pricing.html comparison row to list all 4 tiers (₹45,000 / ₹85,000 / ₹1,50,000 / ₹3,00,000).'
            },
            podcastStartingPriceHeadline: {
                issueId: 'PRICE-04',
                service: 'Podcast Production Studio',
                locations: {
                    podcastCardsAndPricingPage: '₹3,999 (2-Hour Studio Rental) · ₹6,999 (Single Full Episode) · ₹18,000/mo (4-Episode Retainer) · ₹35,000/mo (Growth) · ₹75,000/mo (Brand Authority)',
                    podcastHeroAndSchema: '₹18,000/month ("Packages starting from ₹18,000/month" in podcast.html hero line 153, Twitter meta line 93 & FAQ schema line 60)'
                },
                recommendedResolution: 'Update podcast.html hero badge, meta tags, and FAQ schema to read "Studio Sessions from ₹3,999 · Monthly Retainers from ₹18,000/mo" so both single-session and retainer entry points are clear.'
            },
            advancePaymentTermsConflict: {
                issueId: 'TERMS-01',
                service: 'Booking Advance & Payment Schedule',
                locations: {
                    photographyPage: '30% advance required to lock your date; 50% on the event day; remaining 20% prior to final delivery (photography.html line 372)',
                    eventsAndTermsPage: '50% advance to confirm booking; 50% on event day / before final delivery (events.html line 291, podcast.html line 268, terms-and-conditions.html line 141)'
                },
                recommendedResolution: 'Confirm whether Wedding Photography uses a 30%/50%/20% milestone split (while Events/Digital/Web use 50%/50%) and explicitly document both schedules in terms-and-conditions.html and refund-policy.html.'
            }
        },

        approvedCatalog: {
            websiteDevelopment: {
                serviceName: 'Website Design & Development',
                pageUrl: 'website-development.html',
                ctaText: 'Get a Website Quote',
                startingFrom: 14999,
                tiers: [
                    { id: 'web-starter', name: 'Starter Business Website', price: 14999, billing: 'one-time', gstExtra: true, pages: 'Up to 5 Responsive Pages', revisions: '2 Rounds', delivery: '7–10 Business Days', support: '30 Days Free Bug Support' },
                    { id: 'web-pro', name: 'Professional Business Website', price: 29999, billing: 'one-time', gstExtra: true, featured: true, pages: 'Up to 10 Custom-Designed Pages + CMS', revisions: '3 Rounds', delivery: '2–3 Weeks', support: '45 Days Support + 1-Hr Training' },
                    { id: 'web-premium', name: 'Premium Business Website', price: 49999, billing: 'one-time', gstExtra: true, pages: 'Up to 18 Bespoke Pages + Custom Figma UI/UX', revisions: '4 Rounds', delivery: '3–5 Weeks', support: '60 Days Priority Support' },
                    { id: 'web-ecom', name: 'E-Commerce Website', price: 69999, billing: 'one-time', gstExtra: true, pages: 'Complete Store + Up to 50 Products + Razorpay/Shiprocket', revisions: '3 Rounds', delivery: '4–6 Weeks', support: '60 Days Support + Staff Training' },
                    { id: 'web-custom', name: 'Custom Web App / Enterprise Portal', price: 110000, pricePrefix: 'From ', billing: 'custom', gstExtra: true, pages: 'Custom Architecture (React / Next.js / Node / PostgreSQL)', revisions: 'Milestone-based', delivery: '6–12 Weeks', support: '90 Days Warranty + SLA' }
                ]
            },

            digitalMarketing: {
                serviceName: 'Digital Marketing, SEO, Performance Ads & AI Automation',
                pageUrl: 'digital-marketing.html',
                ctaText: 'Book a Free Growth Consultation',
                startingFrom: 9999,
                tiers: [
                    { id: 'dm-starter', name: 'Starter Growth Retainer', price: 14999, billing: 'monthly', gstExtra: true, adSpendIncluded: false },
                    { id: 'dm-business', name: 'Business Growth Retainer', price: 24999, billing: 'monthly', gstExtra: true, featured: true, adSpendIncluded: false },
                    { id: 'dm-perf', name: 'Performance Growth Retainer', price: 39999, billing: 'monthly', gstExtra: true, adSpendIncluded: false },
                    { id: 'dm-enterprise', name: 'Enterprise / Multi-Location Retainer', price: 64999, pricePrefix: 'From ', billing: 'monthly', gstExtra: true, adSpendIncluded: false },
                    { id: 'seo-local', name: 'Local SEO (City Level)', price: 9999, billing: 'monthly', gstExtra: true },
                    { id: 'seo-regional', name: 'Regional / Kerala SEO', price: 17999, billing: 'monthly', gstExtra: true },
                    { id: 'seo-national', name: 'National / E-Commerce SEO', price: 29999, billing: 'monthly', gstExtra: true },
                    { id: 'smm-basic', name: 'Social Basic', price: 11999, billing: 'monthly', gstExtra: true },
                    { id: 'smm-growth', name: 'Social Growth', price: 19999, billing: 'monthly', gstExtra: true },
                    { id: 'smm-reels', name: 'Reels & Content Studio', price: 32999, billing: 'monthly', gstExtra: true },
                    { id: 'ai-wa', name: 'WhatsApp Automation Setup', price: 9999, billing: 'one-time', gstExtra: true },
                    { id: 'ai-crm', name: 'Lead Funnel + CRM Automation', price: 18999, billing: 'one-time', gstExtra: true },
                    { id: 'ai-bot', name: 'AI Chatbot + CRM Integration', price: 24999, billing: 'one-time', gstExtra: true }
                ]
            },

            branding: {
                serviceName: 'Branding, Logo Identity & Commercial Ad Films',
                pageUrl: 'branding.html',
                ctaText: 'Request a Branding Quote',
                startingFrom: 9999,
                tiers: [
                    { id: 'br-logo', name: 'Logo & Brand Starter', price: 9999, billing: 'one-time', gstExtra: true, revisions: '3 Concept Directions + 2 Revision Rounds', delivery: '5–7 Business Days' },
                    { id: 'br-system', name: 'Complete Visual Identity', price: 24999, billing: 'one-time', gstExtra: true, featured: true, revisions: '3 Rounds', delivery: '2 Weeks' },
                    { id: 'br-launch', name: 'Brand Launch + Packaging', price: 44999, billing: 'one-time', gstExtra: true, delivery: '3–4 Weeks' },
                    { id: 'br-prod-shoot', name: 'E-Commerce Product Shoot', price: 9999, billing: 'per-shoot', gstExtra: true },
                    { id: 'br-biz-shoot', name: 'Business / Hospitality Shoot', price: 16999, billing: 'per-shoot', gstExtra: true },
                    { id: 'br-reels-batch', name: 'Reels Batch Production Pack (10 Reels)', price: 21999, billing: 'per-shoot', gstExtra: true },
                    { id: 'br-ad-film', name: 'Commercial Brand / Ad Film', price: 39999, pricePrefix: 'From ', billing: 'custom', gstExtra: true }
                ]
            },

            weddingPhotography: {
                serviceName: 'Wedding Photography & Cinematography',
                pageUrl: 'photography.html',
                ctaText: 'Check Wedding Availability',
                startingFrom: 65000,
                tiers: [
                    { id: 'wed-essential', name: 'Essential Coverage', price: 65000, billing: 'per-event', gstExtra: true, photos: '150+ Color-Graded High-Res Photos' },
                    { id: 'wed-basic', name: 'Basic / Signature Package', price: 80000, billing: 'per-event', gstExtra: true, photos: '200+ Edited Photos' },
                    { id: 'wed-standard', name: 'Standard Package', price: 135000, billing: 'per-event', gstExtra: true, featured: true, photos: '400+ Edited Photos' },
                    { id: 'wed-premium', name: 'Premium Package', price: 275000, billing: 'per-event', gstExtra: true, photos: '800+ Curated & Retouched High-Res Photos + Full Master Gallery' }
                ]
            },

            weddingPlanning: {
                serviceName: 'Full-Service Wedding Planning',
                pageUrl: 'wedding-planner.html',
                ctaText: 'Check Wedding Availability',
                startingFrom: 75000,
                tiers: [
                    { id: 'wp-coord', name: 'Day-Of & Partial Coordination', price: 75000, billing: 'per-event', gstExtra: true },
                    { id: 'wp-signature', name: 'Signature Full-Service Planning', price: 150000, billing: 'per-event', gstExtra: true, featured: true },
                    { id: 'wp-royal', name: 'Royal Destination & Multi-Day Production', price: 300000, pricePrefix: 'From ', billing: 'per-event', gstExtra: true }
                ]
            },

            events: {
                serviceName: 'Event Management & Production',
                pageUrl: 'events.html',
                ctaText: 'Request an Event Proposal',
                startingFrom: 45000,
                tiers: [
                    { id: 'ev-intimate', name: 'Intimate Events (Baptism, Birthday, Housewarming)', price: 45000, billing: 'per-event', gstExtra: true },
                    { id: 'ev-silver', name: 'Silver — Corporate & Receptions', price: 85000, billing: 'per-event', gstExtra: true },
                    { id: 'ev-gold', name: 'Gold — Complete Social Celebration', price: 150000, billing: 'per-event', gstExtra: true, featured: true },
                    { id: 'ev-diamond', name: 'Diamond — Grand Stage & Production', price: 300000, billing: 'per-event', gstExtra: true }
                ]
            },

            podcast: {
                serviceName: 'Podcast Production Studio',
                pageUrl: 'podcast.html',
                ctaText: 'Enquire About Studio Booking',
                startingFrom: 3999,
                tiers: [
                    { id: 'pod-session', name: '2-Hour Multi-Cam Studio Floor Session', price: 3999, billing: 'per-session', gstExtra: true },
                    { id: 'pod-episode', name: 'Single Episode End-to-End Production', price: 6999, billing: 'per-episode', gstExtra: true, featured: true },
                    { id: 'pod-silver', name: 'Silver — 4 Episodes / Month Retainer', price: 18000, billing: 'monthly', gstExtra: true },
                    { id: 'pod-gold', name: 'Gold — 8 Episodes + 16 Reels / Month', price: 35000, billing: 'monthly', gstExtra: true, featured: true },
                    { id: 'pod-diamond', name: 'Diamond — Brand Authority Executive Show', price: 75000, billing: 'monthly', gstExtra: true }
                ]
            }
        }
    };

    root.TSM_PRICING_CONFIG = TSM_PRICING_CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);

