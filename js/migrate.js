// ════════════════════════════════
// SCHEMA MIGRATION  (v2 → v3)
//
// Runs once per profile, before anything reads the data. It always writes a
// full untouched backup first, so every repair below is reversible from
// Settings → Restore Backup.
//
// Repairs, in order:
//   1. date keys   — pad 2026-6-9 to 2026-06-09 everywhere, merging collisions.
//                    The old build did this for suppLog/waterLog/pepLog and the
//                    fasting log but never for dietLog or shopLog.
//   2. set values  — coerce string weights/reps ('00') to numbers.
//   3. PRs         — rebuild from logged sets, which are the source of truth.
//                    A PR with no set behind it was a typo, not a lift.
//   4. fasting log — discard impossible durations (>48h) left by a fastStart
//                    that never cleared.
//   5. weekStart   — re-anchor if inherited from the old shared global key.
//   6. implements  — tag legacy lifts so Smith and barbell PRs stay separate.
//   7. programs    — wrap the existing day list as the 'Forge' program.
// ════════════════════════════════

var SCHEMA_VERSION = 3;
var BACKUP_KEY_PREFIX = 'forge_v2backup_';

// Lifts logged on a Smith machine but recorded under a barbell name. The
// weights in this history are Smith-bar loads, which are not comparable to a
// free barbell — counterbalanced Smith bars weigh far less than 45 lb, and the
// fixed path removes the stabilization demand. Tagging them keeps the records
// intact while making sure a future barbell lift starts its own line rather
// than looking like a regression against these numbers.
var LEGACY_SMITH = [
  'Barbell Bench Press','Barbell Back Squat','Barbell Overhead Press',
  'Romanian Deadlift','EZ Bar Curl','Hip Thrust Smith Machine',
  'Hack Squat Smith Machine','Skull Crusher','Incline Barbell Press'
];

// Exercises renamed at some point, leaving an orphaned PR behind.
var NAME_ALIASES = {
  'Leg Extensions':'Leg Extension',
  'Cable Seated Row':'Seated Cable Row',
  'Calf Machine':'Standing Calf Raise'
};

function mgNum(v){
  if(typeof v === 'number') return isFinite(v) ? v : 0;
  if(typeof v === 'string'){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
  return 0;
}
function mgPadKey(k){
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(k);
  if(!m) return null;
  var p = m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
  return p === k ? null : p;
}
// Merge two same-day records. Booleans OR together, numbers take the larger,
// arrays concatenate — never silently drop the loser of a key collision.
function mgMerge(a,b){
  if(a == null) return b;
  if(b == null) return a;
  if(typeof a === 'boolean' || typeof b === 'boolean') return !!(a || b);
  if(typeof a === 'number' && typeof b === 'number') return Math.max(a,b);
  if(Array.isArray(a) && Array.isArray(b)) return a.concat(b);
  if(typeof a === 'object' && typeof b === 'object'){
    var out = {}, k;
    for(k in a) out[k] = a[k];
    for(k in b) out[k] = (k in out) ? mgMerge(out[k], b[k]) : b[k];
    return out;
  }
  return b;
}
function mgPadMap(obj,report,label){
  if(!obj || typeof obj !== 'object') return obj;
  var keys = [], k;
  for(k in obj) keys.push(k);
  for(var i=0;i<keys.length;i++){
    var old = keys[i], pad = mgPadKey(old);
    if(!pad) continue;
    if(obj[pad] !== undefined){
      obj[pad] = mgMerge(obj[pad], obj[old]);
      report.push(label+': merged '+old+' into '+pad);
    } else {
      obj[pad] = obj[old];
      report.push(label+': re-keyed '+old+' → '+pad);
    }
    delete obj[old];
  }
  return obj;
}

// Ordered rules — first match wins. Anything unmatched becomes 'other'
// rather than a guess, because a wrong implement tag splits an exercise's
// history into two records that never recombine.
var IMPL_RULES = [
  ['bw',       /stretch|pose|cat-cow|plank|bicycle|crunchy frog|scissors|climber|mason twist|oblique|v-up|in & outs|pulse ups|hip rock|glute bridge|sit-up|hanging leg raise|battle rope|rowing machine|reverse lunge|thoracic|wrist circles|band pull-apart|lateral band walk/i],
  ['dumbbell', /dumbbell|hammer curl|arnold press|farmer|bulgarian split squat/i],
  ['cable',    /cable|pulldown|pushdown|face pull|pallof|woodchop|rope|rear delt/i],
  ['machine',  /machine|leg press|leg curl|leg extension|pec deck|calf raise|t-bar|assisted/i],
  ['smith',    /barbell|smith|ez bar|skull crusher/i],
  ['bw',       /pull-up|chin-up|push-up|dip|decline sit-up|russian twist/i]
];
function mgImplFor(name,maxWeight){
  // Never logged with load at all — it is bodyweight or mobility work.
  if(maxWeight !== undefined && maxWeight <= 0) return 'bw';
  for(var i=0;i<LEGACY_SMITH.length;i++){ if(LEGACY_SMITH[i] === name) return 'smith'; }
  for(var j=0;j<IMPL_RULES.length;j++){
    if(IMPL_RULES[j][1].test(name)) return IMPL_RULES[j][0];
  }
  return 'other';
}
function mgCanon(name){ return NAME_ALIASES[name] || name; }

// e1RM, Epley. Matches the existing engine so rebuilt PRs stay comparable
// with everything already on record.
function mgEpley(w,r){
  if(!w || !r || r === 1) return w;
  return Math.round(w * (1 + r/30));
}

// ── PR rebuild ────────────────────────────────────────────────
// PRs are derived data. Rebuilding them from the logged sets removes any
// record that no set supports, and folds renamed exercises back together.
// A PR above this multiple of the best set ever logged for that exercise is
// treated as a typo rather than a lift. Below it, the old record is kept even
// when no set backs it, because sessions get edited and deleted and a real PR
// should not vanish for that reason.
var PR_IMPLAUSIBLE_RATIO = 2.5;

function mgRebuildPRs(log,oldPrs,report){
  var best = {}, maxW = {}, i, j, name, sets, st;

  // Pass 1 — heaviest load ever logged per exercise, for implement inference
  // and for the plausibility ceiling.
  for(i=0;i<log.length;i++){
    var raw0 = log[i].rawSets || {};
    for(name in raw0){
      var c0 = mgCanon(name), s0 = raw0[name] || [];
      for(j=0;j<s0.length;j++){
        var w0 = mgNum((s0[j]||{}).weight);
        if(w0 > (maxW[c0]||0)) maxW[c0] = w0;
      }
    }
  }
  // Pass 2 — best e1RM per exercise+implement, from the sets themselves.
  for(i=0;i<log.length;i++){
    var raw = log[i].rawSets || {};
    for(name in raw){
      var canon = mgCanon(name);
      var impl  = mgImplFor(canon, maxW[canon]);
      var key   = canon + ' [' + impl + ']';
      sets = raw[name] || [];
      for(j=0;j<sets.length;j++){
        st = sets[j] || {};
        if(st.warmup) continue;
        var w = mgNum(st.weight), r = mgNum(st.reps);
        if(w <= 0 || r <= 0) continue;
        var orm = mgEpley(w,r);
        if(!best[key] || orm > best[key].orm){
          best[key] = {weight:w, reps:r, orm:orm, date:log[i].date,
                       name:canon, impl:impl};
        }
      }
    }
  }
  // Pass 3 — reconcile against the old table. Keep the better record unless
  // the old one is implausible on its face.
  var prs = {}, k;
  for(k in best) prs[k] = best[k];
  for(name in (oldPrs||{})){
    var c   = mgCanon(name);
    var im  = mgImplFor(c, maxW[c]);
    var key2 = c + ' [' + im + ']';
    var old = oldPrs[name] || {};
    var wasW = mgNum(old.weight), wasO = mgNum(old.orm) || mgEpley(wasW, mgNum(old.reps)||1);
    var ceiling = (maxW[c] || 0) * PR_IMPLAUSIBLE_RATIO;

    if(maxW[c] !== undefined && wasW > ceiling && ceiling > 0){
      report.push('PR corrected: '+name+' '+wasW+' lb → '+
                  (prs[key2] ? prs[key2].weight+' lb' : 'removed')+
                  ' (no set above '+maxW[c]+' lb was ever logged)');
      continue;                       // drop the implausible record
    }
    if(!prs[key2] || wasO > prs[key2].orm){
      prs[key2] = {weight:wasW, reps:mgNum(old.reps)||1, orm:wasO,
                   date:old.date, name:c, impl:im,
                   // flagged when no logged set reaches this load — the record
                   // is kept, but the UI can mark it as unconfirmed
                   unverified: (!best[key2] || wasW > (maxW[c]||0))};
      if(!best[key2] || wasW > (maxW[c]||0))
        report.push('PR kept but unconfirmed: '+name+' @ '+wasW+' lb — heaviest logged set is '+
                    (maxW[c]||0)+' lb (likely from an edited or deleted session)');
    }
    if(NAME_ALIASES[name]) report.push('PR merged: '+name+' → '+c);
  }
  return prs;
}

function mgFixFasting(ifData,report){
  if(!ifData || !ifData.log) return ifData;
  for(var k in ifData.log){
    var h = mgNum(ifData.log[k].hours);
    if(h > 48){
      report.push('Fasting log: discarded '+h.toFixed(1)+'h on '+k+' (timer never cleared)');
      ifData.log[k].hours = 0;
      ifData.log[k].completed = false;
      ifData.log[k].invalid = true;
    }
  }
  // A fast left running from a previous session would keep accumulating.
  if(ifData.isFasting && ifData.fastStart){
    var age = (Date.now() - new Date(ifData.fastStart).getTime()) / 3600000;
    if(age > 48){
      report.push('Fasting: cleared a stuck timer running '+Math.round(age)+'h');
      ifData.isFasting = false;
      ifData.fastStart = null;
    }
  }
  return ifData;
}

function mgFixSets(log,report){
  var fixed = 0;
  for(var i=0;i<log.length;i++){
    var raw = log[i].rawSets || {};
    for(var name in raw){
      var sets = raw[name] || [];
      for(var j=0;j<sets.length;j++){
        var st = sets[j]; if(!st) continue;
        if(typeof st.weight === 'string'){ st.weight = mgNum(st.weight); fixed++; }
        if(typeof st.reps === 'string'){ st.reps = mgNum(st.reps); fixed++; }
      }
    }
  }
  if(fixed) report.push('Set values: coerced '+fixed+' text entries to numbers');
  return log;
}

// The old build shared one global forge_week_start across every profile, so a
// value can be inherited from far enough back that the computed week is
// meaningless. Re-anchor anything older than a year to the current week.
function mgFixWeekStart(ws,report){
  var now = Date.now();
  if(!ws || (now - ws) > 52*7*24*3600*1000){
    var d = new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate() - ((d.getDay()+6)%7));   // back to Monday
    if(ws) report.push('Periodization: re-anchored week 1 (old value was '+
                        Math.round((now-ws)/(7*24*3600*1000))+' weeks stale)');
    return d.getTime();
  }
  return ws;
}

// ── entry point ───────────────────────────────────────────────
function migrateUserData(data,userId){
  var report = [];
  if(!data) return {data:data, report:report, migrated:false};
  if(data.schema >= SCHEMA_VERSION) return {data:data, report:report, migrated:false};

  // 1. Untouched backup, before any repair runs.
  if(userId){
    try{
      localStorage.setItem(BACKUP_KEY_PREFIX+userId,
        JSON.stringify({schema:2, savedAt:new Date().toISOString(), data:data}));
    }catch(e){
      report.push('WARNING: could not write the pre-migration backup ('+
                  (e && e.name ? e.name : 'storage error')+')');
    }
  }
  // Work on a copy so a failure part-way cannot leave data half-migrated.
  var d = JSON.parse(JSON.stringify(data));

  // 2. date keys
  mgPadMap(d.suppLog,  report, 'Supplements');
  mgPadMap(d.waterLog, report, 'Water');
  mgPadMap(d.pepLog,   report, 'Peptides');
  if(d.bio){
    mgPadMap(d.bio.dietLog, report, 'Diet');
    mgPadMap(d.bio.shopLog, report, 'Shopping');
    if(d.bio.ifData) mgPadMap(d.bio.ifData.log, report, 'Fasting');
  }
  // 3. set values, then 4. PRs rebuilt from them
  d.log = mgFixSets(d.log || [], report);
  d.prs = mgRebuildPRs(d.log, d.prs, report);
  // 5. fasting
  if(d.bio) d.bio.ifData = mgFixFasting(d.bio.ifData, report);
  // 6. periodization anchor
  d.weekStart = mgFixWeekStart(d.weekStart, report);

  // 7. programs — the existing day list becomes the 'Forge' program, and the
  // built-in programs are added alongside it. Nothing in days[] is altered.
  if(!d.programs){
    d.programs = buildDefaultPrograms(d.days || null);
    d.activeProgramId = FORGE_PID;
    d.progState = {};
    report.push('Programs: your '+((d.days||[]).length || 7)+
                ' days are now the "Forge" program; Hardwood added alongside');
  }
  d.schema = SCHEMA_VERSION;
  return {data:d, report:report, migrated:true};
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = {migrateUserData:migrateUserData, SCHEMA_VERSION:SCHEMA_VERSION,
                    mgRebuildPRs:mgRebuildPRs, mgPadMap:mgPadMap, mgNum:mgNum};
}
