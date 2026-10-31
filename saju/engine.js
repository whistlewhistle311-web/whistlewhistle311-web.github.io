/* 2027 운 그래프 계산 엔진 (브라우저용). 파이썬 엔진(analyze.py)과 같은 규칙. MIT lunar-javascript 사용. */
(function (g) {
  const HAN = {甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계',子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const EL = {甲:'목',乙:'목',丙:'화',丁:'화',戊:'토',己:'토',庚:'금',辛:'금',壬:'수',癸:'수',子:'수',丑:'토',寅:'목',卯:'목',辰:'토',巳:'화',午:'화',未:'토',申:'금',酉:'금',戌:'토',亥:'수'};
  const YANG = {甲:1,乙:0,丙:1,丁:0,戊:1,己:0,庚:1,辛:0,壬:1,癸:0};
  const GEN = {목:'화',화:'토',토:'금',금:'수',수:'목'};
  const CTRL = {목:'토',토:'수',수:'화',화:'금',금:'목'};
  const PREV = {}; for (const k in GEN) PREV[GEN[k]] = k;
  const ZM = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};
  const ko = s => [...s].map(c => HAN[c] || c).join('');
  const pair = s => [...s].sort().join('');
  const LIUHE = {[pair('子丑')]:'토',[pair('寅亥')]:'목',[pair('卯戌')]:'화',[pair('辰酉')]:'금',[pair('巳申')]:'수',[pair('午未')]:'화'};
  const SANHE = [['申子辰','수'],['亥卯未','목'],['寅午戌','화'],['巳酉丑','금']];
  const FANGHE = [['寅卯辰','목'],['巳午未','화'],['申酉戌','금'],['亥子丑','수']];
  const CHONG = ['子午','丑未','寅申','卯酉','辰戌','巳亥'].map(pair);
  const HAI = ['子未','丑午','寅巳','卯辰','申亥','酉戌'].map(pair);
  const YJ = ['子未','丑午','寅酉','卯申','辰亥','巳戌'].map(pair);
  const XING = ['寅巳','巳申','寅申','丑戌','戌未','丑未','子卯'].map(pair);
  const GANCHONG = ['甲庚','乙辛','丙壬','丁癸'].map(pair);
  const TIANYI = {甲:'丑未',戊:'丑未',庚:'丑未',乙:'子申',己:'子申',丙:'亥酉',丁:'亥酉',辛:'寅午',壬:'巳卯',癸:'巳卯'};
  const JQ = ['小寒','立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪'];

  function god(dm, x) {
    const a = EL[dm], b = EL[x], same = YANG[dm] === YANG[x];
    if (a === b) return same ? '비견' : '겁재';
    if (GEN[a] === b) return same ? '식신' : '상관';
    if (CTRL[a] === b) return same ? '편재' : '정재';
    if (CTRL[b] === a) return same ? '편관' : '정관';
    if (GEN[b] === a) return same ? '편인' : '정인';
  }
  function brel(a, b) {
    const out = []; if (a === b) return out; const s = pair(a + b);
    if (LIUHE[s]) out.push('합');
    for (const [t] of SANHE) if (t.includes(a) && t.includes(b) && (a === t[1] || b === t[1])) out.push('합');
    if (CHONG.includes(s)) out.push('충');
    if (XING.includes(s)) out.push('형');
    if (HAI.includes(s)) out.push('해');
    if (YJ.includes(s)) out.push('원진');
    return out;
  }
  const shift = (d, min) => new Date(d.getTime() + min * 60000);
  const sol = d => Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0);

  function analyze(y, m, d, h, mi, male, timeKnown, target) {
    target = target || 2027;
    let kst = new Date(Date.UTC(y, m - 1, d, timeKnown ? h : 12, timeKnown ? mi : 0));
    const flags = [];
    const dst = [[Date.UTC(1987,4,10,2), Date.UTC(1987,9,11,3)], [Date.UTC(1988,4,8,2), Date.UTC(1988,9,9,3)]];
    for (const [a, b] of dst) if (kst >= a && kst < b) { kst = shift(kst, -60); flags.push('서머타임 기간 출생이라 1시간 보정했어요.'); }
    if (kst < Date.UTC(1961, 7, 10)) flags.push('1961년 8월 이전 출생은 당시 표준시가 달라 시주가 다를 수 있어요.');
    const eb = sol(shift(kst, -60)).getLunar().getEightChar();
    const el = sol(shift(kst, -30)).getLunar().getEightChar();
    const pil = [eb.getYear(), eb.getMonth(), el.getDay(), timeKnown ? el.getTime() : null];
    const dm = el.getDayGan();
    const cols = pil.map((p, i) => p ? { gz: p, gan: { c: p[0], el: EL[p[0]], god: i === 2 ? '나' : god(dm, p[0]) }, zhi: { c: p[1], el: EL[p[1]], god: god(dm, ZM[p[1]]) } } : null);
    const cnt = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    cols.forEach(c => { if (c) { cnt[c.gan.el]++; cnt[c.zhi.el]++; } });
    // 신강약
    const me = EL[dm], help = [me, PREV[me]];
    const W = [['gan',0,1],['gan',1,1],['gan',3,1],['zhi',0,1],['zhi',1,3],['zhi',2,1.5],['zhi',3,1]];
    let tot = 0, sup = 0;
    for (const [row, i, w] of W) { const c = cols[i]; if (!c) continue; tot += w; if (help.includes(c[row].el)) sup += w; }
    const ratio = sup / tot;
    const label = ratio < 0.42 ? '신약' : ratio > 0.58 ? '신강' : '중화';
    let yong, hee;
    if (label === '신약') { const outHeavy = cnt[GEN[me]] + cnt[CTRL[me]]; const officer = Object.keys(CTRL).find(k => CTRL[k] === me);
      if (outHeavy >= cnt[officer]) { yong = PREV[me]; hee = me; } else { yong = me; hee = PREV[me]; } }
    else if (label === '신강') { yong = GEN[me]; hee = CTRL[me]; } else { yong = GEN[me]; hee = PREV[me]; }
    const season = cols[1].zhi.c; let johu = null;
    if ('巳午未'.includes(season) && cnt['수'] <= 1) johu = '수';
    if ('亥子丑'.includes(season) && cnt['화'] <= 1) johu = '화';
    const gi = ['목','화','토','금','수'].filter(e => e !== yong && e !== hee && e !== johu && (e === GEN[GEN[me]] || cnt[e] >= 2));
    // 대운
    const yun = eb.getYun(male ? 1 : 0);
    const dayun = yun.getDaYun().slice(1, 9).map(x => ({ gz: x.getGanZhi(), start: x.getStartYear(), end: x.getEndYear() }));
    const cur = dayun.find(x => x.start <= target && target <= x.end);
    const curZ = cur ? cur.gz[1] : '';
    // 달 (입춘 ~ 다음 입춘, 한국 시각)
    const t1 = Solar.fromYmd(target, 6, 15).getLunar().getJieQiTable();
    const t2 = Solar.fromYmd(target + 1, 6, 15).getLunar().getJieQiTable();
    const kstOf = s => { const [a, b] = s.toYmdHms().split(' '); const [Y, M, D] = a.split('-').map(Number); const [hh, mm] = b.split(':').map(Number); return shift(new Date(Date.UTC(Y, M - 1, D, hh, mm)), 60); };
    const starts = JQ.slice(1).map(n => kstOf(t1[n])).concat([kstOf(t2['小寒']), kstOf(t2['立春'])]);
    const dz = cols[2].zhi.c;
    const zsNatal = cols.filter(Boolean).map(c => c.zhi.c).join('');
    const months = [];
    for (let i = 0; i < 12; i++) {
      const a = starts[i], b = shift(starts[i + 1], -24 * 60);
      const mid = shift(a, 10 * 24 * 60);
      const gz = Solar.fromYmd(mid.getUTCFullYear(), mid.getUTCMonth() + 1, mid.getUTCDate()).getLunar().getMonthInGanZhiExact();
      const [gs, zs] = [gz[0], gz[1]];
      let s = 3; const notes = [];
      for (const e of [EL[gs], EL[zs]]) { if (e === yong || e === hee || e === johu) s += 0.75; else if (gi.includes(e)) s -= 0.6; }
      const r = brel(zs, dz);
      if (r.includes('충')) { s -= 1; notes.push(`${zs}${dz} 충`); }
      if (r.includes('합')) { s += 0.5; notes.push(`${zs}${dz} 합`); }
      if (r.includes('형') || r.includes('해') || r.includes('원진')) s -= 0.4;
      if (TIANYI[dm].includes(zs)) { s += 0.5; notes.push('천을귀인'); }
      if (GANCHONG.includes(pair(gs + dm))) s -= 0.5;
      const all = zsNatal + curZ + zs;
      for (const [t, e] of SANHE.concat(FANGHE)) if (t.includes(zs) && [...t].every(x => all.includes(x))) { if (e === yong || e === hee) s += 1; else if (gi.includes(e)) s -= 0.5; }
      const score = Math.max(1, Math.min(5, Math.floor(s + 0.5)));
      months.push({ gz, score, start: a, end: b, label: `${a.getUTCMonth() + 1}/${a.getUTCDate()}~${b.getUTCMonth() + 1}/${b.getUTCDate()}`, m: a.getUTCMonth() + 1, nextYear: a.getUTCFullYear() > target, stem: god(dm, gs), branch: god(dm, ZM[zs]), notes });
    }
    const ygz = Solar.fromYmd(target, 6, 1).getLunar().getYearInGanZhi();
    return { cols, dm, dmKo: ko(dm), dayGz: pil[2], dayKo: ko(pil[2]), cnt, ratio, label, yong, hee, gi, johu, dayun, cur, months, flags,
             year: { gz: ygz, stem: god(dm, ygz[0]), branch: god(dm, ZM[ygz[1]]) } };
  }
  g.SajuEngine = { analyze, ko, EL, god, brel, GEN, CTRL, GANCHONG, pair };
})(window);
