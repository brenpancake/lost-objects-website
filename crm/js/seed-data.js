
// ═══ SEED DATA — unified model ═══════════════════════════════════════════════
// Companies carry lifecycle; contacts reference a company via companyId; intake
// is a sub-object that graduates rather than being deleted. No legacy cat /
// company-string / service / formerReason fields exist here or anywhere else.
//
// Timestamps are emitted relative to load time so the demo stays fresh.
var _t0=Date.now();

var SEED_COMPANIES=[
  {
    "id":"co_4icwx43f4u",
    "name":"Blackout",
    "isSolo":false,
    "handle":"",
    "website":"blackoutconsole.com",
    "color":"#4ECDC4",
    "notes":"",
    "lifecycle":"active",
    "intake":null,
    "engagements":[
      {
        "id":"eng_o7ie9g",
        "serviceId":null,
        "name":"Marketing Retainer",
        "lane":null,
        "status":"active",
        "price":"",
        "manager":null,
        "startedAt":_t0-1229,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["marketing-retainer","strategy-session","instagram","partner","linkedin"],
    "lastContact":"2025-04-01",
    "created":_t0-1229,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_dkfyd53f4u",
    "name":"Filmmakers Academy",
    "isSolo":false,
    "handle":"@shanehurlbutasc",
    "website":"",
    "color":"#c080e0",
    "notes":"",
    "lifecycle":"active",
    "intake":null,
    "engagements":[
      {
        "id":"eng_q06cvk",
        "serviceId":null,
        "name":"Marketing Retainer",
        "lane":null,
        "status":"active",
        "price":"",
        "manager":null,
        "startedAt":_t0-1229,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["marketing-retainer","instagram","youtube","partner","collab"],
    "lastContact":"2025-04-01",
    "created":_t0-1230,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_ynhy523f4u",
    "name":"Aputure",
    "isSolo":false,
    "handle":"@tedsim",
    "website":"",
    "color":"#e06099",
    "notes":"",
    "lifecycle":"prospect",
    "intake":null,
    "engagements":[],
    "owner":null,
    "tags":["warm","brand-consulting","instagram","youtube","marketing-audit","press","partner","collab"],
    "lastContact":"2025-03-05",
    "created":_t0-1228,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_kemcp63f4u",
    "name":"Nanlux",
    "isSolo":false,
    "handle":"",
    "website":"",
    "color":"#FF6666",
    "notes":"",
    "lifecycle":"active",
    "intake":null,
    "engagements":[
      {
        "id":"eng_1xcj38",
        "serviceId":null,
        "name":"Speaking Engagement",
        "lane":null,
        "status":"active",
        "price":"",
        "manager":null,
        "startedAt":_t0-1228,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["speaking","partner","met","instagram","youtube","collab"],
    "lastContact":"2025-03-10",
    "created":_t0-1228,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_d1l6k73f4u",
    "name":"ARRI",
    "isSolo":false,
    "handle":"",
    "website":"",
    "color":"#50b880",
    "notes":"",
    "lifecycle":"prospect",
    "intake":null,
    "engagements":[],
    "owner":null,
    "tags":["cold","brand-consulting","sponsor","partner","speaking","met","collab","instagram","youtube"],
    "lastContact":"2025-02-14",
    "created":_t0-1227,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_1nwb3w3f4u",
    "name":"Atomos",
    "isSolo":false,
    "handle":"@ryangallagher",
    "website":"",
    "color":"#A8DADC",
    "notes":"",
    "lifecycle":"prospect",
    "intake":null,
    "engagements":[],
    "owner":null,
    "tags":["warm","sponsor","brand-consulting","instagram","tiktok","collab","content-creation","youtube"],
    "lastContact":"2025-03-18",
    "created":_t0-1226,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_4f3u0z3f4u",
    "name":"Teradek",
    "isSolo":false,
    "handle":"",
    "website":"",
    "color":"#457B9D",
    "notes":"",
    "lifecycle":"prospect",
    "intake":null,
    "engagements":[],
    "owner":null,
    "tags":["proposal","marketing-retainer","partner","collab","met"],
    "lastContact":"2025-03-22",
    "created":_t0-1226,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_ut1xiw3f4u",
    "name":"SmallRig",
    "isSolo":false,
    "handle":"",
    "website":"",
    "color":"#FF6666",
    "notes":"",
    "lifecycle":"active",
    "intake":null,
    "engagements":[
      {
        "id":"eng_7slvee",
        "serviceId":null,
        "name":"Social Media Retainer",
        "lane":null,
        "status":"active",
        "price":"",
        "manager":null,
        "startedAt":_t0-1228,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["social-retainer","instagram","youtube","collab","partner","content-creation"],
    "lastContact":"2025-04-02",
    "created":_t0-1228,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_iw1zq43f4u",
    "name":"DJI",
    "isSolo":false,
    "handle":"",
    "website":"",
    "color":"#e09050",
    "notes":"",
    "lifecycle":"dormant",
    "intake":null,
    "engagements":[
      {
        "id":"eng_0su0bv",
        "serviceId":null,
        "name":"Scope too small — moved internal",
        "lane":null,
        "status":"completed",
        "price":"",
        "manager":null,
        "startedAt":null,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["partner","sponsor","collab","instagram","youtube","social-audit"],
    "lastContact":"2025-03-01",
    "created":_t0-1230,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_k92kbi3f4u",
    "name":"Zhiyun",
    "isSolo":false,
    "handle":"",
    "website":"",
    "color":"#50b880",
    "notes":"",
    "lifecycle":"prospect",
    "intake":null,
    "engagements":[],
    "owner":null,
    "tags":["wishlist","marketing-audit","instagram","collab","tiktok","cold","met"],
    "lastContact":"2025-02-11",
    "created":_t0-1227,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_5ef5nw3f4u",
    "name":"Moonrise Interactive",
    "isSolo":false,
    "handle":"@moonrisegames",
    "website":"",
    "color":"#6690e0",
    "notes":"",
    "lifecycle":"lead",
    "intake":{
      "stage":"new",
      "lane":"application",
      "source":"website-form",
      "requested":null,
      "service":null,
      "message":"Build a real community around our indie game studio. We want 10K followers across platforms in 6 months and a content pipeline for game launches.",
      "receivedAt":_t0-7201221,
      "startedAt":null,
      "formType":"Discovery Questionnaire",
      "answers":{
        "formType":"Discovery Questionnaire",
        "submitted":"2026-08-17T04:37:40.826Z",
        "presence":"Minimal",
        "challenges":["No strategy","Not growing"],
        "platforms":["Instagram","TikTok","YouTube"],
        "goal":"Build a real community around our indie game studio. We want 10K followers across platforms in 6 months and a content pipeline for game launches.",
        "serviceInterest":"Full Social Media Management",
        "budget":"$1,500 – $3,000 / month",
        "igHandle":"@moonrisegames",
        "igUrl":"",
        "otherHandle":"@moonrisegames",
        "websiteUrl":"https://moonriseinteractive.com",
        "additional":"We’re launching our first title in Q3. Need someone who understands creator culture and gaming audiences."
      },
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[
      {
        "id":"eng_x2rekf",
        "serviceId":null,
        "name":"Full Social Media Management",
        "lane":null,
        "status":"proposed",
        "price":"",
        "manager":null,
        "startedAt":null,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["website-inquiry","social-retainer","instagram","tiktok"],
    "lastContact":"2026-08-17",
    "created":_t0-7201221,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_ilg6gn3f4u",
    "name":"Estrella Theater Company",
    "isSolo":false,
    "handle":"@estrellatheatre",
    "website":"",
    "color":"#4ECDC4",
    "notes":"",
    "lifecycle":"lead",
    "intake":{
      "stage":"new",
      "lane":"booking",
      "source":"website-form",
      "requested":null,
      "service":null,
      "message":"Sell more tickets and attract a younger audience. Our shows are incredible but our social media feels like it’s run by a committee.",
      "receivedAt":_t0-86401221,
      "startedAt":null,
      "formType":"Discovery Questionnaire",
      "answers":{
        "formType":"Discovery Questionnaire",
        "submitted":"2026-08-16T06:37:40.826Z",
        "presence":"Active but stuck",
        "challenges":["Don't know what to post","Inconsistent","Wrong audience"],
        "platforms":["Instagram","Facebook"],
        "goal":"Sell more tickets and attract a younger audience. Our shows are incredible but our social media feels like it’s run by a committee.",
        "serviceInterest":"Basic Social Media Strategy Session",
        "budget":"Under $500 / month",
        "igHandle":"@estrellatheatre",
        "igUrl":"https://instagram.com/estrellatheatre",
        "otherHandle":"",
        "websiteUrl":"https://estrellatheatre.org",
        "additional":"We’re a nonprofit theater company in East LA. Small budget but big ambitions. We do 4 productions a year."
      },
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[
      {
        "id":"eng_6imh4u",
        "serviceId":null,
        "name":"Basic Social Media Strategy Session",
        "lane":null,
        "status":"proposed",
        "price":"",
        "manager":null,
        "startedAt":null,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["website-inquiry","strategy-session","instagram","facebook"],
    "lastContact":"2026-08-16",
    "created":_t0-86401221,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_6ffzxa3f4u",
    "name":"Jordan Okafor",
    "isSolo":true,
    "handle":"@jordanokafor",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"lead",
    "intake":{
      "stage":"new",
      "lane":"booking",
      "source":"website-form",
      "requested":null,
      "service":null,
      "message":"I have 28K on YouTube and 12K on Instagram but growth has flatlined. I know I’m doing something wrong but I can’t figure out what. Need fresh eyes.",
      "receivedAt":_t0-172801221,
      "startedAt":null,
      "formType":"Discovery Questionnaire",
      "answers":{
        "formType":"Discovery Questionnaire",
        "submitted":"2026-08-15T06:37:40.826Z",
        "presence":"Active and growing",
        "challenges":["No strategy","Not growing"],
        "platforms":["Instagram","YouTube","TikTok"],
        "goal":"I have 28K on YouTube and 12K on Instagram but growth has flatlined. I know I’m doing something wrong but I can’t figure out what. Need fresh eyes.",
        "serviceInterest":"Premium Social Media Audit",
        "budget":"$500 – $1,500 / month",
        "igHandle":"@jordanokafor",
        "igUrl":"https://instagram.com/jordanokafor",
        "otherHandle":"@jordanokafor",
        "websiteUrl":"https://jordanokafor.com",
        "additional":""
      },
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[
      {
        "id":"eng_qnci4g",
        "serviceId":null,
        "name":"Premium Social Media Audit",
        "lane":null,
        "status":"proposed",
        "price":"",
        "manager":null,
        "startedAt":null,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":["website-inquiry","social-audit","instagram","youtube","tiktok"],
    "lastContact":"2026-08-15",
    "created":_t0-172801221,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_yj8wrp3f4u",
    "name":"Nightbloom Pictures",
    "isSolo":false,
    "handle":"@nightbloompictures",
    "website":"",
    "color":"#50b880",
    "notes":"",
    "lifecycle":"lead",
    "intake":{
      "stage":"new",
      "lane":"enquiry",
      "source":"website-form",
      "requested":null,
      "service":null,
      "message":"I’ve been following your work with Filmmakers Academy and Legacy Grip for a while. I run a small production company and we’re about to start pre-production on our second feature. I don’t have a huge budget for marketing but I know I need to start building an audience now, not after the film is done. Would love to just talk about what’s possible.",
      "receivedAt":_t0-21601221,
      "startedAt":null,
      "formType":"Just Talk to Us",
      "answers":{
        "formType":"Just Talk to Us",
        "submitted":"2026-08-17T00:37:40.826Z",
        "message":"I’ve been following your work with Filmmakers Academy and Legacy Grip for a while. I run a small production company and we’re about to start pre-production on our second feature. I don’t have a huge budget for marketing but I know I need to start building an audience now, not after the film is done. Would love to just talk about what’s possible."
      },
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[],
    "owner":null,
    "tags":["website-inquiry","warm"],
    "lastContact":"2026-08-17",
    "created":_t0-21601221,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_gnwamf3f4u",
    "name":"Meridian Reef",
    "isSolo":false,
    "handle":"@meridianreef",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"lead",
    "intake":{
      "stage":"new",
      "lane":"booking",
      "source":"pipeline",
      "requested":"premium-audit",
      "service":null,
      "message":"Coastal skincare brand, ~18k on Instagram. Growth stalled since January and we’re posting into the void. Want a proper read on what’s working before we commit to a bigger engagement.",
      "receivedAt":_t0-721220,
      "startedAt":null,
      "formType":null,
      "answers":null,
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[],
    "owner":null,
    "tags":[],
    "lastContact":"2026-08-17",
    "created":_t0-721220,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_3uwc8x3f4u",
    "name":"Nocturne Pictures",
    "isSolo":false,
    "handle":"@nocturnepics",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"lead",
    "intake":{
      "stage":"new",
      "lane":"application",
      "source":"pipeline",
      "requested":"full-management",
      "service":null,
      "message":"Indie horror production house with two features in festival circuit. We need someone to own social end-to-end through our next release. Applying for full management — open to a scoping call.",
      "receivedAt":_t0-2281220,
      "startedAt":null,
      "formType":null,
      "answers":null,
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[],
    "owner":null,
    "tags":[],
    "lastContact":"2026-08-17",
    "created":_t0-2281220,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_60wxn63f4u",
    "name":"Jonah Vance",
    "isSolo":true,
    "handle":"@thekelpforest",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"prospect",
    "intake":{
      "stage":"confirmed",
      "lane":"booking",
      "source":"pipeline",
      "requested":"basic-strategy",
      "service":"basic-strategy",
      "message":"Ocean documentary creator, 42k on YouTube. Confirmed I want a strategy session to map out a Shorts cadence for the next doc drop. Flexible on timing this week.",
      "receivedAt":_t0-7201220,
      "startedAt":null,
      "formType":null,
      "answers":null,
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[
      {
        "id":"eng_lntgo0",
        "serviceId":"basic-strategy",
        "name":"Basic Strategy Session",
        "lane":"booking",
        "status":"proposed",
        "price":"from $500",
        "manager":null,
        "startedAt":null,
        "completedAt":null
      }
    ],
    "owner":null,
    "tags":[],
    "lastContact":"2026-08-17",
    "created":_t0-7201220,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_9d5q293f4u",
    "name":"Sable & Vane",
    "isSolo":false,
    "handle":"@sableandvane",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"prospect",
    "intake":{
      "stage":"assigned",
      "lane":"booking",
      "source":"pipeline",
      "requested":"premium-strategy",
      "service":"premium-strategy",
      "message":"Luxury slow-fashion label launching a capsule in the fall. Booked the premium strategy session — want a full channel + campaign plan around the drop. Kyra, looking forward to it.",
      "receivedAt":_t0-97201220,
      "startedAt":null,
      "formType":null,
      "answers":null,
      "checklist":{},
      "containers":{},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[
      {
        "id":"eng_m4u0tl",
        "serviceId":"premium-strategy",
        "name":"Premium Strategy Session",
        "lane":"booking",
        "status":"proposed",
        "price":"from $2,000",
        "manager":"kyra",
        "startedAt":null,
        "completedAt":null
      }
    ],
    "owner":"kyra",
    "tags":[],
    "lastContact":"2026-08-16",
    "created":_t0-97201220,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_tkh9p33f4u",
    "name":"Priya Anand",
    "isSolo":true,
    "handle":"@runwildmedia",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"prospect",
    "intake":{
      "stage":"onboarding",
      "lane":"booking",
      "source":"pipeline",
      "requested":"basic-audit",
      "service":"basic-audit",
      "message":"Adventure / outdoor creator, 65k across TikTok + IG. Audit is booked and I’ve sent over my logins. Ready to get started whenever Julia is.",
      "receivedAt":_t0-259201220,
      "startedAt":_t0-259201220,
      "formType":null,
      "answers":null,
      "checklist":{"assets":true,"delivered":false},
      "containers":{"agreement":"Signed · Jul 5","assets":"Logins received · 4 items","invoices":"Paid in full · $500","activity":"Audit kickoff scheduled"},
      "graduated":false,
      "graduatedAt":null
    },
    "engagements":[
      {
        "id":"eng_gdr99o",
        "serviceId":"basic-audit",
        "name":"Basic Social Media Audit",
        "lane":"booking",
        "status":"active",
        "price":"from $500",
        "manager":"juliaroberts",
        "startedAt":_t0-259201220,
        "completedAt":null
      }
    ],
    "owner":"juliaroberts",
    "tags":[],
    "lastContact":"2026-08-14",
    "created":_t0-259201220,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  },
  {
    "id":"co_qd0ryf3f4u",
    "name":"Halcyon Studios",
    "isSolo":false,
    "handle":"@halcyongames",
    "website":"",
    "color":"",
    "notes":"",
    "lifecycle":"active",
    "intake":{
      "stage":"onboarding",
      "lane":"application",
      "source":"pipeline",
      "requested":"full-management",
      "service":"full-management",
      "message":"Indie game studio, first title shipping this quarter. Approved for full management — Brendan’s team is running our whole launch calendar. Kickoff is done, we’re live.",
      "receivedAt":_t0-518401220,
      "startedAt":_t0-518401220,
      "formType":null,
      "answers":null,
      "checklist":{"agreement":true,"assets":true,"kickoff":true},
      "containers":{
        "agreement":"Signed · Jun 24",
        "assets":"12 files · brand kit + logins",
        "invoices":"Deposit paid · $2,400 of $6,000",
        "project":"8 tasks · 3 in progress",
        "activity":"Kickoff call logged"
      },
      "graduated":true,
      "graduatedAt":_t0-518401220
    },
    "engagements":[
      {
        "id":"eng_pow2pa",
        "serviceId":"full-management",
        "name":"Full Management",
        "lane":"application",
        "status":"active",
        "price":"Selective · custom",
        "manager":"brendan",
        "startedAt":_t0-518401220,
        "completedAt":null
      }
    ],
    "owner":"brendan",
    "tags":[],
    "lastContact":"2026-08-11",
    "created":_t0-518401220,
    "statusHistory":[],
    "deletion_requested":false,
    "deletion_requested_by":null
  }
];

var SEED_CONTACTS=[
  {
    "id":"0ecp8mu79uh8mswv3f4q",
    "companyId":"co_4icwx43f4u",
    "role":"primary",
    "first":"Jeff",
    "last":"Ellerby",
    "title":"Founder / CEO",
    "email":"jeff@blackoutconsole.com",
    "phone":"310-555-0101",
    "website":"blackoutconsole.com",
    "tags":["marketing-retainer","strategy-session","instagram"],
    "lastContact":"2025-04-01",
    "notes":"Lead client. Cine Gear LA June 5-6. Solmen brand architecture in progress.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Jeff wants to finalize the Cine Gear content plan by end of week. I told him we’d have the shot list over by Wednesday.",
        "ts":_t0-604801221,
        "likes":["brendan"]
      },
      {
        "author":"Chris Haigh",
        "text":"Solmen architecture is looking solid — shared the moodboard with Jeff and he’s into the direction.",
        "ts":_t0-259201221,
        "likes":[]
      },
      {
        "author":"Brendan Sweeney",
        "text":"Solmen brand architecture deck is ready — scheduling review for Thursday",
        "ts":_t0-14401221,
        "likes":["juliaroberts"]
      },
      {
        "author":"Julia Roberts",
        "text":"I’ll prep the social teasers for the Solmen launch once the deck is approved. Already have some caption drafts ready.",
        "ts":_t0-7201221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1229
  },
  {
    "id":"rzhtyid5rsmswv3f4q",
    "companyId":"co_4icwx43f4u",
    "role":"stakeholder",
    "first":"Alan",
    "last":"Marcus",
    "title":"Marketing Consultant",
    "email":"alan@marcus.co",
    "phone":"",
    "website":"",
    "tags":["marketing-retainer","strategy-session"],
    "lastContact":"2025-03-28",
    "notes":"Key stakeholder on roadmap decisions. Very responsive.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Alan confirmed the Q2 roadmap priorities. Content focus is on the console launch.",
        "ts":_t0-518401221,
        "likes":["kyra"]
      }
    ],
    "created":_t0-1228
  },
  {
    "id":"sl6fe2mfnyqmswv3f4q",
    "companyId":"co_4icwx43f4u",
    "role":"network",
    "first":"Maya",
    "last":"Tran",
    "title":"Product Manager",
    "email":"maya@blackoutconsole.com",
    "phone":"",
    "website":"@mayatran",
    "tags":["partner","linkedin"],
    "lastContact":"2025-03-15",
    "notes":"PM on Live Plot Designer. Good bridge between design and engineering.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Maya introduced us to the engineering team. Useful for understanding the Live Plot Designer launch timeline.",
        "ts":_t0-1209601221,
        "likes":["kyra"]
      },
      {
        "author":"Chris Haigh",
        "text":"Good LinkedIn presence — could be worth looping her into the Blackout content series as a subject matter expert.",
        "ts":_t0-691201221,
        "likes":[]
      }
    ],
    "created":_t0-1227
  },
  {
    "id":"td6u3hhj9ecmswv3f4q",
    "companyId":"co_dkfyd53f4u",
    "role":"primary",
    "first":"Shane",
    "last":"Hurlbut",
    "title":"Co-Founder / ASC",
    "email":"shane@filmmakersacademy.com",
    "phone":"",
    "website":"@shanehurlbutasc",
    "tags":["marketing-retainer","instagram","youtube","partner"],
    "lastContact":"2025-03-20",
    "notes":"Fix It In Prep launch. NAB Show April 17-22. Quality of Light speaking slot locked.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"NAB booth assets are in. Need Shane to approve the banner layout before we send to print.",
        "ts":_t0-432001221,
        "likes":["kyra"]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Shane confirmed — he wants the Quality of Light branding front and center.",
        "ts":_t0-345601221,
        "likes":["brendan","chrishaigh"]
      },
      {
        "author":"Chris Haigh",
        "text":"NAB booth layout confirmed. Quality of Light session locked for April 19th",
        "ts":_t0-28801221,
        "likes":["juliaroberts"]
      },
      {
        "author":"Julia Roberts",
        "text":"I’ve scheduled the pre-NAB hype posts for Shane’s channels — 3 reels and a carousel dropping this week.",
        "ts":_t0-21601221,
        "likes":["brendan","kyra","chrishaigh"]
      }
    ],
    "created":_t0-1229
  },
  {
    "id":"pd8u95sc7vmswv3f4q",
    "companyId":"co_dkfyd53f4u",
    "role":"stakeholder",
    "first":"Lydia",
    "last":"Hurlbut",
    "title":"Co-Founder",
    "email":"lydia@filmmakersacademy.com",
    "phone":"",
    "website":"",
    "tags":["marketing-retainer","partner"],
    "lastContact":"2025-03-20",
    "notes":"Operations and partnerships lead.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Lydia approved the partnership deck for Nanlux collab. She’s handling all the contract side.",
        "ts":_t0-864001221,
        "likes":["brendan"]
      },
      {
        "author":"Brendan Sweeney",
        "text":"Lydia wants to discuss the Uscreen integration strategy for the membership platform. Scheduling a call next week.",
        "ts":_t0-432001221,
        "likes":["chrishaigh"]
      }
    ],
    "created":_t0-1229
  },
  {
    "id":"piuio3dxi9fmswv3f4q",
    "companyId":"co_dkfyd53f4u",
    "role":"stakeholder",
    "first":"Demi",
    "last":"Chase",
    "title":"Social Media Coordinator",
    "email":"demi@filmmakersacademy.com",
    "phone":"",
    "website":"@demichase",
    "tags":["marketing-retainer","collab","instagram"],
    "lastContact":"2025-04-01",
    "notes":"Day-to-day social media coordinator for FA. Manages content scheduling and community engagement.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Demi has been crushing the content calendar — engagement is up 40% since she took over scheduling.",
        "ts":_t0-518401221,
        "likes":["kyra","juliaroberts"]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Demi’s Instagram reels for FA are performing really well — the behind-the-scenes content is averaging 3x normal engagement.",
        "ts":_t0-259201221,
        "likes":["brendan","chrishaigh"]
      },
      {
        "author":"Julia Roberts",
        "text":"I’ve been coordinating with Demi on the posting schedule — she’s great to work with. We’re aligned on the May content themes.",
        "ts":_t0-86401221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1230
  },
  {
    "id":"dnu6t5snfcnmswv3f4q",
    "companyId":"co_dkfyd53f4u",
    "role":"network",
    "first":"Rachel",
    "last":"Kim",
    "title":"Community Manager",
    "email":"rachel@filmmakersacademy.com",
    "phone":"",
    "website":"",
    "tags":["partner"],
    "lastContact":"2025-02-10",
    "notes":"Manages member engagement on Uscreen.",
    "comments":[
      {
        "author":"Chris Haigh",
        "text":"Rachel can get us engagement data from the Uscreen community — useful for the quarterly report.",
        "ts":_t0-1728001221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"9w6vyww0bz6mswv3f4q",
    "companyId":"co_ynhy523f4u",
    "role":"primary",
    "first":"Ted",
    "last":"Sim",
    "title":"CEO",
    "email":"ted@aputure.com",
    "phone":"",
    "website":"@tedsim",
    "tags":["warm","brand-consulting","instagram","youtube"],
    "lastContact":"2025-02-15",
    "notes":"Exploring brand consulting retainer. Very active at trade shows.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Had a good call with Ted. He’s interested but wants to see what we did for Blackout first — sending the case study.",
        "ts":_t0-518401221,
        "likes":[]
      },
      {"author":"Chris Haigh","text":"Brand consulting deck drafted — review before sending?","ts":_t0-172801221,"likes":["brendan"]}
    ],
    "created":_t0-1228
  },
  {
    "id":"l2p4y7njthnmswv3f4q",
    "companyId":"co_ynhy523f4u",
    "role":"stakeholder",
    "first":"Rachel",
    "last":"Chen",
    "title":"Head of Marketing",
    "email":"rchen@aputure.com",
    "phone":"",
    "website":"",
    "tags":["warm","marketing-audit","instagram"],
    "lastContact":"2025-02-20",
    "notes":"Primary day-to-day contact for any marketing engagement.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Rachel seems really receptive. She mentioned they’re restructuring their social team — good timing for us.",
        "ts":_t0-432001221,
        "likes":["brendan"]
      },
      {"author":"Brendan Sweeney","text":"Following up after Aputure marketing meeting — warm response","ts":_t0-216001221,"likes":[]}
    ],
    "created":_t0-1227
  },
  {
    "id":"84fq8var50emswv3f4q",
    "companyId":"co_ynhy523f4u",
    "role":"network",
    "first":"David",
    "last":"Liang",
    "title":"PR Manager",
    "email":"dliang@aputure.com",
    "phone":"",
    "website":"",
    "tags":["press","partner"],
    "lastContact":"2025-01-18",
    "notes":"Handles press accreditation and media partnerships.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"David can get us press passes for the next Aputure launch event. Worth staying in touch.",
        "ts":_t0-2592001221,
        "likes":[]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Pinged David about media credentials for NAB. He said he’ll check internally.",
        "ts":_t0-1555201221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"yut9v8kt73cmswv3f4q",
    "companyId":"co_ynhy523f4u",
    "role":"network",
    "first":"Jess",
    "last":"Wong",
    "title":"Partnerships Lead",
    "email":"jwong@aputure.com",
    "phone":"",
    "website":"@jesswong",
    "tags":["partner","collab"],
    "lastContact":"2025-03-05",
    "notes":"Manages creator and brand collaborations.",
    "comments":[
      {
        "author":"Chris Haigh",
        "text":"Jess mentioned they’re looking for creators for the LS 600 Pro campaign. Could be a fit for our talent network.",
        "ts":_t0-1036801221,
        "likes":["kyra","brendan"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"n6duq6r1jdimswv3f4q",
    "companyId":"co_kemcp63f4u",
    "role":"primary",
    "first":"Marco",
    "last":"Rossi",
    "title":"North America Sales Director",
    "email":"marco@nanlux.com",
    "phone":"",
    "website":"",
    "tags":["speaking","partner","met"],
    "lastContact":"2025-03-10",
    "notes":"Shane presenting The Quality of Light at NAB. $15.5k speaking package.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Speaking package signed and paid. $15.5k. Shane’s presentation deck is in progress.",
        "ts":_t0-691201221,
        "likes":["kyra","chrishaigh"]
      },
      {
        "author":"Chris Haigh",
        "text":"Marco wants us to handle the social clips from the NAB talk. Great add-on opportunity.",
        "ts":_t0-345601221,
        "likes":["brendan","juliaroberts"]
      },
      {
        "author":"Julia Roberts",
        "text":"I can cut the social clips from the NAB talk into 3 reels + a highlights carousel. Should have a turnaround of 48 hours post-event.",
        "ts":_t0-172801221,
        "likes":["brendan","chrishaigh","kyra"]
      }
    ],
    "created":_t0-1228
  },
  {
    "id":"8c9wsw0grs2mswv3f4q",
    "companyId":"co_kemcp63f4u",
    "role":"network",
    "first":"Lisa",
    "last":"Park",
    "title":"Social Media Manager",
    "email":"lisa@nanlux.com",
    "phone":"",
    "website":"@lisaparklights",
    "tags":["instagram","youtube","collab"],
    "lastContact":"2025-02-28",
    "notes":"Runs their social content. Great creative instincts.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Lisa’s reels are really good. We should study what she’s doing for our own Nanlux content — similar tone to what we’re building.",
        "ts":_t0-1296001221,
        "likes":["chrishaigh","juliaroberts"]
      },
      {
        "author":"Chris Haigh",
        "text":"Coordinated with Lisa on the NAB product reveal content. She’s handling the unboxing, we’re doing the lifestyle shots.",
        "ts":_t0-604801221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"gejdl8zas79mswv3f4q",
    "companyId":"co_kemcp63f4u",
    "role":"network",
    "first":"Kevin",
    "last":"Huang",
    "title":"Product Marketing Manager",
    "email":"khuang@nanlux.com",
    "phone":"",
    "website":"",
    "tags":["partner"],
    "lastContact":"2025-01-22",
    "notes":"Product side contact for gear review coordination.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Kevin can get us early access units for the new EVO series. Good for review content.",
        "ts":_t0-2160001221,
        "likes":[]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"uxov11dqzanmswv3f4q",
    "companyId":"co_d1l6k73f4u",
    "role":"primary",
    "first":"Greta",
    "last":"Hoffman",
    "title":"VP Brand Partnerships",
    "email":"ghoffman@arri.com",
    "phone":"",
    "website":"",
    "tags":["cold","brand-consulting","sponsor"],
    "lastContact":"",
    "notes":"Top wishlist partner. Warm connection through Shane.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Shane offered to make an intro to Greta. This is our best path into ARRI.",
        "ts":_t0-1728001221,
        "likes":["kyra","chrishaigh"]
      },
      {
        "author":"Chris Haigh",
        "text":"Added Greta to prospects. ARRI is the dream partnership — let’s play this one carefully.",
        "ts":_t0-259201221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1227
  },
  {
    "id":"qyjfh8du3vemswv3f4q",
    "companyId":"co_d1l6k73f4u",
    "role":"network",
    "first":"James",
    "last":"Whitfield",
    "title":"Director of Education",
    "email":"jwhitfield@arri.com",
    "phone":"",
    "website":"",
    "tags":["partner","speaking","met"],
    "lastContact":"2025-01-30",
    "notes":"Met at Cine Gear. Education program alignment is strong.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"James is interested in co-producing an education series with Filmmakers Academy. Great synergy here.",
        "ts":_t0-1900801221,
        "likes":["chrishaigh"]
      },
      {
        "author":"Kyra Sweeney",
        "text":"James followed up after Cine Gear — he wants to explore a speaking slot for Shane at ARRI’s education summit.",
        "ts":_t0-1296001221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"aogztx23kmswv3f4q",
    "companyId":"co_d1l6k73f4u",
    "role":"network",
    "first":"Mia",
    "last":"Bauer",
    "title":"Digital Content Lead",
    "email":"mbauer@arri.com",
    "phone":"",
    "website":"@miabauer",
    "tags":["collab","instagram","youtube"],
    "lastContact":"2025-02-14",
    "notes":"Runs their digital editorial content.",
    "comments":[
      {
        "author":"Chris Haigh",
        "text":"Mia’s editorial style is really aligned with what we do. If ARRI comes on board she’d be the day-to-day creative contact.",
        "ts":_t0-1382401221,
        "likes":["kyra"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"1f4wy2lgw2fhmswv3f4q",
    "companyId":"co_1nwb3w3f4u",
    "role":"primary",
    "first":"Ryan",
    "last":"Gallagher",
    "title":"CEO",
    "email":"ryan@atomos.com",
    "phone":"",
    "website":"@ryangallagher",
    "tags":["warm","sponsor","brand-consulting"],
    "lastContact":"2025-03-18",
    "notes":"Open to a sponsorship conversation.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Ryan’s team is looking for a long-term content partner. He mentioned they’re unhappy with their current agency.",
        "ts":_t0-259201221,
        "likes":["kyra","chrishaigh"]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Atomos sponsorship convo went well — they want to see a proposal",
        "ts":_t0-64801221,
        "likes":["brendan","juliaroberts"]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"wyq67fpatlmswv3f4q",
    "companyId":"co_1nwb3w3f4u",
    "role":"network",
    "first":"Priya",
    "last":"Shah",
    "title":"Social Media Manager",
    "email":"pshah@atomos.com",
    "phone":"",
    "website":"@priyashah",
    "tags":["instagram","tiktok","collab"],
    "lastContact":"2025-02-22",
    "notes":"Great TikTok instincts.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Priya’s TikTok game is strong. We should study her format for the short-form content strategy we’re building.",
        "ts":_t0-1209601221,
        "likes":["chrishaigh","brendan","juliaroberts"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"rjqav9p35f9mswv3f4q",
    "companyId":"co_1nwb3w3f4u",
    "role":"network",
    "first":"Nathan",
    "last":"Cole",
    "title":"Content Director",
    "email":"ncole@atomos.com",
    "phone":"",
    "website":"",
    "tags":["content-creation","youtube"],
    "lastContact":"2025-01-15",
    "notes":"Manages long-form content production.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Nathan’s YouTube production quality is excellent. If we land Atomos, he’d be a great collab partner for long-form.",
        "ts":_t0-2419201221,
        "likes":[]
      }
    ],
    "created":_t0-1224
  },
  {
    "id":"jrx1rcr9jcomswv3f4q",
    "companyId":"co_4f3u0z3f4u",
    "role":"primary",
    "first":"Sofia",
    "last":"Mendez",
    "title":"VP Marketing",
    "email":"smendez@teradek.com",
    "phone":"",
    "website":"",
    "tags":["proposal","marketing-retainer"],
    "lastContact":"2025-03-22",
    "notes":"Proposal sent March 22. Follow up after NAB.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Moved Sofia to prospects — she’s ready for a real conversation. Proposal went out today.",
        "ts":_t0-18001221,
        "likes":["brendan"]
      },
      {
        "author":"Brendan Sweeney",
        "text":"Good call with Sofia. Teradek wants something similar to what we’re doing for Blackout. Following up after NAB.",
        "ts":_t0-864001221,
        "likes":[]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"ju2ixf83qzmswv3f4q",
    "companyId":"co_4f3u0z3f4u",
    "role":"network",
    "first":"Aaron",
    "last":"Fitch",
    "title":"Brand Partnerships",
    "email":"afitch@teradek.com",
    "phone":"",
    "website":"@aaronfitch",
    "tags":["partner","collab","met"],
    "lastContact":"2025-02-08",
    "notes":"Met at Cine Gear 2024. Needs relationship building.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Aaron was super friendly at Cine Gear but we haven’t kept the momentum going. Need to re-engage.",
        "ts":_t0-1555201221,
        "likes":[]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Sent Aaron a follow-up DM. He responded — says they’re looking at partnerships for Q3. Keeping warm.",
        "ts":_t0-864001221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"tu3ptazqbhmswv3f4q",
    "companyId":"co_ut1xiw3f4u",
    "role":"primary",
    "first":"Lucas",
    "last":"Zhang",
    "title":"Global Marketing Director",
    "email":"lzhang@smallrig.com",
    "phone":"",
    "website":"",
    "tags":["social-retainer","instagram","youtube"],
    "lastContact":"2025-04-02",
    "notes":"Monthly deliverables running smoothly.",
    "comments":[
      {
        "author":"Chris Haigh",
        "text":"April content calendar approved by Lucas. All posts scheduled through the 30th.",
        "ts":_t0-172801221,
        "likes":["brendan","kyra"]
      },
      {
        "author":"Brendan Sweeney",
        "text":"Monthly deliverables approved — SmallRig is in great shape this month.",
        "ts":_t0-43201221,
        "likes":["juliaroberts"]
      },
      {
        "author":"Julia Roberts",
        "text":"All SmallRig posts are performing above benchmark. The product lifestyle shots are driving the most saves — doubling down on that format.",
        "ts":_t0-28801221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1228
  },
  {
    "id":"81vke9weyw6mswv3f4q",
    "companyId":"co_ut1xiw3f4u",
    "role":"stakeholder",
    "first":"Amy",
    "last":"Li",
    "title":"Creator Relations Manager",
    "email":"ali@smallrig.com",
    "phone":"",
    "website":"@amyli",
    "tags":["social-retainer","collab","instagram"],
    "lastContact":"2025-03-30",
    "notes":"Day-to-day for creator program. Excellent communicator.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Creator program deliverables on track — Amy confirmed the collab lineup for May.",
        "ts":_t0-172801221,
        "likes":["brendan"]
      },
      {"author":"Chris Haigh","text":"Amy flagged that one of the creator collabs fell through. Working on a replacement.","ts":_t0-345601221,"likes":[]}
    ],
    "created":_t0-1228
  },
  {
    "id":"na8l4trfo2mswv3f4q",
    "companyId":"co_ut1xiw3f4u",
    "role":"network",
    "first":"Tom",
    "last":"Xu",
    "title":"Product Development",
    "email":"txu@smallrig.com",
    "phone":"",
    "website":"",
    "tags":["partner"],
    "lastContact":"2025-01-09",
    "notes":"Good for early review access.",
    "comments":[
      {
        "author":"Chris Haigh",
        "text":"Tom can get us pre-release units 2–3 weeks before launch. Huge for first-look content.",
        "ts":_t0-2592001221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"fjq3r6yacbdmswv3f4q",
    "companyId":"co_ut1xiw3f4u",
    "role":"network",
    "first":"Dana",
    "last":"Mills",
    "title":"Content Creator",
    "email":"dmills@smallrig.com",
    "phone":"",
    "website":"@danamills",
    "tags":["content-creation","youtube","collab"],
    "lastContact":"2025-02-17",
    "notes":"Potential collab content series.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Dana pitched a collab series idea — “Rig Builds” where she builds custom setups using SmallRig gear. Could be great for their socials.",
        "ts":_t0-1382401221,
        "likes":["brendan","chrishaigh","juliaroberts"]
      },
      {
        "author":"Brendan Sweeney",
        "text":"Love the concept. Let’s build a quick pitch deck and run it by Lucas and Amy.",
        "ts":_t0-1209601221,
        "likes":["kyra"]
      }
    ],
    "created":_t0-1224
  },
  {
    "id":"z6f4lmn6icrmswv3f4q",
    "companyId":"co_iw1zq43f4u",
    "role":"network",
    "first":"Ellie",
    "last":"Kong",
    "title":"Brand Marketing Manager",
    "email":"ekong@dji.com",
    "phone":"",
    "website":"",
    "tags":["partner","sponsor"],
    "lastContact":"2025-02-05",
    "notes":"Handles influencer and brand deals. Very process-driven.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Ellie runs a tight ship. Any DJI partnership will need a formal proposal with deliverables, timelines, and KPIs.",
        "ts":_t0-1900801221,
        "likes":["kyra"]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Noted. Let’s build the proposal template first so we’re ready when the timing is right.",
        "ts":_t0-1728001221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1226
  },
  {
    "id":"70tmacdff7vmswv3f4q",
    "companyId":"co_iw1zq43f4u",
    "role":"network",
    "first":"Marcus",
    "last":"Lee",
    "title":"Creator Partnerships Lead",
    "email":"mlee@dji.com",
    "phone":"",
    "website":"@marcuslee",
    "tags":["collab","instagram","youtube"],
    "lastContact":"2025-03-01",
    "notes":"Manages the creator program.",
    "comments":[
      {
        "author":"Chris Haigh",
        "text":"Marcus runs the DJI creator ambassador program. If we get in, it’s recurring content plus gear access.",
        "ts":_t0-1036801221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"tshwbgit53mswv3f4q",
    "companyId":"co_iw1zq43f4u",
    "role":"stakeholder",
    "first":"Chloe",
    "last":"Sun",
    "title":"Social Content Manager",
    "email":"csun@dji.com",
    "phone":"",
    "website":"",
    "tags":["social-audit"],
    "lastContact":"2024-10-15",
    "notes":"Did a social audit Q3 2024. Amicable exit.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Audit went well but DJI decided to handle social internally. Chloe was great to work with — keep the door open.",
        "ts":_t0-10368001221,
        "likes":["brendan"]
      },
      {
        "author":"Brendan Sweeney",
        "text":"No hard feelings here. Chloe appreciated the work and said she’d recommend us internally if scope changes.",
        "ts":_t0-9936001221,
        "likes":[]
      }
    ],
    "created":_t0-1230
  },
  {
    "id":"ckwoz3qf7njmswv3f4q",
    "companyId":"co_k92kbi3f4u",
    "role":"primary",
    "first":"Henry",
    "last":"Wu",
    "title":"International Marketing Lead",
    "email":"hwu@zhiyun.com",
    "phone":"",
    "website":"",
    "tags":["wishlist","marketing-audit","instagram"],
    "lastContact":"",
    "notes":"Wishlist client. Strong product line that needs brand strategy.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Zhiyun’s product line is strong but their brand identity is scattered. A marketing audit would be a perfect entry point.",
        "ts":_t0-1555201221,
        "likes":["kyra"]
      },
      {
        "author":"Chris Haigh",
        "text":"Their Instagram is all over the place. If we can show them what good looks like with a competitive comparison, that’s the pitch.",
        "ts":_t0-864001221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-1227
  },
  {
    "id":"ctykf9ywyosmswv3f4q",
    "companyId":"co_k92kbi3f4u",
    "role":"network",
    "first":"Becky",
    "last":"Lin",
    "title":"Creator Partnerships",
    "email":"blin@zhiyun.com",
    "phone":"",
    "website":"@beckylin",
    "tags":["collab","tiktok"],
    "lastContact":"2025-01-28",
    "notes":"Interesting fit for Kyra-led content strategy.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Becky’s TikTok creator network is exactly the audience Zhiyun needs. If we land Henry, Becky becomes our creative bridge.",
        "ts":_t0-1036801221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-1225
  },
  {
    "id":"1ghvcbayb58mswv3f4q",
    "companyId":"co_k92kbi3f4u",
    "role":"network",
    "first":"Sam",
    "last":"Torres",
    "title":"North America Rep",
    "email":"storres@zhiyun.com",
    "phone":"",
    "website":"",
    "tags":["cold","met"],
    "lastContact":"2025-02-11",
    "notes":"Met at NAB 2024. Relationship still cold.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Sam was friendly at NAB but gave off “I’m just the trade show guy” energy. Henry is the real decision maker.",
        "ts":_t0-2073601221,
        "likes":["kyra"]
      }
    ],
    "created":_t0-1224
  },
  {
    "id":"0zzva86wloybmswv3f4q",
    "companyId":"co_5ef5nw3f4u",
    "role":"primary",
    "first":"Daniel",
    "last":"Park",
    "title":"Gaming Company or Studio",
    "email":"daniel@moonriseinteractive.com",
    "phone":"213-555-0188",
    "website":"@moonrisegames",
    "tags":["website-inquiry","social-retainer","instagram","tiktok"],
    "lastContact":"2026-08-17",
    "notes":"Social Presence: Minimal\nChallenges: No strategy, Not growing\nPlatforms: Instagram, TikTok, YouTube\nGoal: Build a real community around our indie game studio. We want 10K followers across platforms in 6 months and a content pipeline for game launches.\nBudget: $1,500 – $3,000 / month\nAdditional: We’re launching our first title in Q3. Need someone who understands creator culture and gaming audiences.",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"This is a great lead — gaming studio with a real launch timeline and budget. Exactly the kind of entertainment client we’re trying to attract.",
        "ts":_t0-3601221,
        "likes":["kyra","chrishaigh"]
      },
      {
        "author":"Kyra Sweeney",
        "text":"Agreed. Their TikTok strategy needs to be native to gaming culture. I have some ideas for launch content — let’s discuss on the next call.",
        "ts":_t0-1801221,
        "likes":["brendan"]
      }
    ],
    "created":_t0-7201221
  },
  {
    "id":"j9e3us4l1xbmswv3f4q",
    "companyId":"co_ilg6gn3f4u",
    "role":"primary",
    "first":"Maria",
    "last":"Santos",
    "title":"Theater or Performing Arts",
    "email":"maria@estrellatheatre.org",
    "phone":"323-555-0244",
    "website":"@estrellatheatre",
    "tags":["website-inquiry","strategy-session","instagram","facebook"],
    "lastContact":"2026-08-16",
    "notes":"Social Presence: Active but stuck\nChallenges: Don't know what to post, Inconsistent, Wrong audience\nPlatforms: Instagram, Facebook\nGoal: Sell more tickets and attract a younger audience. Our shows are incredible but our social media feels like it’s run by a committee.\nBudget: Under $500 / month\nAdditional: We’re a nonprofit theater company in East LA. Small budget but big ambitions. We do 4 productions a year.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"Love this inquiry. Theater company with real passion but no social direction. A strategy session would give them a clear playbook.",
        "ts":_t0-64801221,
        "likes":["brendan"]
      },
      {
        "author":"Chris Haigh",
        "text":"Their Instagram has great raw content — rehearsal photos, opening night energy. They just need structure. This is a quick win.",
        "ts":_t0-43201221,
        "likes":["kyra","brendan"]
      }
    ],
    "created":_t0-86401221
  },
  {
    "id":"3ntztkk7mrjmswv3f4q",
    "companyId":"co_6ffzxa3f4u",
    "role":"primary",
    "first":"Jordan",
    "last":"Okafor",
    "title":"Content Creator",
    "email":"jordan@jordanokafor.com",
    "phone":"",
    "website":"@jordanokafor",
    "tags":["website-inquiry","social-audit","instagram","youtube","tiktok"],
    "lastContact":"2026-08-15",
    "notes":"Social Presence: Active and growing\nChallenges: No strategy, Not growing\nPlatforms: Instagram, YouTube, TikTok\nGoal: I have 28K on YouTube and 12K on Instagram but growth has flatlined. I know I’m doing something wrong but I can’t figure out what. Need fresh eyes.\nBudget: $500 – $1,500 / month",
    "comments":[
      {
        "author":"Brendan Sweeney",
        "text":"Creator with a real audience that’s plateaued. A premium audit would uncover exactly what’s holding them back. Great fit for us.",
        "ts":_t0-129601221,
        "likes":["kyra"]
      },
      {
        "author":"Julia Roberts",
        "text":"I looked at Jordan’s content — strong visual identity but posting cadence is inconsistent. An audit would give them a clear roadmap.",
        "ts":_t0-108001221,
        "likes":["brendan","kyra"]
      }
    ],
    "created":_t0-172801221
  },
  {
    "id":"gnnvbmpizpemswv3f4q",
    "companyId":"co_yj8wrp3f4u",
    "role":"primary",
    "first":"Ava",
    "last":"Moreno",
    "title":"Director or Producer",
    "email":"ava@nightbloom.film",
    "phone":"310-555-0399",
    "website":"@nightbloompictures",
    "tags":["website-inquiry","warm"],
    "lastContact":"2026-08-17",
    "notes":"I’ve been following your work with Filmmakers Academy and Legacy Grip for a while. I run a small production company and we’re about to start pre-production on our second feature. I don’t have a huge budget for marketing but I know I need to start building an audience now, not after the film is done. Would love to just talk about what’s possible.",
    "comments":[
      {
        "author":"Kyra Sweeney",
        "text":"This is exactly our ideal client — a filmmaker who gets that audience building starts in pre-production. Let’s get her on a call this week.",
        "ts":_t0-14401221,
        "likes":["brendan","chrishaigh"]
      },
      {
        "author":"Brendan Sweeney",
        "text":"Agreed. Ava clearly did her homework on us. This could be a great case study if we can build the audience alongside the film.",
        "ts":_t0-10801221,
        "likes":["kyra"]
      }
    ],
    "created":_t0-21601221
  },
  {
    "id":"gxjjs6mu32amswv3f4u",
    "companyId":"co_gnwamf3f4u",
    "role":"primary",
    "first":"Dana",
    "last":"Okafor",
    "title":"",
    "email":"dana@meridianreef.co",
    "phone":"",
    "website":"@meridianreef",
    "tags":[],
    "lastContact":"2026-08-17",
    "notes":"Coastal skincare brand, ~18k on Instagram. Growth stalled since January and we’re posting into the void. Want a proper read on what’s working before we commit to a bigger engagement.",
    "comments":[],
    "created":_t0-721220
  },
  {
    "id":"fe15geg5f1mswv3f4u",
    "companyId":"co_3uwc8x3f4u",
    "role":"primary",
    "first":"Elias",
    "last":"Vane",
    "title":"",
    "email":"elias@nocturnepictures.film",
    "phone":"",
    "website":"@nocturnepics",
    "tags":[],
    "lastContact":"2026-08-17",
    "notes":"Indie horror production house with two features in festival circuit. We need someone to own social end-to-end through our next release. Applying for full management — open to a scoping call.",
    "comments":[],
    "created":_t0-2281220
  },
  {
    "id":"zema4pe5w8mswv3f4u",
    "companyId":"co_60wxn63f4u",
    "role":"primary",
    "first":"Jonah",
    "last":"Vance",
    "title":"",
    "email":"jonah@thekelpforest.com",
    "phone":"",
    "website":"@thekelpforest",
    "tags":[],
    "lastContact":"2026-08-17",
    "notes":"Ocean documentary creator, 42k on YouTube. Confirmed I want a strategy session to map out a Shorts cadence for the next doc drop. Flexible on timing this week.",
    "comments":[],
    "created":_t0-7201220
  },
  {
    "id":"7akulqnrlrwmswv3f4u",
    "companyId":"co_9d5q293f4u",
    "role":"primary",
    "first":"Priscilla",
    "last":"Sable",
    "title":"",
    "email":"hello@sableandvane.com",
    "phone":"",
    "website":"@sableandvane",
    "tags":[],
    "lastContact":"2026-08-16",
    "notes":"Luxury slow-fashion label launching a capsule in the fall. Booked the premium strategy session — want a full channel + campaign plan around the drop. Kyra, looking forward to it.",
    "comments":[],
    "created":_t0-97201220
  },
  {
    "id":"pemdjjhb7smswv3f4u",
    "companyId":"co_tkh9p33f4u",
    "role":"primary",
    "first":"Priya",
    "last":"Anand",
    "title":"",
    "email":"priya@runwildmedia.co",
    "phone":"",
    "website":"@runwildmedia",
    "tags":[],
    "lastContact":"2026-08-14",
    "notes":"Adventure / outdoor creator, 65k across TikTok + IG. Audit is booked and I’ve sent over my logins. Ready to get started whenever Julia is.",
    "comments":[],
    "created":_t0-259201220
  },
  {
    "id":"k63buoak3wpmswv3f4u",
    "companyId":"co_qd0ryf3f4u",
    "role":"primary",
    "first":"Rowan",
    "last":"Ito",
    "title":"",
    "email":"rowan@halcyonstudios.gg",
    "phone":"",
    "website":"@halcyongames",
    "tags":[],
    "lastContact":"2026-08-11",
    "notes":"Indie game studio, first title shipping this quarter. Approved for full management — Brendan’s team is running our whole launch calendar. Kickoff is done, we’re live.",
    "comments":[],
    "created":_t0-518401220
  }
];
