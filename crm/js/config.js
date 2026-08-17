// ═══ CONSTANTS ═══════════════════════════════════════════════════════════════
var EMOJIS=['🎬','🎥','📽️','🌴','🎞️','⚡','🔥','✨','🎭','🎨','🦁','🐺','🦊','🐉','🌙','🌊','🎸','🎤','📸','🚀'];
var CO_COLORS=['#FF6666','#6690e0','#50b880','#FFCF5A','#c080e0','#e09050','#60c8c8','#e06099','#a060e0','#80d0b8','#FF8C42','#4ECDC4','#A8DADC','#E63946','#457B9D'];
var BASE_USERS={
  brendan:{pass:'sweencake2026',role:'owner',defaultName:'Brendan Sweeney',avatarClass:'',email:'brendan@wearelostobjects.com'},
  kyra:{pass:'kdot2026',role:'owner',defaultName:'Kyra Sweeney',avatarClass:'kyra',email:'kyra@wearelostobjects.com'},
  chrishaigh:{pass:'chaighy2026',role:'editor',defaultName:'Chris Haigh',avatarClass:'',email:'chris@lostobjects.co'},
  juliaroberts:{pass:'robertsjulia2026',role:'editor',defaultName:'Julia Roberts',avatarClass:'',email:'julia@wearelostobjects.com'},
  guest:{pass:'lostobjects-guest',role:'viewer',defaultName:'Guest',avatarClass:'guest',email:''}
};
var ROLE_PERMS={
  owner:{canEdit:true,canAdd:true,canDelete:true,canComment:true,canManageTeam:true},
  editor:{canEdit:true,canAdd:true,canDelete:false,canComment:true,canManageTeam:false},
  commentor:{canEdit:false,canAdd:false,canDelete:false,canComment:true,canManageTeam:false},
  viewer:{canEdit:false,canAdd:false,canDelete:false,canComment:false,canManageTeam:false}
};
var TAG_GROUPS=[
  {label:'Services',tags:[{key:'social-retainer',label:'Social Retainer'},{key:'marketing-retainer',label:'Mktg Retainer'},{key:'social-audit',label:'Social Audit'},{key:'marketing-audit',label:'Mktg Audit'},{key:'meta-ads',label:'Meta Ads'},{key:'strategy-session',label:'Strategy'},{key:'content-creation',label:'Content'},{key:'brand-consulting',label:'Brand Consulting'},{key:'speaking',label:'Speaking'},{key:'event',label:'Event'}]},
  {label:'Platforms',tags:[{key:'instagram',label:'Instagram'},{key:'youtube',label:'YouTube'},{key:'facebook',label:'Facebook'},{key:'tiktok',label:'TikTok'},{key:'threads',label:'Threads'},{key:'x',label:'X/Twitter'},{key:'linkedin',label:'LinkedIn'},{key:'podcast',label:'Podcast'}]},
  {label:'Relationship',tags:[{key:'partner',label:'Partner'},{key:'sponsor',label:'Sponsor'},{key:'collab',label:'Collaborator'},{key:'referral',label:'Referral'},{key:'repeat',label:'Repeat Client'},{key:'press',label:'Press'},{key:'met',label:'Met IRL'}]},
  {label:'Stage',tags:[{key:'cold',label:'Cold'},{key:'warm',label:'Warm'},{key:'proposal',label:'Proposal'},{key:'contract',label:'Contract'},{key:'negotiating',label:'Negotiating'},{key:'on-hold',label:'On Hold'},{key:'wishlist',label:'Wishlist'}]},
  {label:'Source',tags:[{key:'website-inquiry',label:'Website Inquiry'}]}
];
var TAG_MAP={};TAG_GROUPS.forEach(function(g){g.tags.forEach(function(t){TAG_MAP[t.key]=t.label;});});
var CK='lo-contacts-v3',PK='lo-prefs-v1',NK='lo-notifs-v1',UK='lo-users-v1',DK='lo-dms-v1',PRK='lo-presence-v1',ECK='lo-email-cfg',COK='lo-companies-v1';

// Card/pill presentation maps — shared by views, dashboard, dash-edit, trash, detail.
var AV_BG={active:'#CC3333',prospects:'#A8892A',former:'#333',contacts:'#444'};
var PILL_CLS={contacts:'pill-c',active:'pill-a',prospects:'pill-p',former:'pill-f'};
var PILL_LBL={contacts:'Contact',active:'Active',prospects:'Prospect',former:'Former'};
var CAT_LABELS={feed:'Dashboard',companies:'Companies',all:'All Contacts',contacts:'Contacts',active:'Active',prospects:'Prospects',former:'Former',favorites:'Favorites',trash:'Trash'};
