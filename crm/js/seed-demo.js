
// ── SEED DEMO DATA ──────────────────────────────────────────────────────────
function seedFeed(){
  if(getFeedItems().length)return;
  var now=Date.now(),h=3600000,d=86400000,cList=liveContacts();
  function findC(f,l){return cList.find(function(c){return c.first===f&&c.last===l;})||{};}
  var jeff=findC('Jeff','Ellerby'),shane=findC('Shane','Hurlbut'),sofia=findC('Sofia','Mendez'),ted=findC('Ted','Sim'),lucas=findC('Lucas','Zhang'),amy=findC('Amy','Li'),marco=findC('Marco','Rossi'),ryan=findC('Ryan','Gallagher'),rachel=findC('Rachel','Chen'),greta=findC('Greta','Hoffman');
  var daniel=findC('Daniel','Park'),maria=findC('Maria','Santos'),jordan=findC('Jordan','Okafor'),ava=findC('Ava','Moreno');
  saveFeedItems([
    {id:uid(),type:'intake',contactId:daniel.id||'',text:'New inquiry from <strong>Daniel Park</strong>',detail:'Moonrise Interactive \u00B7 Full Social Media Management',ts:now-2*h},
    {id:uid(),type:'comment',contactId:jeff.id||'',text:'<strong>Brendan Sweeney</strong> commented on Jeff Ellerby',detail:'\u201CSolmen brand architecture deck is ready \u2014 scheduling review for Thursday\u201D',ts:now-4*h},
    {id:uid(),type:'activity',contactId:sofia.id||'',text:'<strong>Kyra Sweeney</strong> moved Sofia Mendez to <strong>Prospects</strong>',ts:now-5*h},
    {id:uid(),type:'intake',contactId:ava.id||'',text:'New inquiry from <strong>Ava Moreno</strong>',detail:'Nightbloom Pictures \u00B7 Just Talk to Us',ts:now-6*h},
    {id:uid(),type:'comment',contactId:shane.id||'',text:'<strong>Chris Haigh</strong> commented on Shane Hurlbut',detail:'\u201CNAB booth layout confirmed. Quality of Light session locked for April 19th\u201D',ts:now-8*h},
    {id:uid(),type:'comment',contactId:lucas.id||'',text:'<strong>Julia Roberts</strong> commented on Lucas Zhang',detail:'\u201CSmallRig posts performing above benchmark \u2014 product lifestyle shots driving 2x saves\u201D',ts:now-8*h},
    {id:uid(),type:'activity',contactId:lucas.id||'',text:'<strong>Brendan Sweeney</strong> updated Lucas Zhang \u2014 monthly deliverables approved',ts:now-12*h},
    {id:uid(),type:'comment',contactId:ryan.id||'',text:'<strong>Kyra Sweeney</strong> commented on Ryan Gallagher',detail:'\u201CAtmos sponsorship convo went well \u2014 they want to see a proposal\u201D',ts:now-18*h},
    {id:uid(),type:'intake',contactId:maria.id||'',text:'New inquiry from <strong>Maria Santos</strong>',detail:'Estrella Theater Company \u00B7 Basic Social Media Strategy Session',ts:now-1*d},
    {id:uid(),type:'activity',contactId:marco.id||'',text:'<strong>Brendan Sweeney</strong> added Marco Rossi \u2014 Nanlux speaking package',ts:now-1.5*d},
    {id:uid(),type:'intake',contactId:jordan.id||'',text:'New inquiry from <strong>Jordan Okafor</strong>',detail:'Content Creator \u00B7 Premium Social Media Audit',ts:now-2*d},
    {id:uid(),type:'comment',contactId:ted.id||'',text:'<strong>Chris Haigh</strong> commented on Ted Sim',detail:'\u201CBrand consulting deck drafted \u2014 review before sending?\u201D',ts:now-2*d},
    {id:uid(),type:'activity',contactId:amy.id||'',text:'<strong>Kyra Sweeney</strong> updated Amy Li \u2014 creator program deliverables on track',ts:now-2*d},
    {id:uid(),type:'comment',contactId:rachel.id||'',text:'<strong>Brendan Sweeney</strong> commented on Rachel Chen',detail:'\u201CFollowing up after Aputure marketing meeting \u2014 warm response\u201D',ts:now-2.5*d},
    {id:uid(),type:'comment',contactId:jordan.id||'',text:'<strong>Julia Roberts</strong> commented on Jordan Okafor',detail:'\u201CStrong visual identity but posting cadence is inconsistent. An audit would give them a clear roadmap.\u201D',ts:now-30*h},
    {id:uid(),type:'activity',contactId:greta.id||'',text:'<strong>Chris Haigh</strong> added Greta Hoffman to prospects \u2014 ARRI brand partnership lead',ts:now-3*d}
  ]);
}
function seedChannel(){
  if(getChannelMsgs().length)return;
  var now=Date.now(),h=3600000;
  saveChannelMsgs([
    {id:uid(),user:'brendan',displayName:'Brendan Sweeney',text:'Morning team. NAB prep is the priority this week \u2014 let\u2019s make sure everything is locked by Thursday.',ts:now-26*h},
    {id:uid(),user:'chrishaigh',displayName:'Chris Haigh',text:'Shane\u2019s deck is locked. I\u2019ll handle the social clips from the booth this week.',ts:now-25*h},
    {id:uid(),user:'kyra',displayName:'Kyra Sweeney',text:'Jeff wants the Cine Gear content plan finalized by end of week. I\u2019ll send the shot list today.',ts:now-24*h},
    {id:uid(),user:'brendan',displayName:'Brendan Sweeney',text:'Perfect. @kyra can you also follow up with Sofia at Teradek? She seemed ready after our last call.',ts:now-22*h},
    {id:uid(),user:'kyra',displayName:'Kyra Sweeney',text:'Already sent. She replied \u2014 wants to talk right after NAB. Putting a meeting on the calendar.',ts:now-20*h},
    {id:uid(),user:'juliaroberts',displayName:'Julia Roberts',text:'All the pre-NAB content for Shane and Filmmakers Academy is queued \u2014 reels, carousels, and stories. Ready to go live on schedule.',ts:now-18*h},
    {id:uid(),user:'chrishaigh',displayName:'Chris Haigh',text:'Quick update \u2014 SmallRig April calendar is fully scheduled. All posts approved by Lucas.',ts:now-16*h},
    {id:uid(),user:'juliaroberts',displayName:'Julia Roberts',text:'SmallRig analytics are looking great this month. The product lifestyle shots are getting 2x the saves vs. last month. Doubling down on that format.',ts:now-14*h},
    {id:uid(),user:'brendan',displayName:'Brendan Sweeney',text:'Love it. Let\u2019s aim to get the Atomos proposal out this week too. Ryan seemed receptive.',ts:now-12*h},
    {id:uid(),user:'kyra',displayName:'Kyra Sweeney',text:'On it. He mentioned they\u2019re unhappy with their current agency \u2014 good timing for us.',ts:now-10*h},
    {id:uid(),user:'juliaroberts',displayName:'Julia Roberts',text:'If Atomos comes on I can start building out a content calendar by next week. Already have a few ideas from studying their current feed.',ts:now-8*h},
    {id:uid(),user:'chrishaigh',displayName:'Chris Haigh',text:'Also \u2014 Greta at ARRI. Shane\u2019s making the intro this week. This could be huge.',ts:now-6*h},
    {id:uid(),user:'brendan',displayName:'Brendan Sweeney',text:'That\u2019s the big one. Let\u2019s have a pitch deck ready before the intro happens. Don\u2019t want to fumble it.',ts:now-4*h},
    {id:uid(),user:'juliaroberts',displayName:'Julia Roberts',text:'I can pull together a social media competitive analysis for ARRI vs. their peers. Might strengthen the pitch deck.',ts:now-3*h}
  ]);
}
function seedDMs(){
  var dms=ls.get(DK)||{};if(Object.keys(dms).length)return;
  var now=Date.now(),h=3600000;
  // Brendan <-> Kyra
  dms[getDMKey('brendan','kyra')]=[
    {id:uid(),from:'brendan',fromName:'Brendan Sweeney',text:'Hey \u2014 did you send the Teradek proposal to Sofia?',ts:now-8*h,read:true},
    {id:uid(),from:'kyra',fromName:'Kyra Sweeney',text:'Yep, sent it yesterday. She said she\u2019ll review after NAB and get back to us.',ts:now-7*h,read:true},
    {id:uid(),from:'brendan',fromName:'Brendan Sweeney',text:'Perfect. Let\u2019s set a reminder to follow up the Monday after NAB.',ts:now-6*h,read:true},
    {id:uid(),from:'kyra',fromName:'Kyra Sweeney',text:'Already on my calendar \u2764\uFE0F',ts:now-5.5*h,read:false}
  ];
  // Brendan <-> Chris
  dms[getDMKey('brendan','chrishaigh')]=[
    {id:uid(),from:'chrishaigh',fromName:'Chris Haigh',text:'NAB booth content plan \u2014 are we doing all 3 days or focusing on day 1?',ts:now-14*h,read:true},
    {id:uid(),from:'brendan',fromName:'Brendan Sweeney',text:'All 3. Day 1 is the big reveal, but I want BTS content from every session.',ts:now-13*h,read:true},
    {id:uid(),from:'chrishaigh',fromName:'Chris Haigh',text:'Got it. I\u2019ll prep the shot list and content briefs for each day. Should have it by tomorrow.',ts:now-12*h,read:true},
    {id:uid(),from:'brendan',fromName:'Brendan Sweeney',text:'You\u2019re a machine. Thanks Chris.',ts:now-11*h,read:true}
  ];
  // Kyra <-> Chris
  dms[getDMKey('kyra','chrishaigh')]=[
    {id:uid(),from:'kyra',fromName:'Kyra Sweeney',text:'Hey Chris \u2014 Dana from SmallRig pitched that Rig Builds collab series. What do you think?',ts:now-20*h,read:true},
    {id:uid(),from:'chrishaigh',fromName:'Chris Haigh',text:'Love the concept. It\u2019s very YouTube-native which is exactly what SmallRig needs.',ts:now-19*h,read:true},
    {id:uid(),from:'kyra',fromName:'Kyra Sweeney',text:'Agreed. I\u2019ll draft a pitch deck and we can run it by Lucas and Amy.',ts:now-18*h,read:true},
    {id:uid(),from:'chrishaigh',fromName:'Chris Haigh',text:'Let me know if you need any production cost estimates \u2014 I can pull those together.',ts:now-16*h,read:false}
  ];
  // Brendan <-> Julia
  dms[getDMKey('brendan','juliaroberts')]=[
    {id:uid(),from:'brendan',fromName:'Brendan Sweeney',text:'Hey Julia \u2014 can you pull the March analytics for Blackout and SmallRig? Want to include them in the quarterly review.',ts:now-20*h,read:true},
    {id:uid(),from:'juliaroberts',fromName:'Julia Roberts',text:'Already on it! Blackout is up 28% engagement, SmallRig up 34% in saves. Full report will be in your inbox by EOD.',ts:now-19*h,read:true},
    {id:uid(),from:'brendan',fromName:'Brendan Sweeney',text:'You\u2019re incredible. Also \u2014 the new inquiry from Daniel Park (gaming studio). Can you take a look at their socials and give me a quick read?',ts:now-15*h,read:true},
    {id:uid(),from:'juliaroberts',fromName:'Julia Roberts',text:'Looked at Moonrise Interactive \u2014 they have solid game art on IG but zero strategy. Huge opportunity. I\u2019d love to work on this one.',ts:now-14*h,read:false}
  ];
  // Kyra <-> Julia
  dms[getDMKey('kyra','juliaroberts')]=[
    {id:uid(),from:'kyra',fromName:'Kyra Sweeney',text:'Julia! The Estrella Theater inquiry is so exciting. A nonprofit theater company \u2014 this is exactly the kind of creative client I love.',ts:now-16*h,read:true},
    {id:uid(),from:'juliaroberts',fromName:'Julia Roberts',text:'Right?? Their Instagram has such good raw material. Rehearsal photos, opening nights. They just need a content framework.',ts:now-15*h,read:true},
    {id:uid(),from:'kyra',fromName:'Kyra Sweeney',text:'Exactly. I think a strategy session would change everything for them. Can you draft a few content pillar ideas before the call?',ts:now-12*h,read:true},
    {id:uid(),from:'juliaroberts',fromName:'Julia Roberts',text:'Absolutely. I\u2019m thinking: Behind the Curtain (rehearsals), Opening Night (event energy), Meet the Cast (personality-driven). Will have it ready tomorrow.',ts:now-10*h,read:false}
  ];
  // Chris <-> Julia
  dms[getDMKey('chrishaigh','juliaroberts')]=[
    {id:uid(),from:'chrishaigh',fromName:'Chris Haigh',text:'Hey Julia \u2014 the NAB social clips. I\u2019m cutting 3 reels from Shane\u2019s talk. Want to coordinate on captions and posting schedule?',ts:now-8*h,read:true},
    {id:uid(),from:'juliaroberts',fromName:'Julia Roberts',text:'Yes! I was going to reach out. I\u2019ll draft the captions tonight and share them with you for review. Thinking we stagger the posts over 5 days.',ts:now-7*h,read:true},
    {id:uid(),from:'chrishaigh',fromName:'Chris Haigh',text:'Perfect cadence. Day 1: highlight reel. Day 2-3: individual topic clips. Day 4-5: BTS booth content. Sound good?',ts:now-5*h,read:true},
    {id:uid(),from:'juliaroberts',fromName:'Julia Roberts',text:'Love that structure. I\u2019ll build the content calendar and share it in the channel.',ts:now-4*h,read:false}
  ];
  ls.set(DK,dms);
}

function seedNotifs(){
  var n=ls.get(NK);if(n&&Object.keys(n).length)return;
  var now=Date.now(),h=3600000,cList=liveContacts();n={};
  function fid(f,l){var c=cList.find(function(x){return x.first===f&&x.last===l;});return c?c.id:null;}
  // Brendan's notifications
  n['brendan']=[
    {id:uid(),text:'<strong>Julia Roberts</strong> commented on Jeff Ellerby',contactId:fid('Jeff','Ellerby'),type:'mention',ts:now-2*h,read:false},
    {id:uid(),text:'<strong>Kyra Sweeney</strong> commented on Ryan Gallagher',contactId:fid('Ryan','Gallagher'),type:'mention',ts:now-18*h,read:false},
    {id:uid(),text:'<strong>Chris Haigh</strong> commented on Shane Hurlbut',contactId:fid('Shane','Hurlbut'),type:'mention',ts:now-8*h,read:true},
    {id:uid(),text:'<strong>Julia Roberts</strong> commented on Jordan Okafor',contactId:fid('Jordan','Okafor'),type:'mention',ts:now-30*h,read:true},
    {id:uid(),text:'<strong>Kyra Sweeney</strong> moved Sofia Mendez to Prospects',contactId:fid('Sofia','Mendez'),type:'mention',ts:now-5*h,read:true},
    {id:uid(),text:'<strong>Julia Roberts</strong> sent you a message',contactId:null,type:'dm',fromUser:'juliaroberts',ts:now-14*h,read:true}
  ];
  // Kyra's notifications
  n['kyra']=[
    {id:uid(),text:'<strong>Julia Roberts</strong> commented on Demi Chase',contactId:fid('Demi','Chase'),type:'mention',ts:now-1*86400000,read:false},
    {id:uid(),text:'<strong>Brendan Sweeney</strong> commented on Jeff Ellerby',contactId:fid('Jeff','Ellerby'),type:'mention',ts:now-4*h,read:false},
    {id:uid(),text:'<strong>Chris Haigh</strong> commented on Greta Hoffman',contactId:fid('Greta','Hoffman'),type:'mention',ts:now-3*86400000,read:true},
    {id:uid(),text:'<strong>Julia Roberts</strong> commented on Lucas Zhang',contactId:fid('Lucas','Zhang'),type:'mention',ts:now-8*h,read:true},
    {id:uid(),text:'<strong>Julia Roberts</strong> sent you a message',contactId:null,type:'dm',fromUser:'juliaroberts',ts:now-10*h,read:true}
  ];
  // Chris's notifications
  n['chrishaigh']=[
    {id:uid(),text:'<strong>Julia Roberts</strong> commented on Shane Hurlbut',contactId:fid('Shane','Hurlbut'),type:'mention',ts:now-6*h,read:false},
    {id:uid(),text:'<strong>Brendan Sweeney</strong> commented on Jeff Ellerby',contactId:fid('Jeff','Ellerby'),type:'mention',ts:now-4*h,read:true},
    {id:uid(),text:'<strong>Kyra Sweeney</strong> commented on Demi Chase',contactId:fid('Demi','Chase'),type:'mention',ts:now-3*86400000,read:true},
    {id:uid(),text:'<strong>Julia Roberts</strong> sent you a message',contactId:null,type:'dm',fromUser:'juliaroberts',ts:now-4*h,read:false}
  ];
  // Julia's notifications
  n['juliaroberts']=[
    {id:uid(),text:'<strong>Brendan Sweeney</strong> commented on Jeff Ellerby',contactId:fid('Jeff','Ellerby'),type:'mention',ts:now-4*h,read:false},
    {id:uid(),text:'<strong>Kyra Sweeney</strong> commented on Demi Chase',contactId:fid('Demi','Chase'),type:'mention',ts:now-3*86400000,read:false},
    {id:uid(),text:'<strong>Chris Haigh</strong> commented on Marco Rossi',contactId:fid('Marco','Rossi'),type:'mention',ts:now-4*86400000,read:true},
    {id:uid(),text:'<strong>Brendan Sweeney</strong> sent you a message',contactId:null,type:'dm',fromUser:'brendan',ts:now-15*h,read:true},
    {id:uid(),text:'<strong>Kyra Sweeney</strong> sent you a message',contactId:null,type:'dm',fromUser:'kyra',ts:now-12*h,read:true},
    {id:uid(),text:'<strong>Chris Haigh</strong> sent you a message',contactId:null,type:'dm',fromUser:'chrishaigh',ts:now-5*h,read:true}
  ];
  // Guest gets a welcome notification
  n['guest']=[
    {id:uid(),text:'Welcome to <strong>Lost Objects CRM</strong> \u2014 you have read-only access.',contactId:null,type:'mention',ts:now-1*h,read:false}
  ];
  ls.set(NK,n);
}
